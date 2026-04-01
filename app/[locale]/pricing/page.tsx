'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TIER_CONFIG } from '@/lib/constants';
import LoginModal from '@/components/LoginModal';

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

const PLANS = [
  {
    key: 'free' as const,
    popular: false,
    features: [
      { text: '5 analyses per day', included: true },
      { text: '5-point summary', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Advanced filters', included: false },
      { text: 'PDF report export', included: false },
      { text: 'Search history', included: false },
      { text: 'Drug comparison mode', included: false },
      { text: 'Data extraction table', included: false },
      { text: 'Consensus meter', included: false },
    ],
  },
  {
    key: 'pro' as const,
    popular: true,
    features: [
      { text: '50 analyses per day', included: true },
      { text: '7-point deep summary', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'PDF report export', included: true },
      { text: 'Search history', included: true },
      { text: 'Drug comparison mode', included: false },
      { text: 'Data extraction table', included: false },
      { text: 'Consensus meter', included: false },
    ],
  },
  {
    key: 'ultra' as const,
    popular: false,
    features: [
      { text: '200 analyses per day', included: true },
      { text: '10-point deep summary', included: true },
      { text: 'PubMed search (40M+ papers)', included: true },
      { text: '8 languages auto-detect', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'PDF report export', included: true },
      { text: 'Search history', included: true },
      { text: 'Drug comparison mode', included: true },
      { text: 'Data extraction table', included: true },
      { text: 'Consensus meter', included: true },
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const [billing, setBilling] = useState<Billing>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const plan = `${planKey}_${billing}`;
    setLoading(plan);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Something went wrong');
    }
  };

  return (
    <>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Success/Cancel Banner */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
            <p className="text-green-700 font-medium">Welcome to your new plan! Your account has been upgraded.</p>
          </motion.div>
        )}
        {canceled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
            <p className="text-yellow-700">Checkout was canceled. No charges were made.</p>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Start free, upgrade when you need more. All plans include access to 40M+ PubMed papers.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-[var(--color-bg-secondary)] rounded-full p-1.5 mt-6">
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

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map((plan) => {
            const config = TIER_CONFIG[plan.key];
            const price = billing === 'monthly' ? config.price : config.yearlyPrice;
            const monthlyEquiv = billing === 'yearly' ? (config.yearlyPrice / 12).toFixed(2) : null;
            const isCurrent = user?.tier === plan.key;
            const isUpgrade = user && !isCurrent && plan.key !== 'free';

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
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {plan.key === 'free' ? (
                  isCurrent ? (
                    <div className="py-3 text-center text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl">
                      Current Plan
                    </div>
                  ) : (
                    <a
                      href={`/${locale}`}
                      className="block py-3 text-center text-sm font-semibold text-[var(--color-primary)] border-2 border-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors"
                    >
                      Get Started Free
                    </a>
                  )
                ) : isCurrent ? (
                  <button
                    onClick={handlePortal}
                    className="py-3 text-center text-sm font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={!!loading}
                    className={`py-3 text-center text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                      plan.popular
                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                        : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90'
                    }`}
                  >
                    {loading === `${plan.key}_${billing}` ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Redirecting...
                      </span>
                    ) : (
                      `Upgrade to ${config.label}`
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
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
                  <th className="py-3 px-4 font-medium text-[var(--color-text-muted)] text-center">SciSpace<br/><span className="text-xs font-normal">$9.99/mo</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Meta-Analysis Summary', true, true, true, true],
                  ['Free Tier (No Account)', true, true, true, true],
                  ['Multi-Language Support (8 langs)', true, false, false, false],
                  ['Drug Comparison Pages', true, false, false, false],
                  ['Advanced Filters (RCT, Date, Age)', true, true, true, false],
                  ['PDF Export', true, true, false, true],
                  ['Consensus Meter', true, false, true, false],
                  ['Data Extraction Table', true, true, false, true],
                  ['Starting Price', '$2.99', '$12', '$8.99', '$9.99'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]/50">
                    <td className="py-3 pr-4 text-[var(--color-text-primary)] font-medium">{row[0]}</td>
                    {[1, 2, 3, 4].map(j => (
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
            Pricing FAQ
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.' },
              { q: 'Is there a free trial?', a: 'The free tier is available forever with 5 analyses per day. No credit card needed to start.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards through Stripe, our secure payment processor.' },
              { q: 'Can I switch between plans?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately and are prorated.' },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">{item.q}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
