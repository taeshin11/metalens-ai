import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTierForEmail } from '@/app/api/stripe/webhook/route';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Check if Stripe upgraded the tier (webhook store overrides JWT)
  const stripeTier = getTierForEmail(session.email);
  const tier = stripeTier !== 'free' ? stripeTier : session.tier;

  return NextResponse.json({
    user: { ...session, tier },
  });
}
