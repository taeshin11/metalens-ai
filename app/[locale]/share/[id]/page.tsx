'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PUBMED_BASE, SITE_URL } from '@/lib/constants';

interface ShareData {
  keywords: string;
  result: { english: string; translated?: string | null };
  articles: {
    pmid: string; title: string; authors: string[];
    journal: string; year: string; doi?: string | null; pubTypes: string[];
  }[];
  mode: 'meta-analysis' | 'gap-finder';
  createdAt: number;
}

export default function SharePage() {
  const t = useTranslations('results');
  const ts = useTranslations('share');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = params.id as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/share?id=${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="text-4xl">🔍</p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {ts('expired')}
        </h1>
        <p className="text-[var(--color-text-muted)] max-w-sm">{ts('expiredDesc')}</p>
        <Link href={`/${locale}`} className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
          {ts('tryAgain')}
        </Link>
      </div>
    );
  }

  const summaryText = data.result.translated || data.result.english;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto px-4 py-10 space-y-6"
    >
      {/* Shared banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)]/10 rounded-xl text-sm text-[var(--color-primary-dark)] font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        {ts('sharedBy')}
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {data.mode === 'gap-finder' ? t('gapTitle') : t('title')}
          </h1>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
            📄 {data.articles.length} {t('papersFound')}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('keywords')}: <span className="font-medium text-[var(--color-text-secondary)]">{data.keywords}</span>
        </p>
      </div>

      {/* Translated summary */}
      {data.result.translated && (
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-info)]/5 rounded-2xl p-6 shadow-sm border border-[var(--color-primary)]/20">
          <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            🌐 {t('translatedSummary')}
          </h2>
          <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
            {data.result.translated}
          </div>
        </div>
      )}

      {/* Key findings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="text-[var(--color-success)]">✦</span>
          {data.mode === 'gap-finder' ? t('gapFindings') : data.result.translated ? t('originalFindings') : t('keyFindings')}
        </h2>
        <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
          {data.result.english}
        </div>
      </div>

      {/* Sources */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          📚 {t('sources')}
        </h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {data.articles.map(article => (
            <div key={article.pmid} className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <a href={`${PUBMED_BASE}/${article.pmid}/`} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors">
                {article.title}
              </a>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {article.authors.join(', ')}{article.authors.length >= 3 ? ' et al.' : ''} · {article.journal} ({article.year}) · PMID: {article.pmid}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[var(--color-warning)]/10 rounded-2xl p-4 border border-[var(--color-warning)]/30">
        <p className="text-xs text-[var(--color-text-secondary)] text-center">⚕️ {t('disclaimer')}</p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href={`/${locale}`}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
          {ts('viewOriginal')} →
        </Link>
      </div>
    </motion.div>
  );
}
