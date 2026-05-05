import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CLIENT_LOG_KEY = 'metalens:client_errors';
const RATE_KEY_PREFIX = 'rl:clog:';
const MAX_ENTRIES = 200;
const MAX_BODY_BYTES = 2000;
const RATE_LIMIT = 20; // max 20 logs per IP per hour
const RATE_TTL = 3600;

const ALLOWED_FIELDS = ['ts', 'level', 'side', 'component', 'sid', 'msg', 'url',
  'errName', 'errMessage', 'errStack', 'errCause', 'errCode', 'errStatus'] as const;
const VALID_LEVELS = new Set(['error', 'warn']);

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 45) || 'unknown';

    const rateKey = `${RATE_KEY_PREFIX}${ip}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, RATE_TTL);
    if (count > RATE_LIMIT) return NextResponse.json({ ok: true });

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: true });

    const body = JSON.parse(raw);

    if (!body?.msg || typeof body.msg !== 'string') return NextResponse.json({ ok: true });
    if (!VALID_LEVELS.has(body.level)) return NextResponse.json({ ok: true });
    if (body.side !== 'client') return NextResponse.json({ ok: true });

    const sanitized: Record<string, string> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body && typeof body[key] === 'string') {
        sanitized[key] = body[key].slice(0, 500);
      }
    }

    if (!sanitized.msg) return NextResponse.json({ ok: true });

    sanitized.serverTs = new Date().toISOString();
    sanitized.ip = ip;

    await redis.zadd(CLIENT_LOG_KEY, {
      score: Date.now(),
      member: JSON.stringify(sanitized),
    });

    const total = await redis.zcard(CLIENT_LOG_KEY);
    if (total > MAX_ENTRIES) {
      await redis.zremrangebyrank(CLIENT_LOG_KEY, 0, total - MAX_ENTRIES - 1);
    }
  } catch {
    // Never break client
  }

  return NextResponse.json({ ok: true });
}
