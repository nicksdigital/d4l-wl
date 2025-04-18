// deploy-on-chain-propagation.js
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Deploying on-chain propagation contracts...');
  
  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(await deployer.getBalance())} ETH`);
  
  // Deploy MessagePropagationRegistry
  console.log('\nDeploying MessagePropagationRegistry...');
  const MessagePropagationRegistry = await ethers.getContractFactory('D4LMessagePropagationRegistry');
  const propagationRegistry = await MessagePropagationRegistry.deploy(network.chainId);
  await propagationRegistry.waitForDeployment();
  console.log(`MessagePropagationRegistry deployed to: ${await propagationRegistry.getAddress()}`);
  
  // Get the SoulStreamRegistry address
  // This assumes the registry is already deployed
  const registryAddress = process.env.NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS || 
                          process.env.NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS ||
                          '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default for local testing
  
  console.log(`Using SoulStreamRegistry at: ${registryAddress}`);
  
  // Get the destination chain ID
  // For Chain A, the destination is Chain B, and vice versa
  const sourceChainId = network.chainId;
  const destinationChainId = sourceChainId === 31337 ? 31338 : 31337; // Default for local testing
  
  console.log(`Source Chain ID: ${sourceChainId}`);
  console.log(`Destination Chain ID: ${destinationChainId}`);
  
  // Deploy OnChainPropagationBridgeAdapter
  console.log('\nDeploying OnChainPropagationBridgeAdapter...');
  const OnChainPropagationBridgeAdapter = await ethers.getContractFactory('D4LOnChainPropagationBridgeAdapter');
  const bridgeAdapter = await OnChainPropagationBridgeAdapter.deploy(
    registryAddress,
    sourceChainId,
    destinationChainId,
    await propagationRegistry.getAddress()
  );
  await bridgeAdapter.waitForDeployment();
  console.log(`OnChainPropagationBridgeAdapter deployed to: ${await bridgeAdapter.getAddress()}`);
  
  // Authorize the bridge adapter as a relayer in the propagation registry
  console.log('\nAuthorizing bridge adapter as relayer...');
  const tx = await propagationRegistry.setAuthorizedRelayer(await bridgeAdapter.getAddress(), true);
  await tx.wait();
  console.log('Bridge adapter authorized as relayer');
  
  // Update the .env.local file with the new addresses
  console.log('\nUpdating .env.local file...');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Determine which chain we're updating
  const isChainA = sourceChainId === 31337;
  const chainPrefix = isChainA ? 'CHAIN_A' : 'CHAIN_B';
  
  // Update or add the propagation registry address
  const propagationRegistryKey = `NEXT_PUBLIC_${chainPrefix}_PROPAGATION_REGISTRY_ADDRESS`;
  const propagationRegistryValue = await propagationRegistry.getAddress();
  
  if (envContent.includes(propagationRegistryKey)) {
    envContent = envContent.replace(
      new RegExp(`${propagationRegistryKey}=.*`),
      `${propagationRegistryKey}=${propagationRegistryValue}`
    );
  } else {
    envContent += `\n${propagationRegistryKey}=${propagationRegistryValue}`;
  }
  
  // Update or add the bridge adapter address
  const bridgeAdapterKey = `NEXT_PUBLIC_${chainPrefix}_BRIDGE_ADAPTER_ADDRESS`;
  const bridgeAdapterValue = await bridgeAdapter.getAddress();
  
  if (envContent.includes(bridgeAdapterKey)) {
    envContent = envContent.replace(
      new RegExp(`${bridgeAdapterKey}=.*`),
      `${bridgeAdapterKey}=${bridgeAdapterValue}`
    );
  } else {
    envContent += `\n${bridgeAdapterKey}=${bridgeAdapterValue}`;
  }
  
  // Write the updated .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('.env.local file updated');
  
  // Print deployment summary
  console.log('\nDeployment Summary:');
  console.log('===================');
  console.log(`Network: ${network.name} (chainId: ${sourceChainId})`);
  console.log(`MessagePropagationRegistry: ${await propagationRegistry.getAddress()}`);
  console.log(`OnChainPropagationBridgeAdapter: ${await bridgeAdapter.getAddress()}`);
  console.log('\nNext steps:');
  console.log('1. Deploy to the other chain');
  console.log('2. Set the destination registry address in the bridge adapter');
  console.log('3. Start the relayer service');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
