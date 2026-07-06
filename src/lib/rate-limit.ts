import { Ratelimit } from "./rate-limit-fallback";
import { redis } from "./redis";

const rateLimiters = new Map<string, Ratelimit>();

export function getRateLimiter(
  identifier: string,
  max = 100,
  windowMs = 60000
): Ratelimit {
  const key = `${identifier}:${max}:${windowMs}`;
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: { max, windowMs },
        prefix: `ratelimit:${identifier}`,
      })
    );
  }
  return rateLimiters.get(key)!;
}

export async function checkRateLimit(
  key: string,
  max?: number,
  windowMs?: number
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getRateLimiter("api", max, windowMs);
  const result = await limiter.limit(key);
  return { success: result.success, remaining: result.remaining };
}
