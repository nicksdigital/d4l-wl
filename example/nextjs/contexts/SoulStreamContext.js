import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import { 
  REGISTRY_ABI, 
  REPUTATION_ASSET_ABI, 
  REWARDS_ASSET_ABI,
  SOUL_IDENTITY_ABI
} from '../constants/abis';

const SoulStreamContext = createContext();

export function SoulStreamProvider({ children }) {
  const { provider, signer, account } = useWeb3();
  
  const [registry, setRegistry] = useState(null);
  const [reputationAsset, setReputationAsset] = useState(null);
  const [rewardsAsset, setRewardsAsset] = useState(null);
  const [soulId, setSoulId] = useState(null);
  const [soulIdentity, setSoulIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      if (!provider) return;
      
      try {
        setLoading(true);
        
        // Get contract addresses from environment variables
        const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
        const reputationAssetAddress = process.env.NEXT_PUBLIC_REPUTATION_ASSET_ADDRESS;
        const rewardsAssetAddress = process.env.NEXT_PUBLIC_REWARDS_ASSET_ADDRESS;
        
        // Create contract instances
        const registryContract = new ethers.Contract(
          registryAddress,
          REGISTRY_ABI,
          provider
        );
        
        const reputationAssetContract = new ethers.Contract(
          reputationAssetAddress,
          REPUTATION_ASSET_ABI,
          provider
        );
        
        const rewardsAssetContract = new ethers.Contract(
          rewardsAssetAddress,
          REWARDS_ASSET_ABI,
          provider
        );
        
        // Set contract instances
        setRegistry(registryContract);
        setReputationAsset(reputationAssetContract);
        setRewardsAsset(rewardsAssetContract);
      } catch (error) {
        console.error('Error initializing contracts:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initContracts();
  }, [provider]);

  // Get user's soul identity
  useEffect(() => {
    const getSoulIdentity = async () => {
      if (!registry || !account) {
        setSoulId(null);
        setSoulIdentity(null);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user's soul identities
        const soulIds = await registry.getUserSoulIdentities(account);
        
        if (soulIds.length > 0) {
          // Use the first soul identity
          const userSoulId = soulIds[0];
          setSoulId(userSoulId);
          
          // Create soul identity contract instance
          const soulIdentityContract = new ethers.Contract(
            userSoulId,
            SOUL_IDENTITY_ABI,
            provider
          );
          
          setSoulIdentity(soulIdentityContract);
        } else {
          setSoulId(null);
          setSoulIdentity(null);
        }
      } catch (error) {
        console.error('Error getting soul identity:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    getSoulIdentity();
  }, [registry, account, provider]);

  // Create a soul identity
  const createSoulIdentity = async (appSalt, routingIntentHash) => {
    if (!registry || !signer) {
      throw new Error('Registry or signer not available');
    }
    
    try {
      // Connect registry with signer
      const registryWithSigner = registry.connect(signer);
      
      // Create soul identity
      const tx = await registryWithSigner.createSoulIdentity(
        account,
        appSalt,
        routingIntentHash,
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
        setSoulId(newSoulId);
        
        // Create soul identity contract instance
        const soulIdentityContract = new ethers.Contract(
          newSoulId,
          SOUL_IDENTITY_ABI,
          provider
        );
        
        setSoulIdentity(soulIdentityContract);
        
        return newSoulId;
      }
      
      throw new Error('Failed to get soul identity address from event');
    } catch (error) {
      console.error('Error creating soul identity:', error);
      throw error;
    }
  };

  // Get reputation score
  const getReputationScore = async (targetSoulId) => {
    if (!reputationAsset) {
      throw new Error('Reputation asset not available');
    }
    
    const soulToCheck = targetSoulId || soulId;
    
    if (!soulToCheck) {
      throw new Error('No soul identity available');
    }
    
    try {
      const score = await reputationAsset.balanceOfSoul(soulToCheck);
      return score;
    } catch (error) {
      console.error('Error getting reputation score:', error);
      throw error;
    }
  };

  // Get reputation tier
  const getReputationTier = async (targetSoulId) => {
    if (!reputationAsset) {
      throw new Error('Reputation asset not available');
    }
    
    const soulToCheck = targetSoulId || soulId;
    
    if (!soulToCheck) {
      throw new Error('No soul identity available');
    }
    
    try {
      const tier = await reputationAsset.getReputationTier(soulToCheck);
      return tier;
    } catch (error) {
      console.error('Error getting reputation tier:', error);
      throw error;
    }
  };

  // Get pending rewards
  const getPendingRewards = async (targetSoulId) => {
    if (!rewardsAsset) {
      throw new Error('Rewards asset not available');
    }
    
    const soulToCheck = targetSoulId || soulId;
    
    if (!soulToCheck) {
      throw new Error('No soul identity available');
    }
    
    try {
      const rewards = await rewardsAsset.getPendingRewards(soulToCheck);
      return rewards;
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      throw error;
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!rewardsAsset || !signer || !soulId) {
      throw new Error('Rewards asset, signer, or soul identity not available');
    }
    
    try {
      // Connect rewards asset with signer
      const rewardsAssetWithSigner = rewardsAsset.connect(signer);
      
      // Claim rewards
      const tx = await rewardsAssetWithSigner.claimRewards(soulId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  };

  // Authorize route
  const authorizeRoute = async (routeId, authorized) => {
    if (!soulIdentity || !signer) {
      throw new Error('Soul identity or signer not available');
    }
    
    try {
      // Connect soul identity with signer
      const soulIdentityWithSigner = soulIdentity.connect(signer);
      
      // Authorize route
      const tx = await soulIdentityWithSigner.authorizeRoute(routeId, authorized);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error) {
      console.error('Error authorizing route:', error);
      throw error;
    }
  };

  // Check if route is authorized
  const isRouteAuthorized = async (routeId) => {
    if (!soulIdentity) {
      throw new Error('Soul identity not available');
    }
    
    try {
      const authorized = await soulIdentity.authorizedRoutes(routeId);
      return authorized;
    } catch (error) {
      console.error('Error checking route authorization:', error);
      throw error;
    }
  };

  const value = {
    registry,
    reputationAsset,
    rewardsAsset,
    soulId,
    soulIdentity,
    loading,
    error,
    createSoulIdentity,
    getReputationScore,
    getReputationTier,
    getPendingRewards,
    claimRewards,
    authorizeRoute,
    isRouteAuthorized,
  };

  return (
    <SoulStreamContext.Provider value={value}>
      {children}
    </SoulStreamContext.Provider>
  );
}

export function useSoulStream() {
  const context = useContext(SoulStreamContext);
  if (context === undefined) {
    throw new Error('useSoulStream must be used within a SoulStreamProvider');
  }
  return context;
}

export default SoulStreamContext;
