import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const log = createLogger('api/translate');
  log.start();

  let keywords = '';
  try {
    ({ keywords } = await request.json());

    if (!keywords) {
      log.done(400, { reason: 'missing_keywords' });
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
    }
    log.stage('body_parsed', { keywordsLen: keywords.length });

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
    if (!geminiKey) {
      log.warn('gemini_key_missing_fallback_passthrough');
      log.done(200, { reason: 'no_api_key', passthrough: true });
      return NextResponse.json({ translated: keywords });
    }

    // Try primary model
    const primaryModel = 'gemini-2.5-flash';
    log.stage('gemini_primary_start', { model: primaryModel });
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0, maxOutputTokens: 200 },
      });
      const translated = response.text?.trim().replace(/^["']|["']$/g, '');
      if (translated) {
        log.stage('gemini_primary_done', { model: primaryModel, bytes: translated.length });
        log.done(200, { model: primaryModel });
        return NextResponse.json({ translated });
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
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0, maxOutputTokens: 200 },
      });
      const translated = response.text?.trim().replace(/^["']|["']$/g, '');
      if (translated) {
        log.stage('gemini_fallback_done', { model: fallbackModel, bytes: translated.length });
        log.done(200, { model: fallbackModel });
        return NextResponse.json({ translated });
      }
      log.warn('gemini_fallback_empty', { model: fallbackModel });
    } catch (err) {
      log.error('gemini_fallback_failed', err, { model: fallbackModel });
    }

    log.done(200, { passthrough: true, reason: 'all_models_failed' });
    return NextResponse.json({ translated: keywords });
  } catch (err) {
    log.error('translate_handler_crashed', err);
    log.done(200, { passthrough: true, reason: 'unexpected_error' });
    return NextResponse.json({ translated: keywords });
  }
}
