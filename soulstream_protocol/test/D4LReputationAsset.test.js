const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D4L Reputation Asset Tests", function () {
  let owner, user1, user2, user3;
  let reputationAssetFactory;
  let reputationAsset;
  let soulManager;

  before(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy the mock soul manager
    const MockSoulManager = await ethers.getContractFactory("MockRegistry");
    soulManager = await MockSoulManager.deploy();
    await soulManager.waitForDeployment();
    console.log("Mock Soul Manager deployed at:", await soulManager.getAddress());

    // Deploy the reputation asset factory
    const D4LReputationAssetFactory = await ethers.getContractFactory("D4LReputationAssetFactory");
    reputationAssetFactory = await D4LReputationAssetFactory.deploy(
      await soulManager.getAddress(),
      owner.address
    );
    await reputationAssetFactory.waitForDeployment();
    console.log("Reputation Asset Factory deployed at:", await reputationAssetFactory.getAddress());
  });

  describe("Reputation Asset Creation", function () {
    it("Should deploy a reputation asset", async function () {
      // Deploy the reputation asset
      const tx = await reputationAssetFactory.deployReputationAsset(
        "Community Contribution Score",
        "CCS",
        false, // non-transferable
        false, // non-divisible
        false, // non-consumable
        owner.address
      );
      const receipt = await tx.wait();

      // Get the reputation asset address from the event
      let reputationAssetAddress;
      for (const log of receipt.logs) {
        try {
          const parsedLog = reputationAssetFactory.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "ReputationAssetDeployed") {
            reputationAssetAddress = parsedLog.args[1];
            console.log("Reputation Asset deployed at:", reputationAssetAddress);
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      expect(reputationAssetAddress).to.not.be.undefined;

      // Get the reputation asset contract
      reputationAsset = await ethers.getContractAt("D4LReputationAsset", reputationAssetAddress);

      // Verify the asset was deployed correctly
      expect(await reputationAsset.name()).to.equal("Community Contribution Score");
      expect(await reputationAsset.symbol()).to.equal("CCS");
      expect(await reputationAsset.owner()).to.equal(owner.address);

      // Verify the asset constraints
      const constraints = await reputationAsset.assetConstraints();
      expect(constraints[0]).to.equal(false); // non-transferable
      expect(constraints[1]).to.equal(false); // non-divisible
      expect(constraints[2]).to.equal(false); // non-consumable
    });
  });

  describe("Reputation Score Management", function () {
    it("Should assign reputation scores to users", async function () {
      // Create soul identities for users
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes("reputation"));

      // Create soul for user1
      await soulManager.createSoulIdentity(
        user1.address,
        appSalt,
        ethers.ZeroHash,
        ethers.ZeroHash
      );

      // Create soul for user2
      await soulManager.createSoulIdentity(
        user2.address,
        appSalt,
        ethers.ZeroHash,
        ethers.ZeroHash
      );

      // Get the soul identities directly
      const user1Souls = await soulManager.getUserSoulIdentities(user1.address);
      const user2Souls = await soulManager.getUserSoulIdentities(user2.address);

      const user1SoulId = user1Souls[0];
      const user2SoulId = user2Souls[0];

      console.log("User1 Soul ID:", user1SoulId);
      console.log("User2 Soul ID:", user2SoulId);

      // Assign reputation scores
      await reputationAsset.connect(owner).mintToSoul(user1SoulId, 100);
      await reputationAsset.connect(owner).mintToSoul(user2SoulId, 50);

      // Check the balances
      expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(100);
      expect(await reputationAsset.balanceOfSoul(user2SoulId)).to.equal(50);
    });

    it("Should update reputation scores", async function () {
      // Get the soul identities
      const user1SoulId = (await soulManager.getUserSoulIdentities(user1.address))[0];
      const user2SoulId = (await soulManager.getUserSoulIdentities(user2.address))[0];

      // First reset any existing balances
      const currentUser1Balance = await reputationAsset.balanceOfSoul(user1SoulId);
      const currentUser2Balance = await reputationAsset.balanceOfSoul(user2SoulId);

      if (currentUser1Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user1SoulId, currentUser1Balance);
      }

      if (currentUser2Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user2SoulId, currentUser2Balance);
      }

      // Now mint fresh reputation scores
      await reputationAsset.connect(owner).mintToSoul(user1SoulId, 100);
      await reputationAsset.connect(owner).mintToSoul(user2SoulId, 50);

      // Verify initial balances
      expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(100);
      expect(await reputationAsset.balanceOfSoul(user2SoulId)).to.equal(50);

      // Update reputation scores
      await reputationAsset.connect(owner).mintToSoul(user1SoulId, 50); // Add 50 more points
      await reputationAsset.connect(owner).burnFromSoul(user2SoulId, 10); // Remove 10 points

      // Check the updated balances
      expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(150);
      expect(await reputationAsset.balanceOfSoul(user2SoulId)).to.equal(40);
    });

    it("Should not allow unauthorized users to update scores", async function () {
      // Get the soul identity
      const user1SoulId = (await soulManager.getUserSoulIdentities(user1.address))[0];

      // Try to update reputation score as unauthorized user
      await expect(
        reputationAsset.connect(user3).mintToSoul(user1SoulId, 100)
      ).to.be.reverted;

      await expect(
        reputationAsset.connect(user3).burnFromSoul(user1SoulId, 50)
      ).to.be.reverted;
    });

    it("Should enforce non-transferable constraint", async function () {
      // Get the soul identities
      const user1SoulId = (await soulManager.getUserSoulIdentities(user1.address))[0];
      const user2SoulId = (await soulManager.getUserSoulIdentities(user2.address))[0];

      // Try to transfer reputation score between souls
      await expect(
        reputationAsset.connect(owner).transferBetweenSouls(user1SoulId, user2SoulId, 50)
      ).to.be.reverted;
    });
  });

  describe("Reputation-Based Access Control", function () {
    it("Should allow access based on reputation threshold", async function () {
      // Get the soul identities
      const user1SoulId = (await soulManager.getUserSoulIdentities(user1.address))[0];
      const user2SoulId = (await soulManager.getUserSoulIdentities(user2.address))[0];

      // First reset any existing balances
      const currentUser1Balance = await reputationAsset.balanceOfSoul(user1SoulId);
      const currentUser2Balance = await reputationAsset.balanceOfSoul(user2SoulId);

      if (currentUser1Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user1SoulId, currentUser1Balance);
      }

      if (currentUser2Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user2SoulId, currentUser2Balance);
      }

      // Now mint fresh reputation scores
      await reputationAsset.connect(owner).mintToSoul(user1SoulId, 150);
      await reputationAsset.connect(owner).mintToSoul(user2SoulId, 40);

      // Verify balances
      const user1Balance = await reputationAsset.balanceOfSoul(user1SoulId);
      const user2Balance = await reputationAsset.balanceOfSoul(user2SoulId);
      console.log("User1 balance:", user1Balance);
      console.log("User2 balance:", user2Balance);

      // Check if users meet the reputation threshold
      const highThreshold = 100;
      const lowThreshold = 30;

      // User1 has 150 points, should meet both thresholds
      expect(await reputationAsset.meetsThreshold(user1SoulId, highThreshold)).to.be.true;
      expect(await reputationAsset.meetsThreshold(user1SoulId, lowThreshold)).to.be.true;

      // User2 has 40 points, should only meet the low threshold
      const meetsHighThreshold = await reputationAsset.meetsThreshold(user2SoulId, highThreshold);
      console.log("User2 meets high threshold:", meetsHighThreshold);
      expect(meetsHighThreshold).to.be.false;
      expect(await reputationAsset.meetsThreshold(user2SoulId, lowThreshold)).to.be.true;
    });

    it("Should provide reputation tiers", async function () {
      // Get the soul identities
      const user1SoulId = (await soulManager.getUserSoulIdentities(user1.address))[0];
      const user2SoulId = (await soulManager.getUserSoulIdentities(user2.address))[0];

      // First reset any existing balances
      const currentUser1Balance = await reputationAsset.balanceOfSoul(user1SoulId);
      const currentUser2Balance = await reputationAsset.balanceOfSoul(user2SoulId);

      if (currentUser1Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user1SoulId, currentUser1Balance);
      }

      if (currentUser2Balance > 0) {
        await reputationAsset.connect(owner).burnFromSoul(user2SoulId, currentUser2Balance);
      }

      // Now mint fresh reputation scores
      await reputationAsset.connect(owner).mintToSoul(user1SoulId, 150);
      await reputationAsset.connect(owner).mintToSoul(user2SoulId, 40);

      // Verify balances
      const user1Balance = await reputationAsset.balanceOfSoul(user1SoulId);
      const user2Balance = await reputationAsset.balanceOfSoul(user2SoulId);
      console.log("User1 balance:", user1Balance);
      console.log("User2 balance:", user2Balance);

      // Define reputation tiers - first reset any existing tiers
      await reputationAsset.connect(owner).setReputationTier(1, 0);    // Tier 1: 0+ points
      await reputationAsset.connect(owner).setReputationTier(2, 50);   // Tier 2: 50+ points
      await reputationAsset.connect(owner).setReputationTier(3, 100);  // Tier 3: 100+ points
      await reputationAsset.connect(owner).setReputationTier(4, 200);  // Tier 4: 200+ points

      // Check user tiers
      const user1Tier = await reputationAsset.getReputationTier(user1SoulId);
      const user2Tier = await reputationAsset.getReputationTier(user2SoulId);
      console.log("User1 tier:", user1Tier);
      console.log("User2 tier:", user2Tier);

      // Convert BigInt to Number for comparison
      const user1TierNumber = Number(user1Tier);
      const user2TierNumber = Number(user2Tier);
      console.log("User1 tier (number):", user1TierNumber);
      console.log("User2 tier (number):", user2TierNumber);

      expect(user1TierNumber).to.equal(3); // User1 has 150 points
      expect(user2TierNumber).to.equal(1); // User2 has 40 points

      // Increase user2's score to move to tier 2
      await reputationAsset.connect(owner).mintToSoul(user2SoulId, 20); // Now has 60 points
      const updatedTier = await reputationAsset.getReputationTier(user2SoulId);
      console.log("User2 updated tier:", updatedTier);
      expect(Number(updatedTier)).to.equal(2);
    });
  });
});
