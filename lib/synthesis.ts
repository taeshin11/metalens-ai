import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, FREE_POINTS } from './constants';

export interface SynthesisResult {
  english: string;
  translated: string | null;
  language: string;
}

export function buildPrompt(articles: PubMedArticle[], pointCount = FREE_POINTS): string {
  const systemPrompt = META_ANALYSIS_PROMPT
    .replace(/{pointCount}/g, String(pointCount));

  const MAX_TOTAL_CHARS = 2000;
  const MAX_ABSTRACT_CHARS = 200;
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
 * Client-side fallback: call Pollinations GET API directly from browser
 * GET endpoint avoids 301 redirect issues that POST has in browsers
 */
async function callPollinationsClient(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 100000);
    const url = `https://text.pollinations.ai/${encoded}?model=openai&seed=${seed}`;

    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let text = await response.text();

    // Strip Pollinations ads
    text = text.replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '');
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Hybrid synthesis: try server (Gemini) first, fall back to client-side Pollinations
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
): Promise<SynthesisResult> {
  const prompt = buildPrompt(articles);
  let englishResult = '';

  // Strategy 1: Server-side (Gemini → Pollinations fallback)
  try {
    const synthesisResponse = await fetchWithTimeout('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }, 55000);

    if (synthesisResponse.ok) {
      const { result } = await synthesisResponse.json();
      if (result && result.trim()) englishResult = result;
    }
  } catch {
    // Server failed or timed out — fall through to client-side
  }

  // Strategy 2: Client-side Pollinations (direct from browser, no CORS issue)
  if (!englishResult) {
    try {
      const result = await callPollinationsClient(prompt);
      if (result && result.trim().length > 50) {
        englishResult = result;
      }
    } catch {
      // openai model failed
    }
  }

  if (!englishResult) {
    throw new Error('AI synthesis failed after all attempts');
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
          return { english: englishResult, translated, language };
        }
      }
    } catch {
      // Translation failed — try client-side
    }

    // Client-side translation fallback
    try {
      const translatePrompt = `Translate the following medical analysis into ${language}. Keep the numbered format and all PMID references. Output ONLY the translation:\n\n${englishResult}`;
      const translated = await callPollinationsClient(translatePrompt);
      if (translated && translated.trim().length > 50) {
        return { english: englishResult, translated, language };
      }
    } catch {
      // Return English only
    }
  }

  return { english: englishResult, translated: null, language };
}
