import { NextRequest, NextResponse } from 'next/server';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    // Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const translated = await callPollinations(text, language);
        if (translated) {
          return NextResponse.json({ translated });
        }
      } catch {
        if (attempt < 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function callPollinations(text: string, language: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Translate to ${language}. Keep all formatting (**, numbers, PMIDs, line breaks) exactly the same. Only output the translation.`,
          },
          { role: 'user', content: text },
        ],
        model: 'openai',
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const raw = await response.text();
    return cleanTranslation(raw);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanTranslation(raw: string): string {
  let text = raw;

  // Handle JSON responses
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
