import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { VARIANT_IDS, PlanKey, createCheckoutUrl } from '@/lib/payments';
import { SITE_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const { plan, locale } = await request.json() as { plan: string; locale?: string };
    const variantId = VARIANT_IDS[plan as PlanKey];

    if (!variantId) {
      return NextResponse.json({ error: `Invalid plan: ${plan}. Valid: ${Object.keys(VARIANT_IDS).join(', ')}` }, { status: 400 });
    }

    const url = await createCheckoutUrl(
      variantId,
      session.email,
      `${SITE_URL}/${locale || 'en'}/pricing?success=true`,
    );

    if (!url) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
