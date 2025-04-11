import { useState, useEffect } from 'react';
import { 
  getCachedDataFromRedis, 
  cacheDataWithRedis, 
  dynamicCacheConfig, 
  ContentTags,
  hasContentChangedInRedis
} from '@/lib/cache';

/**
 * Custom hook for fetching and caching data with Redis
 * @param fetchFn Function that fetches the data
 * @param cacheKey Key to use for caching
 * @param cacheParams Additional parameters for the cache key
 * @param dependencies Dependencies array for the useEffect hook
 * @param tags Content tags for categorization and invalidation
 * @param expiration Cache expiration time in seconds
 * @param versionFn Optional function to generate a version identifier for content change detection
 */
export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheParams: Record<string, any> = {},
  dependencies: any[] = [],
  tags: string[] = dynamicCacheConfig.tags,
  expiration = dynamicCacheConfig.redisExpiration,
  versionFn?: () => string
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Use a stable function reference to avoid triggering the effect unnecessarily
    const fetchData = async () => {
      // Don't set loading state during initial render to prevent hydration issues
      // Only set it on the client side
      if (typeof window !== 'undefined') {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        // Generate version identifier if versionFn is provided
        const version = versionFn ? versionFn() : undefined;
        
        // Check if content has changed when version is available
        let contentChanged = true;
        if (version) {
          contentChanged = await hasContentChangedInRedis(cacheKey, version, cacheParams);
        }
        
        // Try to get data from cache first if content hasn't changed
        if (!contentChanged) {
          const cachedData = await getCachedDataFromRedis<T>(cacheKey, cacheParams);
          
          if (cachedData && isMounted) {
            // Use setTimeout to ensure this doesn't happen during render
            setTimeout(() => {
              if (isMounted) {
                setData(cachedData);
                setIsLoading(false);
              }
            }, 0);
            return;
          }
        }
        
        // If content changed, not in cache, or cache is expired, fetch fresh data
        const freshData = await fetchFn();
        
        if (isMounted) {
          // Use setTimeout to ensure this doesn't happen during render
          setTimeout(() => {
            if (isMounted) {
              setData(freshData);
              setIsLoading(false);
            }
          }, 0);
          
          // Cache the fresh data with tags and version
          await cacheDataWithRedis(cacheKey, freshData, tags, cacheParams, expiration, version);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data:', err);
          // Use setTimeout to ensure this doesn't happen during render
          setTimeout(() => {
            if (isMounted) {
              setError(err as Error);
              setIsLoading(false);
            }
          }, 0);
        }
      }
    };
    
    // Use setTimeout to ensure fetchData runs after the component mounts
    const timeoutId = setTimeout(fetchData, 0);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  return { data, isLoading, error };
}

/**
 * Custom hook for fetching and caching blockchain data with Redis
 * This is specifically for Web3 calls that might be expensive or rate-limited
 * @param fetchFn Function that fetches the blockchain data
 * @param cacheKey Key to use for caching
 * @param cacheParams Additional parameters for the cache key
 * @param dependencies Dependencies array for the useEffect hook
 * @param expiration Cache expiration time in seconds
 * @param versionFn Optional function to generate a version identifier for content change detection
 */
export function useCachedBlockchainData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheParams: Record<string, any> = {},
  dependencies: any[] = [],
  expiration = dynamicCacheConfig.redisExpiration,
  versionFn?: () => string
) {
  return useCachedData<T>(
    fetchFn, 
    `blockchain:${cacheKey}`, 
    cacheParams, 
    dependencies, 
    [ContentTags.BLOCKCHAIN], 
    expiration,
    versionFn
  );
}
