import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MetaLens AI privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  const t = useTranslations('privacy');

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
