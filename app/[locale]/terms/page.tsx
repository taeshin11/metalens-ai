import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MetaLens AI terms of service — usage guidelines and disclaimers.',
};

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-8"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
        <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg whitespace-pre-line">
          {t('content')}
        </p>
      </div>
    </div>
  );
}
