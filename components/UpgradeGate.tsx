'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Tier } from '@/lib/constants';

interface UpgradeGateProps {
  requiredTier: 'pro' | 'ultra';
  currentTier: Tier;
  feature: string;
  featureKey: string; // unique key for tracking trial usage (e.g. 'data_table', 'meta_analysis')
  children: React.ReactNode;
}

const MAX_TRIALS = 1; // 1 free trial per feature

function getTrialCount(key: string): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(sessionStorage.getItem(`trial_${key}`) || '0', 10);
}

function useTrial(key: string) {
  if (typeof window === 'undefined') return;
  const count = getTrialCount(key);
  sessionStorage.setItem(`trial_${key}`, String(count + 1));
}

export default function UpgradeGate({ requiredTier, currentTier, feature, featureKey, children }: UpgradeGateProps) {
  const params = useParams();
  const locale = params.locale as string;

  const tierOrder: Record<Tier, number> = { free: 0, pro: 1, ultra: 2 };
  const hasAccess = tierOrder[currentTier] >= tierOrder[requiredTier];

  const [trialUsed, setTrialUsed] = useState(false);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    setTrialUsed(getTrialCount(featureKey) >= MAX_TRIALS);
  }, [featureKey]);

  if (hasAccess || trialActive) return <>{children}</>;

  const tierLabel = requiredTier === 'pro' ? 'Pro' : 'Ultra';
  const tierPrice = requiredTier === 'pro' ? '$2.99' : '$6.99';
  const tierColor = requiredTier === 'pro' ? 'var(--color-primary)' : 'var(--color-accent)';
  const canTrial = !trialUsed;

  const benefits = requiredTier === 'pro'
    ? ['AI-extracted data from each paper', 'Sample sizes, effect sizes, p-values', 'Exportable structured table', '50 analyses per day']
    : ['Statistical meta-analysis (pooled effects)', 'Forest plot visualization', 'I² heterogeneity calculation', '200 analyses per day'];

  const handleTrial = () => {
    useTrial(featureKey);
    setTrialActive(true);
    setTrialUsed(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 text-center" style={{ borderColor: tierColor }}>
      {/* Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold mb-3"
        style={{ backgroundColor: tierColor }}
      >
        {requiredTier === 'pro' ? '⚡' : '🔬'} {tierLabel} Feature
      </div>

      <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {feature}
      </h4>

      {/* Benefits */}
      <div className="inline-block text-left space-y-1.5 mb-5">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-success)] mt-0.5 flex-shrink-0">&#10003;</span>
            {b}
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center gap-3">
        {canTrial ? (
          <>
            <button
              onClick={handleTrial}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: tierColor }}
            >
              Try it free — 1 time only
            </button>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              No credit card needed. Experience it once, then upgrade for unlimited access.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              You&apos;ve used your free trial for this feature.
            </p>
            <a
              href={`/${locale}/pricing`}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: tierColor }}
            >
              Upgrade to {tierLabel} — {tierPrice}/mo
            </a>
            <p className="text-[10px] text-[var(--color-text-muted)]">Cancel anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
