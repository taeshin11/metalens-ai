'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import { ADMIN_EMAILS } from '@/lib/admin';
import type { Tier } from '@/lib/constants';
import { clog } from '@/lib/client-logger';

interface UpgradeGateProps {
  requiredTier: 'pro';
  currentTier: Tier;
  feature: string;
  featureKey: string;
  children: React.ReactNode;
}

const MAX_TRIALS = 1;

function getTrialCount(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(sessionStorage.getItem(`trial_${key}`) || '0', 10);
  } catch (err) {
    clog.warn('trial_count_read_failed', 'UpgradeGate', { featureKey: key, errMessage: err instanceof Error ? err.message : String(err).slice(0, 200) });
    return 0;
  }
}

function useTrial(key: string) {
  if (typeof window === 'undefined') return;
  try {
    const count = getTrialCount(key);
    sessionStorage.setItem(`trial_${key}`, String(count + 1));
    clog.info('trial_consumed', 'UpgradeGate', { featureKey: key, newCount: count + 1 });
  } catch (err) {
    clog.error('trial_write_failed', 'UpgradeGate', err, { featureKey: key });
  }
}

export default function UpgradeGate({ currentTier, feature, featureKey, children }: UpgradeGateProps) {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const t = useTranslations('upgradeGate');

  const [trialUsed, setTrialUsed] = useState(false);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    setTrialUsed(getTrialCount(featureKey) >= MAX_TRIALS);
  }, [featureKey]);

  // Admin bypass
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  if (isAdminUser) return <>{children}</>;

  // Free tier → gate; pro → pass through
  const hasAccess = currentTier === 'pro';
  if (hasAccess || trialActive) return <>{children}</>;

  const tierColor = 'var(--color-primary)';
  const canTrial = !trialUsed;

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
        ⚡ {t('badge')}
      </div>

      <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {feature}
      </h4>

      {/* Benefits */}
      <div className="inline-block text-left space-y-1.5 mb-5">
        {[t('b1'), t('b2'), t('b3'), t('b4')].map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-success)] mt-0.5 flex-shrink-0">&#10003;</span>
            {b}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        {canTrial ? (
          <>
            <button
              onClick={handleTrial}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: tierColor }}
            >
              {t('trialBtn')}
            </button>
            <p className="text-[10px] text-[var(--color-text-muted)]">{t('trialHint')}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('trialUsed')}</p>
            <a
              href={`/${locale}/pricing`}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: tierColor }}
            >
              {t('upgradeBtn')}
            </a>
            <p className="text-[10px] text-[var(--color-text-muted)]">{t('cancelHint')}</p>
          </>
        )}
      </div>
    </div>
  );
}
