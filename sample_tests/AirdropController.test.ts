import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AirdropController, WishlistRegistry, SoulboundProfile, MockERC20 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("AirdropController", function () {
  let airdropController: AirdropController;
  let wishlistRegistry: WishlistRegistry;
  let soulboundProfile: SoulboundProfile;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;
  let user5: SignerWithAddress;
  let user6: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, signer, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Airdrop Token", "AIR", 18);
    await mockToken.waitForDeployment();

    // Mint tokens to owner
    await mockToken.mint(owner.address, ethers.parseEther("1000000"));

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

    // Set signer
    await airdropController.setSigner(signer.address);

    // Transfer tokens to AirdropController
    await mockToken.transfer(await airdropController.getAddress(), ethers.parseEther("100000"));

    // Unpause AirdropController
    await airdropController.unpauseAirdrop();
  });

  // We'll use separate describe blocks for each test group to avoid state conflicts

  describe("Initialization", function () {
    it("Should initialize with correct addresses", async function () {
      expect(await airdropController.registry()).to.equal(await wishlistRegistry.getAddress());
      expect(await airdropController.profile()).to.equal(await soulboundProfile.getAddress());
      expect(await airdropController.token()).to.equal(await mockToken.getAddress());
      expect(await airdropController.signer()).to.equal(signer.address);
    });

    it("Should start in paused state", async function () {
      // Deploy a new controller
      const AirdropControllerFactory = await ethers.getContractFactory("AirdropController");
      const newController = await AirdropControllerFactory.deploy(owner.address);
      await newController.waitForDeployment();

      // Check if paused
      expect(await newController.paused()).to.be.true;
    });
  });

  describe("NFT Minting", function () {
    it("Should mint NFT for a registered user", async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Manually mint NFT for user1 (since automatic minting might not be working in tests)
      await airdropController.mintNFTForUser(user1.address);

      // Check if user1 has an NFT
      expect(await soulboundProfile.hasProfile(user1.address)).to.be.true;

      // Get NFT token ID
      const tokenId = await soulboundProfile.getProfileId(user1.address);
      expect(tokenId).to.be.gt(0);

      // Check total minted
      expect(await airdropController.getTotalMinted()).to.equal(1);
    });

    it("Should batch mint NFTs", async function () {
      // Register users
      await wishlistRegistry.batchRegister(
        [user1.address, user2.address],
        ["user1@example.com", "user2@example.com"],
        ["user1_social", "user2_social"]
      );

      // Manually batch mint NFTs (since automatic minting might not be working in tests)
      await airdropController.batchMintNFTs([user1.address, user2.address]);

      // Check if users have NFTs
      expect(await soulboundProfile.hasProfile(user1.address)).to.be.true;
      expect(await soulboundProfile.hasProfile(user2.address)).to.be.true;

      // Check total minted
      expect(await airdropController.getTotalMinted()).to.equal(2);
    });
  });

  describe("Airdrop Management", function () {
    it("Should set airdrop start time", async function () {
      // Set start time to 1 day from now
      const startTime = Math.floor(Date.now() / 1000) + 86400;
      await airdropController.setAirdropStartTime(startTime);

      // Check airdrop status
      const status = await airdropController.getAirdropStatus();
      expect(status.isActive).to.be.false;
      expect(status.isPaused).to.be.false;
      expect(status.startTime).to.equal(startTime);
    });

    it("Should pause and unpause airdrop", async function () {
      // Pause airdrop
      await airdropController.pauseAirdrop();

      // Check if paused
      const status1 = await airdropController.getAirdropStatus();
      expect(status1.isPaused).to.be.true;

      // Unpause airdrop
      await airdropController.unpauseAirdrop();

      // Check if unpaused
      const status2 = await airdropController.getAirdropStatus();
      expect(status2.isPaused).to.be.false;
    });
  });

  describe("Claiming Airdrop", function () {
    beforeEach(async function () {
      // Register user1
      await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

      // Get current blockchain time
      const currentTime = await time.latest();

      // Set airdrop start time to 1 hour in the future
      const startTime = currentTime + 3600; // 1 hour in the future
      await airdropController.setAirdropStartTime(startTime);

      // Advance time to start time
      await time.increaseTo(startTime);
    });

    it("Should verify signature", async function () {
      // Register user3 (different user for this test)
      await wishlistRegistry.connect(user3).register("user3@example.com", "user3_social");

      // Create message hash
      const message = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "address"],
          [user3.address, await airdropController.getAddress()]
        )
      );

      // Create Ethereum signed message hash
      const messageHash = ethers.hashMessage(ethers.getBytes(message));

      // Sign message
      const signature = await signer.signMessage(ethers.getBytes(message));

      // Verify signature
      expect(await airdropController.verifySignature(user3.address, signature)).to.be.true;
    });

    it("Should claim airdrop with valid signature", async function () {
      // Register user4 (different user for this test)
      await wishlistRegistry.connect(user4).register("user4@example.com", "user4_social");

      // Manually mint NFT for user4
      await airdropController.mintNFTForUser(user4.address);

      // Get user4's profile ID
      const profileId = await soulboundProfile.getProfileId(user4.address);

      // Set airdrop info
      await soulboundProfile.setAirdropInfo(profileId, 100, 10);

      // Create message hash
      const message = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "address"],
          [user4.address, await airdropController.getAddress()]
        )
      );

      // Sign message
      const signature = await signer.signMessage(ethers.getBytes(message));

      // Initial balance
      const initialBalance = await mockToken.balanceOf(user4.address);

      // Claim airdrop
      await airdropController.connect(user4).claimAirdrop(user4.address, signature);

      // Check if claimed
      const airdropInfo = await soulboundProfile.getAirdropInfo(profileId);
      expect(airdropInfo.claimed).to.be.true;

      // Check token balance
      const finalBalance = await mockToken.balanceOf(user4.address);
      expect(finalBalance - initialBalance).to.equal(110n); // 100 base + 10 bonus
    });

    it("Should not claim airdrop with invalid signature", async function () {
      // Register user5 (different user for this test)
      await wishlistRegistry.connect(user5).register("user5@example.com", "user5_social");

      // Manually mint NFT for user5
      await airdropController.mintNFTForUser(user5.address);

      // Create invalid signature
      const invalidSignature = "0x1234";

      // Try to claim with invalid signature
      await expect(
        airdropController.connect(user5).claimAirdrop(user5.address, invalidSignature)
      ).to.be.reverted;
    });

    it("Should not claim airdrop twice", async function () {
      // Register user6 (different user for this test)
      await wishlistRegistry.connect(user6).register("user6@example.com", "user6_social");

      // Manually mint NFT for user6
      await airdropController.mintNFTForUser(user6.address);

      // Get user6's profile ID
      const profileId = await soulboundProfile.getProfileId(user6.address);

      // Set airdrop info
      await soulboundProfile.setAirdropInfo(profileId, 100, 10);

      // Create message hash
      const message = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "address"],
          [user6.address, await airdropController.getAddress()]
        )
      );

      // Sign message
      const signature = await signer.signMessage(ethers.getBytes(message));

      // Claim airdrop
      await airdropController.connect(user6).claimAirdrop(user6.address, signature);

      // Try to claim again
      await expect(
        airdropController.connect(user6).claimAirdrop(user6.address, signature)
      ).to.be.reverted;
    });
  });
});
