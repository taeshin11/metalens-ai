'use client';

import { useAuth } from '@/components/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TIER_CONFIG } from '@/lib/constants';
import type { Tier } from '@/lib/constants';
import { clog } from '@/lib/client-logger';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('account');
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cancelEndsAt, setCancelEndsAt] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (user) {
      const tier = user.tier || 'free';
      const config = TIER_CONFIG[tier];
      setUsage({ remaining: config.dailyLimit, limit: config.dailyLimit });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const tier: Tier = user.tier || 'free';
  const config = TIER_CONFIG[tier];

  const tierStyles: Record<Tier, { bg: string; text: string; border: string }> = {
    free: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    pro: { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary-dark)]', border: 'border-[var(--color-primary)]/30' },
  };

  const style = tierStyles[tier];

  const handleLogout = async () => {
    clog.info('logout_start', 'AccountPage', { tier: user?.tier });
    try {
      await logout();
      clog.info('logout_done', 'AccountPage');
    } catch (err) {
      clog.error('logout_failed', 'AccountPage', err);
    }
    router.push(`/${locale}`);
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h1
        className="text-3xl font-bold text-[var(--color-text-primary)] mb-8"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{user.name}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label={t('email')} value={user.email} />
          <InfoRow label={t('name')} value={user.name} />
        </div>
      </div>

      {/* Subscription Card */}
      <div className={`rounded-2xl p-6 shadow-sm border-2 mb-6 ${style.border} ${style.bg}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{t('currentPlan')}</p>
            <h3 className={`text-2xl font-bold mt-1 ${style.text}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
              {config.label}
            </h3>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${style.bg} ${style.text}`}>
            {config.price === 0 ? t('free') : `$${config.price}/mo`}
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-2 mb-5">
          <PlanFeature text={t('analysesPerDay', { count: config.dailyLimit })} />
          <PlanFeature text={t('pointSummaries', { count: config.pointCount })} />
          <PlanFeature text={t('aiModel', { model: config.model })} />
          <PlanFeature text={t('dataExtraction')} />
          <PlanFeature text={t('fullFeatures')} />
        </div>
      </div>

      {/* Usage Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t('dailyUsage')}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--color-text-secondary)]">{t('analysesToday')}</span>
              <span className="font-mono font-medium text-[var(--color-text-primary)]">
                {usage ? `${usage.limit - usage.remaining} / ${usage.limit}` : '—'}
              </span>
            </div>
            <div className="h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: usage ? `${((usage.limit - usage.remaining) / usage.limit) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          {t('resetsDaily')}
        </p>
      </div>

      {/* Subscription Management */}
      {tier === 'pro' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t('manageSubscription')}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">{t('manageDesc')}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://metalens.lemonsqueezy.com/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--color-primary)] border-2 border-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors"
            >
              {t('manageBilling')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button
              onClick={() => setCancelModal(true)}
              className="px-5 py-2.5 text-sm font-medium text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              {t('cancelSubscription')}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            {cancelDone ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{t('cancelledTitle')}</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-2">{t('cancelledDesc')}</p>
                {cancelEndsAt && (
                  <p className="text-sm font-medium text-[var(--color-primary-dark)] mb-4">
                    {t('cancelledEndsAt', { date: new Date(cancelEndsAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) })}
                  </p>
                )}
                <button
                  onClick={() => { setCancelModal(false); window.location.reload(); }}
                  className="px-6 py-2.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-xl"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {t('cancelTitle')}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">{t('cancelConfirm')}</p>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder={t('cancelReasonPlaceholder')}
                  className="w-full px-4 py-3 text-sm border-2 border-[var(--color-border)] rounded-xl mb-4 resize-none focus:border-red-300 focus:outline-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] border-2 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-secondary)]"
                  >
                    {t('cancelKeep')}
                  </button>
                  <button
                    onClick={async () => {
                      setCancelling(true);
                      try {
                        const res = await fetch('/api/lemonsqueezy/cancel', { method: 'POST' });
                        if (res.ok) {
                          const data = await res.json();
                          setCancelEndsAt(data.endsAt || '');
                          setCancelDone(true);
                          clog.info('subscription_cancelled', 'AccountPage', { reason: cancelReason, endsAt: data.endsAt });
                        } else if (res.status === 404) {
                          alert(t('cancelNoSub'));
                          setCancelModal(false);
                        } else {
                          const data = await res.json();
                          alert(data.error || 'Failed to cancel');
                        }
                      } catch {
                        alert('Network error');
                      }
                      setCancelling(false);
                    }}
                    disabled={cancelling}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50"
                  >
                    {cancelling ? '...' : t('cancelConfirmBtn')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tier === 'free' && (
        <div className="bg-[var(--color-primary)]/5 rounded-2xl p-6 border border-[var(--color-primary)]/20 mb-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('upgradePrompt')}</p>
          <a
            href={`/${locale}/pricing`}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {t('upgradeToPro')}
          </a>
        </div>
      )}

      {/* Logout */}
      <div className="text-center">
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          {t('signOut')}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-[var(--color-bg-primary)] rounded-xl">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5 break-all">{value}</p>
    </div>
  );
}

function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <span className="text-[var(--color-success)]">&#10003;</span>
      {text}
    </div>
  );
}
