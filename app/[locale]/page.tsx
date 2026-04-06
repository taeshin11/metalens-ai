'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import KeywordInput, { SearchFilters, SearchMode } from '@/components/KeywordInput';
import ResultsCard from '@/components/ResultsCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import FeedbackButton from '@/components/FeedbackButton';
import LoginModal from '@/components/LoginModal';
import { searchAndFetch, PubMedArticle } from '@/lib/pubmed';
import { synthesizeWithAI, SynthesisResult } from '@/lib/synthesis';
import { collectData } from '@/lib/analytics';
import { translateForPubMed } from '@/lib/translate';
import { buildPubMedQuery } from '@/lib/pubmed-filters';
import { TIER_CONFIG } from '@/lib/constants';

type Stage = 'idle' | 'searching' | 'synthesizing' | 'done' | 'error';

const FREE_SEARCHES = 1;

export default function HomePage() {
  const t = useTranslations('hero');
  const tErr = useTranslations('errors');
  const locale = useLocale();
  const { user } = useAuth();

  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>('idle');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('meta-analysis');
  const [history, setHistory] = useState<{ keywords: string; paperCount: number; timestamp: number; mode: string; resultId?: string }[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('metalens_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const tier = user?.tier || 'free';
  const tierConfig = TIER_CONFIG[tier];

  // Auto-trigger analysis from ?q= parameter (e.g. from compare pages)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !autoTriggered && stage === 'idle') {
      setAutoTriggered(true);
      handleAnalyze(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, autoTriggered, stage]);

  const handleAnalyze = async (kw: string, filters?: SearchFilters, mode?: SearchMode) => {
    if (mode) setSearchMode(mode);
    // Check if login required (after FREE_SEARCHES without session)
    if (!user) {
      const count = parseInt(sessionStorage.getItem('searchCount') || '0', 10);
      if (count >= FREE_SEARCHES) {
        setShowLogin(true);
        return;
      }
      sessionStorage.setItem('searchCount', String(count + 1));
    }

    setKeywords(kw);
    setStage('searching');
    setError('');
    setResult(null);

    // Smooth scroll to loading area
    setTimeout(() => {
      document.getElementById('loading-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      // Translate non-English keywords to English for PubMed search
      const englishKeywords = await translateForPubMed(kw);
      const query = filters ? buildPubMedQuery(englishKeywords, filters) : englishKeywords;
      const papers = await searchAndFetch(query, 50);

      if (papers.length === 0) {
        setStage('error');
        setError(tErr('noResults'));
        return;
      }

      setArticles(papers);
      collectData(kw, papers.length);

      setStage('synthesizing');

      const langMap: Record<string, string> = {
        en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese',
        es: 'Spanish', pt: 'Portuguese', de: 'German', fr: 'French',
      };
      const language = langMap[locale] || 'English';

      const synthesisResult = await synthesizeWithAI(papers, language, tierConfig.pointCount, mode || searchMode);

      // Track remaining from server response
      if (synthesisResult.remaining !== undefined) {
        setRemaining(synthesisResult.remaining);
      }

      setResult(synthesisResult);
      setStage('done');

      // Save to history + cache results
      const resultId = String(Date.now());
      const entry = { keywords: kw, paperCount: papers.length, timestamp: Date.now(), mode: mode || searchMode, resultId };
      const updated = [entry, ...history.filter(h => h.keywords !== kw)].slice(0, 20);
      setHistory(updated);
      try {
        localStorage.setItem('metalens_history', JSON.stringify(updated));
        localStorage.setItem(`metalens_result_${resultId}`, JSON.stringify({ result: synthesisResult, articles: papers }));
        // Keep only the 20 most recent cached results
        const oldEntry = history.find(h => h.keywords === kw);
        if (oldEntry?.resultId) localStorage.removeItem(`metalens_result_${oldEntry.resultId}`);
      } catch { /* ignore */ }
    } catch (err) {
      setStage('error');
      // Check for rate limit
      if (err instanceof Error && err.message.includes('429')) {
        setError(tErr('rateLimit'));
      } else {
        setError(tErr('apiError'));
      }
    }
  };

  const handleNewSearch = () => {
    setStage('idle');
    setResult(null);
    setArticles([]);
    setKeywords('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Allow Header logo click to reset to home
  useEffect(() => {
    const handler = () => handleNewSearch();
    window.addEventListener('metalens:home', handler);
    return () => window.removeEventListener('metalens:home', handler);
  });

  return (
    <>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <FeedbackButton />

      {/* Hero Section */}
      {stage !== 'done' && (
        <section className="relative overflow-hidden">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary-light)]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent-light)]/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-info)]/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium mb-4">
                  🧬 {t('poweredBy')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {t('title')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed"
              >
                {t('subtitle')}
              </motion.p>

              <div className="pt-4">
                <KeywordInput
                  onSubmit={handleAnalyze}
                  isLoading={stage === 'searching' || stage === 'synthesizing'}
                />
                {/* Quick example buttons */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    { label: 'Pranlukast vs Montelukast', kw: 'pranlukast, montelukast, asthma, efficacy' },
                    { label: 'Metformin vs Insulin', kw: 'metformin, insulin, type 2 diabetes, efficacy' },
                    { label: 'Ibuprofen vs Acetaminophen', kw: 'ibuprofen, acetaminophen, pain, efficacy' },
                  ].map((ex) => (
                    <button
                      key={ex.kw}
                      onClick={() => handleAnalyze(ex.kw)}
                      disabled={stage === 'searching' || stage === 'synthesizing'}
                      className="px-3 py-1.5 text-xs text-[var(--color-primary-dark)] bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 rounded-full hover:bg-[var(--color-primary)]/15 transition-colors disabled:opacity-40"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-center gap-8 pt-8 text-sm text-[var(--color-text-muted)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-success)]">●</span> {t('stat1')}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-info)]">●</span> {t('stat2')}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-warning)]">●</span> {t('stat3')}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Loading */}
      {(stage === 'searching' || stage === 'synthesizing') && (
        <div id="loading-area" className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          <LoadingSkeleton stage={stage} />
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto mt-8"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-200 text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleNewSearch}
                  className="px-6 py-2.5 text-sm font-medium text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  ← {tErr('tryAgain')}
                </button>
                {/* Upgrade link hidden during beta */}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Results */}
      {stage === 'done' && result && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 pb-16">
          {/* Remaining counter hidden during beta */}

          <ResultsCard
            result={result}
            articles={articles}
            keywords={keywords}
            onNewSearch={handleNewSearch}
            mode={searchMode}
          />
        </div>
      )}

      {/* Below-the-fold content (only when idle) */}
      {stage === 'idle' && (
        <>
          {/* Search History */}
          {history.length > 0 && (
            <section className="bg-white border-t border-[var(--color-border)]">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {t('historyTitle')}
                  </h2>
                  <button
                    onClick={() => {
                      history.forEach(h => { if (h.resultId) localStorage.removeItem(`metalens_result_${h.resultId}`); });
                      setHistory([]);
                      localStorage.removeItem('metalens_history');
                    }}
                    className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                  >
                    {t('historyClear')}
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {history.slice(0, 6).map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (h.resultId) {
                          try {
                            const cached = localStorage.getItem(`metalens_result_${h.resultId}`);
                            if (cached) {
                              const { result: cachedResult, articles: cachedArticles } = JSON.parse(cached);
                              setKeywords(h.keywords);
                              setSearchMode(h.mode as SearchMode);
                              setResult(cachedResult);
                              setArticles(cachedArticles);
                              setStage('done');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              return;
                            }
                          } catch { /* fall through to re-search */ }
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        handleAnalyze(h.keywords, undefined, h.mode as SearchMode);
                      }}
                      className="text-left p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all group"
                    >
                      <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {h.keywords}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                        <span>📄 {h.paperCount} papers</span>
                        <span>{h.mode === 'gap-finder' ? '🔍 Gap' : '📊 Meta'}</span>
                        <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* How It Works */}
          <section className="bg-white border-t border-[var(--color-border)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <h2
                className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-12"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {t('howItWorksTitle')}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '⌨️', step: '1', title: t('step1'), desc: t('step1Desc') },
                  { icon: '🔍', step: '2', title: t('step2'), desc: t('step2Desc') },
                  { icon: '🤖', step: '3', title: t('step3'), desc: t('step3Desc') },
                  { icon: '📊', step: '4', title: t('step4'), desc: t('step4Desc') },
                ].map((s) => (
                  <div key={s.step} className="text-center p-6 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2">Step {s.step}</div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {s.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Comparisons */}
          <section className="bg-[var(--color-bg-primary)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <h2
                className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-4"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {t('popularTitle')}
              </h2>
              <p className="text-center text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto">
                {t('popularDesc')}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { d1: 'Pranlukast', d2: 'Montelukast', cond: 'Asthma', kw: 'pranlukast, montelukast, asthma, efficacy, safety' },
                  { d1: 'Metformin', d2: 'Insulin', cond: 'Type 2 Diabetes', kw: 'metformin, insulin, type 2 diabetes, glycemic control, efficacy' },
                  { d1: 'Ibuprofen', d2: 'Acetaminophen', cond: 'Pain Relief', kw: 'ibuprofen, acetaminophen, pain, analgesic, efficacy, safety' },
                  { d1: 'Lisinopril', d2: 'Losartan', cond: 'Hypertension', kw: 'lisinopril, losartan, hypertension, blood pressure, efficacy' },
                  { d1: 'Omeprazole', d2: 'Pantoprazole', cond: 'GERD', kw: 'omeprazole, pantoprazole, GERD, acid reflux, proton pump inhibitor' },
                  { d1: 'Sertraline', d2: 'Fluoxetine', cond: 'Depression', kw: 'sertraline, fluoxetine, depression, SSRI, efficacy, side effects' },
                ].map((c) => (
                  <button
                    key={c.kw}
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); handleAnalyze(c.kw); }}
                    className="text-left p-5 bg-white rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]"></span>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                        {c.d1} vs {c.d2}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.cond}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing CTA hidden during beta */}

          {/* Who Is This For */}
          <section className="bg-white border-t border-[var(--color-border)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
              <h2
                className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-10"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {t('forWhoTitle')}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: '🎓', label: t('forStudents') },
                  { icon: '💊', label: t('forPharmacists') },
                  { icon: '🔬', label: t('forResearchers') },
                  { icon: '⚕️', label: t('forClinicians') },
                ].map((p) => (
                  <div key={p.label} className="text-center p-5 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <p className="font-medium text-[var(--color-text-primary)]">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
