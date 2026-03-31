'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import KeywordInput from '@/components/KeywordInput';
import ResultsCard from '@/components/ResultsCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import FeedbackButton from '@/components/FeedbackButton';
import { searchAndFetch, PubMedArticle } from '@/lib/pubmed';
import { synthesizeWithPuter } from '@/lib/synthesis';
import { collectData } from '@/lib/analytics';
import { translateForPubMed } from '@/lib/translate';

type Stage = 'idle' | 'searching' | 'synthesizing' | 'done' | 'error';

export default function HomePage() {
  const t = useTranslations('hero');
  const tErr = useTranslations('errors');
  const locale = useLocale();

  const [stage, setStage] = useState<Stage>('idle');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [result, setResult] = useState('');
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async (kw: string) => {
    setKeywords(kw);
    setStage('searching');
    setError('');
    setResult('');

    try {
      // Translate non-English keywords to English for PubMed search
      const englishKeywords = await translateForPubMed(kw);
      const papers = await searchAndFetch(englishKeywords, 20);

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

      const text = await synthesizeWithPuter(papers, language);
      setResult(text);
      setStage('done');
    } catch {
      setStage('error');
      setError(tErr('apiError'));
    }
  };

  const handleNewSearch = () => {
    setStage('idle');
    setResult('');
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
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-center gap-8 pt-8 text-sm text-[var(--color-text-muted)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-success)]">●</span> 40M+ Papers
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-info)]">●</span> AI-Powered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-warning)]">●</span> Free to Use
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
                ← Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Results */}
      {stage === 'done' && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 pb-16">
          <ResultsCard
            result={result}
            articles={articles}
            keywords={keywords}
            onNewSearch={handleNewSearch}
          />
        </div>
      )}
    </>
  );
}
