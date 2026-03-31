import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Discover how medical students, pharmacists, researchers, and clinicians use MetaLens AI for evidence-based insights.',
};

const useCases = [
  {
    icon: '🎓',
    role: 'Medical Students',
    description: 'Quickly review evidence for exam preparation and research papers. Instead of spending hours reading individual papers, get structured summaries of the latest evidence on any medical topic.',
    examples: [
      'Compare treatment options for pharmacology assignments',
      'Find evidence for case study presentations',
      'Review drug interactions and efficacy data',
      'Prepare for journal club discussions',
    ],
  },
  {
    icon: '💊',
    role: 'Pharmacists',
    description: 'Compare drug efficacy and safety profiles to make informed dispensing decisions. Access synthesized evidence from peer-reviewed studies in seconds.',
    examples: [
      'Compare two drugs for the same indication',
      'Review side effect profiles across studies',
      'Find dosing recommendations supported by evidence',
      'Stay updated on latest treatment guidelines',
    ],
  },
  {
    icon: '🔬',
    role: 'Researchers',
    description: 'Scope your literature review before committing to a full systematic review. Quickly identify key papers, trends, and gaps in the evidence.',
    examples: [
      'Preliminary literature scoping for grant proposals',
      'Identify research gaps in a topic area',
      'Quick evidence overview before designing a study',
      'Cross-check findings during peer review',
    ],
  },
  {
    icon: '⚕️',
    role: 'Clinicians',
    description: 'Get rapid evidence-based answers to clinical questions during busy practice hours. Make more informed treatment decisions with AI-synthesized research summaries.',
    examples: [
      'Quick comparison of treatment options during consultations',
      'Evidence review for complex or rare conditions',
      'Support for clinical decision-making with citations',
      'Staying current with emerging evidence',
    ],
  },
  {
    icon: '🏥',
    role: 'Healthcare Organizations',
    description: 'Support formulary decisions, guideline development, and training programs with rapid evidence synthesis from the medical literature.',
    examples: [
      'Evidence review for formulary committee decisions',
      'Support for clinical pathway development',
      'Training tool for evidence-based medicine programs',
      'Rapid evidence checks for policy decisions',
    ],
  },
  {
    icon: '🌐',
    role: 'Non-English Speaking Professionals',
    description: 'MetaLens AI automatically translates the interface and generates results in your language, making English-language medical research accessible worldwide.',
    examples: [
      'Search PubMed in Korean, Japanese, Chinese, or other languages',
      'Receive AI summaries in your native language',
      'Bridge the language barrier in medical research',
      'Access the same evidence as English-speaking peers',
    ],
  },
];

export default async function UseCasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold text-[var(--color-text-primary)] mb-4"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Who Uses MetaLens AI?
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          MetaLens AI helps healthcare professionals, students, and researchers access evidence-based insights faster than ever.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {useCases.map((uc) => (
          <div
            key={uc.role}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{uc.icon}</span>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {uc.role}
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {uc.description}
            </p>
            <ul className="space-y-2">
              {uc.examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-primary)] mt-0.5">+</span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium text-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Try MetaLens AI Free
        </Link>
      </div>
    </div>
  );
}
