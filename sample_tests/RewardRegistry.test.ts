import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { WishlistRegistry, SoulboundProfile, AirdropController, MockERC20, RewardRegistry } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";

describe("RewardRegistry", function () {
  let wishlistRegistry: WishlistRegistry;
  let soulboundProfile: SoulboundProfile;
  let airdropController: AirdropController;
  let mockToken: MockERC20;
  let rewardRegistry: RewardRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let verifier: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, verifier] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Airdrop Token", "AIR", 18);
    await mockToken.waitForDeployment();

    // Deploy WishlistRegistry
    const WishlistRegistryFactory = await ethers.getContractFactory("WishlistRegistry");
    wishlistRegistry = await WishlistRegistryFactory.deploy(owner.address);
    await wishlistRegistry.waitForDeployment();

    // Deploy SoulboundProfile
    const SoulboundProfileFactory = await ethers.getContractFactory("SoulboundProfile");
    soulboundProfile = await SoulboundProfileFactory.deploy(owner.address);
    await soulboundProfile.waitForDeployment();

    // Deploy AirdropController
    const AirdropControllerFactory = await ethers.getContractFactory("AirdropController");
    airdropController = await AirdropControllerFactory.deploy(owner.address);
    await airdropController.waitForDeployment();

    // Deploy RewardRegistry
    const RewardRegistryFactory = await ethers.getContractFactory("RewardRegistry");
    rewardRegistry = await RewardRegistryFactory.deploy(owner.address);
    await rewardRegistry.waitForDeployment();

    // Initialize AirdropController
    await airdropController.initialize(
      await wishlistRegistry.getAddress(),
      await soulboundProfile.getAddress(),
      await mockToken.getAddress()
    );

    // Set controller in WishlistRegistry
    await wishlistRegistry.setController(await airdropController.getAddress());

    // Set RewardRegistry in AirdropController
    await airdropController.setRewardRegistry(await rewardRegistry.getAddress());

    // Set WishlistRegistry and AirdropController in RewardRegistry
    await rewardRegistry.setWishlistRegistry(await wishlistRegistry.getAddress());
    await rewardRegistry.setAirdropController(await airdropController.getAddress());

    // Set verifier in RewardRegistry
    await rewardRegistry.setVerifier(verifier.address);

    // Register users
    await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");
    await wishlistRegistry.connect(user2).register("user2@example.com", "user2_social");
  });

  describe("Action Management", function () {
    it("Should create a custom action", async function () {
      // Create a custom action
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("CUSTOM_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "Custom Action",
        "This is a custom action",
        50, // 50 reward points
        0, // No cooldown
        1, // Can only complete once
        true // Requires verification
      );

      // Get action details
      const action = await rewardRegistry.getAction(actionId);
      expect(action.name).to.equal("Custom Action");
      expect(action.description).to.equal("This is a custom action");
      expect(action.rewardPoints).to.equal(50);
      expect(action.active).to.be.true;
      expect(action.cooldownPeriod).to.equal(0);
      expect(action.maxCompletions).to.equal(1);
      expect(action.requiresVerification).to.be.true;
    });

    it("Should update an action", async function () {
      // Create a custom action
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("CUSTOM_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "Custom Action",
        "This is a custom action",
        50,
        0,
        1,
        true
      );

      // Update the action
      await rewardRegistry.updateAction(
        actionId,
        "Updated Action",
        "This is an updated action",
        100, // Increased reward points
        true,
        86400, // 1 day cooldown
        5, // Can complete up to 5 times
        false // No longer requires verification
      );

      // Get updated action details
      const action = await rewardRegistry.getAction(actionId);
      expect(action.name).to.equal("Updated Action");
      expect(action.description).to.equal("This is an updated action");
      expect(action.rewardPoints).to.equal(100);
      expect(action.cooldownPeriod).to.equal(86400);
      expect(action.maxCompletions).to.equal(5);
      expect(action.requiresVerification).to.be.false;
    });

    it("Should get all action IDs", async function () {
      // Get default actions
      const actionIds = await rewardRegistry.getActionIds();
      
      // Should have 5 default actions
      expect(actionIds.length).to.equal(5);
    });
  });

  describe("Action Completion", function () {
    it("Should complete an action that doesn't require verification", async function () {
      // Create a custom action that doesn't require verification
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("NO_VERIFY_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "No Verification",
        "This action doesn't require verification",
        30,
        0,
        1,
        false // No verification required
      );

      // Complete the action
      await rewardRegistry.connect(user1).completeAction(actionId);

      // Get user action details
      const userAction = await rewardRegistry.getUserAction(user1.address, actionId);
      expect(userAction.completions).to.equal(1);
      expect(userAction.totalPoints).to.equal(30);

      // Get user's total reward points
      const rewardPoints = await rewardRegistry.getUserRewardPoints(user1.address);
      expect(rewardPoints).to.equal(30);

      // Get user's bonus points
      const bonusPoints = await rewardRegistry.getUserBonusPoints(user1.address);
      expect(bonusPoints).to.equal(30);
    });

    it("Should complete an action that requires verification", async function () {
      // Create a custom action that requires verification
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("VERIFY_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "Verification Required",
        "This action requires verification",
        40,
        0,
        1,
        true // Verification required
      );

      // Complete the action
      await rewardRegistry.connect(user1).completeAction(actionId);

      // Get user action details before verification
      const userActionBefore = await rewardRegistry.getUserAction(user1.address, actionId);
      expect(userActionBefore.completions).to.equal(1);
      expect(userActionBefore.totalPoints).to.equal(0); // No points yet
      expect(userActionBefore.verified).to.be.false;

      // Verify the action
      await rewardRegistry.connect(verifier).verifyAction(user1.address, actionId);

      // Get user action details after verification
      const userActionAfter = await rewardRegistry.getUserAction(user1.address, actionId);
      expect(userActionAfter.completions).to.equal(1);
      expect(userActionAfter.totalPoints).to.equal(40);
      expect(userActionAfter.verified).to.be.true;

      // Get user's total reward points
      const rewardPoints = await rewardRegistry.getUserRewardPoints(user1.address);
      expect(rewardPoints).to.equal(40);

      // Get user's bonus points
      const bonusPoints = await rewardRegistry.getUserBonusPoints(user1.address);
      expect(bonusPoints).to.equal(40);
    });

    it("Should batch verify actions", async function () {
      // Create two custom actions that require verification
      const actionId1 = ethers.keccak256(ethers.toUtf8Bytes("VERIFY_ACTION_1"));
      const actionId2 = ethers.keccak256(ethers.toUtf8Bytes("VERIFY_ACTION_2"));
      
      await rewardRegistry.createAction(
        actionId1,
        "Verification 1",
        "This action requires verification",
        20,
        0,
        1,
        true
      );
      
      await rewardRegistry.createAction(
        actionId2,
        "Verification 2",
        "This action requires verification",
        30,
        0,
        1,
        true
      );

      // Complete the actions
      await rewardRegistry.connect(user1).completeAction(actionId1);
      await rewardRegistry.connect(user1).completeAction(actionId2);

      // Batch verify the actions
      await rewardRegistry.connect(verifier).batchVerifyActions(
        [user1.address, user1.address],
        [actionId1, actionId2]
      );

      // Get user's total reward points
      const rewardPoints = await rewardRegistry.getUserRewardPoints(user1.address);
      expect(rewardPoints).to.equal(50); // 20 + 30

      // Get user's bonus points
      const bonusPoints = await rewardRegistry.getUserBonusPoints(user1.address);
      expect(bonusPoints).to.equal(50);
    });
  });

  describe("Bonus Points", function () {
    it("Should claim bonus points", async function () {
      // Create and complete an action
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("BONUS_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "Bonus Action",
        "This action awards bonus points",
        50,
        0,
        1,
        false
      );

      // Complete the action
      await rewardRegistry.connect(user1).completeAction(actionId);

      // Check bonus points before claiming
      const bonusPointsBefore = await rewardRegistry.getUserBonusPoints(user1.address);
      expect(bonusPointsBefore).to.equal(50);

      // Check if claimed
      const hasClaimedBefore = await rewardRegistry.hasClaimed(user1.address);
      expect(hasClaimedBefore).to.be.false;

      // Claim bonus points
      await rewardRegistry.connect(user1).claimBonusPoints();

      // Check if claimed
      const hasClaimedAfter = await rewardRegistry.hasClaimed(user1.address);
      expect(hasClaimedAfter).to.be.true;

      // Check reward bonus in AirdropController
      const rewardBonus = await airdropController.getUserRewardBonus(user1.address);
      expect(rewardBonus).to.equal(50);
    });

    it("Should not allow claiming bonus points twice", async function () {
      // Create and complete an action
      const actionId = ethers.keccak256(ethers.toUtf8Bytes("BONUS_ACTION"));
      await rewardRegistry.createAction(
        actionId,
        "Bonus Action",
        "This action awards bonus points",
        50,
        0,
        1,
        false
      );

      // Complete the action
      await rewardRegistry.connect(user1).completeAction(actionId);

      // Claim bonus points
      await rewardRegistry.connect(user1).claimBonusPoints();

      // Try to claim again
      await expect(
        rewardRegistry.connect(user1).claimBonusPoints()
      ).to.be.revertedWithCustomError(rewardRegistry, "BonusAlreadyClaimed");
    });
  });
});
