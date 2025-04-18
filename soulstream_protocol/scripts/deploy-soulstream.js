// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the factory
  const D4LSoulStreamFactory = await hre.ethers.getContractFactory("D4LSoulStreamFactory");
  const factory = await D4LSoulStreamFactory.deploy();
  await factory.waitForDeployment();
  console.log("D4LSoulStreamFactory deployed to:", await factory.getAddress());

  // Set up the SoulStream system
  const admin = deployer.address;
  const stakingRouteOwner = deployer.address;
  const lockDuration = 86400; // 1 day in seconds
  const rewardRate = hre.ethers.parseUnits("0.0001", 18); // 0.0001 tokens per second per token staked

  // For this example, we'll use a mock LayerZero endpoint
  // In a real deployment, you would use the actual LayerZero endpoint address
  // Set to zero address to skip bridge adapter deployment
  const lzEndpoint = hre.ethers.ZeroAddress; // Skip bridge adapter deployment for now

  console.log("Setting up SoulStream system...");
  const tx = await factory.setupSoulStream(
    admin,
    stakingRouteOwner,
    lockDuration,
    rewardRate,
    lzEndpoint
  );
  const receipt = await tx.wait();

  // Get the deployed addresses from the events
  const registryAddress = receipt.logs.find(
    log => log.fragment && log.fragment.name === "RegistryDeployed"
  ).args[0];

  const routerAddress = receipt.logs.find(
    log => log.fragment && log.fragment.name === "RouterDeployed"
  ).args[0];

  const stakingRouteAddress = receipt.logs.find(
    log => log.fragment && log.fragment.name === "RouteImplementationDeployed"
  ).args[0];

  // Check if bridge adapter was deployed
  const bridgeAdapterEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === "BridgeAdapterDeployed"
  );
  const bridgeAdapterAddress = bridgeAdapterEvent ? bridgeAdapterEvent.args[0] : hre.ethers.ZeroAddress;

  console.log("D4LSoulStreamRegistryImpl deployed to:", registryAddress);
  console.log("D4LSoulflowRouter deployed to:", routerAddress);
  console.log("D4LSoulflowStakingRoute deployed to:", stakingRouteAddress);
  if (bridgeAdapterAddress !== hre.ethers.ZeroAddress) {
    console.log("D4LLayerZeroBridgeAdapter deployed to:", bridgeAdapterAddress);
  }

  // Get the contract instances
  const registry = await hre.ethers.getContractAt("D4LSoulStreamRegistryImpl", registryAddress);
  const router = await hre.ethers.getContractAt("D4LSoulflowRouter", routerAddress);

  // Grant roles
  console.log("Granting roles...");

  // Grant ROUTER_MANAGER_ROLE to the deployer
  const ROUTER_MANAGER_ROLE = await router.ROUTE_MANAGER_ROLE();
  await router.grantRole(ROUTER_MANAGER_ROLE, deployer.address);

  // Grant REGISTRY_IDENTITY_MANAGER_ROLE to the deployer
  const REGISTRY_IDENTITY_MANAGER_ROLE = await registry.REGISTRY_IDENTITY_MANAGER_ROLE();
  await registry.grantRole(REGISTRY_IDENTITY_MANAGER_ROLE, deployer.address);

  console.log("Deployment completed!");
  console.log("Next steps:");
  console.log("1. Create a soul identity using the registry");
  console.log("2. Register routes in the registry");
  console.log("3. Register route implementations in the router");
  console.log("4. Authorize routes in the soul identity");
  console.log("5. Execute intents through the soul identity");
  console.log("6. For cross-chain functionality:");
  console.log("   a. Deploy a bridge adapter with a real LayerZero endpoint");
  console.log("   b. Configure supported chains in the router");
  console.log("   c. Map chain IDs in the bridge adapter");
  console.log("   d. Execute cross-chain routes");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
