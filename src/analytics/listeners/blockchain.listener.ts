/**
 * Blockchain event listener for analytics
 */
import { ethers } from 'ethers';
import config from '../../config';
import eventsService from '../services/events.service';
import contractsService from '../services/contracts.service';
import usersService from '../services/users.service';
import { createContractEvent } from '../models';

// Contract ABIs
import D4LSoulIdentityABI from '../../abis/D4LSoulIdentity.json';
import D4LSoulflowRouterABI from '../../abis/D4LSoulflowRouter.json';
import D4LAssetABI from '../../abis/ID4LAsset.json';

// Contract addresses
const CONTRACT_ADDRESSES = {
  D4LSoulIdentity: config.contracts?.D4LSoulIdentity || process.env.D4L_SOUL_IDENTITY_ADDRESS,
  D4LSoulflowRouter: config.contracts?.D4LSoulflowRouter || process.env.D4L_SOULFLOW_ROUTER_ADDRESS,
};

// RPC providers by chain ID
const providers: Record<number, ethers.JsonRpcProvider> = {};

// Initialize providers
function initializeProviders() {
  // Initialize providers for each supported chain
  const supportedChains = config.blockchain?.supportedChains || [
    { id: 1, rpc: process.env.ETH_MAINNET_RPC },
    { id: 137, rpc: process.env.POLYGON_MAINNET_RPC },
    { id: 8453, rpc: process.env.BASE_MAINNET_RPC },
  ];
  
  for (const chain of supportedChains) {
    if (chain.rpc) {
      providers[chain.id] = new ethers.JsonRpcProvider(chain.rpc);
    }
  }
}

// Contract instances by chain ID and address
const contracts: Record<number, Record<string, ethers.Contract>> = {};

// Initialize contract instances
function initializeContracts() {
  for (const chainId in providers) {
    contracts[chainId] = {};
    
    // Initialize known contracts
    if (CONTRACT_ADDRESSES.D4LSoulIdentity) {
      contracts[chainId][CONTRACT_ADDRESSES.D4LSoulIdentity] = new ethers.Contract(
        CONTRACT_ADDRESSES.D4LSoulIdentity,
        D4LSoulIdentityABI,
        providers[chainId]
      );
    }
    
    if (CONTRACT_ADDRESSES.D4LSoulflowRouter) {
      contracts[chainId][CONTRACT_ADDRESSES.D4LSoulflowRouter] = new ethers.Contract(
        CONTRACT_ADDRESSES.D4LSoulflowRouter,
        D4LSoulflowRouterABI,
        providers[chainId]
      );
    }
  }
}

// Start listening to events
async function startListening() {
  try {
    console.log('Starting blockchain event listeners for analytics...');
    
    // Initialize providers and contracts
    initializeProviders();
    initializeContracts();
    
    // Listen to events for each contract
    for (const chainId in contracts) {
      for (const contractAddress in contracts[chainId]) {
        const contract = contracts[chainId][contractAddress];
        
        // Get contract name and type
        let contractName = 'Unknown';
        let contractType = 'Unknown';
        
        if (contractAddress === CONTRACT_ADDRESSES.D4LSoulIdentity) {
          contractName = 'D4LSoulIdentity';
          contractType = 'Identity';
        } else if (contractAddress === CONTRACT_ADDRESSES.D4LSoulflowRouter) {
          contractName = 'D4LSoulflowRouter';
          contractType = 'Router';
        }
        
        // Create or get contract analytics
        await contractsService.getOrCreateContractAnalytics(
          contractAddress,
          contractName,
          contractType
        );
        
        // Listen to all events
        contract.on('*', async (event) => {
          try {
            // Get transaction receipt for gas information
            const receipt = await providers[chainId].getTransactionReceipt(event.transactionHash);
            
            // Create contract event
            const contractEvent = createContractEvent(
              contractAddress,
              event.eventName,
              event.transactionHash,
              event.blockNumber,
              event.logIndex,
              event.args,
              event.args.user || event.args.owner || event.args.from,
              parseInt(chainId),
              receipt ? receipt.gasUsed.toString() : undefined,
              receipt ? receipt.gasPrice.toString() : undefined
            );
            
            // Store the event
            await eventsService.storeContractEvent(contractEvent);
            
            // Update contract analytics
            await contractsService.updateContractAnalytics(
              contractAddress,
              event.eventName,
              contractEvent.walletAddress,
              contractEvent.gasUsed
            );
            
            // Update user stats if wallet address is available
            if (contractEvent.walletAddress) {
              await usersService.getOrCreateUser(contractEvent.walletAddress);
              await usersService.updateUserStats(
                contractEvent.walletAddress,
                false,
                false,
                true,
                contractEvent.gasUsed
              );
            }
            
            console.log(`Tracked event: ${event.eventName} on contract ${contractName}`);
          } catch (error) {
            console.error('Error processing contract event:', error);
          }
        });
        
        console.log(`Listening to events for ${contractName} (${contractAddress}) on chain ${chainId}`);
      }
    }
    
    console.log('Blockchain event listeners started successfully');
  } catch (error) {
    console.error('Error starting blockchain event listeners:', error);
  }
}

