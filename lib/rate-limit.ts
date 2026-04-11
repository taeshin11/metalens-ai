/**
 * Upstash Redis 기반 Rate Limiter
 * - Beta period (until 2026-04-15): logged-in users get unlimited
 * - free tier: 영구 총량 제한 (평생 3회)
 * - pro/ultra: 일별 제한 (UTC 자정 리셋)
 */

const BETA_END = new Date('2026-04-16T00:00:00Z'); // unlimited for logged-in until Apr 15

function isBetaPeriod(): boolean {
  return new Date() < BETA_END;
}

// Logged-in identifier = contains '@' (email); guests = IP string
function isLoggedIn(identifier: string): boolean {
  return identifier.includes('@');
}
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

function rateLimitKey(identifier: string, tier: Tier): string {
  if (tier === 'free') {
    // 날짜 없음 — 영구 총량 카운터
    return `rl:total:${identifier}`;
  }
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `rl:${date}:${identifier}`;
}

export async function checkRateLimit(
  identifier: string,
  tier: Tier,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Beta: logged-in users get unlimited
  if (isBetaPeriod() && isLoggedIn(identifier)) {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const limit = TIER_CONFIG[tier].dailyLimit;
  const key = rateLimitKey(identifier, tier);

  let count: number;
  try {
    count = await redis.incr(key);
    // pro/ultra: 자정 리셋 (첫 요청 시 TTL 설정)
    if (tier !== 'free' && count === 1) {
      await redis.expire(key, getUtcMidnightTtl());
    }
    // free: TTL 없음 (영구 보존)
  } catch {
    // Redis unavailable — allow request
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
  const key = rateLimitKey(identifier, tier);
  const count = (await redis.get<number>(key)) || 0;
  return { count, remaining: Math.max(0, limit - count), limit };
}
