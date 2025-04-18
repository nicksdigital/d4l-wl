// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the auth factory
  const D4LAuthFactory = await hre.ethers.getContractFactory("D4LAuthFactory");
  const factory = await D4LAuthFactory.deploy();
  await factory.waitForDeployment();
  console.log("D4LAuthFactory deployed to:", await factory.getAddress());

  // Get the registry address
  // In a real deployment, you would use the actual registry address
  // For this example, we'll assume the registry is already deployed
  console.log("Enter the registry address:");
  const registryAddress = process.env.REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  if (registryAddress === "0x0000000000000000000000000000000000000000") {
    console.log("WARNING: Using zero address for registry. Set REGISTRY_ADDRESS environment variable.");
  }

  // Set up the auth system
  const admin = deployer.address;
  const sessionDuration = 86400; // 1 day in seconds

  console.log("Deploying D4LAuth...");
  const tx = await factory.deployAuth(
    admin,
    registryAddress,
    sessionDuration
  );
  const receipt = await tx.wait();

  // Get the deployed address from the event
  const authAddress = receipt.logs.find(
    log => log.fragment && log.fragment.name === "AuthDeployed"
  ).args[0];

  console.log("D4LAuth deployed to:", authAddress);

  // Get the auth contract instance
  const auth = await hre.ethers.getContractAt("D4LAuth", authAddress);

  // Grant roles
  console.log("Granting roles...");
  
  // Grant USER_MANAGER_ROLE to the deployer
  const USER_MANAGER_ROLE = await auth.USER_MANAGER_ROLE();
  await auth.grantRole(USER_MANAGER_ROLE, deployer.address);
  
  // Grant AUTH_ADMIN_ROLE to the deployer
  const AUTH_ADMIN_ROLE = await auth.AUTH_ADMIN_ROLE();
  await auth.grantRole(AUTH_ADMIN_ROLE, deployer.address);

  console.log("Deployment completed!");
  console.log("Next steps:");
  console.log("1. Users can register with signature verification");
  console.log("2. Users can login with signature verification");
  console.log("3. Soul identities are automatically created for new users");
  console.log("4. Sessions can be validated for authenticated access");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
