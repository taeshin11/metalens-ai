'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SearchMode = 'meta-analysis' | 'gap-finder';

export interface SearchFilters {
  studyType: string;
  dateRange: string;
  ageGroup: string;
}

interface KeywordInputProps {
  onSubmit: (keywords: string, filters: SearchFilters, mode: SearchMode) => void;
  isLoading: boolean;
  initialValue?: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  studyType: '',
  dateRange: '',
  ageGroup: '',
};

export default function KeywordInput({ onSubmit, isLoading, initialValue }: KeywordInputProps) {
  const t = useTranslations('hero');
  const ta = useTranslations('a11y');
  const [keywords, setKeywords] = useState(initialValue || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [mode, setMode] = useState<SearchMode>('meta-analysis');

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const MAX_KEYWORD_LENGTH = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim() && !isLoading) {
      // Guard: PubMed query URLs break beyond 500 chars
      onSubmit(keywords.trim().slice(0, MAX_KEYWORD_LENGTH), filters, mode);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Mode Toggle */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-1 bg-[var(--color-bg-secondary)] rounded-full p-1">
          <button
            type="button"
            onClick={() => setMode('meta-analysis')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              mode === 'meta-analysis'
                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {t('modeMeta')}
          </button>
          <button
            type="button"
            onClick={() => setMode('gap-finder')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              mode === 'gap-finder'
                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {t('modeGap')}
          </button>
        </div>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={mode === 'meta-analysis' ? t('placeholder') : t('placeholderGap')}
            disabled={isLoading}
            maxLength={500}
            className="w-full px-5 py-4 text-base bg-white border-2 border-[var(--color-border)] rounded-2xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] disabled:opacity-60"
            aria-label={ta('enterKeywords')}
          />
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

      {/* Filter toggle */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] bg-white/60 hover:bg-white border border-[var(--color-border)] rounded-full transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
            <circle cx="6" cy="6" r="2" fill="currentColor" /><circle cx="10" cy="12" r="2" fill="currentColor" /><circle cx="14" cy="18" r="2" fill="currentColor" />
          </svg>
          {t('filters')}
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[var(--color-primary)] rounded-full">
              {activeFilterCount}
            </span>
          )}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl space-y-4">
              {/* Study Type */}
              <FilterRow label={t('studyType')}>
                {[
                  { value: '', label: t('studyAll') },
                  { value: 'randomized controlled trial', label: t('studyRCT') },
                  { value: 'meta-analysis', label: t('studyMeta') },
                  { value: 'systematic review', label: t('studyReview') },
                  { value: 'clinical trial', label: t('studyClinical') },
                ].map(opt => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.studyType === opt.value}
                    onClick={() => handleFilterChange('studyType', opt.value)}
                  />
                ))}
              </FilterRow>

              {/* Date Range */}
              <FilterRow label={t('dateRange')}>
                {[
                  { value: '', label: t('dateAll') },
                  { value: '5', label: t('date5y') },
                  { value: '10', label: t('date10y') },
                ].map(opt => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.dateRange === opt.value}
                    onClick={() => handleFilterChange('dateRange', opt.value)}
                  />
                ))}
              </FilterRow>

              {/* Age Group */}
              <FilterRow label={t('ageGroup')}>
                {[
                  { value: '', label: t('ageAll') },
                  { value: 'child', label: t('ageChild') },
                  { value: 'adolescent', label: t('ageAdolescent') },
                  { value: 'adult', label: t('ageAdult') },
                  { value: 'aged', label: t('ageElderly') },
                ].map(opt => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.ageGroup === opt.value}
                    onClick={() => handleFilterChange('ageGroup', opt.value)}
                  />
                ))}
              </FilterRow>

              <p className="text-[10px] text-[var(--color-text-muted)] text-center pt-1">
                {t('filterHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] w-20 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-all ${
        active
          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
          : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)]'
      }`}
    >
      {label}
    </button>
  );
}
