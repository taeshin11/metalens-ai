'use client';

import { useParams } from 'next/navigation';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { TIER_CONFIG } from '@/lib/constants';
import type { Tier } from '@/lib/constants';

export default function UserMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;

  if (!isLoaded) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />;

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="px-4 py-1.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-full transition-colors">
          {t('signIn')}
        </button>
      </SignInButton>
    );
  }

  const tier = (user.publicMetadata?.tier as Tier) || 'free';
  const tierLabel = TIER_CONFIG[tier]?.label || 'Free';
  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    pro: 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Tier badge */}
      <span className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-semibold ${tierColors[tier] || tierColors.free}`}>
        {tierLabel}
      </span>

      {tier === 'free' && (
        <Link
          href={`/${locale}/pricing`}
          className="hidden sm:inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          Upgrade
        </Link>
      )}

      {/* Clerk's built-in user button (avatar + dropdown) */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
        userProfileProps={{
          additionalOAuthScopes: {},
        }}
      />
    </div>
  );
}
