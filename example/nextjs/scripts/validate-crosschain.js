// validate-crosschain.js
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const chainA = {
  id: process.env.NEXT_PUBLIC_CHAIN_A_ID,
  rpcUrl: process.env.NEXT_PUBLIC_CHAIN_A_RPC_URL,
  registryAddress: process.env.NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS,
  bridgeAdapterAddress: process.env.NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS,
  name: 'Chain A (Ethereum)'
};

const chainB = {
  id: process.env.NEXT_PUBLIC_CHAIN_B_ID,
  rpcUrl: process.env.NEXT_PUBLIC_CHAIN_B_RPC_URL,
  registryAddress: process.env.NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS,
  bridgeAdapterAddress: process.env.NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS,
  name: 'Chain B (Polygon)'
};

// ABIs
const REGISTRY_ABI = [
  "function getUserSoulIdentities(address user) view returns (address[])",
  "function getAssetAddress(string assetType) view returns (address)"
];

const REPUTATION_ASSET_ABI = [
  "function balanceOfSoul(address soul) view returns (uint256)",
  "function mintToSoul(address soul, uint256 amount)"
];

const REWARDS_ASSET_ABI = [
  "function balanceOfSoul(address soul) view returns (uint256)",
  "function mintToSoul(address soul, uint256 amount)"
];

const BRIDGE_ADAPTER_ABI = [
  "function routeReputationCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
  "function routeRewardsCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
  "function receiveMessage(bytes32 messageId, address fromSoul, address toSoul, address asset, uint256 amount, bytes data) external",
  "event MessageSent(bytes32 indexed messageId, uint256 indexed destinationChainId, address fromSoul, address toSoul, address asset, uint256 amount)"
];

