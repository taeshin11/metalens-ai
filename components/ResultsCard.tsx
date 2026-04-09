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

const EXTRACT_STEPS = ['extractStep0', 'extractStep1', 'extractStep2', 'extractStep3', 'extractStep4'] as const;

function ExtractionLoader({ count, elapsed, step, color, t }: {
  count: number;
  elapsed: number;
  step: number;
  color: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const elapsedStr = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `${secs}${(t as any)('extractSeconds')}`;
  const stepKey = EXTRACT_STEPS[Math.min(step, EXTRACT_STEPS.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14">
      {/* Spinner + elapsed */}
      <div className="relative flex items-center justify-center w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: color, borderRightColor: color + '40' }}
        />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{elapsedStr}</span>
      </div>

      {/* Step message */}
      <p className="text-sm font-medium text-[var(--color-text-primary)] text-center max-w-xs">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(t as any)(stepKey, { count })}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2">
        {EXTRACT_STEPS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i <= step ? color : 'var(--color-border)',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Estimated time hint — shown for first 5 seconds */}
      {elapsed < 5 && (
        <p className="text-xs text-[var(--color-text-muted)] text-center max-w-xs">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(t as any)('extractEstimate')}
        </p>
      )}
    </div>
  );
}

interface ResultsCardProps {
  result: SynthesisResult;
  articles: PubMedArticle[];
  keywords: string;
  onNewSearch: () => void;
  mode?: 'meta-analysis' | 'gap-finder';
}

