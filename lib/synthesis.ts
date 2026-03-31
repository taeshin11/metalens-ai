import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, FREE_POINTS } from './constants';

export function buildPrompt(articles: PubMedArticle[], pointCount = FREE_POINTS): string {
  const systemPrompt = META_ANALYSIS_PROMPT
    .replace(/{pointCount}/g, String(pointCount));

  // Keep prompt small for fast Pollinations responses (~10s vs timeout at >25s)
  const MAX_TOTAL_CHARS = 4000;
  const MAX_ABSTRACT_CHARS = 300;
  let totalChars = 0;
  const selectedArticles: typeof articles = [];

  for (const a of articles) {
    const truncatedAbstract = a.abstract.length > MAX_ABSTRACT_CHARS
      ? a.abstract.substring(0, MAX_ABSTRACT_CHARS) + '...'
      : a.abstract;
    const entry = `PMID: ${a.pmid} | ${a.title} | ${a.journal} (${a.year}) | ${truncatedAbstract}`;
    if (totalChars + entry.length > MAX_TOTAL_CHARS && selectedArticles.length >= 5) break;
    totalChars += entry.length;
    selectedArticles.push({ ...a, abstract: truncatedAbstract });
  }

  const abstractsText = selectedArticles
    .map((a, i) => `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract}`)
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
 * Step 1: Synthesize in English (best quality)
 * Step 2: If language is not English, translate the result
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
): Promise<string> {
  // Step 1: Always analyze in English for best quality
  const prompt = buildPrompt(articles);

  const synthesisResponse = await fetchWithTimeout('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  }, 45000);

  if (!synthesisResponse.ok) {
    throw new Error('AI synthesis failed');
  }

  const { result: englishResult } = await synthesisResponse.json();

  // Step 2: Translate if not English
  if (language !== 'English' && englishResult) {
    try {
      const translateResponse = await fetchWithTimeout('/api/translate-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: englishResult, language }),
      }, 45000);

      if (translateResponse.ok) {
        const { translated } = await translateResponse.json();
        if (translated) return translated;
      }
    } catch {
      // Translation failed — return English result as fallback
    }
  }

  return englishResult;
}
