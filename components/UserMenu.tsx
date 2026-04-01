'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export default function UserMenu() {
  const { user, login } = useAuth();
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

  if (!user) {
    return null; // Login is handled by the modal gate, not the header button
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Trigger re-login on next search
    window.location.reload();
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
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
          </div>
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
