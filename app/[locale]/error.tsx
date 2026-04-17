'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-[var(--color-primary-light)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Oops
        </div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {t('title')}
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          {t('description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {t('tryAgain')}
          </button>
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-2xl font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
