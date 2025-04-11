import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { WishlistRegistry, SoulboundProfile, AirdropController, MockERC20 } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Social Media and Referral System", function () {
  let wishlistRegistry: WishlistRegistry;
  let soulboundProfile: SoulboundProfile;
  let airdropController: AirdropController;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

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

    // Initialize AirdropController
    await airdropController.initialize(
      await wishlistRegistry.getAddress(),
      await soulboundProfile.getAddress(),
      await mockToken.getAddress()
    );

    // Set controller in WishlistRegistry
    await wishlistRegistry.setController(await airdropController.getAddress());

    // Register users
    await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");
    await wishlistRegistry.connect(user2).register("user2@example.com", "user2_social");
  });

  describe("Social Media Connections", function () {
    it("Should connect a social media account", async function () {
      // Connect Twitter account
      await wishlistRegistry.connect(user1).connectSocial(
        "twitter",
        "@user1",
        1000 // followers
      );

      // Get social data
      const socialData = await wishlistRegistry.getSocialData(user1.address, "twitter");

      expect(socialData.handle).to.equal("@user1");
      expect(socialData.platform).to.equal("twitter");
      expect(socialData.followers).to.equal(1000);
      expect(socialData.verified).to.be.false;
    });

    it("Should disconnect a social media account", async function () {
      // Connect Twitter account
      await wishlistRegistry.connect(user1).connectSocial(
        "twitter",
        "@user1",
        1000
      );

      // Get active platforms
      const platformsBefore = await wishlistRegistry.getActivePlatforms(user1.address);
      expect(platformsBefore.length).to.equal(1);
      expect(platformsBefore[0]).to.equal("twitter");

      // Disconnect Twitter account
      await wishlistRegistry.connect(user1).disconnectSocial("twitter");

      // Get active platforms
      const platformsAfter = await wishlistRegistry.getActivePlatforms(user1.address);
      expect(platformsAfter.length).to.equal(0);
    });

    it("Should verify a social media account", async function () {
      // Connect Twitter account
      await wishlistRegistry.connect(user1).connectSocial(
        "twitter",
        "@user1",
        1000
      );

      // Verify account (admin only)
      await wishlistRegistry.verifySocial(user1.address, "twitter", true);

      // Get social data
      const socialData = await wishlistRegistry.getSocialData(user1.address, "twitter");
      expect(socialData.verified).to.be.true;
    });

    it("Should update followers count", async function () {
      // Connect Twitter account
      await wishlistRegistry.connect(user1).connectSocial(
        "twitter",
        "@user1",
        1000
      );

      // Update followers (admin only)
      await wishlistRegistry.updateFollowers(user1.address, "twitter", 2000);

      // Get social data
      const socialData = await wishlistRegistry.getSocialData(user1.address, "twitter");
      expect(socialData.followers).to.equal(2000);
    });

    it("Should calculate influence score", async function () {
      // Connect multiple social accounts
      await wishlistRegistry.connect(user1).connectSocial("twitter", "@user1", 1000);
      await wishlistRegistry.connect(user1).connectSocial("instagram", "user1", 5000);

      // Verify Twitter (admin only)
      await wishlistRegistry.verifySocial(user1.address, "twitter", true);

      // Get influence score
      const score = await wishlistRegistry.getInfluenceScore(user1.address);

      // Score should be non-zero
      expect(score).to.be.gt(0);
    });
  });

  describe("Referral System", function () {
    it("Should create a referral", async function () {
      // User2 refers User3
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");
      await wishlistRegistry.connect(user3).createReferral(user2.address);

      // Get referral info
      const referral = await wishlistRegistry.getReferral(user3.address);
      expect(referral.referrer).to.equal(user2.address);
      expect(referral.validated).to.be.false;
    });

    it("Should validate a referral", async function () {
      // User2 refers User3
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");
      await wishlistRegistry.connect(user3).createReferral(user2.address);

      // Validate referral (admin only)
      await wishlistRegistry.validateReferral(user3.address);

      // Get referral info
      const referral = await wishlistRegistry.getReferral(user3.address);
      expect(referral.validated).to.be.true;
    });

    it("Should reward a referral", async function () {
      // User2 refers User3
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");
      await wishlistRegistry.connect(user3).createReferral(user2.address);

      // Reward referral (admin only)
      await wishlistRegistry.rewardReferral(user3.address);

      // Get referral info
      const referral = await wishlistRegistry.getReferral(user3.address);
      expect(referral.validated).to.be.true;
      expect(referral.reward).to.be.gt(0);

      // Get referrer info
      const referrerInfo = await wishlistRegistry.getReferrerInfo(user2.address);
      expect(referrerInfo.totalRewards).to.be.gt(0);
    });

    it("Should configure the referral system", async function () {
      // Configure referral system (admin only)
      await wishlistRegistry.configureReferralSystem(20, 10, 50);

      // User2 refers User3
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");
      await wishlistRegistry.connect(user3).createReferral(user2.address);

      // Reward referral (admin only)
      await wishlistRegistry.rewardReferral(user3.address);

      // Get referral info
      const referral = await wishlistRegistry.getReferral(user3.address);
      expect(referral.reward).to.equal(20);
    });

    it("Should get referred users", async function () {
      // User2 refers User3 and User4
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");
      await wishlistRegistry.connect(user3).createReferral(user2.address);

      await wishlistRegistry.connect(user4).register("user4@example.com", "user4_social");
      await wishlistRegistry.connect(user4).createReferral(user2.address);

      // Get referrer info
      const referrerInfo = await wishlistRegistry.getReferrerInfo(user2.address);
      expect(referrerInfo.totalReferrals).to.equal(2);

      // We can't directly check the referred users array because it's not exposed in the same way
      // But we can check that both users have referrals pointing to user2
      const referral3 = await wishlistRegistry.getReferral(user3.address);
      const referral4 = await wishlistRegistry.getReferral(user4.address);
      expect(referral3.referrer).to.equal(user2.address);
      expect(referral4.referrer).to.equal(user2.address);
    });
  });

  describe("Merkle Proof Verification", function () {
    it("Should set and verify Merkle root", async function () {
      // Create a simple Merkle tree with one leaf
      const leaf = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [user1.address, 100]
        )
      );

      // Set Merkle root (admin only)
      await wishlistRegistry.setMerkleRoot(leaf);

      // Verify proof (empty proof for a single leaf)
      const isValid = await wishlistRegistry.verifyMerkleProof(leaf, []);
      expect(isValid).to.be.true;
    });

    it("Should verify multiple Merkle proofs", async function () {
      // Create simple Merkle tree with two leaves
      const leaf1 = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [user1.address, 100]
        )
      );

      const leaf2 = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [user2.address, 200]
        )
      );

      // Create Merkle root
      const root = ethers.keccak256(
        ethers.solidityPacked(
          ["bytes32", "bytes32"],
          [leaf1, leaf2]
        )
      );

      // Set Merkle root (admin only)
      await wishlistRegistry.setMerkleRoot(root);

      // Create proofs
      const proof1 = [leaf2];
      const proof2 = [leaf1];

      // Verify multiple proofs
      const results = await wishlistRegistry.verifyMultipleMerkleProofs(
        [leaf1, leaf2],
        [proof1, proof2]
      );

      expect(results.length).to.equal(2);
      expect(results[0]).to.be.true;
      expect(results[1]).to.be.true;
    });
  });
});
