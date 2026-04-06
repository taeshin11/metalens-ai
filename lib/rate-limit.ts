/**
 * Upstash Redis 기반 Rate Limiter
 * - 서버 재시작해도 카운트 유지
 * - UTC 자정 기준 일별 리셋
 */
import { Redis } from '@upstash/redis';
import type { Tier } from './constants';
import { TIER_CONFIG } from './constants';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function getUtcMidnightTtl(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function rateLimitKey(identifier: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `rl:${date}:${identifier}`;
}

export async function checkRateLimit(
  identifier: string,
  tier: Tier,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = TIER_CONFIG[tier].dailyLimit;
  const key = rateLimitKey(identifier);
  const ttl = getUtcMidnightTtl();

  let count: number;
  try {
    count = await redis.incr(key);
    if (count === 1) await redis.expire(key, ttl);
  } catch {
    // Redis unavailable — allow request with conservative remaining
    return { allowed: true, remaining: 1, limit };
  }

  if (count > limit) {
    return { allowed: false, remaining: 0, limit };
  }

  return { allowed: true, remaining: limit - count, limit };
}

export async function getRateLimitStatus(
  identifier: string,
  tier: Tier,
): Promise<{ count: number; remaining: number; limit: number }> {
  const limit = TIER_CONFIG[tier].dailyLimit;
  const key = rateLimitKey(identifier);
  const count = (await redis.get<number>(key)) || 0;
  return { count, remaining: Math.max(0, limit - count), limit };
}
