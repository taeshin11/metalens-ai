import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createLogger, maskId } from '@/lib/logger';
import { listSaved, saveAnalysis } from '@/lib/saved-analyses';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/saved — list saved analyses for current user
export async function GET() {
  const log = createLogger('api/saved:GET');
  log.start();

  log.stage('auth_start');
  const session = await getSession();
  log.stage('auth_done', {
    user: maskId(session?.email),
    tier: session?.tier || 'none',
    authenticated: !!session?.email,
  });

  if (!session?.email) {
    log.done(401, { reason: 'not_authenticated' });
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (session.tier !== 'pro') {
    log.done(403, { reason: 'pro_only', tier: session.tier });
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
  }

  try {
    log.stage('redis_list_start');
    const analyses = await listSaved(session.email, log);
    const totalBytes = analyses.reduce((s, a) => s + a.resultEnglish.length, 0);
    log.done(200, {
      count: analyses.length,
      limit: 50,
      totalResultChars: totalBytes,
      oldestDate: analyses.length > 0 ? new Date(analyses[analyses.length - 1].createdAt).toISOString() : null,
      newestDate: analyses.length > 0 ? new Date(analyses[0].createdAt).toISOString() : null,
    });
    return NextResponse.json({ analyses, count: analyses.length, limit: 50 });
  } catch (err) {
    log.error('saved_list_failed', err);
    log.done(500, { reason: 'redis_error' });
    return NextResponse.json({ error: 'Failed to load saved analyses' }, { status: 500 });
  }
}

// POST /api/saved — save an analysis
export async function POST(request: NextRequest) {
  const log = createLogger('api/saved:POST');
  const ua = request.headers.get('user-agent')?.slice(0, 80);
  log.start({ ua });

  log.stage('auth_start');
  const session = await getSession();
  log.stage('auth_done', {
    user: maskId(session?.email),
    tier: session?.tier || 'none',
    authenticated: !!session?.email,
  });

  if (!session?.email) {
    log.done(401, { reason: 'not_authenticated' });
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (session.tier !== 'pro') {
    log.done(403, { reason: 'pro_only', tier: session.tier });
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
  }

  try {
    log.stage('body_parse_start');
    const body = await request.json();
    const { keywords, mode, result, articles, consensus, filters } = body;

    log.stage('body_parsed', {
      keywordsLen: typeof keywords === 'string' ? keywords.length : 0,
      mode: mode || 'meta-analysis',
      hasResult: !!result?.english,
      resultEnglishLen: result?.english?.length || 0,
      resultTranslatedLen: result?.translated?.length || 0,
      articleCount: Array.isArray(articles) ? articles.length : 0,
      consensusScore: consensus?.score,
      consensusLevel: consensus?.level,
      hasFilters: !!filters,
    });

    if (!keywords || !result?.english || !Array.isArray(articles)) {
      log.done(400, {
        reason: 'invalid_body',
        hasKeywords: !!keywords,
        hasResult: !!result?.english,
        isArticlesArray: Array.isArray(articles),
      });
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const id = uuid().replace(/-/g, '').slice(0, 12);
    log.stage('id_generated', { id });

    const data = {
      id,
      keywords: String(keywords).slice(0, 500),
      mode: mode === 'gap-finder' ? 'gap-finder' as const : 'meta-analysis' as const,
      resultEnglish: String(result.english),
      resultTranslated: result.translated || null,
      articles: articles.slice(0, 50).map((a: { pmid: string; title: string; authors?: string[]; journal: string; year: string; doi?: string }) => ({
        pmid: a.pmid,
        title: a.title,
        authors: a.authors?.slice(0, 3) || [],
        journal: a.journal,
        year: a.year,
        doi: a.doi || undefined,
      })),
      consensusScore: consensus?.score ?? null,
      consensusLevel: consensus?.level ?? null,
      filters: filters || null,
      createdAt: Date.now(),
    };

    const payloadBytes = JSON.stringify(data).length;
    log.stage('payload_prepared', {
      id,
      payloadBytes,
      articleCount: data.articles.length,
      keywordsPreview: data.keywords.slice(0, 50),
    });

    log.stage('redis_save_start');
    const { count } = await saveAnalysis(session.email, data, log);
    log.done(200, { id, count, limit: 50, payloadBytes });
    return NextResponse.json({ id, count, limit: 50 });
  } catch (err) {
    log.error('saved_post_failed', err);
    log.done(500, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
  }
}
