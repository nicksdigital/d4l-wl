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

export const rateLimit = async (key: string, ip: string): Promise<RateLimitResult> => {
  try {
    const rateLimitKey = `rate-limit:${key}:${ip}`;
    const [currentCount, expiry] = await redisClient.multi()
      .get(rateLimitKey)
      .ttl(rateLimitKey)
      .exec();

    const count = currentCount?.[1] ? parseInt(currentCount[1]) : 0;
    const timeRemaining = expiry?.[1];

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
