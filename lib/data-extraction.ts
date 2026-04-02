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

const EXTRACTION_PROMPT = `You are a medical data extraction AI. Your job is to extract as much quantitative data as possible from each abstract.

For EACH paper, extract ONE row with these fields:
- pmid: the PMID (string)
- sampleSize: total N participants/subjects (integer or null)
- effectSize: the PRIMARY numerical result (number or null). Extract ANY of these:
  * Odds Ratio (OR), Risk Ratio (RR), Hazard Ratio (HR)
  * Mean Difference (MD), Standardized Mean Difference (SMD)
  * Percentage difference, relative risk reduction, absolute risk difference
  * If only percentages are reported (e.g., "response rate 65% vs 42%"), calculate the difference (e.g., 23) or ratio
  * If OR/RR/HR is not stated but raw event counts are given, calculate OR from them
- effectType: one of "OR", "RR", "HR", "MD", "SMD", "%", "other"
- ciLower: lower 95% CI bound (number or null). If CI is written as "1.2 (0.8-1.6)", extract 0.8
- ciUpper: upper 95% CI bound (number or null). If CI is written as "1.2 (0.8-1.6)", extract 1.6
- pValue: p-value as decimal (number or null). Convert "p<0.001" to 0.001, "p=0.04" to 0.04
- outcome: brief description of outcome (max 10 words)

IMPORTANT RULES:
1. Try HARD to extract effectSize from every paper. Most abstracts contain at least one quantitative result.
2. If the abstract reports group means (e.g., "Group A: 5.2±1.1 vs Group B: 4.8±1.3"), calculate MD = 5.2 - 4.8 = 0.4 and use effectType "MD"
3. If percentages are compared (e.g., "45% vs 32%"), use the difference (13) with effectType "%" or calculate OR
4. When CI is not explicitly stated but SD and N are available, estimate SE = SD/sqrt(N) and CI = effect ± 1.96*SE
5. ALL papers should have effectType consistent where possible — prefer ONE type across all studies
6. Only use null for effectSize if absolutely no numerical comparison exists in the abstract

Output ONLY a valid JSON array. No explanation, no markdown, no code fences. Example:
[{"pmid":"12345","sampleSize":120,"effectSize":1.5,"effectType":"OR","ciLower":1.1,"ciUpper":2.0,"pValue":0.03,"outcome":"mortality rate"}]`;

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
  let poolable = matchingCount >= 3;
  let poolType = mostCommon;

  if (!poolable) {
    const ratioTypes = withEffect.filter(d => ['OR', 'RR', 'HR'].includes(d.effectType));
    const diffTypes = withEffect.filter(d => ['MD', 'SMD', '%'].includes(d.effectType));

    if (ratioTypes.length >= 3) {
      // Normalize all ratios to the most common ratio type
      const ratioMode = mode(ratioTypes.map(d => d.effectType));
      ratioTypes.forEach(d => { d.effectType = ratioMode; });
      poolable = true;
      poolType = ratioMode;
    } else if (diffTypes.length >= 3) {
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
