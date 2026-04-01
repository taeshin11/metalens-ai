import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { getAdminStats } from '@/lib/usage-tracker';

export async function GET() {
  const session = await getSession();

  if (!session || !isAdmin(session.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const stats = getAdminStats();
  return NextResponse.json(stats);
}
