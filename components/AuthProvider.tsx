'use client';

/**
 * Clerk 기반 AuthProvider
 * - ClerkProvider를 래핑하고, 기존 useAuth() 인터페이스를 유지
 * - user.email / user.name / user.tier 를 Clerk publicMetadata에서 가져옴
 */
import { ClerkProvider, useUser, useClerk } from '@clerk/nextjs';
import { createContext, useContext, useMemo } from 'react';
import type { Tier } from '@/lib/constants';

interface User {
  email: string;
  name: string;
  tier: Tier;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openSignIn: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openSignIn: () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();

  const user = useMemo<User | null>(() => {
    if (!clerkUser) return null;
    return {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || '',
      tier: (clerkUser.publicMetadata?.tier as Tier) || 'free',
    };
  }, [clerkUser]);

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, openSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthBridge>{children}</AuthBridge>
    </ClerkProvider>
  );
}
