/**
 * Redis Client for D4L Scripts
 * Provides a shared Redis client for monitoring and batch sync scripts
 */

const { createClient } = require('redis');
require('dotenv').config();

// Redis configuration
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;
const redisDatabase = parseInt(process.env.REDIS_DATABASE || '0', 10);
const redisPrefix = process.env.REDIS_PREFIX || 'd4l:';

// Create Redis client
const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort
  },
  password: redisPassword,
  database: redisDatabase,
});

// Error handling
redisClient.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] Redis error:`, err);
});

// Connection management
let isConnected = false;

/**
 * Connect to Redis if not already connected
 * @returns {Promise<Object>} Redis client
 */
async function connectToRedis() {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log(`[${new Date().toISOString()}] Connected to Redis at ${redisUrl}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Redis connection failed:`, error);
      throw error;
    }
  }
  return redisClient;
}

/**
 * Disconnect from Redis
 */
async function disconnectFromRedis() {
  if (isConnected) {
    try {
      await redisClient.disconnect();
      isConnected = false;
      console.log(`[${new Date().toISOString()}] Disconnected from Redis`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Redis disconnect failed:`, error);
    }
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
async function getCacheStats() {
  const client = await connectToRedis();
  
  // Get all keys with the prefix
  const keys = await client.keys(`${redisPrefix}*`);
  
  // Count keys by tag
  const tagCounts = {};
  const contentTagPrefix = `${redisPrefix}tag:`;
  
  for (const key of keys) {
    if (key.startsWith(contentTagPrefix)) {
      const tag = key.substring(contentTagPrefix.length);
      const count = await client.sCard(key);
      tagCounts[tag] = count;
    }
  }
  
  // Get memory usage
  const info = await client.info('memory');
  const memoryMatch = info.match(/used_memory_human:(.+)/);
  const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
  
  return {
    totalKeys: keys.length,
    memoryUsage,
    tagCounts
  };
}

module.exports = {
  connectToRedis,
  disconnectFromRedis,
  getCacheStats,
  redisClient
};
