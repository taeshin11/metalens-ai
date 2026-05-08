import { NextRequest, NextResponse } from 'next/server';
import { getSession, findClerkUserByEmail, setUserTier } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { createLogger, maskId } from '@/lib/logger';
import type { Tier } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const log = createLogger('api/admin/set-tier');
  log.start();

  const session = await getSession();
  if (!session || !isAdmin(session.email)) {
    log.done(403, { reason: 'unauthorized' });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { email, tier } = await request.json() as { email: string; tier: string };
  if (!email || !['free', 'pro'].includes(tier)) {
    log.done(400, { reason: 'invalid_params' });
    return NextResponse.json({ error: 'Invalid email or tier' }, { status: 400 });
  }

  log.stage('looking_up_user', { user: maskId(email), tier });
  const clerkId = await findClerkUserByEmail(email);
  if (!clerkId) {
    log.done(404, { reason: 'user_not_found' });
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await setUserTier(clerkId, tier as Tier);
  log.done(200, { user: maskId(email), tier });
  return NextResponse.json({ ok: true, email, tier });
}
