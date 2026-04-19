import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { variantIdToPlanKey, planKeyToTier } from '@/lib/payments';
import { findClerkUserByEmail, setUserTier } from '@/lib/auth';
import { createLogger, maskId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const log = createLogger('api/lemonsqueezy/webhook');
  log.start();

  const body = await request.text();
  const sig = request.headers.get('x-signature') || '';
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  log.stage('body_read', { bytes: body.length, hasSig: !!sig, hasSecret: !!secret });

  // Verify signature — reject if no secret is configured
  if (!secret) {
    log.error('webhook_secret_not_configured');
    log.done(500, { reason: 'no_secret' });
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const hmacBuf = Buffer.from(hmac, 'hex');
  const sigBuf = Buffer.from(sig, 'hex');
  if (hmacBuf.length !== sigBuf.length || !crypto.timingSafeEqual(hmacBuf, sigBuf)) {
    log.warn('invalid_signature', { expectedLen: hmacBuf.length, gotLen: sigBuf.length });
    log.done(400, { reason: 'invalid_signature' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  log.stage('signature_verified');

  let event;
  try {
    event = JSON.parse(body);
  } catch (parseErr) {
    log.error('body_json_parse_failed', parseErr);
    log.done(400, { reason: 'invalid_json' });
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = event.meta?.event_name;
  const attrs = event.data?.attributes;
  const email = attrs?.user_email || event.meta?.custom_data?.email || '';
  const variantId = String(attrs?.first_subscription_item?.variant_id || attrs?.variant_id || '');
  const subscriptionId = String(attrs?.first_subscription_item?.subscription_id || event.data?.id || '');

  log.stage('event_parsed', {
    eventName,
    user: maskId(email),
    variantId,
    subscriptionId,
    hasEmail: !!email,
    hasVariantId: !!variantId,
  });

  try {
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        if (!email || !variantId) {
          log.warn('subscription_event_missing_fields', { eventName, hasEmail: !!email, hasVariantId: !!variantId });
          break;
        }
        const planKey = variantIdToPlanKey(variantId);
        if (!planKey) {
          log.warn('unknown_variant_id', { variantId, eventName });
          break;
        }
        const tier = planKeyToTier(planKey);
        log.stage('looking_up_clerk_user', { user: maskId(email) });
        const clerkId = await findClerkUserByEmail(email);
        if (!clerkId) {
          log.warn('clerk_user_not_found', { user: maskId(email), eventName });
          break;
        }
        log.stage('setting_tier', { user: maskId(email), clerkId: maskId(clerkId), tier, planKey });
        await setUserTier(clerkId, tier);
        log.stage('tier_set', { user: maskId(email), tier });
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        if (!email) {
          log.warn('cancel_event_missing_email', { eventName });
          break;
        }
        log.stage('looking_up_clerk_user', { user: maskId(email) });
        const clerkId = await findClerkUserByEmail(email);
        if (!clerkId) {
          log.warn('clerk_user_not_found', { user: maskId(email), eventName });
          break;
        }
        log.stage('downgrading_to_free', { user: maskId(email), clerkId: maskId(clerkId) });
        await setUserTier(clerkId, 'free');
        log.stage('downgraded', { user: maskId(email) });
        break;
      }

      default:
        log.info('event_ignored', { eventName });
    }
  } catch (err) {
    log.error('webhook_processing_failed', err, { eventName, user: maskId(email) });
    // Still return 200 to prevent LemonSqueezy retries for our internal errors —
    // user can be recovered manually from webhook logs.
    log.done(200, { reason: 'internal_error_returned_ok' });
    return NextResponse.json({ received: true, error: 'internal' });
  }

  log.done(200, { eventName });
  return NextResponse.json({ received: true });
}
