// Script to run a local Hardhat node, deploy contracts, and perform some test operations
const hre = require("hardhat");

async function main() {
  console.log("Starting local development environment...");

  // Get accounts
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log(`Using accounts:`);
  console.log(`- Deployer: ${deployer.address}`);
  console.log(`- User 1: ${user1.address}`);
  console.log(`- User 2: ${user2.address}`);

  // Deploy contracts
  console.log("\nDeploying contracts...");
  
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

  // Deploy RewardPoints
  console.log("Deploying RewardPoints...");
  const RewardPoints = await hre.ethers.getContractFactory("RewardPoints");
  const rewardPoints = await RewardPoints.deploy();
  await rewardPoints.waitForDeployment();
  const rewardPointsAddress = await rewardPoints.getAddress();
  console.log(`RewardPoints deployed to: ${rewardPointsAddress}`);

  // Create test tokens
  console.log("\nCreating test tokens...");
  
  // User 1 creates a token
  console.log("User 1 creating a token...");
  const tx1 = await tokenFactory.connect(user1).createToken(
    "User One Token",
    "UOT",
    18,
    hre.ethers.parseEther("1000000"),
    user1.address
  );
  const receipt1 = await tx1.wait();
  
  // Find token address from event
  const tokenCreatedEvent1 = receipt1.logs.find(
    (log) => log.fragment && log.fragment.name === "TokenCreated"
  );
  const token1Address = tokenCreatedEvent1.args[0];
  console.log(`User 1 token created at: ${token1Address}`);
  
  // Award reward points to user 1
  const pointsAmount1 = 100;
  await rewardPoints.awardPoints(user1.address, pointsAmount1, "Creating first token");
  console.log(`Awarded ${pointsAmount1} points to User 1`);
  
  // User 2 creates a token
  console.log("User 2 creating a token...");
  const tx2 = await tokenFactory.connect(user2).createToken(
    "User Two Token",
    "UTT",
    18,
    hre.ethers.parseEther("500000"),
    user2.address
  );
  const receipt2 = await tx2.wait();
  
  // Find token address from event
  const tokenCreatedEvent2 = receipt2.logs.find(
    (log) => log.fragment && log.fragment.name === "TokenCreated"
  );
  const token2Address = tokenCreatedEvent2.args[0];
  console.log(`User 2 token created at: ${token2Address}`);
  
  // Award reward points to user 2
  const pointsAmount2 = 200;
  await rewardPoints.awardPoints(user2.address, pointsAmount2, "Creating second token");
  console.log(`Awarded ${pointsAmount2} points to User 2`);
  
  // Check reward points
  console.log("\nChecking reward points...");
  const user1Points = await rewardPoints.getPoints(user1.address);
  const user2Points = await rewardPoints.getPoints(user2.address);
  const totalPoints = await rewardPoints.getTotalPoints();
  
  console.log(`User 1 points: ${user1Points}`);
  console.log(`User 2 points: ${user2Points}`);
  console.log(`Total points: ${totalPoints}`);
  
  console.log("\nLocal environment setup complete!");
  console.log("Contract addresses:");
  console.log({
    tokenImplementation: tokenImplementationAddress,
    tokenFactory: tokenFactoryAddress,
    rewardPoints: rewardPointsAddress,
    user1Token: token1Address,
    user2Token: token2Address
  });
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
