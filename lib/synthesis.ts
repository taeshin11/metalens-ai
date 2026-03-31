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

export interface SynthesisCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (text: string) => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: Record<string, unknown>) => Promise<{ text?: string; message?: { content: string } }>;
      };
    };
  }
}

export async function synthesizeWithPuter(
  articles: PubMedArticle[],
  language: string,
  callbacks?: SynthesisCallbacks
): Promise<string> {
  const prompt = buildPrompt(articles, language);

  // Wait for puter to be available (script loads with defer)
  if (typeof window === 'undefined') {
    throw new Error('Puter.js not loaded');
  }

  // Poll for puter.js availability (up to 10 seconds)
  for (let i = 0; i < 20 && !window.puter; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!window.puter) {
    throw new Error('Puter.js failed to load. Please refresh and try again.');
  }

  try {
    const response = await window.puter.ai.chat(prompt, {
      model: 'gpt-4.1-nano',
      temperature: 0.3,
    });

    const text = response?.message?.content || response?.text || '';
    callbacks?.onComplete?.(text);
    return text;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('AI synthesis failed');
    callbacks?.onError?.(err);
    throw err;
  }
}
