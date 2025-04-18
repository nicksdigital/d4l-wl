const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D4LAssetFactory Simple Test", function () {
  let owner;
  let mockERC20;
  let assetFactory;

  beforeEach(async function () {
    // Get signers
    [owner] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();

    // Deploy asset factory with a mock soul manager address
    const D4LAssetFactory = await ethers.getContractFactory("D4LAssetFactory");
    assetFactory = await D4LAssetFactory.deploy(
      owner.address, // Using owner as a mock soul manager for simplicity
      owner.address
    );
    await assetFactory.waitForDeployment();
  });

  it("Should deploy an ERC20 asset wrapper", async function () {
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
    const erc20Asset = await ethers.getContractAt("D4LERC20Asset", erc20AssetAddress);
    
    // Verify that the asset was deployed correctly
    expect(await erc20Asset.token()).to.equal(await mockERC20.getAddress());
    expect(await erc20Asset.owner()).to.equal(owner.address);
  });
});
