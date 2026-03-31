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

  const MAX_TOTAL_CHARS = 3000;
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

const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';

/**
 * Client-side fallback: call Pollinations directly from browser
 */
async function callPollinationsClient(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_MSG },
          { role: 'user', content: prompt },
        ],
        model: 'openai',
        temperature: 0.2,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.text();

    // Clean: strip JSON wrapper if present
    let text = raw;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.content === 'string') text = parsed.content;
      else if (parsed?.choices?.[0]?.message?.content) text = parsed.choices[0].message.content;
    } catch { /* not JSON */ }

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

  // Strategy 1: Server-side Gemini API (fast, 10s timeout — skip if slow)
  try {
    const synthesisResponse = await fetchWithTimeout('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }, 10000);

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
