import { PubMedArticle } from './pubmed';
import { META_ANALYSIS_PROMPT, FREE_POINTS } from './constants';

export interface SynthesisResult {
  english: string;
  translated: string | null;
  language: string;
}

const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';
const MODELS = ['openai', 'mistral'];

export function buildPrompt(articles: PubMedArticle[], pointCount = FREE_POINTS): string {
  const systemPrompt = META_ANALYSIS_PROMPT
    .replace(/{pointCount}/g, String(pointCount));

  const MAX_TOTAL_CHARS = 2500;
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

// --- Client-side AI calls (bypass server rate limits) ---

async function callPollinationsClient(prompt: string, model: string, timeoutMs = 25000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        model,
        temperature: 0.2,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const raw = await response.text();
    return cleanResponse(raw);
  } finally {
    clearTimeout(timeout);
  }
}

async function translateClient(text: string, language: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: `Translate to ${language}. Keep all formatting (**, numbers, PMIDs, line breaks). Only output the translation.` },
          { role: 'user', content: text },
        ],
        model: 'openai',
        temperature: 0.1,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (!response.ok) return null;
    const raw = await response.text();
    return cleanResponse(raw) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function synthesizeClientSide(prompt: string): Promise<string> {
  // Try each model with retry on primary
  for (const model of MODELS) {
    const attempts = model === MODELS[0] ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const result = await callPollinationsClient(prompt, model);
        if (result && result.trim()) return result;
      } catch {
        // Continue
      }
      if (attempt < attempts - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
  throw new Error('All AI models failed');
}

/**
 * Client-side synthesis: calls Pollinations directly from browser
 * Step 1: Synthesize in English
 * Step 2: If non-English, translate
 */
export async function synthesizeWithAI(
  articles: PubMedArticle[],
  language: string,
): Promise<SynthesisResult> {
  const prompt = buildPrompt(articles);
  const englishResult = await synthesizeClientSide(prompt);

  if (!englishResult || !englishResult.trim()) {
    throw new Error('AI returned empty result');
  }

  // Translate if not English
  if (language !== 'English') {
    try {
      const translated = await translateClient(englishResult, language);
      if (translated) {
        return { english: englishResult, translated, language };
      }
    } catch {
      // Translation failed — return English only
    }
  }

  return { english: englishResult, translated: null, language };
}

// --- Response cleaning ---

const FAILURE_PHRASES = [
  'analysis could not be completed',
  'could not be completed',
  'unable to complete',
  'try again with different',
  'please try again',
  'I cannot provide',
  'I\'m unable to',
  'sorry, I cannot',
];

function cleanResponse(raw: string): string {
  let text = raw;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        text = parsed.content.trim();
      } else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        text = parsed.choices[0].message.content.trim();
      }
    }
  } catch {
    // Not JSON
  }

  // Strip reasoning preamble
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);
  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.substring(0, match.index);
    if (/We need|Let's|Let me|I need|Must use|Must cite/i.test(preamble)) {
      text = text.substring(match.index);
    }
  }

  // Strip Pollinations ads
  text = text.replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '');

  text = text.trim();

  // Detect failure responses
  const lower = text.toLowerCase();
  if (text.length < 300 && FAILURE_PHRASES.some(p => lower.includes(p))) {
    return '';
  }

  return text;
}
