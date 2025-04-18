// on-chain-propagation-relayer.js
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
  propagationRegistryAddress: process.env.NEXT_PUBLIC_CHAIN_A_PROPAGATION_REGISTRY_ADDRESS,
  name: 'Chain A (Ethereum)'
};

const chainB = {
  id: process.env.NEXT_PUBLIC_CHAIN_B_ID,
  rpcUrl: process.env.NEXT_PUBLIC_CHAIN_B_RPC_URL,
  registryAddress: process.env.NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS,
  bridgeAdapterAddress: process.env.NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS,
  propagationRegistryAddress: process.env.NEXT_PUBLIC_CHAIN_B_PROPAGATION_REGISTRY_ADDRESS,
  name: 'Chain B (Polygon)'
};

// ABIs
const PROPAGATION_REGISTRY_ABI = [
  "function getMessagesByStatus(uint8 status) view returns (bytes32[])",
  "function getMessage(bytes32 messageId) view returns (tuple(bytes32 messageId, uint256 sourceChainId, uint256 destinationChainId, address sender, address fromSoul, address toSoul, address asset, uint256 amount, uint256 timestamp, uint8 status, string metadata))",
  "function updateMessageStatus(bytes32 messageId, uint8 status)",
  "function registerIncomingMessage(bytes32 messageId, uint256 sourceChainId, address sender, address fromSoul, address toSoul, address asset, uint256 amount, string calldata metadata)",
  "enum MessageStatus { NONE, PENDING, PROCESSING, COMPLETED, FAILED }"
];

const BRIDGE_ADAPTER_ABI = [
  "function receiveMessage(bytes32 messageId, address fromSoul, address toSoul, address asset, uint256 amount, bytes calldata data)",
  "function getSourceChainId() view returns (uint256)",
  "function getDestinationChainId() view returns (uint256)"
];

// Message status enum
const MessageStatus = {
  NONE: 0,
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4
};

// Relayer configuration
const POLLING_INTERVAL = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Relayer class
class OnChainPropagationRelayer {
  constructor() {
    // Initialize providers
    this.providerA = new ethers.JsonRpcProvider(chainA.rpcUrl);
    this.providerB = new ethers.JsonRpcProvider(chainB.rpcUrl);
    
    // Get wallet
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.walletA = new ethers.Wallet(privateKey, this.providerA);
    this.walletB = new ethers.Wallet(privateKey, this.providerB);
    
    // Create contract instances
    this.propagationRegistryA = new ethers.Contract(
      chainA.propagationRegistryAddress,
      PROPAGATION_REGISTRY_ABI,
      this.walletA
    );
    
    this.propagationRegistryB = new ethers.Contract(
      chainB.propagationRegistryAddress,
      PROPAGATION_REGISTRY_ABI,
      this.walletB
    );
    
    this.bridgeAdapterA = new ethers.Contract(
      chainA.bridgeAdapterAddress,
      BRIDGE_ADAPTER_ABI,
      this.walletA
    );
    
    this.bridgeAdapterB = new ethers.Contract(
      chainB.bridgeAdapterAddress,
      BRIDGE_ADAPTER_ABI,
      this.walletB
    );
    
    // Initialize state
    this.isRunning = false;
    this.processedMessages = new Set();
  }
  
  // Start the relayer
  async start() {
    if (this.isRunning) {
      console.log('Relayer is already running');
      return;
    }
    
    console.log('Starting on-chain propagation relayer...');
    console.log(`Wallet address: ${this.walletA.address}`);
    
    // Verify chain IDs
    const sourceChainIdA = await this.bridgeAdapterA.getSourceChainId();
    const destChainIdA = await this.bridgeAdapterA.getDestinationChainId();
    const sourceChainIdB = await this.bridgeAdapterB.getSourceChainId();
    const destChainIdB = await this.bridgeAdapterB.getDestinationChainId();
    
    console.log(`${chainA.name} Bridge: Source Chain ID = ${sourceChainIdA}, Destination Chain ID = ${destChainIdA}`);
    console.log(`${chainB.name} Bridge: Source Chain ID = ${sourceChainIdB}, Destination Chain ID = ${destChainIdB}`);
    
    // Start polling
    this.isRunning = true;
    this.poll();
  }
  