export default function ResultsCard({ result, articles, keywords, onNewSearch, mode = 'meta-analysis' }: ResultsCardProps) {
  const t = useTranslations('results');
  const tt = useTranslations('tools');
  const td = useTranslations('dataTable');
  const { user } = useAuth();
  const tier = user?.tier || 'free';

  const [activeTab, setActiveTab] = useState<'summary' | 'data' | 'meta' | 'tools'>('summary');
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [pooled, setPooled] = useState<PooledResult | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractElapsed, setExtractElapsed] = useState(0);
  const [extractStep, setExtractStep] = useState(0);
  const [abstractDraft, setAbstractDraft] = useState('');
  const [journalRecs, setJournalRecs] = useState('');
  const [toolsLoading, setToolsLoading] = useState(false);

  // Auto-extract data when switching to data/meta tab
  useEffect(() => {
    if ((activeTab === 'data' || activeTab === 'meta') && !extraction && !extracting) {
      handleExtract();
    }
  }, [activeTab]);

  const handleExtract = async () => {
    setExtracting(true);
    setExtractError('');
    setExtractElapsed(0);
    setExtractStep(0);

    const startTime = Date.now();
    const elapsedTimer = setInterval(() => {
      setExtractElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const stepMessages = [0, 1, 2, 3, 4]; // indices into t('extractSteps') array
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, stepMessages.length - 1);
      setExtractStep(stepIdx);
    }, 7000);

    try {
      const result = await extractDataFromArticles(articles);
      setExtraction(result);

      // Auto-pool if possible
      if (result.poolable && result.commonEffectType) {
        const poolResult = poolStudies(result.data, result.commonEffectType);
        setPooled(poolResult);
      }
    } catch {
      setExtractError('extraction_failed');
    } finally {
      clearInterval(elapsedTimer);
      clearInterval(stepTimer);
      setExtracting(false);
    }
  };

  const tierOrder: Record<string, number> = { free: 0, pro: 1, ultra: 2 };
  const userTierNum = tierOrder[tier] || 0;

  const tabs = [
    { key: 'summary' as const, label: t('tabAISummary'), icon: '✦', minTier: 0 },
    { key: 'data' as const, label: t('tabData'), icon: '📊', minTier: 0 },
    { key: 'meta' as const, label: t('tabMeta'), icon: '🔬', minTier: 0 },
    { key: 'tools' as const, label: t('tabTools'), icon: '✍️', minTier: 0 },
  ];

  const handleGenerateTools = async (tool: 'abstract' | 'journal') => {
    setToolsLoading(true);
    try {
      const summaryText = result.english;
      const paperCount = articles.length;
      const articleList = articles.slice(0, 10).map(a => `${a.title} (${a.journal}, ${a.year}, PMID:${a.pmid})`).join('\n');

      let prompt = '';
      if (tool === 'abstract') {
        prompt = `Based on the following meta-analysis findings and ${paperCount} PubMed papers, generate a structured research abstract draft.

The abstract should follow the standard IMRAD format:
- **Background**: Why this topic matters, current knowledge gaps
- **Objective**: What this analysis aimed to investigate
- **Methods**: "A systematic search of PubMed was conducted..." with study selection criteria
- **Results**: Key quantitative findings with specific numbers, effect sizes, confidence intervals
- **Conclusion**: Clinical implications and recommendations

Keywords analyzed: ${keywords}

Meta-analysis findings:
${summaryText}

Key source papers:
${articleList}

Output ONLY the abstract text with section headers in bold. Target length: 250-350 words. Use formal academic language.`;
      } else {
        prompt = `Based on the following meta-analysis topic and ${paperCount} PubMed papers, recommend the most suitable SCI/SCIE journals for submission.

For each journal, provide:
1. **Journal Name** — Full name
2. **Impact Factor** — Approximate IF (use your knowledge, state if estimated)
3. **Scope Match** — Why this journal fits this topic (1-2 sentences)
4. **Review Speed** — Typical review timeline if known
5. **Open Access** — Whether OA option is available

Keywords: ${keywords}

Source papers were published in: ${[...new Set(articles.map(a => a.journal))].slice(0, 10).join(', ')}

Recommend exactly 5 journals, ordered by fit (best match first). Include a mix of high-impact and realistic options. Output in structured format with bold headers.`;
      }

      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        if (tool === 'abstract') setAbstractDraft(data.result || '');
        else setJournalRecs(data.result || '');
      }
    } catch { /* silent */ }
    setToolsLoading(false);
  };

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
            {mode === 'gap-finder' ? t('gapTitle') : t('title')}
          </h2>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
            📄 {articles.length} {t('papersFound')}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('keywords')}: <span className="font-medium text-[var(--color-text-secondary)]">{keywords}</span>
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
              {mode === 'gap-finder' ? t('gapFindings') : result.translated ? t('originalFindings') : t('keyFindings')}
            </h3>
            <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              {result.english}
            </div>
          </div>

          {/* Explore other tabs hint */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { tab: 'data' as const, icon: '📊', title: t('tabDataTitle'), desc: t('tabDataDesc') },
              { tab: 'meta' as const, icon: '🔬', title: t('tabMetaTitle'), desc: t('tabMetaDesc') },
              { tab: 'tools' as const, icon: '✍️', title: t('tabToolsTitle'), desc: t('tabToolsDesc') },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className="text-left p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{item.icon}</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{item.title}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
              </button>
            ))}
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
              <span>📊</span> {td('title')}
              {/* PRO badge hidden during beta */}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              {td('desc')}
            </p>

            {extracting ? (
              <ExtractionLoader
                count={articles.length}
                elapsed={extractElapsed}
                step={extractStep}
                color="var(--color-primary)"
                t={t}
              />
            ) : extractError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-3">{t('extractionFailed')}</p>
                <button onClick={handleExtract} className="text-sm text-[var(--color-primary)] hover:underline">
                  {t('tryAgain')}
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
                <span>🔬</span> {t('statMetaTitle')}
                {/* ULTRA badge hidden during beta */}
              </h3>

              {extracting ? (
                <ExtractionLoader
                  count={articles.length}
                  elapsed={extractElapsed}
                  step={extractStep}
                  color="var(--color-accent)"
                  t={t}
                />
              ) : pooled ? (
                <div className="space-y-4">
                  {/* Pooled Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox label={t('pooledEffect')} value={`${pooled.pooledEffect}`} sub={pooled.effectType} />
                    <StatBox label="95% CI" value={`${pooled.ciLower} – ${pooled.ciUpper}`} />
                    <StatBox
                      label={t('pvalue')}
                      value={pooled.pValue < 0.001 ? '<0.001' : String(pooled.pValue)}
                      highlight={pooled.pValue < 0.05}
                    />
                    <StatBox
                      label={`I² ${t('heterogeneity')}`}
                      value={`${pooled.iSquared}%`}
                      sub={pooled.iSquared > 75 ? t('hetHigh') : pooled.iSquared > 50 ? t('hetModerate') : t('hetLow')}
                    />
                  </div>

                  {/* Interpretation */}
                  <div className="p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                      {pooled.interpretation}
                    </p>
                  </div>

                  <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                    {t('basedOn', { numStudies: pooled.numStudies, totalN: pooled.totalN })}
                  </p>
                </div>
              ) : extraction && !extraction.poolable ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t('notEnoughStudies')}
                  </p>
                </div>
              ) : extractError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-3">{t('extractionFailed')}</p>
                  <button onClick={handleExtract} className="text-sm text-[var(--color-primary)] hover:underline">
                    {t('tryAgain')}
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
                  🌲 {t('forestPlotTitle')}
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
                  🔻 {t('funnelPlotTitle')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  {t('funnelPlotDesc')}
                </p>
                <FunnelPlot studies={extraction.data} pooled={pooled} />
              </div>
            )}

            {/* Overall Meta-Analysis Summary */}
            {pooled && extraction && (
              <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-info)]/5 rounded-2xl p-6 border border-[var(--color-primary)]/20">
                <h3
                  className="text-lg font-semibold text-[var(--color-primary-dark)] mb-3 flex items-center gap-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  📋 {t('metaSummaryTitle')}
                </h3>
                <div className="space-y-3 text-sm text-[var(--color-text-primary)] leading-relaxed">
                  <p>
                    <strong>{t('pooledEffect')}:</strong> {t('summaryPooled', { effectType: pooled.effectType, numStudies: pooled.numStudies })}
                    {pooled.totalN > 0 && t('summaryTotalN', { totalN: pooled.totalN.toLocaleString() })} was <strong>{pooled.pooledEffect.toFixed(2)}</strong> (95%
                    CI: {pooled.ciLower.toFixed(2)} to {pooled.ciUpper.toFixed(2)}),
                    {pooled.pValue < 0.05 ? t('summarySig') : t('summaryNotSig')} (p {pooled.pValue < 0.001 ? '< 0.001' : `= ${pooled.pValue}`}).
                  </p>
                  <p>
                    <strong>{t('heterogeneity')}:</strong> I² = {pooled.iSquared}%,
                    {pooled.iSquared > 75 ? t('summaryHetHigh') : pooled.iSquared > 50 ? t('summaryHetMod') : pooled.iSquared > 25 ? t('summaryHetLowMod') : t('summaryHetLow')}.
                    {pooled.iSquared > 50 ? ` ${t('summaryRandomNote')}` : ` ${t('summaryFixedNote')}`}
                  </p>
                  <p>
                    <strong>{t('dataCoverage')}:</strong> {t('dataCoverageText', { withData: extraction.data.filter(d => d.effectSize !== null).length, total: extraction.data.length })}
                    {extraction.data.length - extraction.data.filter(d => d.effectSize !== null).length > 0 &&
                      ` ${t('dataCoverageMissing', { missing: extraction.data.length - extraction.data.filter(d => d.effectSize !== null).length })}`}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                    {t('summaryDisclaimer')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </UpgradeGate>
      )}

      {/* Tab Content: Writing Tools */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Abstract Generator */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                📝 {tt('abstractTitle')}
              </h3>
              {!abstractDraft && (
                <button onClick={() => handleGenerateTools('abstract')} disabled={toolsLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50">
                  {toolsLoading ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{tt('generating')}</span> : tt('abstractBtn')}
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">{tt('abstractDesc')}</p>
            {abstractDraft ? (
              <div>
                <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap bg-[var(--color-bg-primary)] rounded-xl p-5 border border-[var(--color-border)]">{abstractDraft}</div>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => navigator.clipboard.writeText(abstractDraft)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    {tt('copy')}
                  </button>
                  <button onClick={() => { setAbstractDraft(''); handleGenerateTools('abstract'); }} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">{tt('regenerate')}</button>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{tt('abstractDisclaimer')}</p>
              </div>
            ) : !toolsLoading ? (
              <div className="text-center py-6 text-sm text-[var(--color-text-muted)]">{tt('abstractHint')}</div>
            ) : null}
          </div>

          {/* Journal Recommendation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                🎯 {tt('journalTitle')}
              </h3>
              {!journalRecs && (
                <button onClick={() => handleGenerateTools('journal')} disabled={toolsLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50">
                  {toolsLoading ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{tt('analyzing')}</span> : tt('journalBtn')}
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">{tt('journalDesc')}</p>
            {journalRecs ? (
              <div>
                <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap bg-[var(--color-bg-primary)] rounded-xl p-5 border border-[var(--color-border)]">{journalRecs}</div>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => navigator.clipboard.writeText(journalRecs)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    {tt('copy')}
                  </button>
                  <button onClick={() => { setJournalRecs(''); handleGenerateTools('journal'); }} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">{tt('regenerate')}</button>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{tt('journalDisclaimer')}</p>
              </div>
            ) : !toolsLoading ? (
              <div className="text-center py-6 text-sm text-[var(--color-text-muted)]">{tt('journalHint')}</div>
            ) : null}
          </div>
        </div>
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
          {articles.map((article) => (
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

      {/* Ad Banner — shown only for free-tier users */}
      <AdBanner variant="banner" className="rounded-xl opacity-80 hover:opacity-100 transition-opacity" />

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
