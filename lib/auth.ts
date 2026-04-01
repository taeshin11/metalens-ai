import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { Tier } from './constants';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'metalens-dev-secret-change-in-production'
);
const COOKIE_NAME = 'ml_session';

export interface UserSession {
  email: string;
  name: string;
  tier: Tier;
  createdAt: number;
}

export async function createSession(
  email: string,
  name: string,
  tier: Tier = 'free',
): Promise<string> {
  const token = await new SignJWT({ email, name, tier, createdAt: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);
  return token;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return {
      email: payload.email as string,
      name: payload.name as string,
      tier: (payload.tier as Tier) || 'free',
      createdAt: payload.createdAt as number,
    };
  } catch {
    return null;
  }
}
