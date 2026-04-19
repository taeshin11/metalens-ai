'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ExtractedData } from '@/lib/data-extraction';
import { PooledResult } from '@/lib/meta-stats';
import { clog } from '@/lib/client-logger';

interface FunnelPlotProps {
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

interface ValidStudy {
  pmid: string;
  firstAuthor: string;
  year: string;
  effectSize: number;
  se: number;
  precision: number;
  weight: number;
}

export default function FunnelPlot({ studies, pooled }: FunnelPlotProps) {
  const t = useTranslations('plots');
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter to studies with valid effectSize AND (CI or weight > 0)
  const valid: ValidStudy[] = studies
    .filter(s => {
      if (s.effectSize === null) return false;
      const hasCI = s.ciLower !== null && s.ciUpper !== null;
      const hasWeight = s.weight > 0;
      return hasCI || hasWeight;
    })
    .map(s => {
      const effectSize = s.effectSize!;
      // Calculate SE from CI when possible: SE = (ciUpper - ciLower) / 3.92
      let se: number;
      if (s.ciLower !== null && s.ciUpper !== null) {
        se = (s.ciUpper - s.ciLower) / 3.92;
      } else {
        // Use weight as proxy: higher weight => lower SE
        // Approximate: SE ~ 1 / sqrt(weight)
        se = s.weight > 0 ? 1 / Math.sqrt(s.weight) : 1;
      }
      // Avoid zero/negative SE
      if (se <= 0) se = 0.001;
      const precision = 1 / se;
      return {
        pmid: s.pmid,
        firstAuthor: s.firstAuthor,
        year: s.year,
        effectSize,
        se,
        precision,
        weight: s.weight,
      };
    });

  if (valid.length === 0) return null;

  // SVG layout
  const margin = { top: 50, right: 40, bottom: 80, left: 70 };
  const plotWidth = 420;
  const plotHeight = 340;
  const totalWidth = margin.left + plotWidth + margin.right;
  const watermarkHeight = 24;
  const interpretHeight = 50;
  const totalHeight = margin.top + plotHeight + margin.bottom + watermarkHeight + interpretHeight;

  // Data ranges
  const allEffects = valid.map(s => s.effectSize);
  const allSE = valid.map(s => s.se);
  const maxSE = Math.max(...allSE);
  const minSE = 0; // top of plot = SE of 0 (most precise)

  // X-axis: effect size range — include pooled effect, study effects, and funnel bounds
  const funnelHalfWidth = 1.96 * maxSE;
  const effectMin = Math.min(...allEffects, pooled.pooledEffect - funnelHalfWidth);
  const effectMax = Math.max(...allEffects, pooled.pooledEffect + funnelHalfWidth);
  const effectPadding = (effectMax - effectMin) * 0.1;
  const xMin = effectMin - effectPadding;
  const xMax = effectMax + effectPadding;

  // Y-axis: SE from 0 (top) to maxSE * 1.1 (bottom) — inverted so precise studies at top
  const yMaxSE = maxSE * 1.15;

  // Scale functions
  const xScale = (val: number) => margin.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
  const yScale = (se: number) => margin.top + (se / yMaxSE) * plotHeight;

  // Funnel triangle vertices (95% CI bounds around pooled effect)
  // At SE=0 (top), the funnel converges to the pooled effect
  // At SE=yMaxSE (bottom), the funnel spans pooledEffect +/- 1.96 * yMaxSE
  const funnelTopX = xScale(pooled.pooledEffect);
  const funnelTopY = yScale(0);
  const funnelBottomLeftX = xScale(pooled.pooledEffect - 1.96 * yMaxSE);
  const funnelBottomRightX = xScale(pooled.pooledEffect + 1.96 * yMaxSE);
  const funnelBottomY = yScale(yMaxSE);

  // Assess asymmetry: compare mean effect of studies in left vs right of pooled effect
  const leftStudies = valid.filter(s => s.effectSize < pooled.pooledEffect);
  const rightStudies = valid.filter(s => s.effectSize >= pooled.pooledEffect);
  // Simple heuristic: check if small studies (high SE) cluster on one side
  const smallStudies = valid.filter(s => s.se > maxSE * 0.5);
  const smallLeft = smallStudies.filter(s => s.effectSize < pooled.pooledEffect).length;
  const smallRight = smallStudies.filter(s => s.effectSize >= pooled.pooledEffect).length;
  const totalSmall = smallStudies.length;
  const isAsymmetric = totalSmall >= 2 && Math.abs(smallLeft - smallRight) / totalSmall > 0.5;

  // Also check overall balance
  const overallAsymmetric = valid.length >= 3 && (
    isAsymmetric ||
    (leftStudies.length === 0 || rightStudies.length === 0) ||
    Math.abs(leftStudies.length - rightStudies.length) / valid.length > 0.6
  );

  const interpretationText = overallAsymmetric
    ? t('funnelInterpretAsymShort')
    : t('funnelInterpretSymShort');

  // X-axis ticks
  const xTickCount = 7;
  const xStep = (xMax - xMin) / (xTickCount - 1);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => xMin + i * xStep);

