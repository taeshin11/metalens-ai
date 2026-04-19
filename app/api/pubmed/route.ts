import { NextRequest, NextResponse } from 'next/server';
import { searchAndFetch } from '@/lib/pubmed';
import { createLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const log = createLogger('api/pubmed');
  const rawKeywords = request.nextUrl.searchParams.get('q');
  const keywords = rawKeywords?.trim();
  const ua = request.headers.get('user-agent')?.slice(0, 80);

  log.start({ keywordsLen: keywords?.length || 0, ua });

  if (!keywords) {
    log.done(400, { reason: 'missing_keywords' });
    return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
  }
  if (keywords.length > 500) {
    log.done(400, { reason: 'query_too_long', len: keywords.length });
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }

  try {
    log.stage('search_start', { preview: keywords.slice(0, 60) });
    const articles = await searchAndFetch(keywords, 50);
    log.stage('search_done', { articleCount: articles.length });
    log.done(200, { articleCount: articles.length });
    return NextResponse.json({ articles });
  } catch (err) {
    log.error('pubmed_search_failed', err, { preview: keywords.slice(0, 60) });
    log.done(500);
    return NextResponse.json({ error: 'PubMed search failed' }, { status: 500 });
  }
}
