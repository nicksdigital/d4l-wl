const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Minimal D4LAssetFactory Test", function () {
  it("Should compile and deploy D4LAssetFactory", async function () {
    // Get signers
    const [owner] = await ethers.getSigners();
    
    console.log("Deploying D4LAssetFactory...");
    
    // Deploy asset factory with a mock soul manager address
    const D4LAssetFactory = await ethers.getContractFactory("D4LAssetFactory");
    const assetFactory = await D4LAssetFactory.deploy(
      owner.address, // Using owner as a mock soul manager for simplicity
      owner.address
    );
    
    await assetFactory.waitForDeployment();
    
    console.log("D4LAssetFactory deployed successfully");
    
    // Verify that the contract was deployed correctly
    expect(await assetFactory.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await assetFactory.owner()).to.equal(owner.address);
    
    console.log("Test completed successfully");
  });
});
