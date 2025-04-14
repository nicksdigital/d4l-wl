// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the token implementation
  const TokenImplementation = await hre.ethers.getContractFactory("TokenImplementation");
  const tokenImplementation = await TokenImplementation.deploy();
  await tokenImplementation.waitForDeployment();
  console.log("TokenImplementation deployed to:", await tokenImplementation.getAddress());

  // Deploy the token factory
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(await tokenImplementation.getAddress());
  await tokenFactory.waitForDeployment();
  console.log("TokenFactory deployed to:", await tokenFactory.getAddress());

  // Deploy the token upgrader
  const TokenUpgrader = await hre.ethers.getContractFactory("TokenUpgrader");
  const tokenUpgrader = await TokenUpgrader.deploy();
  await tokenUpgrader.waitForDeployment();
  console.log("TokenUpgrader deployed to:", await tokenUpgrader.getAddress());

  // Deploy the V2 implementation (for future upgrades)
  const TokenImplementationV2 = await hre.ethers.getContractFactory("TokenImplementationV2");
  const tokenImplementationV2 = await TokenImplementationV2.deploy();
  await tokenImplementationV2.waitForDeployment();
  console.log("TokenImplementationV2 deployed to:", await tokenImplementationV2.getAddress());

  console.log("Deployment completed!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