// Validation steps
async function validateCrossChain() {
  console.log('Starting cross-chain validation...');
  
  // Check environment variables
  if (!chainA.id || !chainA.rpcUrl || !chainA.registryAddress || !chainA.bridgeAdapterAddress ||
      !chainB.id || !chainB.rpcUrl || !chainB.registryAddress || !chainB.bridgeAdapterAddress) {
    console.error('Missing environment variables. Please check your .env.local file.');
    process.exit(1);
  }
  
  // Create providers
  const providerA = new ethers.JsonRpcProvider(chainA.rpcUrl);
  const providerB = new ethers.JsonRpcProvider(chainB.rpcUrl);
  
  // Get wallet
  const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const walletA = new ethers.Wallet(privateKey, providerA);
  const walletB = new ethers.Wallet(privateKey, providerB);
  
  console.log(`Using wallet address: ${walletA.address}`);
  
  // Create contract instances
  const registryA = new ethers.Contract(chainA.registryAddress, REGISTRY_ABI, walletA);
  const registryB = new ethers.Contract(chainB.registryAddress, REGISTRY_ABI, walletB);
  
  const bridgeAdapterA = new ethers.Contract(chainA.bridgeAdapterAddress, BRIDGE_ADAPTER_ABI, walletA);
  
  // Step 1: Check if Soul Identities exist on both chains
  console.log('\nStep 1: Checking Soul Identities...');
  
  let soulIdsA = await registryA.getUserSoulIdentities(walletA.address);
  let soulIdsB = await registryB.getUserSoulIdentities(walletB.address);
  
  let soulIdA = soulIdsA.length > 0 ? soulIdsA[0] : null;
  let soulIdB = soulIdsB.length > 0 ? soulIdsB[0] : null;
  
  console.log(`${chainA.name} Soul ID: ${soulIdA || 'Not found'}`);
  console.log(`${chainB.name} Soul ID: ${soulIdB || 'Not found'}`);
  
  if (!soulIdA || !soulIdB) {
    console.error('Soul Identities not found on both chains. Please create them first.');
    process.exit(1);
  }
  
  // Step 2: Get reputation asset addresses
  console.log('\nStep 2: Getting reputation asset addresses...');
  
  const reputationAssetAddressA = await registryA.getAssetAddress("REPUTATION");
  const reputationAssetAddressB = await registryB.getAssetAddress("REPUTATION");
  
  console.log(`${chainA.name} Reputation Asset: ${reputationAssetAddressA}`);
  console.log(`${chainB.name} Reputation Asset: ${reputationAssetAddressB}`);
  
  if (!reputationAssetAddressA || !reputationAssetAddressB) {
    console.error('Reputation assets not found on both chains.');
    process.exit(1);
  }
  
  // Create reputation asset contracts
  const reputationAssetA = new ethers.Contract(reputationAssetAddressA, REPUTATION_ASSET_ABI, walletA);
  const reputationAssetB = new ethers.Contract(reputationAssetAddressB, REPUTATION_ASSET_ABI, walletB);
  
  // Step 3: Check initial balances
  console.log('\nStep 3: Checking initial balances...');
  
  const initialBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
  const initialBalanceB = await reputationAssetB.balanceOfSoul(soulIdB);
  
  console.log(`Initial ${chainA.name} Reputation: ${ethers.formatEther(initialBalanceA)}`);
  console.log(`Initial ${chainB.name} Reputation: ${ethers.formatEther(initialBalanceB)}`);
  
  // Step 4: Mint reputation on Chain A if needed
  console.log('\nStep 4: Minting reputation on Chain A if needed...');
  
  const mintAmount = ethers.parseEther("100");
  
  if (initialBalanceA < mintAmount) {
    console.log(`Minting ${ethers.formatEther(mintAmount)} reputation to ${soulIdA} on ${chainA.name}...`);
    const mintTx = await reputationAssetA.mintToSoul(soulIdA, mintAmount);
    await mintTx.wait();
    console.log('Minting complete');
    
    // Check updated balance
    const updatedBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
    console.log(`Updated ${chainA.name} Reputation: ${ethers.formatEther(updatedBalanceA)}`);
  } else {
    console.log(`Sufficient reputation already exists on ${chainA.name}`);
  }
  
  // Step 5: Transfer reputation from Chain A to Chain B
  console.log('\nStep 5: Transferring reputation from Chain A to Chain B...');
  
  const transferAmount = ethers.parseEther("10");
  console.log(`Transfer amount: ${ethers.formatEther(transferAmount)}`);
  
  // Listen for MessageSent event
  let messageId = null;
  let fromSoul = null;
  let toSoul = null;
  let asset = null;
  let amount = null;
  
  const listener = (msgId, destChainId, from, to, assetAddr, amt) => {
    console.log('MessageSent event received:');
    console.log(`  Message ID: ${msgId}`);
    console.log(`  Destination Chain ID: ${destChainId}`);
    console.log(`  From Soul: ${from}`);
    console.log(`  To Soul: ${to}`);
    console.log(`  Asset: ${assetAddr}`);
    console.log(`  Amount: ${ethers.formatEther(amt)}`);
    
    messageId = msgId;
    fromSoul = from;
    toSoul = to;
    asset = assetAddr;
    amount = amt;
  };
  
  bridgeAdapterA.on('MessageSent', listener);
  
  // Execute the transfer
  console.log('Executing cross-chain transfer...');
  const tx = await bridgeAdapterA.routeReputationCrossChain(
    soulIdA,
    soulIdB,
    transferAmount,
    chainB.id,
    { value: ethers.parseEther("0.01") } // Gas fee for cross-chain message
  );
  
  const receipt = await tx.wait();
  console.log(`Transfer transaction hash: ${receipt.hash}`);
  
  // Wait for the event to be processed
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Remove the event listener
  bridgeAdapterA.off('MessageSent', listener);
  
  if (!messageId) {
    console.error('MessageSent event not received. Transfer may have failed.');
    process.exit(1);
  }
  
  // Step 6: Simulate message relay
  console.log('\nStep 6: Simulating message relay...');
  
  // Get the bridge adapter on Chain B
  const bridgeAdapterB = new ethers.Contract(chainB.bridgeAdapterAddress, BRIDGE_ADAPTER_ABI, walletB);
  
  // Simulate receiving the message on Chain B
  console.log('Receiving message on Chain B...');
  const relayTx = await bridgeAdapterB.receiveMessage(
    messageId,
    fromSoul,
    toSoul,
    asset,
    amount,
    '0x' // Empty data
  );
  
  await relayTx.wait();
  console.log('Message relay complete');
  
  // Step 7: Verify the transfer
  console.log('\nStep 7: Verifying the transfer...');
  
  // Wait a moment for the state to update
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check final balances
  const finalBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
  const finalBalanceB = await reputationAssetB.balanceOfSoul(soulIdB);
  
  console.log(`Final ${chainA.name} Reputation: ${ethers.formatEther(finalBalanceA)}`);
  console.log(`Final ${chainB.name} Reputation: ${ethers.formatEther(finalBalanceB)}`);
  
  // Validate the transfer
  const expectedBalanceA = initialBalanceA - transferAmount;
  const expectedBalanceB = initialBalanceB + transferAmount;
  
  const balanceACorrect = finalBalanceA.toString() === expectedBalanceA.toString();
  const balanceBCorrect = finalBalanceB.toString() === expectedBalanceB.toString();
  
  console.log('\nValidation Results:');
  console.log(`${chainA.name} Balance: ${balanceACorrect ? '✅ Correct' : '❌ Incorrect'}`);
  console.log(`${chainB.name} Balance: ${balanceBCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  
  if (balanceACorrect && balanceBCorrect) {
    console.log('\n✅ Cross-chain transfer validated successfully!');
    return true;
  } else {
    console.error('\n❌ Cross-chain transfer validation failed!');
    return false;
  }
}

// Run the validation
validateCrossChain()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error during validation:', error);
    process.exit(1);
  });
