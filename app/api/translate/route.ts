import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

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

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ translated: keywords });

    // Try primary model
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
    } catch (err) {
      console.warn('[translate] primary model failed, trying fallback:', err);
    }

    // Try fallback model
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
    } catch (err) {
      console.warn('[translate] fallback model also failed:', err);
    }

    return NextResponse.json({ translated: keywords });
  } catch (err) {
    console.error('[api/translate] failed:', err);
    return NextResponse.json({ translated: keywords });
  }
}
