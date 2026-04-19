'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ExtractedData } from '@/lib/data-extraction';
import { PooledResult } from '@/lib/meta-stats';
import { clog } from '@/lib/client-logger';

interface ForestPlotProps {
  studies: ExtractedData[];
  pooled: PooledResult;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function svgToPng(svgEl: SVGSVGElement, scale = 3): Promise<Blob> {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  const box = svgEl.viewBox.baseVal;
  canvas.width = box.width * scale;
  canvas.height = box.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

export default function ForestPlot({ studies, pooled }: ForestPlotProps) {
  const t = useTranslations('plots');
  const svgRef = useRef<SVGSVGElement>(null);
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
  const watermarkHeight = 24;
  const totalHeight = headerHeight + (valid.length + 2) * rowHeight + 20 + watermarkHeight;

  const xScale = (val: number) => leftMargin + ((val - scaleMin) / (scaleMax - scaleMin)) * plotWidth;
  const nullX = xScale(nullLine);

  const handleSavePng = async () => {
    if (!svgRef.current) {
      clog.warn('save_png_no_svg_ref', 'ForestPlot');
      return;
    }
    clog.info('save_png_start', 'ForestPlot', { studyCount: valid.length, scale: 3 });
    try {
      const blob = await svgToPng(svgRef.current, 3);
      downloadBlob(blob, `forest-plot-metalens.png`);
      clog.info('save_png_done', 'ForestPlot', { studyCount: valid.length, bytes: blob.size });
    } catch (err) {
      clog.error('save_png_failed', 'ForestPlot', err, { studyCount: valid.length });
    }
  };

  const handleSaveSvg = () => {
    if (!svgRef.current) {
      clog.warn('save_svg_no_svg_ref', 'ForestPlot');
      return;
    }
    clog.info('save_svg_start', 'ForestPlot', { studyCount: valid.length });
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, `forest-plot-metalens.svg`);
      clog.info('save_svg_done', 'ForestPlot', { studyCount: valid.length, bytes: blob.size });
    } catch (err) {
      clog.error('save_svg_failed', 'ForestPlot', err, { studyCount: valid.length });
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full max-w-[800px] mx-auto"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {/* White background for export */}
          <rect width={totalWidth} height={totalHeight} fill="white" />

          {/* Header */}
          <text x={10} y={25} fontSize={11} fontWeight={600} fill="#2C3E50">
            Study
          </text>
          <text x={leftMargin + plotWidth / 2} y={25} textAnchor="middle" fontSize={11} fontWeight={600} fill="#2C3E50">
            {pooled.effectType} (95% CI)
          </text>
          <text x={totalWidth - 10} y={25} textAnchor="end" fontSize={11} fontWeight={600} fill="#2C3E50">
            Weight
          </text>

          {/* Null effect line */}
          <line
            x1={nullX} y1={headerHeight}
            x2={nullX} y2={headerHeight + (valid.length + 1) * rowHeight}
            stroke="#9BA8B2" strokeWidth={1} strokeDasharray="4,3"
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
                  <rect x={0} y={y - rowHeight / 2} width={totalWidth} height={rowHeight} fill="#FAF8F5" opacity={0.5} />
                )}

                {/* Study label */}
                <text x={10} y={y + 4} fontSize={10} fill="#2C3E50">
                  {study.firstAuthor} {study.year}
                </text>

                {/* CI line */}
                <line x1={xLo} y1={y} x2={xHi} y2={y} stroke="#4DA8A0" strokeWidth={1.5} />

                {/* CI caps */}
                <line x1={xLo} y1={y - 4} x2={xLo} y2={y + 4} stroke="#4DA8A0" strokeWidth={1} />
                <line x1={xHi} y1={y - 4} x2={xHi} y2={y + 4} stroke="#4DA8A0" strokeWidth={1} />

                {/* Effect size square */}
                <rect
                  x={xEs - sqSize / 2} y={y - sqSize / 2}
                  width={sqSize} height={sqSize}
                  fill="#4DA8A0"
                />

