import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, GAP_FINDER_PROMPT, FREE_POINTS, TIER_CONFIG } from './constants';
import type { Tier } from './constants';

export interface SynthesisResult {
  english: string;
  translated: string | null;
  language: string;
  remaining?: number;
}

export function buildPrompt(
  articles: PubMedArticle[],
  pointCount: number = FREE_POINTS,
  mode: 'meta-analysis' | 'gap-finder' = 'meta-analysis',
  opts: { useFullText?: boolean } = {},
): string {
  const template = mode === 'gap-finder' ? GAP_FINDER_PROMPT : META_ANALYSIS_PROMPT;
  const systemPrompt = template.replace(/{pointCount}/g, String(pointCount));

  // Hybrid char budget: when full_text is mixed in we let the prompt grow,
  // but each individual paper still gets a per-entry cap so one giant PMC
  // article doesn't crowd out everything else.
  const MAX_TOTAL_CHARS = opts.useFullText ? 60000 : 30000;
  const MAX_ABSTRACT_CHARS = 1500;
  const MAX_FULLTEXT_CHARS = 4000;
  let totalChars = 0;
  const selectedArticles: typeof articles = [];

  for (const a of articles) {
    const truncatedAbstract = a.abstract.length > MAX_ABSTRACT_CHARS
      ? a.abstract.substring(0, MAX_ABSTRACT_CHARS) + '...'
      : a.abstract;
    const ftBudget = opts.useFullText && a.fullText
      ? a.fullText.slice(0, MAX_FULLTEXT_CHARS)
      : '';
    const entry = `PMID: ${a.pmid} | ${a.title} | ${a.journal} (${a.year}) | ${truncatedAbstract}${ftBudget ? ' | FULLTEXT(' + ftBudget.length + ')' : ''}`;
    if (totalChars + entry.length + ftBudget.length > MAX_TOTAL_CHARS && selectedArticles.length >= 5) break;
    totalChars += entry.length + ftBudget.length;
    selectedArticles.push({ ...a, abstract: truncatedAbstract, fullText: ftBudget || undefined });
  }

  const abstractsText = selectedArticles
    .map((a, i) => {
      const typeLabel = a.pubTypes?.length ? `[${a.pubTypes.join(', ')}]` : '';
      const sourceLabel = a.source === 'papers-db' ? '[CACHED]' : '';
      const specialtyLabel = a.specialty ? `[${a.specialty}]` : '';
      const labels = [typeLabel, sourceLabel, specialtyLabel].filter(Boolean).join(' ');
      const block = `[${i + 1}] PMID: ${a.pmid} ${labels}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract}`;
      // Inline full text after abstract only when present and useFullText is on.
      // The prompt already instructs the model to prioritize numerical data
      // from full text when available.
      if (opts.useFullText && a.fullText) {
        return `${block}\nFullText (truncated): ${a.fullText}`;
      }
      return block;
    })
    .join('\n\n---\n\n');

  return `${systemPrompt}\n\n--- ABSTRACTS ---\n\n${abstractsText}`;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Synthesis: call server API (Gemini)
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
  pointCount?: number,
  mode: 'meta-analysis' | 'gap-finder' = 'meta-analysis',
  opts: { useFullText?: boolean } = {},
): Promise<SynthesisResult> {
  const prompt = buildPrompt(articles, pointCount, mode, opts);
  let englishResult = '';
  let remaining: number | undefined;

  const synthesisResponse = await fetchWithTimeout('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  }, 55000);

  if (synthesisResponse.status === 429) {
    throw new Error('429: Daily limit reached');
  }

  if (synthesisResponse.ok) {
    const data = await synthesisResponse.json();
    if (data.result && data.result.trim()) englishResult = data.result;
    if (data.remaining !== undefined) remaining = data.remaining;
  }

  if (!englishResult) {
    throw new Error('AI synthesis failed. Please try again.');
  }

  // Translate if not English
  if (language !== 'English') {
    try {
      const translateResponse = await fetchWithTimeout('/api/translate-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: englishResult, language }),
      }, 30000);

      if (translateResponse.ok) {
        const { translated } = await translateResponse.json();
        if (translated) {
          return { english: englishResult, translated, language, remaining };
        }
      }
    } catch {
      // Translation failed — return English only
    }
  }

  return { english: englishResult, translated: null, language, remaining };
}
