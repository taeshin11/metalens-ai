import type { Tier } from './constants';
import { TIER_CONFIG } from './constants';

// In-memory rate limiter (resets on server restart; good enough for MVP)
// Key: email or IP, Value: { count, resetAt }
const store = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  identifier: string,
  tier: Tier,
): { allowed: boolean; remaining: number; limit: number } {
  const limit = TIER_CONFIG[tier].dailyLimit;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window (midnight reset)
    const resetAt = getEndOfDay();
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, limit };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, limit };
}

function getEndOfDay(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