                {/* Values text */}
                <text x={leftMargin + plotWidth + 10} y={y + 4} fontSize={9} fill="#6B7C8A" fontFamily="JetBrains Mono, monospace">
                  {es.toFixed(2)} [{lo.toFixed(2)}, {hi.toFixed(2)}]
                </text>

                {/* Weight */}
                <text x={totalWidth - 10} y={y + 4} textAnchor="end" fontSize={9} fill="#9BA8B2" fontFamily="JetBrains Mono, monospace">
                  {weightPct}%
                </text>
              </g>
            );
          })}

          {/* Separator line */}
          <line
            x1={10} y1={headerHeight + valid.length * rowHeight}
            x2={totalWidth - 10} y2={headerHeight + valid.length * rowHeight}
            stroke="#E2DDD8" strokeWidth={1}
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
                <text x={10} y={y + 4} fontSize={10} fontWeight={700} fill="#E8856C">
                  Overall (I²={pooled.iSquared}%)
                </text>

                {/* Diamond */}
                <polygon
                  points={`${xLo},${y} ${xEs},${y - dh} ${xHi},${y} ${xEs},${y + dh}`}
                  fill="#E8856C"
                  opacity={0.8}
                />

                {/* Values */}
                <text x={leftMargin + plotWidth + 10} y={y + 4} fontSize={9} fontWeight={700} fill="#E8856C" fontFamily="JetBrains Mono, monospace">
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
                  <line x1={x} y1={y - 15} x2={x} y2={y - 10} stroke="#9BA8B2" strokeWidth={0.5} />
                  <text x={x} y={y} textAnchor="middle" fontSize={8} fill="#9BA8B2">
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
                <text x={leftMargin + 10} y={y} fontSize={8} fill="#9BA8B2">
                  ← Favors control
                </text>
                <text x={leftMargin + plotWidth - 10} y={y} textAnchor="end" fontSize={8} fill="#9BA8B2">
                  Favors treatment →
                </text>
              </>
            );
          })()}

          {/* Watermark for exports */}
          <text
            x={totalWidth / 2}
            y={totalHeight - 6}
            textAnchor="middle"
            fontSize={9}
            fill="#9BA8B2"
            opacity={0.7}
          >
            Generated by MetaLens AI (metalens-ai.com) — For research use
          </text>
        </svg>
      </div>

      {/* Export buttons */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={handleSavePng}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {t('savePng')}
        </button>
        <button
          onClick={handleSaveSvg}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {t('saveSvg')}
        </button>
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
        {t('saveHint')}
      </p>

      {/* Forest Plot Interpretation */}
      <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5">
          <span>🔍</span> {t('forestInterpretTitle')}
        </h4>
        <ul className="space-y-2 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">▪</span>
            {t('forestEffect')}
          </li>
          <li className="flex items-start gap-2">
            <span className={`mt-0.5 flex-shrink-0 ${pooled.pValue < 0.05 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
              {pooled.pValue < 0.05 ? '✓' : '!'}
            </span>
            {pooled.pValue < 0.05 ? t('forestSig') : t('forestNotSig')}
            <span className="text-[var(--color-text-muted)]"> (p = {pooled.pValue < 0.001 ? '<0.001' : pooled.pValue.toFixed(3)})</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={`mt-0.5 flex-shrink-0 ${pooled.iSquared < 25 ? 'text-[var(--color-success)]' : pooled.iSquared < 75 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>▪</span>
            {pooled.iSquared < 25 ? t('forestHetLow') : pooled.iSquared < 75 ? t('forestHetMod') : t('forestHetHigh')}
            <span className="text-[var(--color-text-muted)]"> (I² = {pooled.iSquared}%)</span>
          </li>
          {((isRatio && (pooled.ciLower < 1 && pooled.ciUpper > 1)) ||
            (!isRatio && (pooled.ciLower < 0 && pooled.ciUpper > 0))) && (
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-warning)] mt-0.5 flex-shrink-0">!</span>
              {t('forestNullCrossed')}
            </li>
          )}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 p-3 bg-[var(--color-warning)]/10 rounded-xl border border-[var(--color-warning)]/30">
        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed text-center">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
