import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { variantIdToPlanKey, planKeyToTier } from '@/lib/payments';

export const dynamic = 'force-dynamic';

// In-memory tier store (MVP) — maps email → tier
const tierStore = new Map<string, 'pro' | 'ultra'>();

export function getTierForEmail(email: string): 'free' | 'pro' | 'ultra' {
  return tierStore.get(email.toLowerCase()) || 'free';
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('x-signature') || '';
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

  // Verify signature
  if (secret) {
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (hmac !== sig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = event.meta?.event_name;
  const attrs = event.data?.attributes;
  const email = attrs?.user_email || event.meta?.custom_data?.email || '';
  const variantId = String(attrs?.first_subscription_item?.variant_id || attrs?.variant_id || '');

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated': {
      if (email && variantId) {
        const planKey = variantIdToPlanKey(variantId);
        if (planKey) {
          const tier = planKeyToTier(planKey);
          tierStore.set(email.toLowerCase(), tier);
          console.log(`[LS] ${email} → ${tier}`);
        }
      }
      break;
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      if (email) {
        tierStore.delete(email.toLowerCase());
        console.log(`[LS] ${email} → free`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
