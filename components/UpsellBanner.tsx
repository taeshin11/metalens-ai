'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tier } from '@/lib/constants';

interface UpsellBannerProps {
  tier: Tier;
  paperCount: number;
}

export default function UpsellBanner({ tier, paperCount }: UpsellBannerProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [dismissed, setDismissed] = useState(false);

  // TEMP: Hidden during beta (until payments are set up)
  return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="bg-gradient-to-r from-[var(--color-primary)]/5 via-white to-[var(--color-accent)]/5 rounded-2xl p-5 border border-[var(--color-primary)]/20 relative"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-secondary)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Left: What you're missing */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              You analyzed {paperCount} papers. Here&apos;s what Pro would add:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MiniFeature
                icon="📊"
                title="Data Table"
                desc="Extract numbers from each paper"
                tier="Pro"
              />
              <MiniFeature
                icon="🔬"
                title="Meta-Analysis"
                desc="Pool data into new statistics"
                tier="Ultra"
              />
              <MiniFeature
                icon="🌲"
                title="Forest Plot"
                desc="Visualize combined results"
                tier="Ultra"
              />
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex-shrink-0 text-center sm:text-right">
            <a
              href={`/${locale}/pricing`}
              className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              See Plans
            </a>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">From $2.99/mo</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MiniFeature({ icon, title, desc, tier }: { icon: string; title: string; desc: string; tier: string }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
      <span className="text-base">{icon}</span>
      <div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{title}</span>
          <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
            tier === 'Pro' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]' : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          }`}>{tier}</span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">{desc}</p>
      </div>
    </div>
  );
}
