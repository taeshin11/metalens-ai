/**
 * Server-side auth helpers — Clerk 기반
 * currentUser() / auth() 를 통해 유저 정보 및 tier(publicMetadata) 접근
 */
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Tier } from './constants';

export interface UserSession {
  email: string;
  name: string;
  tier: Tier;
  clerkId: string;
}

/** Server Component / Route Handler 에서 현재 유저 세션 반환 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress || '';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email;
    const tier = (user.publicMetadata?.tier as Tier) || 'free';

    return { email, name, tier, clerkId: user.id };
  } catch (err) {
    // Don't block the caller — unauthenticated is a valid state — but surface
    // genuine Clerk outages in logs so an auth incident isn't invisible.
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      route: 'lib/auth',
      msg: 'getSession_failed',
      errName: err instanceof Error ? err.name : 'unknown',
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
    }));
    return null;
  }
}

/** 현재 유저의 Clerk ID 반환 (미인증이면 null) */
export async function getClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/** Clerk Backend API로 유저 tier 업데이트 */
export async function setUserTier(clerkId: string, tier: Tier): Promise<void> {
  const res = await fetch(
    `https://api.clerk.com/v1/users/${clerkId}/metadata`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_metadata: { tier } }),
    }
  );
  if (!res.ok) {
    // Include response body so webhook logs can see WHY Clerk rejected the update
    let body = '';
    try { body = (await res.text()).slice(0, 300); } catch { /* ignore */ }
    throw new Error(`Clerk metadata update failed: HTTP ${res.status} ${res.statusText} | body: ${body}`);
  }
}

/** Clerk에서 email로 userId 조회 */
export async function findClerkUserByEmail(email: string): Promise<string | null> {
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }
  );
  if (!res.ok) {
    // Log the error so webhook can see it — but return null to let caller decide flow
    let body = '';
    try { body = (await res.text()).slice(0, 200); } catch { /* ignore */ }
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      route: 'lib/auth',
      msg: 'findClerkUserByEmail_http_failed',
      status: res.status,
      statusText: res.statusText,
      body,
    }));
    return null;
  }
  try {
    const users = await res.json();
    return users[0]?.id || null;
  } catch (err) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      route: 'lib/auth',
      msg: 'findClerkUserByEmail_parse_failed',
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
    }));
    return null;
  }
}
