import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    // Lemon Squeezy customer portal URL
    // Users manage subscriptions directly on Lemon Squeezy
    const portalUrl = process.env.LEMONSQUEEZY_PORTAL_URL;
    if (!portalUrl) {
      return NextResponse.json({ error: 'Portal not configured' }, { status: 500 });
    }

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Portal failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
