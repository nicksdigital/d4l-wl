const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardPoints Contract", function () {
  let RewardPoints;
  let rewardPoints;
  let deployer;
  let rewarder;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [deployer, rewarder, user1, user2] = await ethers.getSigners();

    // Deploy RewardPoints
    RewardPoints = await ethers.getContractFactory("RewardPoints");
    rewardPoints = await RewardPoints.deploy();
    await rewardPoints.waitForDeployment();
    
    // Add rewarder role
    await rewardPoints.addRewarder(rewarder.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await rewardPoints.owner()).to.equal(deployer.address);
    });

    it("Should grant admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      expect(await rewardPoints.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("Should grant rewarder role to deployer", async function () {
      const REWARDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDER_ROLE"));
      expect(await rewardPoints.hasRole(REWARDER_ROLE, deployer.address)).to.be.true;
    });
  });

  describe("Award Points", function () {
    it("Should award points to a user", async function () {
      const pointsAmount = 100;
      const reason = "Token creation";
      
      await rewardPoints.connect(rewarder).awardPoints(user1.address, pointsAmount, reason);
      
      expect(await rewardPoints.getPoints(user1.address)).to.equal(pointsAmount);
      expect(await rewardPoints.getTotalPoints()).to.equal(pointsAmount);
    });

    it("Should emit PointsAwarded event", async function () {
      const pointsAmount = 100;
      const reason = "Token creation";
      
      await expect(rewardPoints.connect(rewarder).awardPoints(user1.address, pointsAmount, reason))
        .to.emit(rewardPoints, "PointsAwarded")
        .withArgs(user1.address, pointsAmount, reason);
    });

    it("Should accumulate points for multiple awards", async function () {
      await rewardPoints.connect(rewarder).awardPoints(user1.address, 100, "First award");
      await rewardPoints.connect(rewarder).awardPoints(user1.address, 150, "Second award");
      
      expect(await rewardPoints.getPoints(user1.address)).to.equal(250);
      expect(await rewardPoints.getTotalPoints()).to.equal(250);
    });

    it("Should track points for multiple users", async function () {
      await rewardPoints.connect(rewarder).awardPoints(user1.address, 100, "User 1 award");
      await rewardPoints.connect(rewarder).awardPoints(user2.address, 200, "User 2 award");
      
      expect(await rewardPoints.getPoints(user1.address)).to.equal(100);
      expect(await rewardPoints.getPoints(user2.address)).to.equal(200);
      expect(await rewardPoints.getTotalPoints()).to.equal(300);
    });

    it("Should fail when awarding points from non-rewarder", async function () {
      const REWARDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDER_ROLE"));
      await expect(
        rewardPoints.connect(user1).awardPoints(user2.address, 100, "Unauthorized award")
      ).to.be.revertedWithCustomError(rewardPoints, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, REWARDER_ROLE);
    });

    it("Should fail when awarding points to zero address", async function () {
      await expect(
        rewardPoints.connect(rewarder).awardPoints(ethers.ZeroAddress, 100, "Invalid award")
      ).to.be.revertedWith("RewardPoints: user cannot be zero address");
    });

    it("Should fail when awarding zero points", async function () {
      await expect(
        rewardPoints.connect(rewarder).awardPoints(user1.address, 0, "Invalid award")
      ).to.be.revertedWith("RewardPoints: amount must be greater than zero");
    });
  });

  describe("Redeem Points", function () {
    beforeEach(async function () {
      // Award some points to user1
      await rewardPoints.connect(rewarder).awardPoints(user1.address, 300, "Initial points");
    });

    it("Should redeem points from a user", async function () {
      const redeemAmount = 100;
      
      await rewardPoints.connect(rewarder).redeemPoints(user1.address, redeemAmount);
      
      expect(await rewardPoints.getPoints(user1.address)).to.equal(200);
      expect(await rewardPoints.getTotalPoints()).to.equal(200);
    });

    it("Should emit PointsRedeemed event", async function () {
      const redeemAmount = 100;
      
      await expect(rewardPoints.connect(rewarder).redeemPoints(user1.address, redeemAmount))
        .to.emit(rewardPoints, "PointsRedeemed")
        .withArgs(user1.address, redeemAmount);
    });

    it("Should fail when redeeming points from non-rewarder", async function () {
      const REWARDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDER_ROLE"));
      await expect(
        rewardPoints.connect(user2).redeemPoints(user1.address, 100)
      ).to.be.revertedWithCustomError(rewardPoints, "AccessControlUnauthorizedAccount")
        .withArgs(user2.address, REWARDER_ROLE);
    });

    it("Should fail when redeeming points from zero address", async function () {
      await expect(
        rewardPoints.connect(rewarder).redeemPoints(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("RewardPoints: user cannot be zero address");
    });

    it("Should fail when redeeming zero points", async function () {
      await expect(
        rewardPoints.connect(rewarder).redeemPoints(user1.address, 0)
      ).to.be.revertedWith("RewardPoints: amount must be greater than zero");
    });

    it("Should fail when redeeming more points than user has", async function () {
      await expect(
        rewardPoints.connect(rewarder).redeemPoints(user1.address, 400)
      ).to.be.revertedWith("RewardPoints: insufficient points");
    });
  });

  describe("Admin Functions", function () {
    it("Should set exact points for a user", async function () {
      const pointsAmount = 500;
      
      await rewardPoints.setUserPoints(user1.address, pointsAmount);
      
      expect(await rewardPoints.getPoints(user1.address)).to.equal(pointsAmount);
      expect(await rewardPoints.getTotalPoints()).to.equal(pointsAmount);
    });

    it("Should update total points when increasing user points", async function () {
      await rewardPoints.setUserPoints(user1.address, 200);
      await rewardPoints.setUserPoints(user1.address, 300);
      
      expect(await rewardPoints.getTotalPoints()).to.equal(300);
    });

    it("Should update total points when decreasing user points", async function () {
      await rewardPoints.setUserPoints(user1.address, 300);
      await rewardPoints.setUserPoints(user1.address, 100);
      
      expect(await rewardPoints.getTotalPoints()).to.equal(100);
    });

    it("Should add a new rewarder", async function () {
      const REWARDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDER_ROLE"));
      await rewardPoints.addRewarder(user2.address);
      
      expect(await rewardPoints.hasRole(REWARDER_ROLE, user2.address)).to.be.true;
    });

    it("Should remove a rewarder", async function () {
      const REWARDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDER_ROLE"));
      await rewardPoints.removeRewarder(rewarder.address);
      
      expect(await rewardPoints.hasRole(REWARDER_ROLE, rewarder.address)).to.be.false;
    });

    it("Should fail when non-admin tries to set user points", async function () {
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      await expect(
        rewardPoints.connect(user1).setUserPoints(user2.address, 100)
      ).to.be.revertedWithCustomError(rewardPoints, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });

    it("Should fail when non-admin tries to add a rewarder", async function () {
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      await expect(
        rewardPoints.connect(user1).addRewarder(user2.address)
      ).to.be.revertedWithCustomError(rewardPoints, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });

    it("Should fail when non-admin tries to remove a rewarder", async function () {
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      await expect(
        rewardPoints.connect(user1).removeRewarder(rewarder.address)
      ).to.be.revertedWithCustomError(rewardPoints, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });
  });
});
