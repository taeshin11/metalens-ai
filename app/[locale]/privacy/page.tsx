import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MetaLens AI privacy policy — how we handle your data, your rights, and our security practices.',
};

const sections = [
  's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10',
] as const;

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">{t('lastUpdated')}</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] space-y-6">
        <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
          {t('intro')}
        </p>

        {sections.map((s) => (
          <div key={s}>
            <h2
              className="text-lg font-semibold text-[var(--color-text-primary)] mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {t(`${s}Title`)}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {t(`${s}Text`)}
            </p>
          </div>
        ))}

        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)]">
            {t('contactLine')}{' '}
            <a
              href="mailto:taeshinkim11@gmail.com"
              className="text-[var(--color-primary)] hover:underline"
            >
              taeshinkim11@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
