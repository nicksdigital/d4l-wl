import { getCachedDataFromRedis, cacheDataWithRedis, defaultCacheConfig, ContentTags } from './cache';

/**
 * Fetches data with Redis caching
 * @param url The URL to fetch data from
 * @param options Fetch options
 * @param cacheKey The key to use for caching
 * @param cacheParams Additional parameters for the cache key
 * @param expiration Cache expiration time in seconds
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheKey: string,
  cacheParams: Record<string, any> = {},
  expiration = defaultCacheConfig.redisExpiration
): Promise<T> {
  try {
    // Try to get data from cache first
    const cachedData = await getCachedDataFromRedis<T>(cacheKey, cacheParams);
    
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    // If not in cache, fetch from API
    console.log(`Cache miss for ${cacheKey}, fetching from API`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the fetched data
    await cacheDataWithRedis(cacheKey, data, [ContentTags.DYNAMIC], cacheParams, expiration);
    
    return data as T;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
 * Fetches blockchain data with Redis caching
 * This is specifically for Web3 calls that might be expensive or rate-limited
 * @param fetchFunction The async function that fetches the blockchain data
 * @param cacheKey The key to use for caching
 * @param cacheParams Additional parameters for the cache key
 * @param expiration Cache expiration time in seconds
 */
export async function fetchBlockchainDataWithCache<T>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  cacheParams: Record<string, any> = {},
  expiration = defaultCacheConfig.redisExpiration
): Promise<T> {
  try {
    // Try to get data from cache first
    const cachedData = await getCachedDataFromRedis<T>(cacheKey, cacheParams);
    
    if (cachedData) {
      console.log(`Cache hit for blockchain data: ${cacheKey}`);
      return cachedData;
    }
    
    // If not in cache, fetch from blockchain
    console.log(`Cache miss for blockchain data: ${cacheKey}, fetching from blockchain`);
    const data = await fetchFunction();
    
    // Cache the fetched data
    await cacheDataWithRedis(cacheKey, data, [ContentTags.DYNAMIC], cacheParams, expiration);
    
    return data;
  } catch (error) {
    console.error('Error fetching blockchain data:', error);
    throw error;
  }
}
