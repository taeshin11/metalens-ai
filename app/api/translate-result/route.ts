import { NextRequest, NextResponse } from 'next/server';
import { createLogger, RouteLogger } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const log = createLogger('api/translate-result');
  log.start();

  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      log.done(400, { reason: 'missing_fields', hasText: !!text, hasLanguage: !!language });
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }
    log.stage('body_parsed', { textLen: text.length, language });

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

    const translated = await translate(text, systemPrompt, log);

    if (!translated) {
      log.done(502, { reason: 'all_models_failed', language });
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    log.done(200, { language, bytes: translated.length });
    return NextResponse.json({ translated });
  } catch (err) {
    log.error('translate_result_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
  }
}

async function translate(text: string, systemPrompt: string, log: RouteLogger): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    log.error('gemini_key_missing');
    return null;
  }

  // Try primary model
  const primaryModel = 'gemini-2.5-flash';
  log.stage('gemini_primary_start', { model: primaryModel });
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.1, maxOutputTokens: 4000 },
    });
    const result = response.text?.trim();
    if (result) {
      log.stage('gemini_primary_done', { model: primaryModel, bytes: result.length });
      return result;
    }
    log.warn('gemini_primary_empty', { model: primaryModel });
  } catch (err) {
    log.warn('gemini_primary_failed', {
      model: primaryModel,
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
    });
  }

  // Try fallback model
  const fallbackModel = 'gemini-2.0-flash-lite';
  log.stage('gemini_fallback_start', { model: fallbackModel });
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: fallbackModel,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.1, maxOutputTokens: 4000 },
    });
    const result = response.text?.trim();
    if (result) {
      log.stage('gemini_fallback_done', { model: fallbackModel, bytes: result.length });
      return result;
    }
    log.warn('gemini_fallback_empty', { model: fallbackModel });
  } catch (err) {
    log.error('gemini_fallback_failed', err, { model: fallbackModel });
  }

  return null;
}
