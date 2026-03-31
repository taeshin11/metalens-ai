'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CONTACT_EMAIL, BRAND_NAME } from '@/lib/constants';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔬</span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {t('builtBy')}{' '}
              <span className="font-semibold text-[var(--color-primary-dark)]">{BRAND_NAME}</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href={`/${locale}/about`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {nav('about')}
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {nav('howItWorks')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {nav('faq')}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {nav('blog')}
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href={`/${locale}/privacy`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {t('terms')}
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=MetaLens%20AI%20Feedback`}
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors"
            >
              {t('feedback')}
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          &copy; 2025-2026 {BRAND_NAME}. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
