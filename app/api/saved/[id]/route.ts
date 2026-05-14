import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createLogger, maskId } from '@/lib/logger';
import { deleteSaved, getSavedCount } from '@/lib/saved-analyses';

export const dynamic = 'force-dynamic';

// DELETE /api/saved/[id] — delete a saved analysis
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const log = createLogger('api/saved:DELETE');
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

  const { id } = await params;
  log.stage('params_resolved', { id: id || 'missing' });

  if (!id) {
    log.done(400, { reason: 'missing_id' });
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const countBefore = await getSavedCount(session.email);
    log.stage('redis_delete_start', { id, countBefore });

    const deleted = await deleteSaved(session.email, id, log);

    const countAfter = await getSavedCount(session.email);
    log.done(200, { id, deleted, countBefore, countAfter });
    return NextResponse.json({ deleted, remaining: countAfter });
  } catch (err) {
    log.error('saved_delete_failed', err, { id });
    log.done(500, { reason: 'unexpected_error', id });
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
