/**
 * Blockchain API Service
 * 
 * This service provides a reliable way to interact with blockchain data
 * by using both direct RPC connections and API fallbacks.
 */

import { ethers } from 'ethers';

// Create a type-safe provider and utility functions
const getProvider = () => {
  return new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL || 'https://base-sepolia.g.alchemy.com/v2/FNDX9qdyF7dDyhaIwXF337H9GWnwKhV7'
  );
};

// Interfaces for blockchain data
export interface AirdropStatus {
  isActive: boolean;
  totalMinted: number;
  maxSupply: number;
  startTime: number;
  endTime: number;
}

export interface WishlistStatus {
  totalRegistered: number;
  registrationOpen: boolean;
  isUserRegistered: boolean;
}

export interface ProfileStatus {
  hasProfile: boolean;
  profileData?: {
    name: string;
    bio: string;
    avatar: string;
  };
}

// Cache for blockchain data to reduce API calls
const dataCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

/**
 * Check if caching is enabled
 */
const isCachingEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_DISABLE_CACHE !== 'true';
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (key: string): boolean => {
  if (!isCachingEnabled() || !dataCache[key]) return false;
  const now = Date.now();
  return now - dataCache[key].timestamp < CACHE_DURATION;
};

/**
 * Get cached data if valid
 */
const getCachedData = <T>(key: string): T | null => {
  if (!isCachingEnabled() || !isCacheValid(key)) return null;
  return dataCache[key].data as T;
};

/**
 * Set data in cache
 */
const setCachedData = <T>(key: string, data: T): void => {
  if (!isCachingEnabled()) return;
  dataCache[key] = {
    data,
    timestamp: Date.now(),
  };
};

/**
 * Check if API fallback is enabled
 */
const useApiFallback = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_API_FALLBACK === 'true';
};

/**
 * Get airdrop status from API
 */
export const getAirdropStatus = async (
  address: string = '0xC669B4Cc448b8b53f5D5Bcd60198c9c7bf6f346c'
): Promise<AirdropStatus> => {
  const cacheKey = `airdrop:${address}`;
  const cachedData = getCachedData<AirdropStatus>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Use API endpoint
    const response = await fetch(`/api/blockchain/airdrop-status?address=${address}`);
    
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication required for blockchain data');
      // Return default values for unauthenticated users
      const defaultData = {
        isActive: false,
        totalMinted: 0,
        maxSupply: 10000,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      };
      setCachedData(cacheKey, defaultData);
      return defaultData;
    }
    
    if (!response.ok) throw new Error(`API response not OK: ${response.status}`);
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching airdrop data from API:', error);
    
    // Return default values if API fails
    return {
      isActive: false,
      totalMinted: 0,
      maxSupply: 10000,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    };
  }
};

/**
 * Get wishlist registry status from API
 */
export const getWishlistStatus = async (
  address: string = '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf',
  userAddress?: string
): Promise<WishlistStatus> => {
  const cacheKey = `wishlist:${address}:${userAddress || 'anonymous'}`;
  const cachedData = getCachedData<WishlistStatus>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Use API endpoint
    const url = userAddress 
      ? `/api/blockchain/wishlist-status?userAddress=${userAddress}&address=${address}`
      : `/api/blockchain/wishlist-status?address=${address}`;
      
    const response = await fetch(url);
    
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication required for blockchain data');
      // Return default values for unauthenticated users
      const defaultData = {
        totalRegistered: 0,
        registrationOpen: false,
        isUserRegistered: false
      };
      setCachedData(cacheKey, defaultData);
      return defaultData;
    }
    
    if (!response.ok) throw new Error(`API response not OK: ${response.status}`);
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching wishlist data from API:', error);
    
    // Return default values if API fails
    return {
      totalRegistered: 0,
      registrationOpen: false,
      isUserRegistered: false,
    };
  }
};

/**
 * Get user profile status from API
 */
export const getProfileStatus = async (
  profileAddress: string = '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9',
  userAddress?: string
): Promise<ProfileStatus> => {
  if (!userAddress) {
    return { hasProfile: false };
  }
  
  const cacheKey = `profile:${profileAddress}:${userAddress}`;
  const cachedData = getCachedData<ProfileStatus>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Use API endpoint
    const response = await fetch(`/api/blockchain/profile-status?userAddress=${userAddress}&profileAddress=${profileAddress}`);
    
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication required for blockchain data');
      // Return default values for unauthenticated users
      const defaultData = {
        hasProfile: false
      };
      setCachedData(cacheKey, defaultData);
      return defaultData;
    }
    
    if (!response.ok) throw new Error(`API response not OK: ${response.status}`);
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching profile data from API:', error);
    
    // Return default values if API fails
    return {
      hasProfile: false,
    };
  }
};

/**
 * Get token balance from API
 */
export const getTokenBalance = async (
  tokenAddress: string = '0x4e569c16220c734484BE84430A995A33d3543e0d',
  userAddress?: string
): Promise<{ balance: string }> => {
  if (!userAddress) {
    return { balance: '0.0' };
  }
  
  const cacheKey = `token:${tokenAddress}:${userAddress}`;
  const cachedData = getCachedData<{ balance: string }>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Use API endpoint
    const response = await fetch(`/api/blockchain/token-balance?userAddress=${userAddress}&tokenAddress=${tokenAddress}`);
    
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication required for blockchain data');
      // Return default values for unauthenticated users
      const defaultData = { balance: '0.0' };
      setCachedData(cacheKey, defaultData);
      return defaultData;
    }
    
    if (!response.ok) throw new Error(`API response not OK: ${response.status}`);
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching token balance from API:', error);
    
    // Return default values if API fails
    return {
      balance: '0.0',
    };
  }
};

/**
 * Clear all blockchain data cache
 */
export const clearBlockchainCache = (): void => {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
};
