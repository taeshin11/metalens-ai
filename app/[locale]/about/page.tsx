import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about MetaLens AI by SPINAI — our mission to democratize medical research insights.',
};

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-8"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>

      <div className="space-y-8">
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2
            className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {t('mission')}
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
            {t('missionText')}
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2
            className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {t('howWeWork')}
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
            {t('howWeWorkText')}
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2
            className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Contact
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Have questions or want to collaborate? Reach out at{' '}
            <a
              href="mailto:taeshinkim11@gmail.com"
              className="text-[var(--color-primary)] hover:underline"
            >
              taeshinkim11@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
