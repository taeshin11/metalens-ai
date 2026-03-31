/**
 * Check if text contains non-Latin characters (CJK, Korean, Arabic, Cyrillic, etc.)
 */
function hasNonLatinChars(text: string): boolean {
  return /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
}

/**
 * Translate non-English keywords to English medical terms for PubMed search.
 * Uses Pollinations.ai — free, no API key, no login.
 */
export async function translateForPubMed(keywords: string): Promise<string> {
  if (!hasNonLatinChars(keywords)) {
    return keywords;
  }

  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Translate the following medical/scientific keywords to English. Return ONLY the English medical terms separated by commas, nothing else. No explanations.\n\nKeywords: ${keywords}`,
          },
        ],
        model: 'openai',
        temperature: 0,
      }),
    });

    if (!response.ok) return keywords;

    const translated = await response.text();
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return cleaned || keywords;
  } catch {
    return keywords;
  }
}
