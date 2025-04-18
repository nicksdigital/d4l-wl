const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D4LAssetFactory Tests", function () {
  let owner, user1;
  let mockERC20, mockERC721;
  let assetFactory;
  let erc20Asset, erc721Asset;

  before(async function () {
    // Get signers
    [owner, user1] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy("Test NFT", "TNFT");
    await mockERC721.waitForDeployment();

    // Deploy asset factory with a mock soul manager address
    const D4LAssetFactory = await ethers.getContractFactory("D4LAssetFactory");
    assetFactory = await D4LAssetFactory.deploy(
      owner.address, // Using owner as a mock soul manager for simplicity
      owner.address
    );
    await assetFactory.waitForDeployment();

    console.log("Contracts deployed successfully");
  });

  it("Should deploy an ERC20 asset wrapper", async function () {
    console.log("Deploying ERC20 asset wrapper...");
    
    // Deploy ERC20 asset wrapper
    const erc20AssetTx = await assetFactory.deployERC20Asset(
      await mockERC20.getAddress(),
      true,  // transferable
      true,  // divisible
      true,  // consumable
      owner.address
    );
    
    // Wait for the transaction to be mined
    const receipt = await erc20AssetTx.wait();
    
    // Verify that the transaction was successful
    expect(receipt.status).to.equal(1);
    
    // Try to find the ERC20AssetDeployed event
    let erc20AssetAddress;
    for (const log of receipt.logs) {
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
    
    // Verify that we found the event and the asset address
    expect(erc20AssetAddress).to.not.be.undefined;
    
    // Get the ERC20 asset contract
    erc20Asset = await ethers.getContractAt("D4LERC20Asset", erc20AssetAddress);
    
    // Verify that the asset was deployed correctly
    expect(await erc20Asset.token()).to.equal(await mockERC20.getAddress());
    expect(await erc20Asset.owner()).to.equal(owner.address);
    
    console.log("ERC20 asset wrapper deployed successfully");
  });

  it("Should deploy an ERC721 asset wrapper", async function () {
    console.log("Deploying ERC721 asset wrapper...");
    
    // Deploy ERC721 asset wrapper
    const erc721AssetTx = await assetFactory.deployERC721Asset(
      await mockERC721.getAddress(),
      true,  // transferable
      false, // consumable
      owner.address
    );
    
    // Wait for the transaction to be mined
    const receipt = await erc721AssetTx.wait();
    
    // Verify that the transaction was successful
    expect(receipt.status).to.equal(1);
    
    // Try to find the ERC721AssetDeployed event
    let erc721AssetAddress;
    for (const log of receipt.logs) {
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
    
    // Verify that we found the event and the asset address
    expect(erc721AssetAddress).to.not.be.undefined;
    
    // Get the ERC721 asset contract
    erc721Asset = await ethers.getContractAt("D4LERC721Asset", erc721AssetAddress);
    
    // Verify that the asset was deployed correctly
    expect(await erc721Asset.token()).to.equal(await mockERC721.getAddress());
    expect(await erc721Asset.owner()).to.equal(owner.address);
    
    console.log("ERC721 asset wrapper deployed successfully");
  });

  it("Should return correct asset metadata for ERC20", async function () {
    console.log("Checking ERC20 asset metadata...");
    
    const metadata = await erc20Asset.assetMetadata();
    expect(metadata[0]).to.equal("Test Token");
    expect(metadata[1]).to.equal("TEST");
    expect(metadata[2]).to.equal(18);
    
    console.log("ERC20 asset metadata verified successfully");
  });

  it("Should return correct asset constraints for ERC20", async function () {
    console.log("Checking ERC20 asset constraints...");
    
    const constraints = await erc20Asset.assetConstraints();
    expect(constraints[0]).to.equal(true);  // transferable
    expect(constraints[1]).to.equal(true);  // divisible
    expect(constraints[2]).to.equal(true);  // consumable
    
    console.log("ERC20 asset constraints verified successfully");
  });

  it("Should return correct asset type for ERC20", async function () {
    console.log("Checking ERC20 asset type...");
    
    expect(await erc20Asset.assetType()).to.equal(1); // ERC20
    
    console.log("ERC20 asset type verified successfully");
  });

  it("Should return correct asset metadata for ERC721", async function () {
    console.log("Checking ERC721 asset metadata...");
    
    const metadata = await erc721Asset.assetMetadata();
    expect(metadata[0]).to.equal("Test NFT");
    expect(metadata[1]).to.equal("TNFT");
    expect(metadata[2]).to.equal(0); // No decimals for ERC721
    
    console.log("ERC721 asset metadata verified successfully");
  });

  it("Should return correct asset constraints for ERC721", async function () {
    console.log("Checking ERC721 asset constraints...");
    
    const constraints = await erc721Asset.assetConstraints();
    expect(constraints[0]).to.equal(true);   // transferable
    expect(constraints[1]).to.equal(false);  // divisible (always false for ERC721)
    expect(constraints[2]).to.equal(false);  // consumable
    
    console.log("ERC721 asset constraints verified successfully");
  });

  it("Should return correct asset type for ERC721", async function () {
    console.log("Checking ERC721 asset type...");
    
    expect(await erc721Asset.assetType()).to.equal(2); // ERC721
    
    console.log("ERC721 asset type verified successfully");
  });
});
