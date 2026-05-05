import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { callGeminiWithFallback } from '@/lib/gemini';

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

    const translated = await callGeminiWithFallback({
      prompt,
      temperature: 0,
      maxOutputTokens: 200,
      log,
    });

    if (translated) {
      const cleaned = translated.replace(/^["']|["']$/g, '');
      const termCount = cleaned.split(',').length;
      log.done(200, {
        bytes: cleaned.length, termCount,
        inputKeywords: keywords, outputKeywords: cleaned,
        wasChanged: keywords !== cleaned,
      });
      return NextResponse.json({ translated: cleaned });
    }

    log.warn('translate_all_failed_passthrough', { keywords });
    log.done(200, { passthrough: true, reason: 'all_models_failed' });
    return NextResponse.json({ translated: keywords });
  } catch (err) {
    log.error('translate_handler_crashed', err);
    log.done(200, { passthrough: true, reason: 'unexpected_error' });
    return NextResponse.json({ translated: keywords });
  }
}
