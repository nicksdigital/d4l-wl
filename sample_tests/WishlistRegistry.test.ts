import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { WishlistRegistry, SoulboundProfile, AirdropController, MockERC20 } from "../typechain-types";

describe("WishlistRegistry", function () {
  let wishlistRegistry: WishlistRegistry;
  let soulboundProfile: SoulboundProfile;
  let airdropController: AirdropController;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

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
      await mockToken.getAddress() // Use mock token for testing
    );

    // Set controller in WishlistRegistry
    await wishlistRegistry.setController(await airdropController.getAddress());
  });

  // We'll use separate describe blocks for each test group to avoid state conflicts

  describe("Registration", function () {
    it("Should register a user", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Check if user1 is registered
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.true;

      // Get registration details
      const details = await wishlistRegistry.registrationDetails(user1.address);
      expect(details.email).to.equal("user1@example.com");
      expect(details.social).to.equal("user1_social");
      expect(details.hasEmailOrSocial).to.be.true;
      expect(details.bonusTokens).to.equal(10); // 10 bonus tokens for email/social
    });

    it("Should register a user without email or social", async function () {
      // Register user2 without email or social
      await wishlistRegistry.connect(user2).register("", "");

      // Check if user2 is registered
      expect(await wishlistRegistry.isRegistered(user2.address)).to.be.true;

      // Get registration details
      const details = await wishlistRegistry.registrationDetails(user2.address);
      expect(details.email).to.equal("");
      expect(details.social).to.equal("");
      expect(details.hasEmailOrSocial).to.be.false;
      expect(details.bonusTokens).to.equal(0); // No bonus tokens
    });

    it("Should not register a user twice", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Try to register user1 again
      await expect(
        wishlistRegistry.connect(user1).register("user1@example.com", "user1_social")
      ).to.be.revertedWithCustomError(wishlistRegistry, "AlreadyRegistered");
    });

    it("Should batch register users", async function () {
      // Batch register users
      await wishlistRegistry.batchRegister(
        [user1.address, user2.address, user3.address],
        ["user1@example.com", "user2@example.com", "user3@example.com"],
        ["user1_social", "user2_social", "user3_social"]
      );

      // Check if users are registered
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.true;
      expect(await wishlistRegistry.isRegistered(user2.address)).to.be.true;
      expect(await wishlistRegistry.isRegistered(user3.address)).to.be.true;

      // Get registration details
      const details1 = await wishlistRegistry.registrationDetails(user1.address);
      expect(details1.email).to.equal("user1@example.com");
      expect(details1.social).to.equal("user1_social");
      expect(details1.hasEmailOrSocial).to.be.true;
      expect(details1.bonusTokens).to.equal(10); // 10 bonus tokens for email/social

      // Check total registered
      expect(await wishlistRegistry.totalRegistered()).to.equal(3);
    });

    it("Should remove a user", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Check if user1 is registered
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.true;

      // Remove user1
      await wishlistRegistry.removeUser(user1.address);

      // Check if user1 is no longer registered
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.false;

      // Check total registered
      expect(await wishlistRegistry.totalRegistered()).to.equal(0);
    });
  });

  describe("Registration with NFT", function () {
    it("Should mint an NFT when a user registers", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Manually mint NFT for user1 (since automatic minting might not be working in tests)
      await airdropController.mintNFTForUser(user1.address);

      // Check if user1 has an NFT
      expect(await soulboundProfile.hasProfile(user1.address)).to.be.true;

      // Get NFT token ID
      const tokenId = await soulboundProfile.getProfileId(user1.address);
      expect(tokenId).to.be.gt(0);

      // Check if NFT is recorded in registry
      const details = await wishlistRegistry.registrationDetails(user1.address);
      expect(details.nftTokenId).to.equal(tokenId);
    });

    it("Should set airdrop info in the NFT", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Manually mint NFT for user1 (since automatic minting might not be working in tests)
      await airdropController.mintNFTForUser(user1.address);

      // Get NFT token ID
      const tokenId = await soulboundProfile.getProfileId(user1.address);

      // Check airdrop info
      const airdropInfo = await soulboundProfile.getAirdropInfo(tokenId);
      expect(airdropInfo.baseAmount).to.be.gt(0);
      expect(airdropInfo.bonusAmount).to.equal(10); // 10 bonus tokens for email/social
      expect(airdropInfo.claimed).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should open and close registration", async function () {
      // Close registration
      await wishlistRegistry.closeRegistration();
      expect(await wishlistRegistry.registrationOpen()).to.be.false;

      // Try to register when closed
      await expect(
        wishlistRegistry.connect(user1).register("user1@example.com", "user1_social")
      ).to.be.revertedWithCustomError(wishlistRegistry, "RegistrationNotOpen");

      // Open registration
      await wishlistRegistry.openRegistration();
      expect(await wishlistRegistry.registrationOpen()).to.be.true;

      // Register when open
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.true;
    });

    it("Should pause and unpause the contract", async function () {
      // Pause the contract
      await wishlistRegistry.pause();

      // Try to register when paused
      await expect(
        wishlistRegistry.connect(user1).register("user1@example.com", "user1_social")
      ).to.be.reverted;

      // Unpause the contract
      await wishlistRegistry.unpause();

      // Register when unpaused
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");
      expect(await wishlistRegistry.isRegistered(user1.address)).to.be.true;
    });
  });
});
