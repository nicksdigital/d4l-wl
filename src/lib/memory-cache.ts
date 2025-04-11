// In-memory cache implementation as a fallback when Redis is disabled
import { generateCacheKey } from './redis';

// In-memory storage for cache data
const memoryCache: Map<string, any> = new Map();
const tagToKeysMap: Map<string, Set<string>> = new Map();

// Interface for cached data with tags and timestamp
interface CachedItem<T> {
  data: T;
  tags: string[];
  timestamp: number;
  version?: string;
  expiresAt?: number;
}

// Check if in-memory cache is enabled
export const isMemoryCacheEnabled = () => {
  return process.env.NEXT_PUBLIC_USE_IN_MEMORY_CACHE === 'true';
};

// Cache data in memory and associate it with tags
export async function cacheDataInMemory<T>(
  key: string, 
  data: T, 
  tags: string[] = [], 
  expirationInSeconds = 3600,
  version?: string
): Promise<void> {
  try {
    // Create a cache item with tags and timestamp
    const cacheItem: CachedItem<T> = {
      data,
      tags,
      timestamp: Date.now(),
      version,
      expiresAt: Date.now() + (expirationInSeconds * 1000)
    };
    
    // Store the data
    memoryCache.set(key, JSON.stringify(cacheItem));
    
    // For each tag, add this key to a set of keys with that tag
    for (const tag of tags) {
      if (!tagToKeysMap.has(tag)) {
        tagToKeysMap.set(tag, new Set<string>());
      }
      tagToKeysMap.get(tag)?.add(key);
    }
  } catch (error) {
    console.error('Memory caching error:', error);
  }
}

// Get cached data from memory
export async function getCachedDataFromMemory<T>(key: string): Promise<T | null> {
  try {
    const data = memoryCache.get(key);
    
    if (!data) return null;
    
    // Parse the cached item and return just the data
    const cacheItem = JSON.parse(data as string) as CachedItem<T>;
    
    // Check if the cache item has expired
    if (cacheItem.expiresAt && cacheItem.expiresAt < Date.now()) {
      // Remove expired item
      await deleteCachedDataFromMemory(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Memory fetch error:', error);
    return null;
  }
}

// Get cached data with metadata (tags, timestamp, etc.)
export async function getCachedDataWithMetadataFromMemory<T>(key: string): Promise<CachedItem<T> | null> {
  try {
    const data = memoryCache.get(key);
    
    if (!data) return null;
    
    const cacheItem = JSON.parse(data as string) as CachedItem<T>;
    
    // Check if the cache item has expired
    if (cacheItem.expiresAt && cacheItem.expiresAt < Date.now()) {
      // Remove expired item
      await deleteCachedDataFromMemory(key);
      return null;
    }
    
    return cacheItem;
  } catch (error) {
    console.error('Memory fetch error:', error);
    return null;
  }
}

// Delete cached data from memory
export async function deleteCachedDataFromMemory(key: string): Promise<void> {
  try {
    // Get the cache item to find its tags
    const data = memoryCache.get(key);
    
    if (data) {
      const cacheItem = JSON.parse(data as string);
      
      if (cacheItem && cacheItem.tags) {
        // Remove this key from all tag sets it belongs to
        for (const tag of cacheItem.tags) {
          const keysSet = tagToKeysMap.get(tag);
          if (keysSet) {
            keysSet.delete(key);
            // If the set is empty, remove the tag
            if (keysSet.size === 0) {
              tagToKeysMap.delete(tag);
            }
          }
        }
      }
      
      // Delete the actual cache entry
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Memory delete error:', error);
  }
}

// Delete cached data by tag
export async function deleteCachedDataByTagFromMemory(tag: string): Promise<void> {
  try {
    const keysSet = tagToKeysMap.get(tag);
    
    if (keysSet && keysSet.size > 0) {
      // Delete all the keys
      for (const key of keysSet) {
        memoryCache.delete(key);
      }
      
      // Remove the tag set itself
      tagToKeysMap.delete(tag);
    }
  } catch (error) {
    console.error('Memory tag delete error:', error);
  }
}

// Delete multiple cached items by pattern (simplified implementation)
export async function deleteCachedDataByPatternFromMemory(pattern: string): Promise<void> {
  try {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    // Find keys that match the pattern
    const keysToDelete: string[] = [];
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete each key
    for (const key of keysToDelete) {
      await deleteCachedDataFromMemory(key);
    }
  } catch (error) {
    console.error('Memory pattern delete error:', error);
  }
}

// Get all keys with a specific tag
export async function getKeysByTagFromMemory(tag: string): Promise<string[]> {
  try {
    const keysSet = tagToKeysMap.get(tag);
    return keysSet ? Array.from(keysSet) : [];
  } catch (error) {
    console.error('Memory get keys by tag error:', error);
    return [];
  }
}

// Check if content has changed by comparing versions
export async function hasContentChangedInMemory(key: string, newVersion: string): Promise<boolean> {
  try {
    const cacheItem = await getCachedDataWithMetadataFromMemory(key);
    
    if (!cacheItem || !cacheItem.version) {
      return true; // No cached version, so content has changed
    }
    
    return cacheItem.version !== newVersion;
  } catch (error) {
    console.error('Memory version check error:', error);
    return true; // Assume content has changed on error
  }
}

// Clear all cache data (useful for testing or admin functions)
export async function clearMemoryCache(): Promise<void> {
  memoryCache.clear();
  tagToKeysMap.clear();
}

// Get cache stats
export async function getMemoryCacheStats(): Promise<{
  totalItems: number;
  totalTags: number;
  memoryUsage: number;
}> {
  return {
    totalItems: memoryCache.size,
    totalTags: tagToKeysMap.size,
    memoryUsage: calculateMemoryUsage(),
  };
}

// Helper function to estimate memory usage
function calculateMemoryUsage(): number {
  let totalSize = 0;
  
  // Estimate size of cache items
  for (const value of memoryCache.values()) {
    totalSize += value.length * 2; // Rough estimate for string size in bytes
  }
  
  // Estimate size of tag map
  for (const [tag, keys] of tagToKeysMap.entries()) {
    totalSize += tag.length * 2; // Tag name
    totalSize += keys.size * 40; // Rough estimate for Set overhead and references
  }
  
  return totalSize;
}
