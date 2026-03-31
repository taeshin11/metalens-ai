'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface KeywordInputProps {
  onSubmit: (keywords: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function KeywordInput({ onSubmit, isLoading, initialValue }: KeywordInputProps) {
  const t = useTranslations('hero');
  const [keywords, setKeywords] = useState(initialValue || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() && !isLoading) {
      onSubmit(keywords.trim());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('placeholder')}
            disabled={isLoading}
            className="w-full px-5 py-4 text-base bg-white border-2 border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] disabled:opacity-60"
            aria-label="Enter medical keywords"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            🔍
          </span>
        </div>
        <button
          type="submit"
          disabled={isLoading || !keywords.trim()}
          className="px-8 py-4 bg-[var(--color-accent)] text-white font-semibold rounded-2xl hover:bg-[var(--color-accent-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-accent)]/20"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('analyze')}...
            </span>
          ) : (
            t('analyze')
          )}
        </button>
      </div>
    </motion.form>
  );
}