  // Stop the relayer
  stop() {
    console.log('Stopping relayer...');
    this.isRunning = false;
  }
  
  // Poll for pending messages
  async poll() {
    while (this.isRunning) {
      try {
        // Process messages from Chain A to Chain B
        await this.processMessages(
          this.propagationRegistryA,
          this.bridgeAdapterB,
          chainA.name,
          chainB.name
        );
        
        // Process messages from Chain B to Chain A
        await this.processMessages(
          this.propagationRegistryB,
          this.bridgeAdapterA,
          chainB.name,
          chainA.name
        );
        
        // Wait for the next polling interval
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      } catch (error) {
        console.error('Error in polling loop:', error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  // Process messages from source chain to destination chain
  async processMessages(sourceRegistry, destBridgeAdapter, sourceName, destName) {
    console.log(`\nChecking for pending messages from ${sourceName} to ${destName}...`);
    
    try {
      // Get pending messages
      const pendingMessageIds = await sourceRegistry.getMessagesByStatus(MessageStatus.PENDING);
      
      if (pendingMessageIds.length === 0) {
        console.log(`No pending messages from ${sourceName} to ${destName}`);
        return;
      }
      
      console.log(`Found ${pendingMessageIds.length} pending messages from ${sourceName} to ${destName}`);
      
      // Process each pending message
      for (const messageId of pendingMessageIds) {
        // Skip already processed messages
        if (this.processedMessages.has(messageId)) {
          continue;
        }
        
        // Get message details
        const message = await sourceRegistry.getMessage(messageId);
        
        console.log(`\nProcessing message ${messageId}:`);
        console.log(`  From Soul: ${message.fromSoul}`);
        console.log(`  To Soul: ${message.toSoul}`);
        console.log(`  Asset: ${message.asset}`);
        console.log(`  Amount: ${ethers.formatEther(message.amount)}`);
        
        // Update message status to PROCESSING
        await sourceRegistry.updateMessageStatus(messageId, MessageStatus.PROCESSING);
        console.log(`  Status updated to PROCESSING on ${sourceName}`);
        
        // Relay the message to the destination chain
        let success = false;
        let retries = 0;
        
        while (!success && retries < MAX_RETRIES) {
          try {
            // Call receiveMessage on the destination bridge adapter
            const tx = await destBridgeAdapter.receiveMessage(
              messageId,
              message.fromSoul,
              message.toSoul,
              message.asset,
              message.amount,
              '0x' // Empty data
            );
            
            console.log(`  Message relay initiated on ${destName}, waiting for confirmation...`);
            await tx.wait();
            
            console.log(`  Message successfully relayed to ${destName}`);
            success = true;
            
            // Mark message as processed
            this.processedMessages.add(messageId);
            
            // Update message status to COMPLETED
            await sourceRegistry.updateMessageStatus(messageId, MessageStatus.COMPLETED);
            console.log(`  Status updated to COMPLETED on ${sourceName}`);
          } catch (error) {
            console.error(`  Error relaying message (attempt ${retries + 1}/${MAX_RETRIES}):`, error.message);
            retries++;
            
            if (retries >= MAX_RETRIES) {
              console.error(`  Failed to relay message after ${MAX_RETRIES} attempts`);
              
              // Update message status to FAILED
              await sourceRegistry.updateMessageStatus(messageId, MessageStatus.FAILED);
              console.log(`  Status updated to FAILED on ${sourceName}`);
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing messages from ${sourceName} to ${destName}:`, error);
    }
  }
}

// Run the relayer
async function main() {
  // Check environment variables
  if (!chainA.propagationRegistryAddress || !chainB.propagationRegistryAddress) {
    console.error('Missing propagation registry addresses. Please check your .env.local file.');
    process.exit(1);
  }
  
  const relayer = new OnChainPropagationRelayer();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down...');
    relayer.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Shutting down...');
    relayer.stop();
    process.exit(0);
  });
  
  // Start the relayer
  await relayer.start();
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
