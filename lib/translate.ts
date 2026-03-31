/**
 * Check if text contains non-Latin characters (CJK, Korean, Arabic, Cyrillic, etc.)
 */
function hasNonLatinChars(text: string): boolean {
  return /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
}

/**
 * Translate non-English keywords to English medical terms for PubMed search.
 * Calls our server-side API route to avoid CORS issues.
 */
export async function translateForPubMed(keywords: string): Promise<string> {
  if (!hasNonLatinChars(keywords)) {
    return keywords;
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) return keywords;

    const data = await response.json();
    return data.translated || keywords;
  } catch {
    return keywords;
  }
}
