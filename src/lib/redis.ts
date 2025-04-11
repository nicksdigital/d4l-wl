/* eslint-disable @typescript-eslint/no-unused-vars */
// Interface for cached data with tags and timestamp
interface CachedItem<T> {
  data: T;
  tags: string[];
  timestamp: number;
  version?: string;
}

// Interface for cached data with metadata
interface CachedDataWithMetadata<T> {
  data: T | null;
  tags: string[];
  timestamp: number;
  version?: string;
}

// Check if Redis is enabled
export const isRedisEnabled = () => {
  return process.env.REDIS_HOST && process.env.NEXT_PUBLIC_DISABLE_CACHE !== 'true';
};

// Get cached data from API
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const response = await fetch(`/api/cache/${key}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cached data:', error);
    return null;
  }
};

// Delete cached data via API
export const deleteCachedData = async (key: string): Promise<void> => {
  try {
    await fetch(`/api/cache/${key}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting cached data:', error);
  }
};

// Generate cache key helper
export const generateCacheKey = (prefix: string, params: Record<string, any> = {}): string => {
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${prefix}:${paramStr}`;
};

// Cache data with Redis and associate it with tags
export async function cacheData<T>(
  key: string, 
  data: T, 
  tags: string[] = [], 
  expirationInSeconds = 3600,
  version?: string
): Promise<void> {
  try {
    const response = await fetch(`/api/cache/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data,
        tags,
        expirationInSeconds,
        version
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to cache data: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

// Get cached data with metadata
export async function getCachedDataWithMetadata<T>(key: string): Promise<CachedDataWithMetadata<T> | null> {
  try {
    const response = await fetch(`/api/cache/${key}`);
    const data = await response.json();
    return {
      data: data.data,
      tags: data.tags,
      timestamp: data.timestamp,
      version: data.version
    };
  } catch (error) {
    console.error('Error fetching cached data with metadata:', error);
    return null;
  }
}

// Delete cached data by tag
export async function deleteCachedDataByTag(tag: string): Promise<void> {
  try {
    await fetch(`/api/cache/tag/${tag}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting cached data by tag:', error);
  }
}

// Delete cached data by pattern
export async function deleteCachedDataByPattern(pattern: string): Promise<void> {
  try {
    await fetch(`/api/cache/pattern/${pattern}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting cached data by pattern:', error);
  }
}

// Get all keys with a specific tag
export async function getKeysByTag(tag: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/cache/tag/${tag}`);
    const data = await response.json();
    return data.keys;
  } catch (error) {
    console.error('Error getting keys by tag:', error);
    return [];
  }
}

// Check if content has changed by comparing versions
export async function hasContentChanged(key: string, newVersion: string): Promise<boolean> {
  try {
    const cacheItem = await getCachedDataWithMetadata(key);
    return cacheItem?.version !== newVersion;
  } catch (error) {
    console.error('Error checking if content has changed:', error);
    return true;
  }
}
