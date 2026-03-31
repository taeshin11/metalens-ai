'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PubMedArticle } from '@/lib/pubmed';
import { PUBMED_BASE } from '@/lib/constants';

interface ResultsCardProps {
  result: string;
  articles: PubMedArticle[];
  keywords: string;
  onNewSearch: () => void;
}

export default function ResultsCard({ result, articles, keywords, onNewSearch }: ResultsCardProps) {
  const t = useTranslations('results');

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
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <h3
          className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span className="text-[var(--color-success)]">✦</span>
          {t('keyFindings')}
        </h3>
        <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
          {result}
        </div>
      </div>

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
