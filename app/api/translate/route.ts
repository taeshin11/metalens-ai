import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';

export async function POST(request: NextRequest) {
  let keywords = '';
  try {
    ({ keywords } = await request.json());

    if (!keywords) {
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
    }

    const prompt = `Translate the following medical/scientific keywords to English. Return ONLY the English medical terms separated by commas, nothing else. No explanations.\n\nKeywords: ${keywords}`;

    // Try Gemini first, then Pollinations
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0, maxOutputTokens: 200 },
        });
        const translated = response.text?.trim().replace(/^["']|["']$/g, '');
        if (translated) return NextResponse.json({ translated });
      } catch { /* fall through */ }
    }

    // Fallback: Pollinations
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai',
        temperature: 0,
        seed: Math.floor(Math.random() * 100000),
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) return NextResponse.json({ translated: keywords });
    const data = await response.json();
    const translated = data?.choices?.[0]?.message?.content || '';
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return NextResponse.json({ translated: cleaned || keywords });
  } catch {
    return NextResponse.json({ translated: keywords });
  }
}
