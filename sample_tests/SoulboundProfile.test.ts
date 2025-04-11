import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { SoulboundProfile, SocialModule } from "../typechain-types";

describe("SoulboundProfile", function () {
  let soulboundProfile: SoulboundProfile;
  let socialModule: SocialModule;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy SoulboundProfile
    const SoulboundProfileFactory = await ethers.getContractFactory("SoulboundProfile");
    soulboundProfile = await SoulboundProfileFactory.deploy(owner.address);
    await soulboundProfile.waitForDeployment();

    // Deploy SocialModule
    const SocialModuleFactory = await ethers.getContractFactory("SocialModule");
    socialModule = await SocialModuleFactory.deploy();
    await socialModule.waitForDeployment();

    // Note: We don't initialize the SocialModule here
    // It will be initialized when added to the SoulboundProfile
  });

  // We'll use separate describe blocks for each test group to avoid state conflicts

  describe("Profile Management", function () {
    it("Should mint a profile", async function () {
      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);

      // Check if user1 has a profile
      expect(await soulboundProfile.hasProfile(user1.address)).to.be.true;

      // Get profile ID
      const profileId = await soulboundProfile.getProfileId(user1.address);
      expect(profileId).to.be.gt(0);

      // Check owner of the token
      expect(await soulboundProfile.ownerOf(profileId)).to.equal(user1.address);
    });

    it("Should not allow transferring profiles (soulbound)", async function () {
      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Try to transfer the profile
      await expect(
        soulboundProfile.connect(user1).transferFrom(user1.address, user2.address, profileId)
      ).to.be.revertedWithCustomError(soulboundProfile, "NonTransferable");
    });

    it("Should batch mint profiles", async function () {
      // Batch mint profiles
      await soulboundProfile.batchMintProfiles([user1.address, user2.address]);

      // Check if users have profiles
      expect(await soulboundProfile.hasProfile(user1.address)).to.be.true;
      expect(await soulboundProfile.hasProfile(user2.address)).to.be.true;

      // Get profile IDs
      const profileId1 = await soulboundProfile.getProfileId(user1.address);
      const profileId2 = await soulboundProfile.getProfileId(user2.address);
      expect(profileId1).to.be.gt(0);
      expect(profileId2).to.be.gt(0);
    });
  });

  describe("Airdrop Information", function () {
    it("Should set and get airdrop info", async function () {
      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Set airdrop info
      await soulboundProfile.setAirdropInfo(profileId, 100, 10);

      // Get airdrop info
      const airdropInfo = await soulboundProfile.getAirdropInfo(profileId);
      expect(airdropInfo.baseAmount).to.equal(100);
      expect(airdropInfo.bonusAmount).to.equal(10);
      expect(airdropInfo.claimed).to.be.false;
      expect(airdropInfo.claimTimestamp).to.equal(0);
    });

    it("Should mark airdrop as claimed", async function () {
      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Set airdrop info
      await soulboundProfile.setAirdropInfo(profileId, 100, 10);

      // Mark as claimed
      await soulboundProfile.markAirdropClaimed(profileId);

      // Get airdrop info
      const airdropInfo = await soulboundProfile.getAirdropInfo(profileId);
      expect(airdropInfo.claimed).to.be.true;
      expect(airdropInfo.claimTimestamp).to.be.gt(0);
    });
  });

  describe("Module Management", function () {
    it("Should add a module", async function () {
      // Add social module
      await soulboundProfile.addModule(await socialModule.getAddress(), "Social Module");

      // Get modules
      const modules = await soulboundProfile.getModules();
      expect(modules.length).to.equal(1);
      expect(modules[0]).to.equal(await socialModule.getAddress());
    });

    it("Should update module data", async function () {
      // Add social module
      await soulboundProfile.addModule(await socialModule.getAddress(), "Social Module");

      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Encode social data
      const socialData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "string"],
        ["@user1", "user1#1234", "t.me/user1"]
      );

      // Update module data
      await soulboundProfile.updateModuleData(profileId, await socialModule.getAddress(), socialData);

      // Get module data
      const data = await soulboundProfile.getModuleData(profileId, await socialModule.getAddress());
      expect(data).to.equal(socialData);
    });

    it("Should remove a module", async function () {
      // Add social module
      await soulboundProfile.addModule(await socialModule.getAddress(), "Social Module");

      // Remove module
      await soulboundProfile.removeModule(await socialModule.getAddress());

      // Get modules
      const modules = await soulboundProfile.getModules();
      expect(modules.length).to.equal(0);
    });
  });

  describe("Metadata", function () {
    it("Should set and get base URI", async function () {
      // Set base URI
      await soulboundProfile.setBaseURI("https://example.com/api/metadata/");

      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Get token URI
      const tokenURI = await soulboundProfile.tokenURI(profileId);
      expect(tokenURI).to.equal(`https://example.com/api/metadata/${profileId}`);
    });

    it("Should set token URI", async function () {
      // Mint profile for user1
      await soulboundProfile.mintProfile(user1.address);
      const profileId = await soulboundProfile.getProfileId(user1.address);

      // Set token URI
      await soulboundProfile.setTokenURI(profileId, "https://example.com/custom-metadata.json");

      // Get token URI
      const tokenURI = await soulboundProfile.tokenURI(profileId);
      expect(tokenURI).to.equal("https://example.com/custom-metadata.json");
    });
  });
});
