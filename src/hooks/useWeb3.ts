"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { baseSepolia } from '@/utils/chains';
import { 
  AirdropControllerABI, 
  SoulboundProfileABI,
  WishlistRegistryABI,
  RewardRegistryABI,
  TokenABI
} from '@/contracts/abis';
import { getContractAddresses } from '@/utils/contractUtils';

// Define contract interfaces
interface ContractInterface {
  address: `0x${string}`;
  abi: any;
  read: (functionName: string, args?: any[]) => Promise<any>;
  write: (functionName: string, args?: any[]) => Promise<any>;
}

interface ContractsType {
  airdropController: ContractInterface | null;
  soulboundProfile: ContractInterface | null;
  wishlistRegistry: ContractInterface | null;
  rewardRegistry: ContractInterface | null;
  token: ContractInterface | null;
}

export function useWeb3() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [contracts, setContracts] = useState<ContractsType>({
    airdropController: null,
    soulboundProfile: null,
    wishlistRegistry: null,
    rewardRegistry: null,
    token: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if connected to the correct network
  const isCorrectNetwork = chainId === baseSepolia.id;
  const networkName = baseSepolia.name;

  // Create a contract interface with read and write methods
  const createContractInterface = (address: string, abi: any): ContractInterface => {
    return {
      address: address as `0x${string}`,
      abi,
      read: async (functionName: string, args: any[] = []) => {
        if (!publicClient || !address) throw new Error("Client or address not available");
        try {
          return await publicClient.readContract({
            address: address as `0x${string}`,
            abi,
            functionName,
            args,
          });
        } catch (error) {
          console.error(`Error reading ${functionName}:`, error);
          // If a specific function is missing on the chain (different from the ABI), we can handle it gracefully
          if (
            error.message?.includes("Function") && 
            error.message?.includes("not found on ABI") ||
            error.message?.includes("Position") && 
            error.message?.includes("is out of bounds")
          ) {
            // Return a default value depending on function name
            if (functionName === "registrationDetails") {
              return ["", "", 0]; // Default email, social, timestamp
            } else if (functionName.startsWith("get") || functionName.startsWith("is") || functionName.startsWith("has")) {
              return null; // Default for getter functions
            }
          }
          throw error;
        }
      },
      write: async (functionName: string, args: any[] = []) => {
        if (!walletClient || !address) throw new Error("Wallet client or address not available");
        try {
          const hash = await walletClient.writeContract({
            address: address as `0x${string}`,
            abi,
            functionName,
            args,
          });
          return hash;
        } catch (error) {
          console.error(`Error writing ${functionName}:`, error);
          throw error;
        }
      }
    };
  };

  // Initialize contracts
  useEffect(() => {
    if (!publicClient || !isConnected) return;
    
    const initContracts = async () => {
      try {
        setIsLoading(true);
        const addresses = getContractAddresses(chainId);
        
        // Create contract instances
        setContracts({
          airdropController: createContractInterface(addresses.airdropController, AirdropControllerABI),
          soulboundProfile: createContractInterface(addresses.soulboundProfile, SoulboundProfileABI),
          wishlistRegistry: createContractInterface(addresses.wishlistRegistry, WishlistRegistryABI),
          rewardRegistry: createContractInterface(addresses.rewardRegistry, RewardRegistryABI),
          token: createContractInterface(addresses.token, TokenABI),
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error initializing contracts:', err);
        setError(err.message || 'Failed to initialize contracts');
      } finally {
        setIsLoading(false);
      }
    };
    
    initContracts();
  }, [publicClient, walletClient, isConnected, chainId]);

  // Helper methods for the home page
  const getAirdropStatus = async () => {
    try {
      if (!contracts.airdropController) throw new Error("Airdrop controller not initialized");
      return await contracts.airdropController.read('getAirdropStatus');
    } catch (error) {
      console.error("Error getting airdrop status:", error);
      return { isActive: false, isPaused: true, startTime: 0 };
    }
  };

  const getTotalMinted = async () => {
    try {
      if (!contracts.airdropController) throw new Error("Airdrop controller not initialized");
      return await contracts.airdropController.read('getTotalMinted');
    } catch (error) {
      console.error("Error getting total minted:", error);
      return 0;
    }
  };

  const getTotalRegistered = async () => {
    try {
      if (!contracts.wishlistRegistry) throw new Error("Wishlist registry not initialized");
      return await contracts.wishlistRegistry.read('totalRegistered');
    } catch (error) {
      console.error("Error getting total registered:", error);
      return 0;
    }
  };

  const getRegistrationOpen = async () => {
    try {
      if (!contracts.wishlistRegistry) throw new Error("Wishlist registry not initialized");
      return await contracts.wishlistRegistry.read('registrationOpen');
    } catch (error) {
      console.error("Error checking if registration is open:", error);
      return false;
    }
  };

  return {
    address,
    isConnected,
    chainId,
    isCorrectNetwork,
    networkName,
    isLoading,
    error,
    contracts,
    publicClient, // Expose the publicClient for advanced operations
    walletClient, // Expose the walletClient as well for completeness
    // Helper methods
    getAirdropStatus,
    getTotalMinted,
    getTotalRegistered,
    getRegistrationOpen
  };
}

export default useWeb3;
