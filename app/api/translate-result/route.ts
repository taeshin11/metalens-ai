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

    const systemPrompt = `You are a medical research translator. The user will give you an English meta-analysis summary. Your job is to produce a faithful factual summary in ${language}.

RULES:
- Write 3-5 numbered lines
- Each line = 1-2 sentences stating a finding as fact
- PRESERVE ALL numbers: effect sizes, percentages, p-values, CIs, sample sizes (N=), hazard/odds ratios
  BAD: "메트포르민이 혈당을 낮춘다" — numbers dropped
  GOOD: "메트포르민은 HbA1c를 1.2% 감소시켰다 (95% CI: 0.8-1.6, p<0.001, N=1089)"
- Do NOT omit any statistic that appears in the English text
- Do NOT add information not in the original
- Do NOT include PMID citations — only the factual conclusions
- Do NOT include section titles or headings

EXAMPLE (Korean):
1. 메트포르민은 인슐린 대비 HbA1c를 1.2% 더 감소시켰다 (95% CI: 0.8-1.6, p<0.001, N=1089).
2. 세마글루타이드 투여군은 체중이 6.3kg 감소한 반면, 인슐린군은 1.9kg 증가했다.
3. 저혈당 발생률은 세마글루타이드 6%, 인슐린 11%로 유의한 차이를 보였다.

Write ONLY the numbered lines in ${language}. Nothing else.`;

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
      // CJK languages: ASCII-only = English echo. Latin-script languages: check for English stopwords.
      const cjkLangs = ['Korean', 'Japanese', 'Chinese'];
      const isCJK = cjkLangs.includes(language);
      const isEnglishEcho = language !== 'English' && (
        isCJK
          ? /^[a-zA-Z0-9\s.,;:'"()\-*#%<>=\/]+$/.test(translated.replace(/\n/g, '').slice(0, 200))
          : /\b(the|and|with|for|that|this|from|have|were|was|are|been|which)\b/gi.test(translated.slice(0, 300)) &&
            (translated.slice(0, 300).match(/\b(the|and|with|for|that|this)\b/gi) || []).length >= 5
      );

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
