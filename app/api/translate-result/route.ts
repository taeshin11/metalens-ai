import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a professional medical translator. Translate the following text to ${language}. Keep all formatting (**, numbers, PMIDs, line breaks) exactly the same. Only translate the text — do not add, remove, or change any content. Do not add any commentary.`,
            },
            { role: 'user', content: text },
          ],
          model: 'openai',
          temperature: 0.1,
        }),
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json({ error: 'Translation timed out' }, { status: 504 });
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    const raw = await response.text();
    const translated = cleanTranslation(raw);

    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function cleanTranslation(raw: string): string {
  let text = raw;

  // Handle JSON responses from reasoning models
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        text = parsed.content.trim();
      }
    }
  } catch {
    // Not JSON
  }

  // Strip Pollinations ads
  text = text.replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '');

  return text.trim();
}
