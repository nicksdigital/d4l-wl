const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TokenFactory Contract", function () {
  let TokenImplementation;
  let TokenFactory;
  let tokenImplementation;
  let tokenFactory;
  let deployer;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy TokenImplementation
    TokenImplementation = await ethers.getContractFactory("TokenImplementation");
    tokenImplementation = await TokenImplementation.deploy();
    await tokenImplementation.waitForDeployment();

    // Deploy TokenFactory
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactory.deploy(await tokenImplementation.getAddress());
    await tokenFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token implementation", async function () {
      expect(await tokenFactory.tokenImplementation()).to.equal(await tokenImplementation.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await tokenFactory.owner()).to.equal(deployer.address);
    });
  });

  describe("Token Creation", function () {
    it("Should create a token with the correct parameters", async function () {
      const name = "Test Token";
      const symbol = "TST";
      const decimals = 18;
      const initialSupply = ethers.parseEther("1000000"); // 1 million tokens

      const tx = await tokenFactory.createToken(
        name,
        symbol,
        decimals,
        initialSupply,
        user1.address
      );
      
      const receipt = await tx.wait();
      
      // Check if the TokenCreated event was emitted
      const tokenCreatedEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "TokenCreated"
      );
      
      expect(tokenCreatedEvent).to.not.be.undefined;
      
      // Get the token address from the event
      const tokenAddress = tokenCreatedEvent.args[0];
      
      // Verify token metadata in factory
      const tokenMetadata = await tokenFactory.tokens(tokenAddress);
      expect(tokenMetadata.name).to.equal(name);
      expect(tokenMetadata.symbol).to.equal(symbol);
      expect(tokenMetadata.decimals).to.equal(decimals);
      expect(tokenMetadata.owner).to.equal(user1.address);
      expect(tokenMetadata.exists).to.be.true;
      
      // Check token count
      expect(await tokenFactory.getTokenCount()).to.equal(1);
      
      // Check if token is from factory
      expect(await tokenFactory.isTokenFromFactory(tokenAddress)).to.be.true;
      
      // Check token instance details
      const TokenInstance = await ethers.getContractFactory("TokenImplementation");
      const tokenInstance = TokenInstance.attach(tokenAddress);
      
      expect(await tokenInstance.name()).to.equal(name);
      expect(await tokenInstance.symbol()).to.equal(symbol);
      expect(await tokenInstance.decimals()).to.equal(decimals);
      expect(await tokenInstance.totalSupply()).to.equal(initialSupply);
      expect(await tokenInstance.balanceOf(user1.address)).to.equal(initialSupply);
      expect(await tokenInstance.owner()).to.equal(user1.address);
    });

    it("Should fail when creating a token with empty name", async function () {
      await expect(
        tokenFactory.createToken(
          "",
          "TST",
          18,
          ethers.parseEther("1000000"),
          user1.address
        )
      ).to.be.revertedWith("TokenFactory: name cannot be empty");
    });

    it("Should fail when creating a token with empty symbol", async function () {
      await expect(
        tokenFactory.createToken(
          "Test Token",
          "",
          18,
          ethers.parseEther("1000000"),
          user1.address
        )
      ).to.be.revertedWith("TokenFactory: symbol cannot be empty");
    });

    it("Should fail when creating a token with zero address owner", async function () {
      await expect(
        tokenFactory.createToken(
          "Test Token",
          "TST",
          18,
          ethers.parseEther("1000000"),
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("TokenFactory: owner cannot be zero address");
    });
  });

  describe("Implementation Upgrade", function () {
    it("Should upgrade the implementation contract", async function () {
      // Deploy a new implementation
      const TokenImplementationV2 = await ethers.getContractFactory("TokenImplementationV2");
      const tokenImplementationV2 = await TokenImplementationV2.deploy();
      await tokenImplementationV2.waitForDeployment();
      
      const oldImplementation = await tokenFactory.tokenImplementation();
      
      // Upgrade implementation
      const tx = await tokenFactory.upgradeImplementation(await tokenImplementationV2.getAddress());
      const receipt = await tx.wait();
      
      // Check if the ImplementationUpgraded event was emitted
      const implementationUpgradedEvent = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ImplementationUpgraded"
      );
      
      expect(implementationUpgradedEvent).to.not.be.undefined;
      expect(implementationUpgradedEvent.args[0]).to.equal(oldImplementation);
      expect(implementationUpgradedEvent.args[1]).to.equal(await tokenImplementationV2.getAddress());
      
      // Check if implementation was updated
      expect(await tokenFactory.tokenImplementation()).to.equal(await tokenImplementationV2.getAddress());
    });

    it("Should fail when upgrading to zero address", async function () {
      await expect(
        tokenFactory.upgradeImplementation(ethers.ZeroAddress)
      ).to.be.revertedWith("TokenFactory: new implementation cannot be zero address");
    });

    it("Should fail when upgrading to the same implementation", async function () {
      const currentImplementation = await tokenFactory.tokenImplementation();
      
      await expect(
        tokenFactory.upgradeImplementation(currentImplementation)
      ).to.be.revertedWith("TokenFactory: new implementation must be different");
    });

    it("Should fail when non-owner tries to upgrade implementation", async function () {
      const TokenImplementationV2 = await ethers.getContractFactory("TokenImplementationV2");
      const tokenImplementationV2 = await TokenImplementationV2.deploy();
      await tokenImplementationV2.waitForDeployment();
      
      await expect(
        tokenFactory.connect(user1).upgradeImplementation(await tokenImplementationV2.getAddress())
      ).to.be.revertedWithCustomError(tokenFactory, "OwnableUnauthorizedAccount");
    });
  });
});
