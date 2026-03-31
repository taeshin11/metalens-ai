import { NextRequest, NextResponse } from 'next/server';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    const systemPrompt = `Translate to ${language}. Keep all formatting (**, numbers, PMIDs, line breaks) exactly the same. Only output the translation.`;

    // Try Gemini first, then Pollinations
    const translated = await translate(text, systemPrompt);

    if (!translated) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
  }
}

async function translate(text: string, systemPrompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: { systemInstruction: systemPrompt, temperature: 0.1, maxOutputTokens: 2000 },
      });
      const result = response.text?.trim();
      if (result) return result;
    } catch { /* fall through to Pollinations */ }
  }

  // Fallback: Pollinations
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        model: 'openai',
        temperature: 0.1,
        seed: Math.floor(Math.random() * 100000),
      }),
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const raw = await response.text();
    // Strip Pollinations ads
    return raw.trim().replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '').trim() || null;
  } catch {
    return null;
  }
}
