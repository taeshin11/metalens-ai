'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { PubMedArticle } from '@/lib/pubmed';
import { SynthesisResult } from '@/lib/synthesis';
import { PUBMED_BASE } from '@/lib/constants';
import { extractDataFromArticles, ExtractionResult } from '@/lib/data-extraction';
import { poolStudies, PooledResult } from '@/lib/meta-stats';
import DataTable from './DataTable';
import ForestPlot from './ForestPlot';
import FunnelPlot from './FunnelPlot';
import UpgradeGate from './UpgradeGate';
import ShareButtons from './ShareButtons';
import UpsellBanner from './UpsellBanner';
import AdBanner from './AdBanner';

interface ResultsCardProps {
  result: SynthesisResult;
  articles: PubMedArticle[];
  keywords: string;
  onNewSearch: () => void;
}

export default function ResultsCard({ result, articles, keywords, onNewSearch }: ResultsCardProps) {
  const t = useTranslations('results');
  const { user } = useAuth();
  const tier = user?.tier || 'free';

  const [activeTab, setActiveTab] = useState<'summary' | 'data' | 'meta'>('summary');
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [pooled, setPooled] = useState<PooledResult | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  // Auto-extract data when switching to data/meta tab
  useEffect(() => {
    if ((activeTab === 'data' || activeTab === 'meta') && !extraction && !extracting) {
      handleExtract();
    }
  }, [activeTab]);

  const handleExtract = async () => {
    setExtracting(true);
    setExtractError('');
    try {
      const result = await extractDataFromArticles(articles);
      setExtraction(result);

      // Auto-pool if possible
      if (result.poolable && result.commonEffectType) {
        const poolResult = poolStudies(result.data, result.commonEffectType);
        setPooled(poolResult);
      }
    } catch {
      setExtractError('Data extraction failed. Try again.');
    } finally {
      setExtracting(false);
    }
  };

  const tierOrder: Record<string, number> = { free: 0, pro: 1, ultra: 2 };
  const userTierNum = tierOrder[tier] || 0;

  const tabs = [
    { key: 'summary' as const, label: 'AI Summary', icon: '✦', minTier: 0 },
    { key: 'data' as const, label: 'Data Table', icon: '📊', minTier: 1 },
    { key: 'meta' as const, label: 'Meta-Analysis', icon: '🔬', minTier: 2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8 space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {t('title')}
          </h2>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
            📄 {articles.length} {t('papersFound')}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Keywords: <span className="font-medium text-[var(--color-text-secondary)]">{keywords}</span>
        </p>
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <ShareButtons keywords={keywords} paperCount={articles.length} />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-[var(--color-bg-secondary)] rounded-xl p-1">
        {tabs.map(tab => {
          const unlocked = userTierNum >= tab.minTier;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Tier badges hidden during beta */}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Summary */}
      {activeTab === 'summary' && (
        <>
          {/* Translated Summary */}
          {result.translated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-info)]/5 rounded-2xl p-6 shadow-sm border border-[var(--color-primary)]/20"
            >
              <h3
                className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>🌐</span>
                {t('translatedSummary')}
              </h3>
              <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {result.translated}
              </div>
            </motion.div>
          )}

          {/* Key Findings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <h3
              className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-[var(--color-success)]">✦</span>
              {result.translated ? t('originalFindings') : t('keyFindings')}
            </h3>
            <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              {result.english}
            </div>
          </div>
        </>
      )}

      {/* Tab Content: Data Table (Pro) */}
      {activeTab === 'data' && (
        <UpgradeGate requiredTier="pro" currentTier={tier} feature="Data Extraction Table" featureKey="data_table">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <h3
              className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span>📊</span> Extracted Study Data
              {/* PRO badge hidden during beta */}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              AI-extracted numerical data from each paper&apos;s abstract. Includes sample sizes, effect sizes, confidence intervals, and p-values.
            </p>

            {extracting ? (
              <div className="flex items-center justify-center gap-3 py-12">
                <div className="w-5 h-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
                <span className="text-sm text-[var(--color-text-muted)]">Extracting data from {articles.length} papers...</span>
              </div>
            ) : extractError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-3">{extractError}</p>
                <button onClick={handleExtract} className="text-sm text-[var(--color-primary)] hover:underline">
                  Try again
                </button>
              </div>
            ) : extraction ? (
              <DataTable data={extraction.data} />
            ) : null}
          </div>
        </UpgradeGate>
      )}

      {/* Tab Content: Meta-Analysis (Ultra) */}
      {activeTab === 'meta' && (
        <UpgradeGate requiredTier="ultra" currentTier={tier} feature="Statistical Meta-Analysis & Forest Plot" featureKey="meta_analysis">
          <div className="space-y-6">
            {/* Pooled Result */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
              <h3
                className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>🔬</span> Statistical Meta-Analysis
                {/* ULTRA badge hidden during beta */}
              </h3>

              {extracting ? (
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                  <span className="text-sm text-[var(--color-text-muted)]">Running meta-analysis on {articles.length} papers...</span>
                </div>
              ) : pooled ? (
                <div className="space-y-4">
                  {/* Pooled Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox label="Pooled Effect" value={`${pooled.pooledEffect}`} sub={pooled.effectType} />
                    <StatBox label="95% CI" value={`${pooled.ciLower} – ${pooled.ciUpper}`} />
                    <StatBox
                      label="p-value"
                      value={pooled.pValue < 0.001 ? '<0.001' : String(pooled.pValue)}
                      highlight={pooled.pValue < 0.05}
                    />
                    <StatBox
                      label="I² Heterogeneity"
                      value={`${pooled.iSquared}%`}
                      sub={pooled.iSquared > 75 ? 'High' : pooled.iSquared > 50 ? 'Moderate' : 'Low'}
                    />
                  </div>

                  {/* Interpretation */}
                  <div className="p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                      {pooled.interpretation}
                    </p>
                  </div>

                  <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                    Based on {pooled.numStudies} studies (N={pooled.totalN}). Fixed-effect inverse-variance model.
                  </p>
                </div>
              ) : extraction && !extraction.poolable ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Not enough studies with comparable effect sizes to perform statistical pooling.
                    <br />At least 3 studies with the same effect type (OR, RR, MD, etc.) are needed.
                  </p>
                </div>
              ) : extractError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-3">{extractError}</p>
                  <button onClick={handleExtract} className="text-sm text-[var(--color-primary)] hover:underline">
                    Try again
                  </button>
                </div>
              ) : null}
            </div>

            {/* Forest Plot */}
            {pooled && extraction && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
                <h3
                  className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  🌲 Forest Plot
                </h3>
                <ForestPlot studies={extraction.data} pooled={pooled} />
              </div>
            )}

            {/* Funnel Plot (Publication Bias) */}
            {pooled && extraction && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
                <h3
                  className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  🔻 Funnel Plot
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Assesses publication bias by plotting effect size vs. precision. Asymmetry may indicate selective reporting.
                </p>
                <FunnelPlot studies={extraction.data} pooled={pooled} />
              </div>
            )}
          </div>
        </UpgradeGate>
      )}

      {/* Upsell Banner hidden during beta */}

      {/* Sources */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <h3
          className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          📚 {t('sources')}
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {articles.slice(0, 10).map((article) => (
            <div
              key={article.pmid}
              className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors"
            >
              <a
                href={`${PUBMED_BASE}/${article.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
              >
                {article.title}
              </a>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {article.authors.slice(0, 3).join(', ')}
                {article.authors.length > 3 && ' et al.'}
                {' · '}
                {article.journal} ({article.year})
                {' · '}
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  PMID: {article.pmid}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Banner */}
      {process.env.NEXT_PUBLIC_ADSTERRA_AD_KEY && (
        <div className="flex justify-center">
          <AdBanner
            adKey={process.env.NEXT_PUBLIC_ADSTERRA_AD_KEY}
            width={728}
            height={90}
            className="rounded-xl opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-[var(--color-warning)]/10 rounded-2xl p-4 border border-[var(--color-warning)]/30">
        <p className="text-xs text-[var(--color-text-secondary)] text-center">
          ⚕️ {t('disclaimer')}
        </p>
      </div>

      {/* New Search */}
      <div className="text-center">
        <button
          onClick={onNewSearch}
          className="px-6 py-2.5 text-sm font-medium text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          ← {t('newSearch')}
        </button>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-center">
      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold font-mono mt-1 ${highlight ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
}
