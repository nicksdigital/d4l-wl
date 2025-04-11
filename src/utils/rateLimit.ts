import { createClient, RedisClientType } from 'redis';

// Create Redis client with authentication if password is provided
const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  }
}) as RedisClientType;

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Try to connect to Redis but catch errors
try {
  await redisClient.connect();
  console.log('Redis connection established successfully');
} catch (error) {
  console.error('Failed to connect to Redis, rate limiting will be disabled:', error);
}

interface RateLimitResult {
  success: boolean;
  message?: string;
}

interface RedisMultiExecResult {
  [key: string]: [string, string | number];
}

export const rateLimit = async (key: string, ip: string): Promise<RateLimitResult> => {
  try {
    // Check if Redis client is connected
    if (!redisClient.isOpen) {
      console.warn('Redis client not connected, skipping rate limiting');
      return { success: true };
    }

    const rateLimitKey = `rate-limit:${key}:${ip}`;
    
    try {
      const result = await redisClient.multi()
        .get(rateLimitKey)
        .ttl(rateLimitKey)
        .exec() as unknown as RedisMultiExecResult;

      if (!result || Object.keys(result).length !== 2) {
        console.warn('Invalid Redis multi-exec result, skipping rate limiting');
        return { success: true };
      }

      const currentCount = result['GET'][1] as string | null;
      const expiry = result['TTL'][1] as number | null;

      const count = currentCount ? parseInt(currentCount) : 0;
      const timeRemaining = expiry || 0;

      if (count >= 100) {
        return {
          success: false,
          message: `Rate limit exceeded. Try again in ${Math.ceil(timeRemaining / 60)} minutes.`,
        };
      }

      // Increment the counter and set expiry
      await redisClient.multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, 900) // 15 minutes
        .exec();
    } catch (redisError) {
      console.error('Redis operation failed:', redisError);
      // Continue execution without rate limiting
    }

    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true }; // Fall back to allowing request if rate limiting fails
  }
};
