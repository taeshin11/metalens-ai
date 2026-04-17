import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
  try {
    const body = await request.json();
    const { keywords, result, articles, mode } = body;

    if (typeof keywords !== 'string' || keywords.length === 0 || keywords.length > 500) {
      return NextResponse.json({ error: 'Invalid keywords' }, { status: 400 });
    }
    if (!result || typeof result !== 'object' || typeof result.english !== 'string') {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }
    if (!Array.isArray(articles) || articles.length === 0 || articles.length > 200) {
      return NextResponse.json({ error: 'Invalid articles' }, { status: 400 });
    }

    // Store only what's needed for rendering
    const payload = {
      keywords,
      result: {
        english: result.english,
        translated: result.translated || null,
      },
      articles: articles.map((a: any) => ({
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
    await redis.set(`share:${id}`, JSON.stringify(payload), { ex: TTL });

    return NextResponse.json({ id });
  } catch (err) {
    console.error('[api/share POST] failed:', err);
    return NextResponse.json({ error: 'Failed to save share' }, { status: 500 });
  }
}

// GET /api/share?id=xxx — fetch shared result
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const raw = await redis.get(`share:${id}`);
    if (!raw) return NextResponse.json({ error: 'Not found or expired' }, { status: 404 });

    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/share GET] failed:', err);
    return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 });
  }
}
