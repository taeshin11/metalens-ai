import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();
const TTL = 60 * 60 * 24 * 7; // 7 days

function makeId(len = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// POST /api/share — save result, return share ID
export async function POST(request: NextRequest) {
  const log = createLogger('api/share:POST');
  log.start();

  try {
    const body = await request.json();
    const { keywords, result, articles, mode } = body;
    log.stage('body_parsed', {
      keywordsLen: typeof keywords === 'string' ? keywords.length : 0,
      articleCount: Array.isArray(articles) ? articles.length : 0,
      mode,
      hasResult: !!result,
      hasTranslated: !!(result?.translated),
    });

    if (typeof keywords !== 'string' || keywords.length === 0 || keywords.length > 500) {
      log.done(400, { reason: 'invalid_keywords', type: typeof keywords, len: typeof keywords === 'string' ? keywords.length : 0 });
      return NextResponse.json({ error: 'Invalid keywords' }, { status: 400 });
    }
    if (!result || typeof result !== 'object' || typeof result.english !== 'string') {
      log.done(400, { reason: 'invalid_result' });
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }
    if (!Array.isArray(articles) || articles.length === 0 || articles.length > 200) {
      log.done(400, { reason: 'invalid_articles', count: Array.isArray(articles) ? articles.length : 'not_array' });
      return NextResponse.json({ error: 'Invalid articles' }, { status: 400 });
    }
    log.stage('validated');

    // Store only what's needed for rendering
    const payload = {
      keywords,
      result: {
        english: result.english,
        translated: result.translated || null,
      },
      articles: articles.map((a: { pmid: string; title: string; authors?: string[]; journal: string; year: string; doi?: string; pubTypes?: string[] }) => ({
        pmid: a.pmid,
        title: a.title,
        authors: a.authors?.slice(0, 3) || [],
        journal: a.journal,
        year: a.year,
        doi: a.doi || null,
        pubTypes: a.pubTypes || [],
      })),
      mode: mode || 'meta-analysis',
      createdAt: Date.now(),
    };

    const id = makeId();
    const serialized = JSON.stringify(payload);
    log.stage('payload_prepared', { id, bytes: serialized.length });

    try {
      await redis.set(`share:${id}`, serialized, { ex: TTL });
      log.stage('redis_write_done', { id });
    } catch (redisErr) {
      log.error('redis_write_failed', redisErr, { id });
      log.done(500, { reason: 'redis_write_failed' });
      return NextResponse.json({ error: 'Failed to save share' }, { status: 500 });
    }

    log.done(200, { id });
    return NextResponse.json({ id });
  } catch (err) {
    log.error('share_post_handler_crashed', err);
    log.done(500, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Failed to save share' }, { status: 500 });
  }
}

// GET /api/share?id=xxx — fetch shared result
export async function GET(request: NextRequest) {
  const log = createLogger('api/share:GET');
  const id = request.nextUrl.searchParams.get('id');
  log.start({ id });

  try {
    if (!id) {
      log.done(400, { reason: 'missing_id' });
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    let raw;
    try {
      log.stage('redis_read_start');
      raw = await redis.get(`share:${id}`);
      log.stage('redis_read_done', { hit: !!raw });
    } catch (redisErr) {
      log.error('redis_read_failed', redisErr, { id });
      log.done(500, { reason: 'redis_read_failed' });
      return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
    }

    if (!raw) {
      log.done(404, { reason: 'not_found_or_expired' });
      return NextResponse.json({ error: 'Not found or expired' }, { status: 404 });
    }

    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      log.done(200, { articleCount: data.articles?.length, mode: data.mode });
      return NextResponse.json(data);
    } catch (parseErr) {
      log.error('share_parse_failed', parseErr, { id });
      log.done(500, { reason: 'parse_failed' });
      return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
    }
  } catch (err) {
    log.error('share_get_handler_crashed', err);
    log.done(500, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
  }
}
