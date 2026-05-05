import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CLIENT_LOG_KEY = 'metalens:client_errors';

export async function POST(request: NextRequest) {
  try {
    const entry = await request.json();
    if (!entry?.msg) return NextResponse.json({ ok: true });

    const enriched = {
      ...entry,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      ua: request.headers.get('user-agent')?.slice(0, 150),
      serverTs: new Date().toISOString(),
    };

    await redis.zadd(CLIENT_LOG_KEY, {
      score: Date.now(),
      member: JSON.stringify(enriched),
    });

    const count = await redis.zcard(CLIENT_LOG_KEY);
    if (count > 200) {
      await redis.zremrangebyrank(CLIENT_LOG_KEY, 0, count - 201);
    }
  } catch {
    // Never break client
  }

  return NextResponse.json({ ok: true });
}
