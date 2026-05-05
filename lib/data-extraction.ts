import { PubMedArticle } from './pubmed';

export interface ExtractedData {
  pmid: string;
  firstAuthor: string;
  year: string;
  sampleSize: number | null;
  effectSize: number | null;
  effectType: string; // 'OR' | 'RR' | 'MD' | 'SMD' | 'HR' | '%' | 'other'
  ciLower: number | null;
  ciUpper: number | null;
  pValue: number | null;
  outcome: string;
  weight: number; // for forest plot, based on sample size
}

export interface ExtractionResult {
  data: ExtractedData[];
  poolable: boolean; // whether data can be statistically pooled
  commonEffectType: string | null;
}

export async function extractDataFromArticles(
  articles: PubMedArticle[],
): Promise<ExtractionResult> {
  const t0 = performance.now();
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articles: articles.map(a => ({
        pmid: a.pmid,
        title: a.title,
        abstract: a.abstract,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    console.error(JSON.stringify({
      ts: new Date().toISOString(), level: 'error', route: 'lib/data-extraction',
      msg: 'extract_api_failed', status: response.status, error: err.error,
      articleCount: articles.length,
    }));
    throw new Error(err.error || 'Data extraction failed');
  }

  const { data: rawData } = await response.json();

  // Enrich with article metadata
  const data: ExtractedData[] = rawData.map((row: Record<string, unknown>) => {
    const article = articles.find(a => a.pmid === String(row.pmid));
    const sampleSize = typeof row.sampleSize === 'number' ? row.sampleSize : null;
    return {
      pmid: String(row.pmid || ''),
      firstAuthor: article ? (article.authors[0]?.split(' ')[0] || 'Unknown') : 'Unknown',
      year: article?.year || '',
      sampleSize,
      effectSize: typeof row.effectSize === 'number' ? row.effectSize : null,
      effectType: String(row.effectType || 'other'),
      ciLower: typeof row.ciLower === 'number' ? row.ciLower : null,
      ciUpper: typeof row.ciUpper === 'number' ? row.ciUpper : null,
      pValue: typeof row.pValue === 'number' ? row.pValue : null,
      outcome: String(row.outcome || ''),
      weight: sampleSize ? Math.sqrt(sampleSize) : 1,
    };
  });

  // Determine if poolable (need 2+ studies with same effect type and effect sizes)
  const withEffect = data.filter(d => d.effectSize !== null && d.effectType !== 'other');
  const effectTypes = withEffect.map(d => d.effectType);
  const mostCommon = mode(effectTypes);
  const matchingCount = withEffect.filter(d => d.effectType === mostCommon).length;

  let poolable = matchingCount >= 2;
  let poolType = mostCommon;

  if (!poolable) {
    const ratioTypes = withEffect.filter(d => ['OR', 'RR', 'HR'].includes(d.effectType));
    const diffTypes = withEffect.filter(d => ['MD', 'SMD', '%'].includes(d.effectType));

    if (ratioTypes.length >= 2) {
      const ratioMode = mode(ratioTypes.map(d => d.effectType));
      ratioTypes.forEach(d => { d.effectType = ratioMode; });
      poolable = true;
      poolType = ratioMode;
    } else if (diffTypes.length >= 2) {
      const diffMode = mode(diffTypes.map(d => d.effectType));
      diffTypes.forEach(d => { d.effectType = diffMode; });
      poolable = true;
      poolType = diffMode;
    }
  }

  const ms = Math.round(performance.now() - t0);
  console.log(JSON.stringify({
    ts: new Date().toISOString(), level: 'info', route: 'lib/data-extraction',
    msg: 'extraction_complete', ms, articleCount: articles.length,
    extractedCount: data.length, poolable, commonEffectType: poolable ? poolType : null,
    withEffectCount: withEffect.length, nullEffectCount: data.filter(d => d.effectSize === null).length,
  }));

  return {
    data,
    poolable,
    commonEffectType: poolable ? poolType : null,
  };
}

function mode(arr: string[]): string {
  const counts: Record<string, number> = {};
  for (const v of arr) counts[v] = (counts[v] || 0) + 1;
  let max = 0, result = '';
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) { max = v; result = k; }
  }
  return result;
}
