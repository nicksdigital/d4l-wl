// deploy-crosschain.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SoulStream contracts for cross-chain testing...");

  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(await deployer.getBalance())} ETH`);

  // Deploy SoulIdentity implementation
  console.log("Deploying SoulIdentity implementation...");
  const D4LSoulIdentity = await ethers.getContractFactory("D4LSoulIdentity");
  const soulIdentityImpl = await D4LSoulIdentity.deploy(
    ethers.ZeroAddress, // Will be replaced in the actual deployment
    ethers.ZeroHash,    // Will be replaced in the actual deployment
    ethers.ZeroHash,    // Will be replaced in the actual deployment
    ethers.ZeroHash,    // Will be replaced in the actual deployment
    ethers.ZeroAddress, // Will be replaced in the actual deployment
    { gasLimit: 5000000 } // Add gas limit to avoid errors
  );
  await soulIdentityImpl.waitForDeployment();
  console.log(`SoulIdentity implementation deployed to: ${await soulIdentityImpl.getAddress()}`);

  // Deploy SoulStreamRegistry
  console.log("Deploying SoulStreamRegistry...");
  const D4LSoulStreamRegistryImpl = await ethers.getContractFactory("D4LSoulStreamRegistryImpl");
  const soulStreamRegistry = await D4LSoulStreamRegistryImpl.deploy(
    deployer.address,
    await soulIdentityImpl.getAddress()
  );
  await soulStreamRegistry.waitForDeployment();
  console.log(`SoulStreamRegistry deployed to: ${await soulStreamRegistry.getAddress()}`);

  // Deploy ReputationAsset implementation
  console.log("Deploying ReputationAsset implementation...");
  const D4LReputationAsset = await ethers.getContractFactory("D4LReputationAsset");
  const reputationAssetImpl = await D4LReputationAsset.deploy(
    "Community Reputation",
    "CREP",
    false, // non-transferable
    false, // non-divisible
    false, // non-consumable
    await soulStreamRegistry.getAddress(),
    deployer.address
  );
  await reputationAssetImpl.waitForDeployment();
  console.log(`ReputationAsset implementation deployed to: ${await reputationAssetImpl.getAddress()}`);

  // Deploy RewardsAsset implementation
  console.log("Deploying RewardsAsset implementation...");
  const D4LRewardsAsset = await ethers.getContractFactory("D4LRewardsAsset");
  const rewardsAssetImpl = await D4LRewardsAsset.deploy(
    "Community Rewards",
    "CRWD",
    true,  // transferable
    true,  // divisible
    true,  // consumable
    await soulStreamRegistry.getAddress(),
    deployer.address
  );
  await rewardsAssetImpl.waitForDeployment();
  console.log(`RewardsAsset implementation deployed to: ${await rewardsAssetImpl.getAddress()}`);

  // Register assets in the registry
  console.log("Registering assets in the registry...");
  await soulStreamRegistry.registerAsset(
    await reputationAssetImpl.getAddress(),
    "REPUTATION",
    "Community Reputation",
    "CREP"
  );
  console.log("Reputation asset registered");

  await soulStreamRegistry.registerAsset(
    await rewardsAssetImpl.getAddress(),
    "REWARDS",
    "Community Rewards",
    "CRWD"
  );
  console.log("Rewards asset registered");

  // Deploy BridgeAdapter
  console.log("Deploying BridgeAdapter...");
  const D4LSoulStreamBridgeAdapter = await ethers.getContractFactory("D4LSoulStreamBridgeAdapter");
  const bridgeAdapter = await D4LSoulStreamBridgeAdapter.deploy(
    await soulStreamRegistry.getAddress(),
    network.chainId,
    0, // Destination chain ID will be set later
    deployer.address
  );
  await bridgeAdapter.waitForDeployment();
  console.log(`BridgeAdapter deployed to: ${await bridgeAdapter.getAddress()}`);

  // Register the bridge adapter as a router
  console.log("Registering bridge adapter as a router...");
  await soulStreamRegistry.registerRouter(
    await bridgeAdapter.getAddress(),
    "BRIDGE_ADAPTER",
    true
  );
  console.log("Bridge adapter registered as router");

  // Print deployment summary
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
  console.log(`SoulIdentity Implementation: ${await soulIdentityImpl.getAddress()}`);
  console.log(`SoulStreamRegistry: ${await soulStreamRegistry.getAddress()}`);
  console.log(`ReputationAsset: ${await reputationAssetImpl.getAddress()}`);
  console.log(`RewardsAsset: ${await rewardsAssetImpl.getAddress()}`);
  console.log(`BridgeAdapter: ${await bridgeAdapter.getAddress()}`);
  console.log("\nNext steps:");
  console.log("1. Update the .env.local file with these addresses");
  console.log("2. Deploy to the other chain");
  console.log("3. Set the destination chain ID in the bridge adapter");
  console.log("4. Set the destination registry address in the bridge adapter");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
