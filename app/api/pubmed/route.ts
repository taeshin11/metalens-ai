import { NextRequest, NextResponse } from 'next/server';
import { searchAndFetch } from '@/lib/pubmed';

export async function GET(request: NextRequest) {
  const keywords = request.nextUrl.searchParams.get('q');
  if (!keywords) {
    return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
  }
  if (keywords.length > 500) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }

  try {
    const articles = await searchAndFetch(keywords, 50);
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: 'PubMed search failed' }, { status: 500 });
  }
}
