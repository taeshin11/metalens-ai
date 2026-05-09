import { NextResponse } from 'next/server';
import { getSession, findClerkUserByEmail, setUserTier } from '@/lib/auth';
import { createLogger, maskId } from '@/lib/logger';
import { lemonSqueezySetup, listSubscriptions, cancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';

export async function POST() {
  const log = createLogger('api/lemonsqueezy/cancel');
  log.start();

  const session = await getSession();
  if (!session) {
    log.done(401, { reason: 'login_required' });
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }
  log.stage('auth_done', { user: maskId(session.email) });

  const key = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!key || !storeId) {
    log.done(500, { reason: 'config_missing' });
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  lemonSqueezySetup({ apiKey: key });

  try {
    // Find active subscription for this user
    log.stage('finding_subscription', { email: maskId(session.email) });
    const { data: subs } = await listSubscriptions({
      filter: { storeId: Number(storeId), userEmail: session.email, status: 'active' },
    });

    const activeSub = subs?.data?.[0];
    if (!activeSub) {
      log.warn('no_active_subscription');
      log.done(404, { reason: 'no_subscription' });
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subId = activeSub.id;
    log.stage('cancelling', { subscriptionId: subId });

    const { data: cancelled } = await cancelSubscription(subId);
    const endsAt = cancelled?.data?.attributes?.ends_at;
    log.stage('subscription_cancelled', { subscriptionId: subId, endsAt });

    // Do NOT downgrade tier now — user keeps Pro until period ends.
    // LemonSqueezy will send subscription_expired webhook at endsAt,
    // which triggers automatic downgrade to free in webhook/route.ts.

    log.done(200, { subscriptionId: subId, endsAt });
    return NextResponse.json({ ok: true, endsAt });
  } catch (err) {
    log.error('cancel_failed', err);
    log.done(500, { reason: 'cancel_error' });
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