// Add a new contract to listen to
async function addContractToListen(
  address: string,
  abi: any,
  name?: string,
  type?: string,
  chainId: number = 1
) {
  try {
    // Check if provider exists for this chain
    if (!providers[chainId]) {
      console.error(`No provider available for chain ID ${chainId}`);
      return false;
    }
    
    // Initialize contracts object for this chain if it doesn't exist
    if (!contracts[chainId]) {
      contracts[chainId] = {};
    }
    
    // Check if we're already listening to this contract
    if (contracts[chainId][address]) {
      console.log(`Already listening to contract ${address} on chain ${chainId}`);
      return true;
    }
    
    // Create contract instance
    const contract = new ethers.Contract(
      address,
      abi,
      providers[chainId]
    );
    
    // Store contract instance
    contracts[chainId][address] = contract;
    
    // Create or get contract analytics
    await contractsService.getOrCreateContractAnalytics(
      address,
      name,
      type
    );
    
    // Listen to all events
    contract.on('*', async (event) => {
      try {
        // Get transaction receipt for gas information
        const receipt = await providers[chainId].getTransactionReceipt(event.transactionHash);
        
        // Create contract event
        const contractEvent = createContractEvent(
          address,
          event.eventName,
          event.transactionHash,
          event.blockNumber,
          event.logIndex,
          event.args,
          event.args.user || event.args.owner || event.args.from,
          chainId,
          receipt ? receipt.gasUsed.toString() : undefined,
          receipt ? receipt.gasPrice.toString() : undefined
        );
        
        // Store the event
        await eventsService.storeContractEvent(contractEvent);
        
        // Update contract analytics
        await contractsService.updateContractAnalytics(
          address,
          event.eventName,
          contractEvent.walletAddress,
          contractEvent.gasUsed
        );
        
        // Update user stats if wallet address is available
        if (contractEvent.walletAddress) {
          await usersService.getOrCreateUser(contractEvent.walletAddress);
          await usersService.updateUserStats(
            contractEvent.walletAddress,
            false,
            false,
            true,
            contractEvent.gasUsed
          );
        }
        
        console.log(`Tracked event: ${event.eventName} on contract ${name || address}`);
      } catch (error) {
        console.error('Error processing contract event:', error);
      }
    });
    
    console.log(`Started listening to events for ${name || address} on chain ${chainId}`);
    return true;
  } catch (error) {
    console.error(`Error adding contract ${address} to listen:`, error);
    return false;
  }
}

// Stop listening to a contract
function stopListeningToContract(address: string, chainId: number = 1) {
  try {
    // Check if we're listening to this contract
    if (!contracts[chainId] || !contracts[chainId][address]) {
      console.log(`Not listening to contract ${address} on chain ${chainId}`);
      return true;
    }
    
    // Remove all listeners
    contracts[chainId][address].removeAllListeners();
    
    // Remove contract instance
    delete contracts[chainId][address];
    
    console.log(`Stopped listening to events for ${address} on chain ${chainId}`);
    return true;
  } catch (error) {
    console.error(`Error stopping listening to contract ${address}:`, error);
    return false;
  }
}

// Get all contracts we're listening to
function getListeningContracts() {
  const result: Array<{
    address: string;
    chainId: number;
    name?: string;
  }> = [];
  
  for (const chainId in contracts) {
    for (const address in contracts[chainId]) {
      let name;
      
      if (address === CONTRACT_ADDRESSES.D4LSoulIdentity) {
        name = 'D4LSoulIdentity';
      } else if (address === CONTRACT_ADDRESSES.D4LSoulflowRouter) {
        name = 'D4LSoulflowRouter';
      }
      
      result.push({
        address,
        chainId: parseInt(chainId),
        name
      });
    }
  }
  
  return result;
}

export default {
  startListening,
  addContractToListen,
  stopListeningToContract,
  getListeningContracts
};
