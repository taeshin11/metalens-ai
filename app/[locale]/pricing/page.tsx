'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TIER_CONFIG } from '@/lib/constants';

type Billing = 'monthly' | 'yearly';

const CHECK = (
  <svg className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
);
const CROSS = (
  <svg className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

type FeatureKey = 'f_analyses' | 'f_meta' | 'f_gap' | 'f_pubmed' | 'f_lang' | 'f_plots' | 'f_datatable' | 'f_abstract' | 'f_journal' | 'f_pdf' | 'f_draft' | 'f_diff';

interface PlanFeature {
  key: FeatureKey;
  included: boolean;
  soon?: boolean;
  count?: number;
}

const PLANS: { key: 'free' | 'pro' | 'ultra'; popular: boolean; features: PlanFeature[] }[] = [
  {
    key: 'free', popular: false,
    features: [
      { key: 'f_analyses', included: true, count: 5 },
      { key: 'f_meta', included: true },
      { key: 'f_gap', included: true },
      { key: 'f_pubmed', included: true },
      { key: 'f_lang', included: true },
      { key: 'f_plots', included: true },
      { key: 'f_datatable', included: true },
      { key: 'f_abstract', included: false, soon: true },
      { key: 'f_journal', included: false, soon: true },
      { key: 'f_pdf', included: false, soon: true },
      { key: 'f_draft', included: false },
      { key: 'f_diff', included: false },
    ],
  },
  {
    key: 'pro', popular: true,
    features: [
      { key: 'f_analyses', included: true, count: 50 },
      { key: 'f_meta', included: true },
      { key: 'f_gap', included: true },
      { key: 'f_pubmed', included: true },
      { key: 'f_lang', included: true },
      { key: 'f_plots', included: true },
      { key: 'f_datatable', included: true },
      { key: 'f_abstract', included: true, soon: true },
      { key: 'f_journal', included: true, soon: true },
      { key: 'f_pdf', included: true, soon: true },
      { key: 'f_draft', included: false },
      { key: 'f_diff', included: false },
    ],
  },
  {
    key: 'ultra', popular: false,
    features: [
      { key: 'f_analyses', included: true, count: 200 },
      { key: 'f_meta', included: true },
      { key: 'f_gap', included: true },
      { key: 'f_pubmed', included: true },
      { key: 'f_lang', included: true },
      { key: 'f_plots', included: true },
      { key: 'f_datatable', included: true },
      { key: 'f_abstract', included: true, soon: true },
      { key: 'f_journal', included: true, soon: true },
      { key: 'f_pdf', included: true, soon: true },
      { key: 'f_draft', included: true, soon: true },
      { key: 'f_diff', included: true, soon: true },
    ],
  },
];

export default function PricingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('pricing');
  const [billing, setBilling] = useState<Billing>('monthly');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords: `PRICING_WAITLIST: ${email}`,
            paper_count: 0, language: navigator.language,
            user_agent: navigator.userAgent, referrer: 'pricing_page', session_id: 'waitlist',
          }),
        });
      }
    } catch { /* silent */ }
    setSubmitted(true);
  };

  const featureText = (f: PlanFeature): string => {
    if (f.key === 'f_analyses' && f.count) return t('f_analyses', { count: f.count });
    return t(f.key);
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t('title')}
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          {t('betaSubtitle')}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          {t('betaBadge')}
        </div>
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center gap-3 bg-[var(--color-bg-secondary)] rounded-full p-1.5">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${billing === 'monthly' ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}>
              {t('monthly')}
            </button>
            <button onClick={() => setBilling('yearly')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${billing === 'yearly' ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}>
              {t('yearly')}
              <span className="ml-1.5 text-xs text-[var(--color-success)] font-semibold">{t('save')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {PLANS.map((plan) => {
          const config = TIER_CONFIG[plan.key];
          const price = billing === 'monthly' ? config.price : config.yearlyPrice;
          const monthlyEquiv = billing === 'yearly' && config.yearlyPrice > 0 ? (config.yearlyPrice / 12).toFixed(2) : null;

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: plan.key === 'free' ? 0 : plan.key === 'pro' ? 0.1 : 0.2 }}
              className={`relative rounded-3xl border-2 p-8 flex flex-col ${plan.popular ? 'border-[var(--color-primary)] bg-white shadow-xl scale-[1.02]' : 'border-[var(--color-border)] bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  {t('mostPopular')}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {config.label}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                    {price === 0 ? t('freeLabel') : `$${price}`}
                  </span>
                  {price > 0 && <span className="text-sm text-[var(--color-text-muted)]">{billing === 'monthly' ? t('perMonth') : t('perYear')}</span>}
                </div>
                {monthlyEquiv && price > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">${monthlyEquiv}{t('perMonth')} {t('billedAnnually', { amount: monthlyEquiv })}</p>
                )}
              </div>
              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {f.included ? CHECK : CROSS}
                    <span className={`text-sm ${f.included ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] line-through'}`}>
                      {featureText(f)}
                    </span>
                    {f.soon && f.included && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)] font-bold">{t('soon')}</span>
                    )}
                  </div>
                ))}
              </div>
              {plan.key === 'free' ? (
                <a href={`/${locale}`} className="block py-3 text-center text-sm font-semibold text-[var(--color-primary)] border-2 border-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors">
                  {t('startFree')}
                </a>
              ) : (
                <div className={`py-3 text-center text-sm font-semibold rounded-xl ${plan.popular ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'}`}>
                  {t('comingSoon')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Waitlist */}
      <div className="mt-16 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-3xl p-8 border border-[var(--color-primary)]/20 text-center">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t('waitlistTitle')}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">{t('waitlistDesc')}</p>
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-3 px-6 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl font-medium text-sm">
              {t('waitlistSuccess')}
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('waitlistPlaceholder')} required
                className="flex-1 px-4 py-3 text-sm bg-white border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
              <button type="submit" className="px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors">
                {t('waitlistButton')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t('howWeCompare')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)]">
                <th className="text-left py-3 pr-4 font-medium text-[var(--color-text-secondary)]">{t('feature')}</th>
                <th className="py-3 px-4 font-bold text-[var(--color-primary)] text-center">MetaLens AI</th>
                <th className="py-3 px-4 font-medium text-[var(--color-text-muted)] text-center">Elicit<br/><span className="text-xs font-normal">$12/mo</span></th>
                <th className="py-3 px-4 font-medium text-[var(--color-text-muted)] text-center">Consensus<br/><span className="text-xs font-normal">$8.99/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                [t('f_meta'), true, true, true],
                [t('f_gap'), true, false, false],
                [t('f_lang'), true, false, false],
                [t('f_plots'), true, false, false],
                [t('f_datatable'), true, true, false],
                [t('f_abstract'), true, false, false],
                [t('f_journal'), true, false, false],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-3 pr-4 text-[var(--color-text-primary)] font-medium">{row[0]}</td>
                  {[1, 2, 3].map(j => (
                    <td key={j} className="py-3 px-4 text-center">
                      {typeof row[j] === 'boolean' ? (
                        row[j] ? <span className="text-[var(--color-success)]">&#10003;</span> : <span className="text-[var(--color-text-muted)]">&#10007;</span>
                      ) : row[j]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t('faqTitle')}
        </h2>
        <div className="space-y-4">
          {[
            { q: t('faq1qBeta'), a: t('faq1aBeta') },
            { q: t('faq2qBeta'), a: t('faq2aBeta') },
            { q: t('faq1q'), a: t('faq1a') },
            { q: t('faq3q'), a: t('faq3a') },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)]">
              <p className="font-semibold text-[var(--color-text-primary)] mb-2">{item.q}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
