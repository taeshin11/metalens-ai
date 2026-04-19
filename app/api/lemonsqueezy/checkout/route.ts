import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { VARIANT_IDS, PlanKey, createCheckoutUrl } from '@/lib/payments';
import { SITE_URL } from '@/lib/constants';
import { createLogger, maskId } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const log = createLogger('api/lemonsqueezy/checkout');
  log.start();

  try {
    log.stage('auth_start');
    const session = await getSession();
    if (!session) {
      log.done(401, { reason: 'login_required' });
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }
    log.stage('auth_done', { user: maskId(session.email) });

    const { plan, locale } = await request.json() as { plan: string; locale?: string };
    log.stage('body_parsed', { plan, locale: locale || 'en' });

    const variantId = VARIANT_IDS[plan as PlanKey];

    if (!variantId) {
      log.warn('invalid_plan_key', { plan, validKeys: Object.keys(VARIANT_IDS) });
      log.done(400, { reason: 'invalid_plan' });
      return NextResponse.json({ error: `Invalid plan: ${plan}. Valid: ${Object.keys(VARIANT_IDS).join(', ')}` }, { status: 400 });
    }
    log.stage('variant_resolved', { plan, variantId });

    log.stage('checkout_url_create_start');
    const url = await createCheckoutUrl(
      variantId,
      session.email,
      `${SITE_URL}/${locale || 'en'}/pricing?success=true`,
    );

    if (!url) {
      log.error('checkout_url_create_returned_null', undefined, { plan, variantId, user: maskId(session.email) });
      log.done(500, { reason: 'lemonsqueezy_no_url' });
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    log.stage('checkout_url_created', { urlHost: new URL(url).host });
    log.done(200, { plan, user: maskId(session.email) });
    return NextResponse.json({ url });
  } catch (err) {
    log.error('checkout_handler_crashed', err);
    log.done(500, { reason: 'unexpected_error' });
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
