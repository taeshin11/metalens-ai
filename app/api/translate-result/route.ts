import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    const systemPrompt = `You are a medical research summarizer. The user will give you a detailed English meta-analysis. Your ONLY job is to produce a VERY SHORT factual summary in ${language}.

STRICT RULES:
- Write EXACTLY 3-5 numbered lines
- Each line = ONE short sentence (max 30 words)
- State conclusions as FACTS — no explanations, no reasoning, no PMID citations
- Include specific numbers/percentages/statistics when available
- Fill in blanks with actual data from the analysis — never leave placeholders
- Do NOT translate the English text — REWRITE it as a concise factual summary
- Do NOT include section titles like "Main Comparison" or "Statistics"

EXAMPLE OUTPUT FORMAT:
1. 프란루카스트가 몬테루카스트보다 천식 이환율을 15% 더 낮추었다.
2. 두 약물 분석 시 사망률은 약 2.3%였다.
3. 12개 논문의 메타분석 결과 몬테루카스트 사용이 더 효과적이다.
4. 단, 소아 환자에서는 프란루카스트가 더 좋은 결과를 보였다.
5. 장기 사용(1년 이상) 데이터는 부족하여 추가 연구가 필요하다.

Write ONLY the numbered lines. Nothing else.`;

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
    // Try free tier first
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
    } catch { /* free tier exhausted */ }

    // Try cheapest paid model
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
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
    const data = await response.json();
    const msg = data?.choices?.[0]?.message;
    const raw = msg?.content || msg?.reasoning_content || '';
    // Strip Pollinations ads
    return raw.trim().replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '').trim() || null;
  } catch {
    return null;
  }
}
