import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-[var(--color-primary-light)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          404
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
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
