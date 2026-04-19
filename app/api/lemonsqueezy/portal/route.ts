import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createLogger, maskId } from '@/lib/logger';

export async function POST() {
  const log = createLogger('api/lemonsqueezy/portal');
  log.start();

  try {
    const session = await getSession();
    if (!session) {
      log.done(401, { reason: 'login_required' });
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }
    log.stage('auth_done', { user: maskId(session.email) });

    // Lemon Squeezy customer portal URL
    // Users manage subscriptions directly on Lemon Squeezy
    const portalUrl = process.env.LEMONSQUEEZY_PORTAL_URL;
    if (!portalUrl) {
      log.error('portal_url_not_configured');
      log.done(500, { reason: 'not_configured' });
      return NextResponse.json({ error: 'Portal not configured' }, { status: 500 });
    }

    log.done(200, { user: maskId(session.email) });
    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    log.error('portal_handler_crashed', err);
    log.done(500, { reason: 'unexpected_error' });
    const message = err instanceof Error ? err.message : 'Portal failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
