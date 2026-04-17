'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import UserMenu from './UserMenu';

export default function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('a11y');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/how-it-works`, label: t('howItWorks') },
    { href: `/${locale}/pricing`, label: t('pricing') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/faq`, label: t('faq') },
    { href: `/${locale}/blog`, label: t('blog') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          href={`/${locale}`}
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new Event('metalens:home'));
            router.push(`/${locale}`);
          }}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl" aria-label="MetaLens AI">🔬</span>
          <span
            className="text-xl font-bold text-[var(--color-primary-dark)] group-hover:text-[var(--color-primary)] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            MetaLens AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[var(--color-text-secondary)]"
            aria-label={ta('toggleMenu')}
          >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-b border-[var(--color-border)] px-4 pb-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--color-border)] mt-2">
            <UserMenu />
          </div>
        </nav>
      )}
    </header>
  );
}
