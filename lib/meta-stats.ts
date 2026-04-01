import { ExtractedData } from './data-extraction';

export interface PooledResult {
  pooledEffect: number;
  ciLower: number;
  ciUpper: number;
  pValue: number;
  iSquared: number; // I² heterogeneity (0-100%)
  effectType: string;
  numStudies: number;
  totalN: number;
  interpretation: string;
}

/**
 * Inverse-variance weighted fixed-effect meta-analysis
 * Works for OR, RR, HR (log-transformed) and MD, SMD, % (direct)
 */
export function poolStudies(studies: ExtractedData[], effectType: string): PooledResult | null {
  // Filter to studies with the right effect type and valid data
  const valid = studies.filter(
    s => s.effectSize !== null && s.effectType === effectType && s.ciLower !== null && s.ciUpper !== null
  );

  if (valid.length < 2) return null;

  const isRatio = ['OR', 'RR', 'HR'].includes(effectType);

  // Calculate weights using inverse variance
  const processed = valid.map(s => {
    const es = s.effectSize!;
    const lo = s.ciLower!;
    const hi = s.ciUpper!;

    // Transform ratios to log scale
    const y = isRatio ? Math.log(es) : es;
    const lnLo = isRatio ? Math.log(Math.max(lo, 0.001)) : lo;
    const lnHi = isRatio ? Math.log(Math.max(hi, 0.001)) : hi;

    // Standard error from CI: SE = (upper - lower) / (2 * 1.96)
    const se = Math.max((lnHi - lnLo) / 3.92, 0.001);
    const variance = se * se;
    const weight = 1 / variance;

    return { y, se, variance, weight, es, lo, hi, pmid: s.pmid };
  });

  const totalWeight = processed.reduce((s, p) => s + p.weight, 0);
  if (totalWeight === 0) return null;

  // Pooled effect (weighted mean)
  const pooledY = processed.reduce((s, p) => s + p.weight * p.y, 0) / totalWeight;
  const pooledSE = Math.sqrt(1 / totalWeight);

  // Back-transform if ratio
  const pooledEffect = isRatio ? Math.exp(pooledY) : pooledY;
  const ciLower = isRatio ? Math.exp(pooledY - 1.96 * pooledSE) : pooledY - 1.96 * pooledSE;
  const ciUpper = isRatio ? Math.exp(pooledY + 1.96 * pooledSE) : pooledY + 1.96 * pooledSE;

  // P-value from Z-test
  const z = Math.abs(pooledY / pooledSE);
  const pValue = 2 * (1 - normalCDF(z));

  // Cochran's Q and I²
  const Q = processed.reduce((s, p) => s + p.weight * Math.pow(p.y - pooledY, 2), 0);
  const df = valid.length - 1;
  const iSquared = df > 0 ? Math.max(0, ((Q - df) / Q) * 100) : 0;

  const totalN = valid.reduce((s, v) => s + (v.sampleSize || 0), 0);

  // Generate interpretation
  const interpretation = generateInterpretation(pooledEffect, ciLower, ciUpper, pValue, iSquared, effectType, valid.length);

  return {
    pooledEffect: round(pooledEffect, 3),
    ciLower: round(ciLower, 3),
    ciUpper: round(ciUpper, 3),
    pValue: round(pValue, 4),
    iSquared: round(iSquared, 1),
    effectType,
    numStudies: valid.length,
    totalN,
    interpretation,
  };
}

function generateInterpretation(
  effect: number, ciLo: number, ciHi: number,
  p: number, i2: number, type: string, n: number
): string {
  const isRatio = ['OR', 'RR', 'HR'].includes(type);
  const nullValue = isRatio ? 1 : 0;
  const significant = p < 0.05;
  const direction = effect > nullValue ? 'increased' : 'decreased';

  let hetero = 'low';
  if (i2 > 75) hetero = 'high';
  else if (i2 > 50) hetero = 'moderate';
  else if (i2 > 25) hetero = 'low-to-moderate';

  const sigText = significant
    ? `The pooled ${type} of ${round(effect, 2)} (95% CI: ${round(ciLo, 2)}–${round(ciHi, 2)}) suggests a statistically significant ${direction} effect (p = ${round(p, 4)}).`
    : `The pooled ${type} of ${round(effect, 2)} (95% CI: ${round(ciLo, 2)}–${round(ciHi, 2)}) did not reach statistical significance (p = ${round(p, 4)}).`;

  return `Based on ${n} studies: ${sigText} Heterogeneity was ${hetero} (I² = ${round(i2, 1)}%).`;
}

/** Standard normal CDF approximation */
function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function round(n: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}
