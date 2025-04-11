import { createClient, RedisClientType } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
}) as RedisClientType;

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

await redisClient.connect();

interface RateLimitResult {
  success: boolean;
  message?: string;
}

interface RedisMultiExecResult {
  [key: string]: [string, string | number];
}

export const rateLimit = async (key: string, ip: string): Promise<RateLimitResult> => {
  try {
    const rateLimitKey = `rate-limit:${key}:${ip}`;
    const result = await redisClient.multi()
      .get(rateLimitKey)
      .ttl(rateLimitKey)
      .exec() as unknown as RedisMultiExecResult;

    if (!result || Object.keys(result).length !== 2) {
      throw new Error('Invalid Redis multi-exec result');
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

    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true }; // Fall back to allowing request if rate limiting fails
  }
};
