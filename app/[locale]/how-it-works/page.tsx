import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how MetaLens AI searches PubMed and uses AI to synthesize medical research into structured summaries.',
};

const steps = [
  { icon: '⌨️', key: 'step1' },
  { icon: '🔍', key: 'step2' },
  { icon: '🤖', key: 'step3' },
  { icon: '📊', key: 'step4' },
] as const;

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-12 text-center"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors"
          >
            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary)]/10 rounded-xl text-2xl">
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-full"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Step {i + 1}
                </span>
                <h2
                  className="text-xl font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {t(`${step.key}Title`)}
                </h2>
              </div>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t(`${step.key}Text`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
