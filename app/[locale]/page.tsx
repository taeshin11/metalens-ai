'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import KeywordInput, { SearchFilters } from '@/components/KeywordInput';
import ResultsCard from '@/components/ResultsCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import FeedbackButton from '@/components/FeedbackButton';
import { searchAndFetch, PubMedArticle } from '@/lib/pubmed';
import { synthesizeWithAI, SynthesisResult } from '@/lib/synthesis';
import { collectData } from '@/lib/analytics';
import { translateForPubMed } from '@/lib/translate';
import { buildPubMedQuery } from '@/lib/pubmed-filters';

type Stage = 'idle' | 'searching' | 'synthesizing' | 'done' | 'error';

export default function HomePage() {
  const t = useTranslations('hero');
  const tErr = useTranslations('errors');
  const locale = useLocale();

  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>('idle');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Auto-trigger analysis from ?q= parameter (e.g. from compare pages)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !autoTriggered && stage === 'idle') {
      setAutoTriggered(true);
      handleAnalyze(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, autoTriggered, stage]);

  const handleAnalyze = async (kw: string, filters?: SearchFilters) => {
    setKeywords(kw);
    setStage('searching');
    setError('');
    setResult(null);

    try {
      // Translate non-English keywords to English for PubMed search
      const englishKeywords = await translateForPubMed(kw);
      const query = filters ? buildPubMedQuery(englishKeywords, filters) : englishKeywords;
      const papers = await searchAndFetch(query, 20);

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

      const synthesisResult = await synthesizeWithAI(papers, language);
      setResult(synthesisResult);
      setStage('done');
    } catch {
      setStage('error');
      setError(tErr('apiError'));
    }
  };

  const handleNewSearch = () => {
    setStage('idle');
    setResult(null);
    setArticles([]);
    setKeywords('');
    setError('');
  };

  return (
    <>
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
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
              <button
                onClick={handleNewSearch}
                className="px-6 py-2.5 text-sm font-medium text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                ← {tErr('tryAgain')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Results */}
      {stage === 'done' && result && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 pb-16">
          <ResultsCard
            result={result}
            articles={articles}
            keywords={keywords}
            onNewSearch={handleNewSearch}
          />
        </div>
      )}

      {/* Below-the-fold content (only when idle) */}
      {stage === 'idle' && (
        <>
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
