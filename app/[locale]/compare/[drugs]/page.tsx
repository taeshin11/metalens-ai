import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SITE_URL } from '@/lib/constants';
import { COMPARISONS, type ComparisonData } from '@/lib/comparisons';

function parseSlug(slug: string): ComparisonData | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  const drug1 = match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const drug2 = match[2].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    drug1,
    drug2,
    conditionKey: '',
    keywords: `${drug1}, ${drug2}, efficacy, safety, comparison`,
  };
}

function getComparison(slug: string): ComparisonData | null {
  return COMPARISONS[slug] || parseSlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ drugs: string }>;
}): Promise<Metadata> {
  const { drugs } = await params;
  const data = getComparison(drugs);
  if (!data) return { title: 'Not Found' };

  const title = `${data.drug1} vs ${data.drug2}`;
  return {
    title,
    description: `Compare ${data.drug1} vs ${data.drug2} based on published PubMed evidence. AI-powered meta-analysis from 40M+ papers.`,
    openGraph: {
      title: `${title} | MetaLens AI`,
      description: `AI-powered comparison of ${data.drug1} vs ${data.drug2}. Instant meta-analysis from PubMed research.`,
      url: `${SITE_URL}/en/compare/${drugs}`,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string; drugs: string }>;
}) {
  const { locale, drugs } = await params;
  const data = getComparison(drugs);

  if (!data) notFound();

  return <CompareContent locale={locale} drugs={drugs} data={data} />;
}

function CompareContent({ locale, drugs, data }: { locale: string; drugs: string; data: ComparisonData }) {
  const t = useTranslations('compare');

  const condition = data.conditionKey ? t(data.conditionKey) : 'Clinical Outcomes';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${data.drug1} vs ${data.drug2}`,
    about: [
      { '@type': 'Drug', name: data.drug1 },
      { '@type': 'Drug', name: data.drug2 },
    ],
    lastReviewed: '2026-04-30',
    reviewedBy: { '@type': 'Organization', name: 'SPINAI' },
    mainEntityOfPage: `https://metalens-ai.com/${locale}/compare/${drugs}`,
  };

  const otherComparisons = Object.entries(COMPARISONS)
    .filter(([slug, comp]) => slug !== drugs && comp.conditionKey === data.conditionKey)
    .slice(0, 4);
  const moreComparisons = otherComparisons.length < 4
    ? [...otherComparisons, ...Object.entries(COMPARISONS).filter(([slug]) => slug !== drugs && !otherComparisons.some(([s]) => s === slug)).slice(0, 4 - otherComparisons.length)]
    : otherComparisons;

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1
        className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4 leading-tight"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {data.drug1} vs {data.drug2}
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-2">
        {t('comparingFor')} <span className="font-medium text-[var(--color-text-primary)]">{condition}</span>
      </p>
      <p className="text-[var(--color-text-muted)] mb-8">
        {t('description', { drug1: data.drug1, drug2: data.drug2, condition: condition.toLowerCase() })}
      </p>

      {/* Drug cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></span>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {data.drug1}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('searchEvidence', { drug: data.drug1, condition: condition.toLowerCase() })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]"></span>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {data.drug2}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('searchEvidence', { drug: data.drug2, condition: condition.toLowerCase() })}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-primary)]/5 rounded-2xl p-8 border border-[var(--color-primary)]/20 text-center mb-10">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t('ctaTitle')}
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-5 max-w-lg mx-auto">
          {t('ctaDesc', { drug1: data.drug1, drug2: data.drug2, condition: condition.toLowerCase() })}
        </p>
        <Link
          href={`/${locale}?q=${encodeURIComponent(data.keywords)}`}
          className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {t('analyzeBtn', { drug1: data.drug1, drug2: data.drug2 })}
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-[var(--color-warning)]/10 rounded-2xl p-4 border border-[var(--color-warning)]/30 mb-10">
        <p className="text-xs text-[var(--color-text-secondary)] text-center">
          {t('disclaimer')}
        </p>
      </div>

      {/* Other comparisons */}
      {otherComparisons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t('otherTitle')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {moreComparisons.map(([slug, comp]) => (
              <Link
                key={slug}
                href={`/${locale}/compare/${slug}`}
                className="block p-4 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium text-[var(--color-primary-dark)]">
                  {comp.drug1} vs {comp.drug2}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{t(comp.conditionKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
