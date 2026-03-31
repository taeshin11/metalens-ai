'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LoadingSkeleton({ stage }: { stage: 'searching' | 'synthesizing' }) {
  const t = useTranslations('results');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset timer when stage changes
  useEffect(() => {
    setElapsed(0);
  }, [stage]);

  const steps = [
    { key: 'searching', label: t('searchingPubMed') },
    { key: 'synthesizing', label: t('synthesizing') },
  ];

  const tips = [
    t('tipLargeQuery'),
    t('tipAISynthesis'),
    t('tipAlmostDone'),
  ];

  const tipIndex = Math.min(Math.floor(elapsed / 8), tips.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((step, i) => {
            const isActive = step.key === stage;
            const isDone = steps.findIndex((s) => s.key === stage) > i;
            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-[var(--color-success)] text-white'
                    : isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-sm truncate ${
                  isActive ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'
                }`}>
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${
                    isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-bg-secondary)]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Animated spinner + message */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-5 h-5 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium">
            {stage === 'searching' ? t('searchingPubMed') : t('synthesizing')}
          </p>
          <span className="ml-auto text-xs text-[var(--color-text-muted)] tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {elapsed}s
          </span>
        </div>

        {/* Skeleton lines */}
        <div className="space-y-4 mb-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--color-bg-secondary)] rounded-lg w-full mb-2" />
              <div className="h-4 bg-[var(--color-bg-secondary)] rounded-lg" style={{ width: `${85 - i * 10}%` }} />
            </div>
          ))}
        </div>

        {/* Helpful tip that rotates */}
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--color-text-muted)] text-center border-t border-[var(--color-border)] pt-4"
        >
          {tips[tipIndex]}
        </motion.p>
      </div>
    </motion.div>
  );
}
