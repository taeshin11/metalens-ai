const POLLINATIONS_URL = 'https://text.pollinations.ai/';

/**
 * Check if text contains non-Latin characters (CJK, Korean, Arabic, Cyrillic, etc.)
 */
function hasNonLatinChars(text: string): boolean {
  return /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
}

/**
 * Translate non-English keywords to English medical terms for PubMed search.
 * Calls Pollinations directly from client to avoid server rate limits.
 */
export async function translateForPubMed(keywords: string): Promise<string> {
  if (!hasNonLatinChars(keywords)) {
    return keywords;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Translate these medical/scientific keywords to English. Return ONLY the English medical terms separated by commas, nothing else.\n\nKeywords: ${keywords}`,
          },
        ],
        model: 'openai',
        temperature: 0,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) return keywords;

    const translated = await response.text();
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return cleaned || keywords;
  } catch {
    return keywords;
  }
}
