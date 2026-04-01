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

const EXTRACTION_PROMPT = `You are a medical data extraction AI. Extract numerical data from each PubMed abstract.

For EACH paper, extract ONE row with these fields (use null if not found):
- pmid: the PMID
- sampleSize: total number of participants/subjects (integer)
- effectSize: the PRIMARY effect size (number) — prefer OR, RR, HR, MD, or percentage difference
- effectType: type of effect size — one of: "OR", "RR", "HR", "MD", "SMD", "%", "other"
- ciLower: lower bound of 95% confidence interval (number)
- ciUpper: upper bound of 95% confidence interval (number)
- pValue: p-value (number, e.g. 0.04)
- outcome: brief description of the measured outcome (max 10 words)

Output ONLY a valid JSON array. No explanation, no markdown. Example:
[{"pmid":"12345","sampleSize":120,"effectSize":1.5,"effectType":"OR","ciLower":1.1,"ciUpper":2.0,"pValue":0.03,"outcome":"mortality rate"}]

If a paper has NO extractable numerical data, include it with null values.`;

export async function extractDataFromArticles(
  articles: PubMedArticle[],
): Promise<ExtractionResult> {
  const abstractsText = articles
    .slice(0, 15)
    .map((a, i) => `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nAbstract: ${a.abstract.slice(0, 1200)}`)
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
  const withEffect = data.filter(d => d.effectSize !== null);
  const effectTypes = withEffect.map(d => d.effectType);
  const mostCommon = mode(effectTypes);
  const poolable = withEffect.filter(d => d.effectType === mostCommon).length >= 3;

  return {
    data,
    poolable,
    commonEffectType: poolable ? mostCommon : null,
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
