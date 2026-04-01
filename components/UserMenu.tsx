'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

export default function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn('google')}
        className="px-4 py-2 text-xs font-medium text-white bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-dark)] transition-colors"
      >
        {t('signIn')}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full border border-[var(--color-border)]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
            {session.user.name?.charAt(0) || '?'}
          </div>
        )}
        <span className="hidden sm:inline text-sm text-[var(--color-text-primary)] font-medium max-w-[120px] truncate">
          {session.user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
