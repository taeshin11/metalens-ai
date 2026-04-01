'use client';

import { ExtractedData } from '@/lib/data-extraction';
import { PooledResult } from '@/lib/meta-stats';

interface ForestPlotProps {
  studies: ExtractedData[];
  pooled: PooledResult;
}

export default function ForestPlot({ studies, pooled }: ForestPlotProps) {
  const isRatio = ['OR', 'RR', 'HR'].includes(pooled.effectType);
  const nullLine = isRatio ? 1 : 0;

  // Filter to valid studies
  const valid = studies.filter(
    s => s.effectSize !== null && s.ciLower !== null && s.ciUpper !== null && s.effectType === pooled.effectType
  );

  if (valid.length === 0) return null;

  // Calculate scale
  const allValues = [
    ...valid.flatMap(s => [s.ciLower!, s.ciUpper!, s.effectSize!]),
    pooled.ciLower, pooled.ciUpper, pooled.pooledEffect, nullLine,
  ];
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.15;
  const scaleMin = dataMin - padding;
  const scaleMax = dataMax + padding;

  // SVG dimensions
  const leftMargin = 160;
  const rightMargin = 140;
  const plotWidth = 400;
  const totalWidth = leftMargin + plotWidth + rightMargin;
  const rowHeight = 32;
  const headerHeight = 40;
  const totalHeight = headerHeight + (valid.length + 2) * rowHeight + 20;

  const xScale = (val: number) => leftMargin + ((val - scaleMin) / (scaleMax - scaleMin)) * plotWidth;
  const nullX = xScale(nullLine);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full max-w-[800px] mx-auto"
        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {/* Header */}
        <text x={10} y={25} className="text-[11px] font-semibold" fill="var(--color-text-primary)">
          Study
        </text>
        <text x={leftMargin + plotWidth / 2} y={25} textAnchor="middle" className="text-[11px] font-semibold" fill="var(--color-text-primary)">
          {pooled.effectType} (95% CI)
        </text>
        <text x={totalWidth - 10} y={25} textAnchor="end" className="text-[11px] font-semibold" fill="var(--color-text-primary)">
          Weight
        </text>

        {/* Null effect line */}
        <line
          x1={nullX} y1={headerHeight}
          x2={nullX} y2={headerHeight + (valid.length + 1) * rowHeight}
          stroke="var(--color-text-muted)" strokeWidth={1} strokeDasharray="4,3"
        />

        {/* Individual studies */}
        {valid.map((study, i) => {
          const y = headerHeight + (i + 0.5) * rowHeight;
          const es = study.effectSize!;
          const lo = study.ciLower!;
          const hi = study.ciUpper!;
          const xEs = xScale(es);
          const xLo = xScale(Math.max(lo, scaleMin));
          const xHi = xScale(Math.min(hi, scaleMax));

          // Square size proportional to weight
          const maxWeight = Math.max(...valid.map(s => s.weight));
          const relWeight = study.weight / maxWeight;
          const sqSize = 4 + relWeight * 8;
          const weightPct = ((study.weight / valid.reduce((s, v) => s + v.weight, 0)) * 100).toFixed(1);

          return (
            <g key={study.pmid}>
              {/* Row background */}
              {i % 2 === 0 && (
                <rect x={0} y={y - rowHeight / 2} width={totalWidth} height={rowHeight} fill="var(--color-bg-primary)" opacity={0.5} />
              )}

              {/* Study label */}
              <text x={10} y={y + 4} className="text-[10px]" fill="var(--color-text-primary)">
                {study.firstAuthor} {study.year}
              </text>

              {/* CI line */}
              <line x1={xLo} y1={y} x2={xHi} y2={y} stroke="var(--color-primary)" strokeWidth={1.5} />

              {/* CI caps */}
              <line x1={xLo} y1={y - 4} x2={xLo} y2={y + 4} stroke="var(--color-primary)" strokeWidth={1} />
              <line x1={xHi} y1={y - 4} x2={xHi} y2={y + 4} stroke="var(--color-primary)" strokeWidth={1} />

              {/* Effect size square */}
              <rect
                x={xEs - sqSize / 2} y={y - sqSize / 2}
                width={sqSize} height={sqSize}
                fill="var(--color-primary)"
              />

              {/* Values text */}
              <text x={leftMargin + plotWidth + 10} y={y + 4} className="text-[9px]" fill="var(--color-text-secondary)" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {es.toFixed(2)} [{lo.toFixed(2)}, {hi.toFixed(2)}]
              </text>

              {/* Weight */}
              <text x={totalWidth - 10} y={y + 4} textAnchor="end" className="text-[9px]" fill="var(--color-text-muted)" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {weightPct}%
              </text>
            </g>
          );
        })}

        {/* Separator line */}
        <line
          x1={10} y1={headerHeight + valid.length * rowHeight}
          x2={totalWidth - 10} y2={headerHeight + valid.length * rowHeight}
          stroke="var(--color-border)" strokeWidth={1}
        />

        {/* Pooled result (diamond) */}
        {(() => {
          const y = headerHeight + (valid.length + 0.5) * rowHeight;
          const xEs = xScale(pooled.pooledEffect);
          const xLo = xScale(pooled.ciLower);
          const xHi = xScale(pooled.ciUpper);
          const dh = 8;

          return (
            <g>
              <text x={10} y={y + 4} className="text-[10px] font-bold" fill="var(--color-accent)">
                Overall (I²={pooled.iSquared}%)
              </text>

              {/* Diamond */}
              <polygon
                points={`${xLo},${y} ${xEs},${y - dh} ${xHi},${y} ${xEs},${y + dh}`}
                fill="var(--color-accent)"
                opacity={0.8}
              />

              {/* Values */}
              <text x={leftMargin + plotWidth + 10} y={y + 4} className="text-[9px] font-bold" fill="var(--color-accent)" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {pooled.pooledEffect.toFixed(2)} [{pooled.ciLower.toFixed(2)}, {pooled.ciUpper.toFixed(2)}]
              </text>
            </g>
          );
        })()}

        {/* X-axis labels */}
        {(() => {
          const y = headerHeight + (valid.length + 1.8) * rowHeight;
          const ticks = 5;
          const step = (scaleMax - scaleMin) / (ticks - 1);
          return Array.from({ length: ticks }, (_, i) => {
            const val = scaleMin + i * step;
            const x = xScale(val);
            return (
              <g key={i}>
                <line x1={x} y1={y - 15} x2={x} y2={y - 10} stroke="var(--color-text-muted)" strokeWidth={0.5} />
                <text x={x} y={y} textAnchor="middle" className="text-[8px]" fill="var(--color-text-muted)">
                  {val.toFixed(2)}
                </text>
              </g>
            );
          });
        })()}

        {/* Favors labels */}
        {(() => {
          const y = headerHeight + (valid.length + 1.8) * rowHeight + 14;
          return (
            <>
              <text x={leftMargin + 10} y={y} className="text-[8px]" fill="var(--color-text-muted)">
                ← Favors control
              </text>
              <text x={leftMargin + plotWidth - 10} y={y} textAnchor="end" className="text-[8px]" fill="var(--color-text-muted)">
                Favors treatment →
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}
