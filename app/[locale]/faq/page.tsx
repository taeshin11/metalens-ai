import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description: 'Frequently asked questions about MetaLens AI — accuracy, pricing, languages, data sources, privacy, and how our AI meta-analysis works.',
  keywords: 'MetaLens AI FAQ, medical meta-analysis questions, PubMed AI tool help, free research tool',
};

const faqs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export default function FAQPage() {
  const t = useTranslations('faq');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((n) => ({
      '@type': 'Question',
      name: t(`q${n}`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`a${n}`),
      },
    })),
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 text-center"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>
      <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-xl mx-auto">
        {t('subtitle')}
      </p>

      <div className="space-y-4">
        {faqs.map((n) => (
          <details
            key={n}
            className="group bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden"
          >
            <summary className="cursor-pointer px-6 py-5 text-lg font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors list-none flex items-center justify-between">
              {t(`q${n}`)}
              <span className="text-[var(--color-text-muted)] group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <div className="px-6 pb-5 text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 pt-4">
              {t(`a${n}`)}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
