import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, FREE_POINTS } from './constants';

export function buildPrompt(articles: PubMedArticle[], language: string, pointCount = FREE_POINTS): string {
  const systemPrompt = META_ANALYSIS_PROMPT
    .replace('{language}', language)
    .replace('{pointCount}', String(pointCount));

  const abstractsText = articles
    .map((a, i) => `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract}`)
    .join('\n\n---\n\n');

  return `${systemPrompt}\n\n--- ABSTRACTS ---\n\n${abstractsText}`;
}

/**
 * Synthesize using Pollinations.ai — completely free, no API key, no login.
 * https://text.pollinations.ai/
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
): Promise<string> {
  const prompt = buildPrompt(articles, language);

  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: prompt },
      ],
      model: 'openai',
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error('AI synthesis failed');
  }

  const text = await response.text();
  return text;
}