  // Y-axis ticks (SE values)
  const yTickCount = 5;
  const yStep = yMaxSE / (yTickCount - 1);
  const yTicks = Array.from({ length: yTickCount }, (_, i) => i * yStep);

  const handleSavePng = async () => {
    if (!svgRef.current) {
      clog.warn('save_png_no_svg_ref', 'FunnelPlot');
      return;
    }
    clog.info('save_png_start', 'FunnelPlot', { studyCount: valid.length, asymmetric: overallAsymmetric });
    try {
      const blob = await svgToPng(svgRef.current, 3);
      downloadBlob(blob, 'funnel-plot-metalens.png');
      clog.info('save_png_done', 'FunnelPlot', { studyCount: valid.length, bytes: blob.size });
    } catch (err) {
      clog.error('save_png_failed', 'FunnelPlot', err, { studyCount: valid.length });
    }
  };

  const handleSaveSvg = () => {
    if (!svgRef.current) {
      clog.warn('save_svg_no_svg_ref', 'FunnelPlot');
      return;
    }
    clog.info('save_svg_start', 'FunnelPlot', { studyCount: valid.length });
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, 'funnel-plot-metalens.svg');
      clog.info('save_svg_done', 'FunnelPlot', { studyCount: valid.length, bytes: blob.size });
    } catch (err) {
      clog.error('save_svg_failed', 'FunnelPlot', err, { studyCount: valid.length });
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full max-w-[600px] mx-auto"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {/* White background for export */}
          <rect width={totalWidth} height={totalHeight} fill="white" />

          {/* Title */}
          <text
            x={totalWidth / 2}
            y={28}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill="#2C3E50"
          >
            Funnel Plot — {pooled.effectType} ({pooled.numStudies} studies)
          </text>

          {/* Plot area background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="#FAF8F5"
            stroke="#E2DDD8"
            strokeWidth={1}
          />

          {/* Funnel triangle (95% CI region) */}
          <polygon
            points={`${funnelTopX},${funnelTopY} ${funnelBottomLeftX},${funnelBottomY} ${funnelBottomRightX},${funnelBottomY}`}
            fill="#4DA8A0"
            opacity={0.08}
            stroke="#4DA8A0"
            strokeWidth={1}
            strokeDasharray="4,3"
            strokeOpacity={0.4}
          />

          {/* Pooled effect vertical dashed line */}
          <line
            x1={xScale(pooled.pooledEffect)}
            y1={margin.top}
            x2={xScale(pooled.pooledEffect)}
            y2={margin.top + plotHeight}
            stroke="#E8856C"
            strokeWidth={1.5}
            strokeDasharray="6,4"
          />

          {/* Study dots */}
          {valid.map((study, i) => {
            const cx = xScale(study.effectSize);
            const cy = yScale(study.se);
            // Clamp to plot area
            const clampedCx = Math.max(margin.left, Math.min(margin.left + plotWidth, cx));
            const clampedCy = Math.max(margin.top, Math.min(margin.top + plotHeight, cy));

            return (
              <g key={`${study.pmid}-${i}`}>
                <circle
                  cx={clampedCx}
                  cy={clampedCy}
                  r={5}
                  fill="#4DA8A0"
                  stroke="white"
                  strokeWidth={1.5}
                  opacity={0.85}
                />
                {/* Tooltip-like label on hover (shown as title) */}
                <title>
                  {study.firstAuthor} {study.year} — {pooled.effectType}: {study.effectSize.toFixed(2)}, SE: {study.se.toFixed(3)}
                </title>
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="#E2DDD8"
            strokeWidth={1}
          />
          {xTicks.map((val, i) => {
            const x = xScale(val);
            if (x < margin.left || x > margin.left + plotWidth) return null;
            return (
              <g key={`xtick-${i}`}>
                <line
                  x1={x}
                  y1={margin.top + plotHeight}
                  x2={x}
                  y2={margin.top + plotHeight + 5}
                  stroke="#9BA8B2"
                  strokeWidth={0.5}
                />
                <text
                  x={x}
                  y={margin.top + plotHeight + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9BA8B2"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}
          {/* X-axis label */}
          <text
            x={margin.left + plotWidth / 2}
            y={margin.top + plotHeight + 34}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#2C3E50"
          >
            Effect Size ({pooled.effectType})
          </text>

          {/* Y-axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="#E2DDD8"
            strokeWidth={1}
          />
          {yTicks.map((se, i) => {
            const y = yScale(se);
            return (
              <g key={`ytick-${i}`}>
                <line
                  x1={margin.left - 5}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke="#9BA8B2"
                  strokeWidth={0.5}
                />
                {/* Gridline */}
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="#E2DDD8"
                  strokeWidth={0.5}
                  strokeDasharray="2,4"
                  opacity={0.5}
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="#9BA8B2"
                >
                  {se.toFixed(2)}
                </text>
              </g>
            );
          })}
          {/* Y-axis label (rotated) */}
          <text
            x={16}
            y={margin.top + plotHeight / 2}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#2C3E50"
            transform={`rotate(-90, 16, ${margin.top + plotHeight / 2})`}
          >
            Standard Error
          </text>

          {/* Pooled effect label */}
          <text
            x={xScale(pooled.pooledEffect)}
            y={margin.top - 8}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            fill="#E8856C"
          >
            Pooled {pooled.effectType} = {pooled.pooledEffect.toFixed(2)}
          </text>

          {/* Legend */}
          <circle cx={margin.left + plotWidth - 120} cy={margin.top + 18} r={4} fill="#4DA8A0" stroke="white" strokeWidth={1} />
          <text x={margin.left + plotWidth - 112} y={margin.top + 22} fontSize={9} fill="#2C3E50">
            Individual study
          </text>
          <line
            x1={margin.left + plotWidth - 124}
            y1={margin.top + 34}
            x2={margin.left + plotWidth - 116}
            y2={margin.top + 34}
            stroke="#E8856C"
            strokeWidth={1.5}
            strokeDasharray="4,2"
          />
          <text x={margin.left + plotWidth - 112} y={margin.top + 38} fontSize={9} fill="#2C3E50">
            Pooled effect
          </text>

          {/* Interpretation text */}
          <text
            x={totalWidth / 2}
            y={margin.top + plotHeight + 58}
            textAnchor="middle"
            fontSize={10}
            fill={overallAsymmetric ? '#E8856C' : '#4DA8A0'}
            fontWeight={600}
          >
            {overallAsymmetric ? '\u26A0 ' : '\u2713 '}
            {interpretationText}
          </text>

          {/* Watermark */}
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

      {/* Funnel Plot Interpretation */}
      <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5">
          <span>🔍</span> {t('funnelInterpretTitle')}
        </h4>
        <ul className="space-y-2 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">▪</span>
            {t('funnelExplain')}
          </li>
          <li className="flex items-start gap-2">
            <span className={`mt-0.5 flex-shrink-0 ${overallAsymmetric ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
              {overallAsymmetric ? '!' : '✓'}
            </span>
            {overallAsymmetric ? t('funnelAsymmetric') : t('funnelSymmetric')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-text-muted)] mt-0.5 flex-shrink-0">▪</span>
            {t('funnelCaution')}
          </li>
        </ul>
      </div>
    </div>
  );
}
