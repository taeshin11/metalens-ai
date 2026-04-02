'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
const SOON = (
  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)] font-bold">SOON</span>
);

const PLANS = [
  {
    key: 'free' as const,
    popular: false,
    features: [
      { text: '5 analyses per day', included: true },
      { text: 'Meta-analysis summary', included: true },
      { text: 'Research Gap Finder', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Forest Plot & Funnel Plot', included: true },
      { text: 'Data extraction table', included: true },
      { text: 'Abstract draft generation', included: false, soon: true },
      { text: 'SCI journal recommendation', included: false, soon: true },
      { text: 'PDF report export', included: false, soon: true },
      { text: 'Paper introduction/discussion draft', included: false },
      { text: 'Literature differentiation analysis', included: false },
    ],
  },
  {
    key: 'pro' as const,
    popular: true,
    features: [
      { text: '50 analyses per day', included: true },
      { text: 'Meta-analysis summary', included: true },
      { text: 'Research Gap Finder', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Forest Plot & Funnel Plot', included: true },
      { text: 'Data extraction table', included: true },
      { text: 'Abstract draft generation', included: true, soon: true },
      { text: 'SCI journal recommendation', included: true, soon: true },
      { text: 'PDF report export', included: true, soon: true },
      { text: 'Paper introduction/discussion draft', included: false },
      { text: 'Literature differentiation analysis', included: false },
    ],
  },
  {
    key: 'ultra' as const,
    popular: false,
    features: [
      { text: '200 analyses per day', included: true },
      { text: 'Meta-analysis summary', included: true },
      { text: 'Research Gap Finder', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Forest Plot & Funnel Plot', included: true },
      { text: 'Data extraction table', included: true },
      { text: 'Abstract draft generation', included: true, soon: true },
      { text: 'SCI journal recommendation', included: true, soon: true },
      { text: 'PDF report export', included: true, soon: true },
      { text: 'Paper introduction/discussion draft', included: true, soon: true },
      { text: 'Literature differentiation analysis', included: true, soon: true },
    ],
  },
];

export default function PricingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [billing, setBilling] = useState<Billing>('monthly');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Send to Google Sheets webhook (silent collection)
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords: `PRICING_WAITLIST: ${email}`,
            paper_count: 0,
            language: navigator.language,
            user_agent: navigator.userAgent,
            referrer: 'pricing_page',
            session_id: 'waitlist',
          }),
        });
      }
    } catch { /* silent */ }

    setSubmitted(true);
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1
          className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Start free with full access during beta. Paid plans coming soon with advanced paper writing tools.
        </p>

        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          Beta — All features currently free
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center gap-3 bg-[var(--color-bg-secondary)] rounded-full p-1.5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                billing === 'yearly'
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-[var(--color-success)] font-semibold">Save 17%</span>
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
              className={`relative rounded-3xl border-2 p-8 flex flex-col ${
                plan.popular
                  ? 'border-[var(--color-primary)] bg-white shadow-xl scale-[1.02]'
                  : 'border-[var(--color-border)] bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <h3
                  className="text-xl font-bold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {config.label}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-[var(--color-text-muted)]">
                      /{billing === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                {monthlyEquiv && price > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    ${monthlyEquiv}/mo billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {f.included ? CHECK : CROSS}
                    <span className={`text-sm ${f.included ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] line-through'}`}>
                      {f.text}
                    </span>
                    {f.soon && f.included && SOON}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {plan.key === 'free' ? (
                <a
                  href={`/${locale}`}
                  className="block py-3 text-center text-sm font-semibold text-[var(--color-primary)] border-2 border-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors"
                >
                  Start Free
                </a>
              ) : (
                <div
                  className={`py-3 text-center text-sm font-semibold rounded-xl ${
                    plan.popular
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                  }`}
                >
                  Coming Soon
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Waitlist Email */}
      <div className="mt-16 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-3xl p-8 border border-[var(--color-primary)]/20 text-center">
          <h3
            className="text-xl font-bold text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Get notified when Pro launches
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Be the first to access abstract generation, journal recommendations, and PDF export.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-3 px-6 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl font-medium text-sm"
            >
              You&apos;re on the list! We&apos;ll notify you when Pro is ready.
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-3 text-sm bg-white border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Comparison with Competitors */}
      <div className="mt-20">
        <h2
          className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          How We Compare
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)]">
                <th className="text-left py-3 pr-4 font-medium text-[var(--color-text-secondary)]">Feature</th>
                <th className="py-3 px-4 font-bold text-[var(--color-primary)] text-center">MetaLens AI</th>
                <th className="py-3 px-4 font-medium text-[var(--color-text-muted)] text-center">Elicit<br/><span className="text-xs font-normal">$12/mo</span></th>
                <th className="py-3 px-4 font-medium text-[var(--color-text-muted)] text-center">Consensus<br/><span className="text-xs font-normal">$8.99/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['AI Meta-Analysis Summary', true, true, true],
                ['Research Gap Finder', true, false, false],
                ['Free Tier (No Credit Card)', true, true, true],
                ['Multi-Language (8 langs)', true, false, false],
                ['Forest Plot + Funnel Plot', true, false, false],
                ['Data Extraction Table', true, true, false],
                ['Abstract Draft Generation', true, false, false],
                ['SCI Journal Recommendation', true, false, false],
                ['Starting Price', '$4.99', '$12', '$8.99'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-3 pr-4 text-[var(--color-text-primary)] font-medium">{row[0]}</td>
                  {[1, 2, 3].map(j => (
                    <td key={j} className="py-3 px-4 text-center">
                      {typeof row[j] === 'boolean' ? (
                        row[j] ? <span className="text-[var(--color-success)]">&#10003;</span> : <span className="text-[var(--color-text-muted)]">&#10007;</span>
                      ) : (
                        <span className={j === 1 ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}>{row[j]}</span>
                      )}
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
        <h2
          className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-8"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          FAQ
        </h2>
        <div className="space-y-4">
          {[
            { q: 'Is MetaLens AI really free?', a: 'Yes! During beta, all features are free with no limits. When paid plans launch, the free tier will still include 5 analyses per day with full meta-analysis and gap finder access.' },
            { q: 'When will Pro/Ultra launch?', a: 'We are targeting Q2 2026. Sign up for the waitlist to be notified as soon as paid plans are available.' },
            { q: 'What payment methods will you accept?', a: 'We will accept all major credit and debit cards through Lemon Squeezy, our secure payment processor.' },
            { q: 'Can I cancel anytime?', a: 'Yes, you will be able to cancel your subscription at any time. Your access continues until the end of the billing period.' },
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
