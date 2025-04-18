// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get deployment accounts
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Deploy TokenImplementation
  console.log("Deploying TokenImplementation...");
  const TokenImplementation = await hre.ethers.getContractFactory("TokenImplementation");
  const tokenImplementation = await TokenImplementation.deploy();
  await tokenImplementation.waitForDeployment();
  const tokenImplementationAddress = await tokenImplementation.getAddress();
  console.log(`TokenImplementation deployed to: ${tokenImplementationAddress}`);

  // Deploy TokenFactory
  console.log("Deploying TokenFactory...");
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(tokenImplementationAddress);
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log(`TokenFactory deployed to: ${tokenFactoryAddress}`);

  // Deploy RewardPoints contract
  console.log("Deploying RewardPoints...");
  const RewardPoints = await hre.ethers.getContractFactory("RewardPoints");
  const rewardPoints = await RewardPoints.deploy();
  await rewardPoints.waitForDeployment();
  const rewardPointsAddress = await rewardPoints.getAddress();
  console.log(`RewardPoints deployed to: ${rewardPointsAddress}`);

  // Add TokenFactory as a rewarder
  console.log("Setting up roles...");
  const addRewarderTx = await rewardPoints.addRewarder(tokenFactoryAddress);
  await addRewarderTx.wait();
  console.log(`TokenFactory added as rewarder in RewardPoints contract`);

  console.log("Deployment complete!");
  console.log({
    tokenImplementation: tokenImplementationAddress,
    tokenFactory: tokenFactoryAddress,
    rewardPoints: rewardPointsAddress
  });
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
