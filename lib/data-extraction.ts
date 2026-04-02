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

const EXTRACTION_PROMPT = `Extract numerical data from each PubMed abstract. Return a JSON array.

For EACH paper, extract:
- pmid (string)
- sampleSize (integer or null): total N, patients, participants, subjects, cases
- effectSize (number or null): the MAIN quantitative result
- effectType: USE "MD" (mean difference) as the DEFAULT type for ALL studies. Only use "OR"/"RR"/"HR" if explicitly stated in the abstract. This ensures consistency across studies for meta-analysis pooling.
- ciLower (number or null): lower 95% CI
- ciUpper (number or null): upper 95% CI
- pValue (number or null): "p<0.001"→0.001, "p=0.04"→0.04, "significant"→0.05, "NS"→0.5
- outcome (string): what was measured, max 10 words

HOW TO EXTRACT effectSize:
1. If MD/SMD is stated: use it directly
2. If means are given (e.g., "HbA1c 7.2% vs 7.8%"): calculate MD = 7.2 - 7.8 = -0.6
3. If percentages are compared (e.g., "45% vs 32%"): calculate MD = 45 - 32 = 13
4. If OR/RR/HR is explicitly stated: use it with that effectType
5. If change from baseline is given (e.g., "-1.2% vs -0.8%"): calculate MD = -1.2 - (-0.8) = -0.4
6. If only one group's result is stated: use it as effectSize with effectType "other"

CRITICAL RULES:
- Do NOT return all nulls — every abstract has SOME numbers
- Use "MD" as effectType whenever you calculate a difference between two values
- At minimum extract sampleSize and pValue even if effectSize is unclear
- Use CONSISTENT effectType across all studies (prefer "MD" for everything unless OR/RR/HR is explicit)

Output ONLY valid JSON array. No markdown, no explanation.
[{"pmid":"12345","sampleSize":120,"effectSize":-0.6,"effectType":"MD","ciLower":-1.1,"ciUpper":-0.1,"pValue":0.03,"outcome":"HbA1c reduction"}]`;

export async function extractDataFromArticles(
  articles: PubMedArticle[],
): Promise<ExtractionResult> {
  const abstractsText = articles
    .slice(0, 30)
    .map((a, i) => `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nAbstract: ${a.abstract.slice(0, 1000)}`)
    .join('\n\n---\n\n');

  const prompt = `${EXTRACTION_PROMPT}\n\n--- ABSTRACTS ---\n\n${abstractsText}`;

  // Call server-side synthesis API
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Data extraction failed');
  }

  const { result } = await response.json();

  // Parse JSON from AI response
  const rawData = parseJsonFromAI(result);

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

  // Determine if poolable (need 3+ studies with same effect type and effect sizes)
  const withEffect = data.filter(d => d.effectSize !== null && d.effectType !== 'other');
  const effectTypes = withEffect.map(d => d.effectType);
  const mostCommon = mode(effectTypes);
  const matchingCount = withEffect.filter(d => d.effectType === mostCommon).length;

  // If not enough matching types, try grouping compatible types
  // OR/RR/HR are all ratio-based and can be loosely compared
  let poolable = matchingCount >= 2;
  let poolType = mostCommon;

  if (!poolable) {
    const ratioTypes = withEffect.filter(d => ['OR', 'RR', 'HR'].includes(d.effectType));
    const diffTypes = withEffect.filter(d => ['MD', 'SMD', '%'].includes(d.effectType));

    if (ratioTypes.length >= 2) {
      // Normalize all ratios to the most common ratio type
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

  return {
    data,
    poolable,
    commonEffectType: poolable ? poolType : null,
  };
}

function parseJsonFromAI(text: string): Record<string, unknown>[] {
  // Try to find JSON array in the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Try fixing common JSON issues
      try {
        const fixed = jsonMatch[0]
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}')
          .replace(/'/g, '"');
        const parsed = JSON.parse(fixed);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* give up */ }
    }
  }
  return [];
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
