import { createClient, RedisClientType } from 'redis';

// Initialize Redis client
let redisClient: RedisClientType | null = null;

// Check if Redis is enabled
export const isRedisEnabled = () => {
  return process.env.REDIS_HOST && process.env.NEXT_PUBLIC_DISABLE_CACHE !== 'true';
};

/**
 * Get Redis client with error handling
 */
export const getRedisClient = async (): Promise<RedisClientType | null> => {
  // If Redis is not enabled, return null
  if (!isRedisEnabled()) {
    return null;
  }
  
  try {
    if (!redisClient) {
      // Create a new Redis client for local instance
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);
      const password = process.env.REDIS_PASSWORD || undefined;
      
      redisClient = createClient({
        socket: {
          host,
          port,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.error('Redis connection failed after 3 retries');
              return new Error('Redis connection failed after 3 retries');
            }
            return Math.min(retries * 100, 3000);
          }
        },
        password
      });
      
      // Set up event handlers
      redisClient.on('error', (err: Error) => {
        console.error('Redis client error:', err);
      });
      
      // Connect to Redis
      await redisClient.connect();
    }
    
    return redisClient;
  } catch (error) {
    console.error('Error initializing Redis client:', error);
    return null;
  }
};

// Interface for cached data with tags and timestamp
interface CachedItem<T> {
  data: T;
  tags: string[];
  timestamp: number;
  version?: string;
}

// Cache data with Redis and associate it with tags
export async function cacheData<T>(
  key: string, 
  data: T, 
  tags: string[] = [], 
  expirationInSeconds = 3600,
  version?: string
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    // Create a cache item with tags and timestamp
    const cacheItem: CachedItem<T> = {
      data,
      tags,
      timestamp: Date.now(),
      version
    };
    
    // Store the data with expiration
    await client.set(key, JSON.stringify(cacheItem), { EX: expirationInSeconds });
    
    // For each tag, add this key to a set of keys with that tag
    for (const tag of tags) {
      await client.sAdd(`d4l:tag:${tag}`, key);
    }
  } catch (error) {
    console.error('Redis caching error:', error);
  }
}

// Get cached data from Redis
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    
    const data = await client.get(key);
    
    if (!data) return null;
    
    // Parse the cached item and return just the data
    const cacheItem = JSON.parse(data) as CachedItem<T>;
    return cacheItem.data;
  } catch (error) {
    console.error('Redis fetch error:', error);
    return null;
  }
}

// Get cached data with metadata (tags, timestamp, etc.)
export async function getCachedDataWithMetadata<T>(key: string): Promise<CachedItem<T> | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    
    const data = await client.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data) as CachedItem<T>;
  } catch (error) {
    console.error('Redis fetch error:', error);
    return null;
  }
}

// Delete cached data
export async function deleteCachedData(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    // Get the cache item to find its tags
    const cacheItem = await getCachedDataWithMetadata(key);
    
    if (cacheItem && cacheItem.tags) {
      // Remove this key from all tag sets it belongs to
      for (const tag of cacheItem.tags) {
        await client.sRem(`d4l:tag:${tag}`, key);
      }
    }
    
    // Delete the actual cache entry
    await client.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

// Delete cached data by tag
export async function deleteCachedDataByTag(tag: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    // Get all keys with this tag
    const keys = await client.sMembers(`d4l:tag:${tag}`);
    
    if (keys && keys.length > 0) {
      // Delete all the keys
      await client.del(keys);
      
      // Remove the tag set itself
      await client.del(`d4l:tag:${tag}`);
    }
  } catch (error) {
    console.error('Redis tag delete error:', error);
  }
}

// Delete multiple cached items by pattern
export async function deleteCachedDataByPattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    
    const keys = await client.keys(pattern);
    
    if (keys && keys.length > 0) {
      // For each key, we need to remove it from its tag sets
      for (const key of keys) {
        const cacheItem = await getCachedDataWithMetadata(key);
        if (cacheItem && cacheItem.tags) {
          for (const tag of cacheItem.tags) {
            await client.sRem(`d4l:tag:${tag}`, key);
          }
        }
      }
      
      // Delete all the keys
      await client.del(keys);
    }
  } catch (error) {
    console.error('Redis pattern delete error:', error);
  }
}

// Get all keys with a specific tag
export async function getKeysByTag(tag: string): Promise<string[]> {
  try {
    const client = await getRedisClient();
    if (!client) return [];
    
    return await client.sMembers(`d4l:tag:${tag}`) || [];
  } catch (error) {
    console.error('Redis get keys by tag error:', error);
    return [];
  }
}

// Check if content has changed by comparing versions
export async function hasContentChanged(key: string, newVersion: string): Promise<boolean> {
  try {
    const cacheItem = await getCachedDataWithMetadata(key);
    
    if (!cacheItem || !cacheItem.version) {
      return true; // No cached version, so content has changed
    }
    
    return cacheItem.version !== newVersion;
  } catch (error) {
    console.error('Redis version check error:', error);
    return true; // Assume content has changed on error
  }
}

// Helper to generate cache keys
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const paramString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join(':');
  
  return `d4l:${prefix}${paramString ? `:${paramString}` : ''}`;
}
