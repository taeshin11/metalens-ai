import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { callGeminiWithFallback } from '@/lib/gemini';

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

    let bestTranslation = '';
    const MAX_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      log.stage('translation_attempt', { attempt, language });

      const translated = await callGeminiWithFallback({
        prompt: text,
        systemInstruction: systemPrompt,
        temperature: 0.1,
        maxOutputTokens: 4000,
        log,
      });

      if (!translated) {
        log.warn('translation_attempt_null', { attempt, language });
        continue;
      }

      const numberedLines = (translated.match(/^\d+\./gm) || []).length;
      const charRatio = text.length > 0 ? +(translated.length / text.length).toFixed(2) : 0;
      const hasNumbers = /\d+\.?\d*%/.test(translated);
      const isEnglishEcho = language !== 'English' && /^[a-zA-Z0-9\s.,;:'"()\-*#%]+$/.test(translated.slice(0, 200));

      log.stage('translation_scored', { attempt, language, numberedLines, charRatio, hasNumbers, isEnglishEcho, chars: translated.length });

      bestTranslation = translated;

      if (isEnglishEcho) {
        log.warn('translation_garbage_english_echo', { attempt, language });
        if (attempt < MAX_ATTEMPTS) continue;
      }
      if (translated.length < 20) {
        log.warn('translation_garbage_too_short', { attempt, language, chars: translated.length });
        if (attempt < MAX_ATTEMPTS) continue;
      }
      break;
    }

    if (!bestTranslation) {
      log.done(502, { reason: 'all_attempts_failed', language });
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    log.done(200, { language, bytes: bestTranslation.length });
    return NextResponse.json({ translated: bestTranslation });
  } catch (err) {
    log.error('translate_result_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
  }
}
