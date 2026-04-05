import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { variantIdToPlanKey, planKeyToTier } from '@/lib/payments';
import { findClerkUserByEmail, setUserTier } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
          const clerkId = await findClerkUserByEmail(email);
          if (clerkId) {
            await setUserTier(clerkId, tier);
            console.log(`[LS] ${email} (${clerkId}) → ${tier}`);
          } else {
            console.warn(`[LS] Clerk user not found for ${email}`);
          }
        }
      }
      break;
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      if (email) {
        const clerkId = await findClerkUserByEmail(email);
        if (clerkId) {
          await setUserTier(clerkId, 'free');
          console.log(`[LS] ${email} → free`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
