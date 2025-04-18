const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.skip("D4L Asset Tests", function () {
  this.timeout(100000); // Increase timeout for the entire test suite
  let owner, user1, user2;
  let mockERC20, mockERC721;
  let soulStreamRegistry, soulIdentityImpl;
  let assetFactory, erc20Asset, erc721Asset;
  let user1SoulId, user2SoulId;

  beforeEach(async function () {
    console.log("Setting up test environment...");
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy("Test NFT", "TNFT");
    await mockERC721.waitForDeployment();

    // Mint some NFTs
    await mockERC721.mint(user1.address, 1);
    await mockERC721.mint(user1.address, 2);
    await mockERC721.mint(user2.address, 3);

    // Transfer some tokens to users
    await mockERC20.transfer(user1.address, ethers.parseEther("10000"));
    await mockERC20.transfer(user2.address, ethers.parseEther("10000"));

    // Deploy SoulStreamRegistry and SoulIdentity implementation
    const D4LSoulIdentity = await ethers.getContractFactory("D4LSoulIdentity");
    soulIdentityImpl = await D4LSoulIdentity.deploy(
      ethers.ZeroAddress, // Will be replaced in the actual deployment
      ethers.ZeroHash,    // Will be replaced in the actual deployment
      ethers.ZeroHash,    // Will be replaced in the actual deployment
      ethers.ZeroHash,    // Will be replaced in the actual deployment
      ethers.ZeroAddress, // Will be replaced in the actual deployment
      { gasLimit: 5000000 } // Add gas limit to avoid errors
    );
    await soulIdentityImpl.waitForDeployment();

    const D4LSoulStreamRegistryImpl = await ethers.getContractFactory("D4LSoulStreamRegistryImpl");
    soulStreamRegistry = await D4LSoulStreamRegistryImpl.deploy(
      owner.address,
      await soulIdentityImpl.getAddress()
    );
    await soulStreamRegistry.waitForDeployment();

    // Create soul identities for users
    const appSalt1 = ethers.keccak256(ethers.toUtf8Bytes("User1Salt"));
    const routingIntentHash1 = ethers.keccak256(ethers.toUtf8Bytes("User1Intent"));
    await soulStreamRegistry.createSoulIdentity(
      user1.address,
      appSalt1,
      routingIntentHash1,
      ethers.ZeroHash
    );

    const appSalt2 = ethers.keccak256(ethers.toUtf8Bytes("User2Salt"));
    const routingIntentHash2 = ethers.keccak256(ethers.toUtf8Bytes("User2Intent"));
    await soulStreamRegistry.createSoulIdentity(
      user2.address,
      appSalt2,
      routingIntentHash2,
      ethers.ZeroHash
    );

    // Get the soul identity addresses
    const user1Souls = await soulStreamRegistry.getUserSoulIdentities(user1.address);
    user1SoulId = user1Souls[0];
    const user2Souls = await soulStreamRegistry.getUserSoulIdentities(user2.address);
    user2SoulId = user2Souls[0];

    // Deploy asset factory
    const D4LAssetFactory = await ethers.getContractFactory("D4LAssetFactory");
    assetFactory = await D4LAssetFactory.deploy(
      await soulStreamRegistry.getAddress(),
      owner.address
    );
    await assetFactory.waitForDeployment();

    // Deploy asset wrappers
    const erc20AssetTx = await assetFactory.deployERC20Asset(
      await mockERC20.getAddress(),
      true,  // transferable
      true,  // divisible
      true,  // consumable
      owner.address
    );
    const erc20AssetReceipt = await erc20AssetTx.wait();

    // Find the ERC20AssetDeployed event
    let erc20AssetAddress;
    for (const log of erc20AssetReceipt.logs) {
      try {
        const parsedLog = assetFactory.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        if (parsedLog && parsedLog.name === "ERC20AssetDeployed") {
          erc20AssetAddress = parsedLog.args[1];
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
        continue;
      }
    }

    if (!erc20AssetAddress) {
      throw new Error("ERC20AssetDeployed event not found");
    }

    erc20Asset = await ethers.getContractAt("D4LERC20Asset", erc20AssetAddress);

    const erc721AssetTx = await assetFactory.deployERC721Asset(
      await mockERC721.getAddress(),
      true,  // transferable
      false, // consumable
      owner.address
    );
    const erc721AssetReceipt = await erc721AssetTx.wait();

    // Find the ERC721AssetDeployed event
    let erc721AssetAddress;
    for (const log of erc721AssetReceipt.logs) {
      try {
        const parsedLog = assetFactory.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        if (parsedLog && parsedLog.name === "ERC721AssetDeployed") {
          erc721AssetAddress = parsedLog.args[1];
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
        continue;
      }
    }

    if (!erc721AssetAddress) {
      throw new Error("ERC721AssetDeployed event not found");
    }

    erc721Asset = await ethers.getContractAt("D4LERC721Asset", erc721AssetAddress);

    console.log("Test environment setup complete.");
  });

  describe("ERC20 Asset Tests", function () {
    console.log("Starting ERC20 Asset Tests...");
    it("Should link ERC20 tokens to a soul", async function () {
      // Approve the asset contract to spend tokens
      await mockERC20.connect(user1).approve(await erc20Asset.getAddress(), ethers.parseEther("1000"));

      // Link tokens to the soul
      await erc20Asset.connect(user1).linkToSoul(user1SoulId, ethers.parseEther("1000"));

      // Check the soul balance
      expect(await erc20Asset.balanceOfSoul(user1SoulId)).to.equal(ethers.parseEther("1000"));
      expect(await erc20Asset.totalLinkedAmount()).to.equal(ethers.parseEther("1000"));
    });

    it("Should transfer ERC20 tokens between souls", async function () {
      // Approve and link tokens to the first soul
      await mockERC20.connect(user1).approve(await erc20Asset.getAddress(), ethers.parseEther("1000"));
      await erc20Asset.connect(user1).linkToSoul(user1SoulId, ethers.parseEther("1000"));

      // Transfer tokens between souls
      await erc20Asset.connect(user1).transferBetweenSouls(
        user1SoulId,
        user2SoulId,
        ethers.parseEther("500")
      );

      // Check the soul balances
      expect(await erc20Asset.balanceOfSoul(user1SoulId)).to.equal(ethers.parseEther("500"));
      expect(await erc20Asset.balanceOfSoul(user2SoulId)).to.equal(ethers.parseEther("500"));
      expect(await erc20Asset.totalLinkedAmount()).to.equal(ethers.parseEther("1000"));
    });

    it("Should unlink ERC20 tokens from a soul", async function () {
      // Approve and link tokens to the soul
      await mockERC20.connect(user1).approve(await erc20Asset.getAddress(), ethers.parseEther("1000"));
      await erc20Asset.connect(user1).linkToSoul(user1SoulId, ethers.parseEther("1000"));

      // Unlink tokens from the soul
      await erc20Asset.connect(user1).unlinkFromSoul(user1SoulId, ethers.parseEther("500"));

      // Check the soul balance
      expect(await erc20Asset.balanceOfSoul(user1SoulId)).to.equal(ethers.parseEther("500"));
      expect(await erc20Asset.totalLinkedAmount()).to.equal(ethers.parseEther("500"));
      expect(await mockERC20.balanceOf(user1.address)).to.equal(ethers.parseEther("9500"));
    });

    it("Should return correct asset metadata", async function () {
      const metadata = await erc20Asset.assetMetadata();
      expect(metadata[0]).to.equal("Test Token");
      expect(metadata[1]).to.equal("TEST");
      expect(metadata[2]).to.equal(18);
    });

    it("Should return correct asset constraints", async function () {
      const constraints = await erc20Asset.assetConstraints();
      expect(constraints[0]).to.equal(true);  // transferable
      expect(constraints[1]).to.equal(true);  // divisible
      expect(constraints[2]).to.equal(true);  // consumable
    });

    it("Should return correct asset type", async function () {
      expect(await erc20Asset.assetType()).to.equal(1); // ERC20
    });
  });

  describe("ERC721 Asset Tests", function () {
    console.log("Starting ERC721 Asset Tests...");
    it("Should link ERC721 tokens to a soul", async function () {
      // Approve the asset contract to transfer the NFT
      await mockERC721.connect(user1).approve(await erc721Asset.getAddress(), 1);

      // Link the NFT to the soul
      await erc721Asset.connect(user1).linkToSoul(user1SoulId, 1);

      // Check the soul balance
      expect(await erc721Asset.balanceOfSoul(user1SoulId)).to.equal(1);
      expect(await erc721Asset.totalLinkedAmount()).to.equal(1);
      expect(await erc721Asset.getSoulForTokenId(1)).to.equal(user1SoulId);
    });

    it("Should transfer ERC721 tokens between souls", async function () {
      // Approve and link the NFT to the first soul
      await mockERC721.connect(user1).approve(await erc721Asset.getAddress(), 1);
      await erc721Asset.connect(user1).linkToSoul(user1SoulId, 1);

      // Transfer the NFT between souls
      await erc721Asset.connect(user1).transferBetweenSouls(
        user1SoulId,
        user2SoulId,
        1
      );

      // Check the soul balances
      expect(await erc721Asset.balanceOfSoul(user1SoulId)).to.equal(0);
      expect(await erc721Asset.balanceOfSoul(user2SoulId)).to.equal(1);
      expect(await erc721Asset.totalLinkedAmount()).to.equal(1);
      expect(await erc721Asset.getSoulForTokenId(1)).to.equal(user2SoulId);
    });

    it("Should unlink ERC721 tokens from a soul", async function () {
      // Approve and link the NFT to the soul
      await mockERC721.connect(user1).approve(await erc721Asset.getAddress(), 1);
      await erc721Asset.connect(user1).linkToSoul(user1SoulId, 1);

      // Unlink the NFT from the soul
      await erc721Asset.connect(user1).unlinkFromSoul(user1SoulId, 1);

      // Check the soul balance
      expect(await erc721Asset.balanceOfSoul(user1SoulId)).to.equal(0);
      expect(await erc721Asset.totalLinkedAmount()).to.equal(0);
      expect(await mockERC721.ownerOf(1)).to.equal(user1.address);
    });

    it("Should return correct asset metadata", async function () {
      const metadata = await erc721Asset.assetMetadata();
      expect(metadata[0]).to.equal("Test NFT");
      expect(metadata[1]).to.equal("TNFT");
      expect(metadata[2]).to.equal(0); // No decimals for ERC721
    });

    it("Should return correct asset constraints", async function () {
      const constraints = await erc721Asset.assetConstraints();
      expect(constraints[0]).to.equal(true);   // transferable
      expect(constraints[1]).to.equal(false);  // divisible (always false for ERC721)
      expect(constraints[2]).to.equal(false);  // consumable
    });

    it("Should return correct asset type", async function () {
      expect(await erc721Asset.assetType()).to.equal(2); // ERC721
    });
  });
});
