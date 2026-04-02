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

    const prompt = `Convert this medical query into PubMed search keywords in English.

Rules:
1. If the input is a natural language sentence (e.g. "치과치료후 생기는 sinusitis"), extract the key medical concepts and convert to standard English medical terms
2. If the input is already keywords, just translate each term to English
3. Return ONLY comma-separated English medical terms optimized for PubMed search
4. Use MeSH-compatible terms when possible (e.g. "부비동염" → "sinusitis", "치과" → "dental")
5. No explanations, no quotes, no extra text

Examples:
- "치과치료후 생기는 sinusitis" → "dental treatment, sinusitis, odontogenic, maxillary"
- "고혈압에 좋은 약" → "hypertension, antihypertensive, treatment, efficacy"
- "소아 천식 치료 가이드라인" → "pediatric, asthma, treatment, guideline"

Input: ${keywords}`;

    // Try Gemini first, then Pollinations
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // Try free tier first
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
      } catch { /* free tier exhausted */ }

      // Try cheapest paid model
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-lite',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0, maxOutputTokens: 200 },
        });
        const translated = response.text?.trim().replace(/^["']|["']$/g, '');
        if (translated) return NextResponse.json({ translated });
      } catch { /* fall through to Pollinations */ }
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
    const msg = data?.choices?.[0]?.message;
    const translated = msg?.content || msg?.reasoning_content || '';
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return NextResponse.json({ translated: cleaned || keywords });
  } catch {
    return NextResponse.json({ translated: keywords });
  }
}
