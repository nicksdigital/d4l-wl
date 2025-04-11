import { 
  cacheData, 
  getCachedData, 
  deleteCachedData, 
  deleteCachedDataByPattern, 
  deleteCachedDataByTag,
  generateCacheKey,
  getKeysByTag,
  hasContentChanged,
  getCachedDataWithMetadata
} from './redis';

// Content type tags for different sections of the application
export enum ContentTags {
  GENERAL = 'd4l-content',
  DYNAMIC = 'd4l-dynamic-content',
  USER = 'd4l-user-content',
  HOME = 'd4l-home-content',
  CLAIM = 'd4l-claim-content',
  REWARDS = 'd4l-rewards-content',
  PROFILE = 'd4l-profile-content',
  WHITEPAPER = 'd4l-whitepaper-content',
  TOKEN = 'd4l-token-content',
  BLOCKCHAIN = 'd4l-blockchain-data',
  ADMIN = 'd4l-admin-content'
}

// Cache configuration for the D4L application
export const defaultCacheConfig = {
  revalidate: 3600, // Revalidate content every hour (3600 seconds)
  tags: [ContentTags.GENERAL],
  redisExpiration: 3600 // 1 hour in Redis
};

// Cache configuration for frequently changing content
export const dynamicCacheConfig = {
  revalidate: 60, // Revalidate every minute
  tags: [ContentTags.DYNAMIC],
  redisExpiration: 60 // 1 minute in Redis
};

// Cache configuration for user-specific content
export const userCacheConfig = {
  revalidate: 0, // No cache for user-specific content
  tags: [ContentTags.USER],
  redisExpiration: 300 // 5 minutes in Redis (for user session data)
};

// Page-specific cache configurations
export const pageCacheConfig = {
  home: {
    revalidate: 60,
    tags: [ContentTags.HOME, ContentTags.DYNAMIC],
    redisExpiration: 60
  },
  claim: {
    revalidate: 0,
    tags: [ContentTags.CLAIM, ContentTags.USER],
    redisExpiration: 300
  },
  rewards: {
    revalidate: 0,
    tags: [ContentTags.REWARDS, ContentTags.USER],
    redisExpiration: 300
  },
  profile: {
    revalidate: 0,
    tags: [ContentTags.PROFILE, ContentTags.USER],
    redisExpiration: 300
  },
  whitepaper: {
    revalidate: 3600,
    tags: [ContentTags.WHITEPAPER, ContentTags.GENERAL],
    redisExpiration: 3600
  },
  token: {
    revalidate: 300,
    tags: [ContentTags.TOKEN, ContentTags.BLOCKCHAIN],
    redisExpiration: 300
  },
  admin: {
    revalidate: 60,
    tags: [ContentTags.ADMIN, ContentTags.DYNAMIC],
    redisExpiration: 60
  }
};

/**
 * Cache data using Redis with content tags
 * @param key Cache key or prefix
 * @param data Data to cache
 * @param tags Content tags for categorization and invalidation
 * @param params Additional parameters to include in the cache key
 * @param expiration Expiration time in seconds
 * @param version Optional version identifier for content change detection
 */
export async function cacheDataWithRedis<T>(
  key: string,
  data: T,
  tags: string[] = defaultCacheConfig.tags,
  params: Record<string, any> = {},
  expiration = defaultCacheConfig.redisExpiration,
  version?: string
): Promise<void> {
  const cacheKey = generateCacheKey(key, params);
  await cacheData(cacheKey, data, tags, expiration, version);
}

/**
 * Get cached data from Redis
 * @param key Cache key or prefix
 * @param params Additional parameters included in the cache key
 */
export async function getCachedDataFromRedis<T>(
  key: string,
  params: Record<string, any> = {}
): Promise<T | null> {
  const cacheKey = generateCacheKey(key, params);
  return await getCachedData<T>(cacheKey);
}

/**
 * Get cached data with metadata from Redis
 * @param key Cache key or prefix
 * @param params Additional parameters included in the cache key
 */
export async function getCachedDataWithMetadataFromRedis<T>(
  key: string,
  params: Record<string, any> = {}
) {
  const cacheKey = generateCacheKey(key, params);
  return await getCachedDataWithMetadata<T>(cacheKey);
}

/**
 * Check if content has changed by comparing versions
 * @param key Cache key or prefix
 * @param newVersion New version to compare against cached version
 * @param params Additional parameters included in the cache key
 */
export async function hasContentChangedInRedis(
  key: string,
  newVersion: string,
  params: Record<string, any> = {}
): Promise<boolean> {
  const cacheKey = generateCacheKey(key, params);
  return await hasContentChanged(cacheKey, newVersion);
}

/**
 * Delete cached data from Redis
 * @param key Cache key or prefix
 * @param params Additional parameters included in the cache key
 */
export async function deleteCachedDataFromRedis(
  key: string,
  params: Record<string, any> = {}
): Promise<void> {
  const cacheKey = generateCacheKey(key, params);
  await deleteCachedData(cacheKey);
}

/**
 * Delete cached data by content tag
 * @param tag Content tag to delete
 */
export async function deleteCachedDataByContentTag(tag: string): Promise<void> {
  await deleteCachedDataByTag(tag);
}

/**
 * Get all keys associated with a specific content tag
 * @param tag Content tag to query
 */
export async function getKeysByContentTag(tag: string): Promise<string[]> {
  return await getKeysByTag(tag);
}

// Function to revalidate specific content tags
export const revalidateTag = async (tag: string) => {
  try {
    // Delete Redis cache for this tag
    await deleteCachedDataByContentTag(tag);
    
    // Also call the Next.js revalidation API
    await fetch(`/api/revalidate?tag=${tag}`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Failed to revalidate:', error);
    return false;
  }
};

// Function to revalidate multiple content tags
export const revalidateTags = async (tags: string[]) => {
  try {
    const results = await Promise.all(tags.map(tag => revalidateTag(tag)));
    return results.every(result => result === true);
  } catch (error) {
    console.error('Failed to revalidate multiple tags:', error);
    return false;
  }
};

// Function to revalidate specific paths
export const revalidatePath = async (path: string) => {
  try {
    // Delete Redis cache for this path
    await deleteCachedDataFromRedis('path', { path });
    
    // Also call the Next.js revalidation API
    await fetch(`/api/revalidate?path=${path}`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Failed to revalidate path:', error);
    return false;
  }
};
