declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: Record<string, unknown>) => Promise<{ text?: string; message?: { content: string } }>;
      };
    };
  }
}

/**
 * Check if text contains non-Latin characters (CJK, Korean, Arabic, Cyrillic, etc.)
 */
function hasNonLatinChars(text: string): boolean {
  return /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
}

/**
 * Wait for Puter.js to load
 */
async function waitForPuter(): Promise<void> {
  for (let i = 0; i < 20 && !window.puter; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

/**
 * Translate non-English keywords to English medical terms for PubMed search.
 * Returns the English translation. If already English, returns as-is.
 */
export async function translateForPubMed(keywords: string): Promise<string> {
  if (!hasNonLatinChars(keywords)) {
    return keywords;
  }

  if (typeof window === 'undefined') return keywords;

  await waitForPuter();
  if (!window.puter) return keywords;

  try {
    const response = await window.puter.ai.chat(
      `Translate the following medical/scientific keywords to English. Return ONLY the English medical terms separated by commas, nothing else. Do not add explanations.\n\nKeywords: ${keywords}`,
      { model: 'gpt-4.1-nano', temperature: 0 }
    );

    const translated = response?.message?.content || response?.text || '';
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return cleaned || keywords;
  } catch {
    return keywords;
  }
}
