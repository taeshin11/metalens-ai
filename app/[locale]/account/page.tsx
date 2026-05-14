'use client';

import { useAuth } from '@/components/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TIER_CONFIG } from '@/lib/constants';
import type { Tier } from '@/lib/constants';
import { clog } from '@/lib/client-logger';

interface SavedItem {
  id: string;
  keywords: string;
  mode: string;
  consensusLevel: string | null;
  consensusScore: number | null;
  createdAt: number;
  articles: { pmid: string }[];
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('account');
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      if (tier === 'pro') {
        setSavedLoading(true);
        fetch('/api/saved')
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.analyses) setSavedAnalyses(data.analyses); })
          .catch(() => {})
          .finally(() => setSavedLoading(false));
      }
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

      {/* Saved Analyses (Pro only) */}
      {tier === 'pro' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Saved Analyses
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">{savedAnalyses.length} / 50</span>
          </div>
          {savedLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : savedAnalyses.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
              No saved analyses yet. Use the Save button on any analysis result.
            </p>
          ) : (
            <div className="space-y-2">
              {savedAnalyses.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-xl group">
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/${locale}?q=${encodeURIComponent(item.keywords)}`}
                      className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] truncate block"
                    >
                      {item.keywords}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                        {item.mode === 'gap-finder' ? 'Gap Finder' : 'Meta-Analysis'}
                      </span>
                      {item.consensusLevel && (
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {item.consensusLevel} {item.consensusScore}%
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {item.articles?.length || 0} papers
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setDeletingId(item.id);
                      try {
                        const res = await fetch(`/api/saved/${item.id}`, { method: 'DELETE' });
                        if (res.ok) setSavedAnalyses(prev => prev.filter(a => a.id !== item.id));
                      } catch {}
                      setDeletingId(null);
                    }}
                    disabled={deletingId === item.id}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    {deletingId === item.id ? (
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
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
