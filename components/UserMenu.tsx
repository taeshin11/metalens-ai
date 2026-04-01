'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { isAdmin } from '@/lib/admin';
import { TIER_CONFIG } from '@/lib/constants';

export default function UserMenu() {
  const { user } = useAuth();
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  const tierLabel = TIER_CONFIG[user.tier]?.label || 'Free';
  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    pro: 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]',
    ultra: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm text-[var(--color-text-primary)] font-medium max-w-[120px] truncate">
          {user.name}
        </span>
        <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tierColors[user.tier] || tierColors.free}`}>
          {tierLabel}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tierColors[user.tier] || tierColors.free}`}>
                {tierLabel}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
          </div>

          <Link
            href={`/${locale}/account`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            My Account
          </Link>

          {user.tier === 'free' && (
            <Link
              href={`/${locale}/pricing`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
            >
              Upgrade Plan
            </Link>
          )}

          {isAdmin(user.email) && (
            <Link
              href={`/${locale}/admin`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
            >
              CEO Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
