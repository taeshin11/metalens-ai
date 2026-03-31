import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/constants';

type ComparisonData = {
  drug1: string;
  drug2: string;
  condition: string;
  description: string;
  keywords: string;
};

const comparisons: Record<string, ComparisonData> = {
  'pranlukast-vs-montelukast': {
    drug1: 'Pranlukast',
    drug2: 'Montelukast',
    condition: 'Asthma',
    description: 'Compare the efficacy and safety of Pranlukast vs Montelukast for asthma treatment based on published PubMed evidence.',
    keywords: 'pranlukast, montelukast, asthma, efficacy, safety',
  },
  'metformin-vs-insulin': {
    drug1: 'Metformin',
    drug2: 'Insulin',
    condition: 'Type 2 Diabetes',
    description: 'Compare Metformin vs Insulin for Type 2 Diabetes management based on published clinical evidence from PubMed.',
    keywords: 'metformin, insulin, type 2 diabetes, glycemic control, efficacy',
  },
  'ibuprofen-vs-acetaminophen': {
    drug1: 'Ibuprofen',
    drug2: 'Acetaminophen',
    condition: 'Pain Relief',
    description: 'Compare Ibuprofen vs Acetaminophen for pain management based on published PubMed evidence.',
    keywords: 'ibuprofen, acetaminophen, pain, analgesic, efficacy, safety',
  },
  'lisinopril-vs-losartan': {
    drug1: 'Lisinopril',
    drug2: 'Losartan',
    condition: 'Hypertension',
    description: 'Compare Lisinopril (ACE inhibitor) vs Losartan (ARB) for hypertension treatment based on published evidence.',
    keywords: 'lisinopril, losartan, hypertension, blood pressure, efficacy',
  },
  'omeprazole-vs-pantoprazole': {
    drug1: 'Omeprazole',
    drug2: 'Pantoprazole',
    condition: 'GERD',
    description: 'Compare Omeprazole vs Pantoprazole for GERD and acid reflux treatment based on published clinical evidence.',
    keywords: 'omeprazole, pantoprazole, GERD, acid reflux, proton pump inhibitor',
  },
  'sertraline-vs-fluoxetine': {
    drug1: 'Sertraline',
    drug2: 'Fluoxetine',
    condition: 'Depression',
    description: 'Compare Sertraline (Zoloft) vs Fluoxetine (Prozac) for depression treatment based on published evidence.',
    keywords: 'sertraline, fluoxetine, depression, SSRI, efficacy, side effects',
  },
};

export async function generateStaticParams() {
  return Object.keys(comparisons).map((drugs) => ({ drugs }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ drugs: string }>;
}): Promise<Metadata> {
  const { drugs } = await params;
  const data = comparisons[drugs];
  if (!data) return { title: 'Not Found' };

  const title = `${data.drug1} vs ${data.drug2} for ${data.condition}`;
  return {
    title,
    description: data.description,
    openGraph: {
      title: `${title} | MetaLens AI`,
      description: data.description,
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
  const data = comparisons[drugs];

  if (!data) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${data.drug1} vs ${data.drug2} for ${data.condition}`,
    description: data.description,
    about: [
      { '@type': 'Drug', name: data.drug1 },
      { '@type': 'Drug', name: data.drug2 },
    ],
  };

  const otherComparisons = Object.entries(comparisons)
    .filter(([slug]) => slug !== drugs)
    .slice(0, 4);

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
        Comparing treatments for <span className="font-medium text-[var(--color-text-primary)]">{data.condition}</span>
      </p>
      <p className="text-[var(--color-text-muted)] mb-8">{data.description}</p>

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
            Search PubMed for evidence on {data.drug1} and {data.condition.toLowerCase()}.
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
            Search PubMed for evidence on {data.drug2} and {data.condition.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-primary)]/5 rounded-2xl p-8 border border-[var(--color-primary)]/20 text-center mb-10">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Get an AI-Powered Comparison
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-5 max-w-lg mx-auto">
          Use MetaLens AI to analyze the latest PubMed evidence comparing {data.drug1} and {data.drug2} for {data.condition.toLowerCase()}.
        </p>
        <Link
          href={`/${locale}?q=${encodeURIComponent(data.keywords)}`}
          className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Analyze {data.drug1} vs {data.drug2}
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-[var(--color-warning)]/10 rounded-2xl p-4 border border-[var(--color-warning)]/30 mb-10">
        <p className="text-xs text-[var(--color-text-secondary)] text-center">
          This page is for informational purposes only. It does NOT constitute medical advice. Always consult a qualified healthcare professional for treatment decisions.
        </p>
      </div>

      {/* Other comparisons */}
      {otherComparisons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Other Drug Comparisons
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherComparisons.map(([slug, comp]) => (
              <Link
                key={slug}
                href={`/${locale}/compare/${slug}`}
                className="block p-4 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium text-[var(--color-primary-dark)]">
                  {comp.drug1} vs {comp.drug2}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{comp.condition}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
