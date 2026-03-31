import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, FREE_POINTS } from './constants';

export function buildPrompt(articles: PubMedArticle[], language: string, pointCount = FREE_POINTS): string {
  const systemPrompt = META_ANALYSIS_PROMPT
    .replace('{language}', language)
    .replace('{pointCount}', String(pointCount));

  // Limit abstracts to ~8000 chars total to stay within Pollinations token limits
  const MAX_TOTAL_CHARS = 8000;
  const MAX_ABSTRACT_CHARS = 600;
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

/**
 * Synthesize via our server-side API route (which calls Pollinations.ai).
 * This avoids CORS issues from client-side calls.
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
): Promise<string> {
  const prompt = buildPrompt(articles, language);

  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('AI synthesis failed');
  }

  const data = await response.json();
  return data.result;
}
