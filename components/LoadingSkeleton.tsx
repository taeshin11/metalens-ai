'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function LoadingSkeleton({ stage }: { stage: 'searching' | 'synthesizing' }) {
  const t = useTranslations('results');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin" />
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium">
            {stage === 'searching' ? t('searchingPubMed') : t('synthesizing')}
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--color-bg-secondary)] rounded-lg w-full mb-2" />
              <div className="h-4 bg-[var(--color-bg-secondary)] rounded-lg w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
