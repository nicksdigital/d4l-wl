import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import { 
  REGISTRY_ABI, 
  BRIDGE_ADAPTER_ABI,
  REPUTATION_ASSET_ABI, 
  REWARDS_ASSET_ABI
} from '../constants/abis';

const CrossChainContext = createContext();

export function CrossChainProvider({ children }) {
  const { provider, signer, account, chainId, switchNetwork } = useWeb3();
  
  // Chain configurations
  const [chains, setChains] = useState({
    chainA: {
      id: process.env.NEXT_PUBLIC_CHAIN_A_ID,
      name: 'Ethereum',
      rpcUrl: process.env.NEXT_PUBLIC_CHAIN_A_RPC_URL,
      registryAddress: process.env.NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS,
      bridgeAdapterAddress: process.env.NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS,
      provider: null,
      registry: null,
      bridgeAdapter: null,
      connected: false
    },
    chainB: {
      id: process.env.NEXT_PUBLIC_CHAIN_B_ID,
      name: 'Polygon',
      rpcUrl: process.env.NEXT_PUBLIC_CHAIN_B_RPC_URL,
      registryAddress: process.env.NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS,
      bridgeAdapterAddress: process.env.NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS,
      provider: null,
      registry: null,
      bridgeAdapter: null,
      connected: false
    }
  });
  
  // Current active chain
  const [activeChain, setActiveChain] = useState('chainA');
  
  // Soul identities on different chains
  const [soulIds, setSoulIds] = useState({
    chainA: null,
    chainB: null
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize providers and contracts for both chains
  useEffect(() => {
    const initChains = async () => {
      try {
        setLoading(true);
        
        const updatedChains = { ...chains };
        
        // Initialize Chain A
        if (chains.chainA.rpcUrl) {
          const providerA = new ethers.JsonRpcProvider(chains.chainA.rpcUrl);
          updatedChains.chainA.provider = providerA;
          
          if (chains.chainA.registryAddress) {
            updatedChains.chainA.registry = new ethers.Contract(
              chains.chainA.registryAddress,
              REGISTRY_ABI,
              providerA
            );
          }
          
          if (chains.chainA.bridgeAdapterAddress) {
            updatedChains.chainA.bridgeAdapter = new ethers.Contract(
              chains.chainA.bridgeAdapterAddress,
              BRIDGE_ADAPTER_ABI,
              providerA
            );
          }
        }
        
        // Initialize Chain B
        if (chains.chainB.rpcUrl) {
          const providerB = new ethers.JsonRpcProvider(chains.chainB.rpcUrl);
          updatedChains.chainB.provider = providerB;
          
          if (chains.chainB.registryAddress) {
            updatedChains.chainB.registry = new ethers.Contract(
              chains.chainB.registryAddress,
              REGISTRY_ABI,
              providerB
            );
          }
          
          if (chains.chainB.bridgeAdapterAddress) {
            updatedChains.chainB.bridgeAdapter = new ethers.Contract(
              chains.chainB.bridgeAdapterAddress,
              BRIDGE_ADAPTER_ABI,
              providerB
            );
          }
        }
        
        setChains(updatedChains);
      } catch (error) {
        console.error('Error initializing chains:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initChains();
  }, []);

  // Update active chain based on connected wallet
  useEffect(() => {
    if (!chainId) return;
    
    const chainIdStr = chainId.toString();
    
    if (chainIdStr === chains.chainA.id) {
      setActiveChain('chainA');
      
      // Update connected status
      setChains(prev => ({
        ...prev,
        chainA: { ...prev.chainA, connected: true },
        chainB: { ...prev.chainB, connected: false }
      }));
    } else if (chainIdStr === chains.chainB.id) {
      setActiveChain('chainB');
      
      // Update connected status
      setChains(prev => ({
        ...prev,
        chainA: { ...prev.chainA, connected: false },
        chainB: { ...prev.chainB, connected: true }
      }));
    } else {
      // Not connected to either chain
      setChains(prev => ({
        ...prev,
        chainA: { ...prev.chainA, connected: false },
        chainB: { ...prev.chainB, connected: false }
      }));
    }
  }, [chainId, chains.chainA.id, chains.chainB.id]);

  // Get soul identities on both chains
  useEffect(() => {
    const getSoulIdentities = async () => {
      if (!account) {
        setSoulIds({ chainA: null, chainB: null });
        return;
      }
      
      try {
        const updatedSoulIds = { ...soulIds };
        
        // Get soul identity on Chain A
        if (chains.chainA.registry) {
          try {
            const soulIdsA = await chains.chainA.registry.getUserSoulIdentities(account);
            updatedSoulIds.chainA = soulIdsA.length > 0 ? soulIdsA[0] : null;
          } catch (e) {
            console.error('Error getting soul identity on Chain A:', e);
          }
        }
        
        // Get soul identity on Chain B
        if (chains.chainB.registry) {
          try {
            const soulIdsB = await chains.chainB.registry.getUserSoulIdentities(account);
            updatedSoulIds.chainB = soulIdsB.length > 0 ? soulIdsB[0] : null;
          } catch (e) {
            console.error('Error getting soul identity on Chain B:', e);
          }
        }
        
        setSoulIds(updatedSoulIds);
      } catch (error) {
        console.error('Error getting soul identities:', error);
        setError(error);
      }
    };
    
    getSoulIdentities();
  }, [account, chains.chainA.registry, chains.chainB.registry]);

  // Switch to a specific chain
  const switchToChain = async (chain) => {
    if (!switchNetwork) return;
    
    try {
      const targetChainId = parseInt(chains[chain].id);
      await switchNetwork(targetChainId);
      setActiveChain(chain);
    } catch (error) {
      console.error(`Error switching to ${chain}:`, error);
      throw error;
    }
  };

  // Create soul identity on current chain
  const createSoulIdentity = async () => {
    if (!account || !signer || !chains[activeChain].registry) {
      throw new Error('Not connected to chain or registry not available');
    }
    
    try {
      // Create a random app salt
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes(`soulstream-${Date.now()}`));
      
      // Connect registry with signer
      const registry = chains[activeChain].registry.connect(signer);
      
      // Create soul identity
      const tx = await registry.createSoulIdentity(
        account,
        appSalt,
        ethers.ZeroHash,
        ethers.ZeroHash
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Get the soul identity address from the event
      let newSoulId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'SoulIdentityCreated') {
            newSoulId = parsedLog.args[1];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }
      
      if (newSoulId) {
        // Update soul IDs
        setSoulIds(prev => ({
          ...prev,
          [activeChain]: newSoulId
        }));
        
        return newSoulId;
      }
      
      throw new Error('Failed to get soul identity address from event');
    } catch (error) {
      console.error('Error creating soul identity:', error);
      throw error;
    }
  };

  // Route reputation across chains
  const routeReputationCrossChain = async (fromChain, toChain, amount) => {
    if (!signer || !account) {
      throw new Error('Wallet not connected');
    }
    
    if (!soulIds[fromChain] || !soulIds[toChain]) {
      throw new Error('Soul identities not available on both chains');
    }
    
    if (!chains[fromChain].bridgeAdapter) {
      throw new Error('Bridge adapter not available');
    }
    
    try {
      // Switch to source chain
      await switchToChain(fromChain);
      
      // Connect bridge adapter with signer
      const bridgeAdapter = chains[fromChain].bridgeAdapter.connect(signer);
      
      // Get destination chain ID
      const destinationChainId = parseInt(chains[toChain].id);
      
      // Route reputation cross-chain
      const tx = await bridgeAdapter.routeReputationCrossChain(
        soulIds[fromChain],
        soulIds[toChain],
        amount,
        destinationChainId,
        { value: ethers.parseEther('0.01') } // Gas fee for cross-chain message
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error routing reputation cross-chain:', error);
      throw error;
    }
  };

  // Route rewards across chains
  const routeRewardsCrossChain = async (fromChain, toChain, amount) => {
    if (!signer || !account) {
      throw new Error('Wallet not connected');
    }
    
    if (!soulIds[fromChain] || !soulIds[toChain]) {
      throw new Error('Soul identities not available on both chains');
    }
    
    if (!chains[fromChain].bridgeAdapter) {
      throw new Error('Bridge adapter not available');
    }
    
    try {
      // Switch to source chain
      await switchToChain(fromChain);
      
      // Connect bridge adapter with signer
      const bridgeAdapter = chains[fromChain].bridgeAdapter.connect(signer);
      
      // Get destination chain ID
      const destinationChainId = parseInt(chains[toChain].id);
      
      // Route rewards cross-chain
      const tx = await bridgeAdapter.routeRewardsCrossChain(
        soulIds[fromChain],
        soulIds[toChain],
        amount,
        destinationChainId,
        { value: ethers.parseEther('0.01') } // Gas fee for cross-chain message
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error routing rewards cross-chain:', error);
      throw error;
    }
  };

  // Get reputation on a specific chain
  const getReputationOnChain = async (chain, soulId) => {
    if (!chains[chain].provider) {
      throw new Error('Provider not available');
    }
    
    const targetSoulId = soulId || soulIds[chain];
    
    if (!targetSoulId) {
      throw new Error('Soul identity not available');
    }
    
    try {
      // Get reputation asset address from registry
      const registry = chains[chain].registry;
      const reputationAssetAddress = await registry.getAssetAddress('REPUTATION');
      
      // Create reputation asset contract
      const reputationAsset = new ethers.Contract(
        reputationAssetAddress,
        REPUTATION_ASSET_ABI,
        chains[chain].provider
      );
      
      // Get reputation score
      const score = await reputationAsset.balanceOfSoul(targetSoulId);
      
      return score;
    } catch (error) {
      console.error(`Error getting reputation on ${chain}:`, error);
      throw error;
    }
  };

  // Get rewards on a specific chain
  const getRewardsOnChain = async (chain, soulId) => {
    if (!chains[chain].provider) {
      throw new Error('Provider not available');
    }
    
    const targetSoulId = soulId || soulIds[chain];
    
    if (!targetSoulId) {
      throw new Error('Soul identity not available');
    }
    
    try {
      // Get rewards asset address from registry
      const registry = chains[chain].registry;
      const rewardsAssetAddress = await registry.getAssetAddress('REWARDS');
      
      // Create rewards asset contract
      const rewardsAsset = new ethers.Contract(
        rewardsAssetAddress,
        REWARDS_ASSET_ABI,
        chains[chain].provider
      );
      
      // Get pending rewards
      const rewards = await rewardsAsset.getPendingRewards(targetSoulId);
      
      return rewards;
    } catch (error) {
      console.error(`Error getting rewards on ${chain}:`, error);
      throw error;
    }
  };

  const value = {
    chains,
    activeChain,
    soulIds,
    loading,
    error,
    switchToChain,
    createSoulIdentity,
    routeReputationCrossChain,
    routeRewardsCrossChain,
    getReputationOnChain,
    getRewardsOnChain
  };

  return (
    <CrossChainContext.Provider value={value}>
      {children}
    </CrossChainContext.Provider>
  );
}

export function useCrossChain() {
  const context = useContext(CrossChainContext);
  if (context === undefined) {
    throw new Error('useCrossChain must be used within a CrossChainProvider');
  }
  return context;
}

export default CrossChainContext;
