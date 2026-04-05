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
  } catch {
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
    throw new Error(`Clerk metadata update failed: ${res.status}`);
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
  if (!res.ok) return null;
  const users = await res.json();
  return users[0]?.id || null;
}
