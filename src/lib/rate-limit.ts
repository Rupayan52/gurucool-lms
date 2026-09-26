import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// A local cache map to store dynamically generated rate limiters per route
const limiters = new Map();

export async function rateLimit(ip: string, limit: number, windowMs: number) {
  // Fail open in local development if Redis is not configured yet
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Redis environment variables missing. Rate limiting bypassed.");
    return true;
  }

  // Create a unique cache key based on the route's specific limits (e.g., "15-60000")
  const key = `${limit}-${windowMs}`;
  
  if (!limiters.has(key)) {
    limiters.set(key, new Ratelimit({
      redis: Redis.fromEnv(),
      // The Token Bucket Algorithm:
      // maxTokens = limit
      // refillRate = limit tokens
      // refillInterval = windowMs (e.g., 60s)
      limiter: Ratelimit.tokenBucket(limit, `${windowMs} ms`, limit),
      ephemeralCache: limiters,
    }));
  }

  const ratelimit = limiters.get(key);
  const { success } = await ratelimit.limit(ip);
  
  return success;
}
