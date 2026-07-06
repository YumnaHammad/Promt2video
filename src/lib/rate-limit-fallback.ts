import type { Redis } from "ioredis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

interface LimiterConfig {
  max: number;
  windowMs: number;
}

export class Ratelimit {
  private redis: Redis;
  private limiter: LimiterConfig;
  private prefix: string;

  constructor(opts: {
    redis: Redis;
    limiter: LimiterConfig;
    prefix: string;
  }) {
    this.redis = opts.redis;
    this.limiter = opts.limiter;
    this.prefix = opts.prefix;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.limiter.windowMs;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, this.limiter.windowMs);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    return {
      success: count <= this.limiter.max,
      remaining: Math.max(0, this.limiter.max - count),
      reset: now + this.limiter.windowMs,
    };
  }
}
