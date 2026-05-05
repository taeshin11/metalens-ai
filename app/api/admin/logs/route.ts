import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { queryTraces, clearTraces, queryClientLogs } from '@/lib/log-store';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const source = url.searchParams.get('source') || 'server';

  if (source === 'client') {
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const clientLogs = await queryClientLogs(limit);
    return NextResponse.json({ logs: clientLogs, total: clientLogs.length });
  }

  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const route = url.searchParams.get('route') || undefined;
  const level = (url.searchParams.get('level') || 'all') as 'error' | 'warn' | 'all';
  const search = url.searchParams.get('search') || undefined;

  const result = await queryTraces({ limit, offset, route, level, search });
  return NextResponse.json(result);
}

export async function DELETE() {
  const session = await getSession();
  if (!session || !isAdmin(session.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const count = await clearTraces();
  return NextResponse.json({ cleared: count });
}
