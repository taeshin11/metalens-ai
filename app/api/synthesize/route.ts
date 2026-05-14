import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { TIER_CONFIG } from '@/lib/constants';
import { trackUsage } from '@/lib/usage-tracker';
import { ADMIN_EMAILS } from '@/lib/admin';
import { createLogger, maskId } from '@/lib/logger';
import { callGeminiWithFallback } from '@/lib/gemini';
import type { Tier } from '@/lib/constants';

// Allow up to 60s for AI synthesis on Vercel
export const maxDuration = 60;

const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';

export async function POST(request: NextRequest) {
  const log = createLogger('api/synthesize');
  log.start();

  try {
    log.stage('auth_start');
    const session = await getSession();
    const isAdmin = !!(session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()));
    const tier: Tier = isAdmin ? 'pro' : (session?.tier || 'free');
    const identifier = session?.email || request.headers.get('x-forwarded-for') || 'anon';
    log.stage('auth_done', {
      user: maskId(session?.email),
      tier,
      isAdmin,
      anon: !session,
    });

    // Admin users skip rate limit
    let remaining = 999;
    if (!isAdmin) {
      log.stage('rate_limit_start', { identifier: maskId(identifier) });
      const rl = await checkRateLimit(identifier, tier, log);
      log.stage('rate_limit_done', { allowed: rl.allowed, remaining: rl.remaining, limit: rl.limit });
      if (!rl.allowed) {
        const errorMsg = tier === 'free'
          ? 'Free usage limit reached. Upgrade to Pro for more analyses.'
          : 'Daily limit reached. Resets at midnight UTC.';
        log.done(429, { reason: 'rate_limited', tier });
        return NextResponse.json(
          { error: errorMsg, limit: rl.limit, tier },
          { status: 429 },
        );
      }
      remaining = rl.remaining;
    }

    const { prompt } = await request.json();
    if (!prompt) {
      log.done(400, { reason: 'missing_prompt' });
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    log.stage('body_parsed', { promptLen: prompt.length });

    const tierModel = TIER_CONFIG[tier].model;
    const MAX_ATTEMPTS = 3;
    let bestResult = '';
    let bestScore = -1;
    let bestQuality: Record<string, unknown> = {};
    let degraded = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      log.stage('synthesis_attempt', { attempt, model: tierModel });

      const result = await callGeminiWithFallback({
        prompt,
        systemInstruction: SYSTEM_MSG,
        temperature: 0.2,
        maxOutputTokens: 8000,
        model: tierModel,
        log,
      });

      if (!result) {
        log.warn('synthesis_attempt_null', { attempt });
        continue;
      }

      const boldHeaders = (result.match(/\*\*\d+\./g) || []).length;
      const realPmids = (result.match(/PMID[:\s]*\d{7,8}/gi) || []).length;
      const fakePmids = (result.match(/PMID[:\s]*\d{1,6}(?!\d)/gi) || []).length;
      const numberCount = (result.match(/\d+\.?\d*%/g) || []).length;
      const lineCount = result.split('\n').filter(l => l.trim()).length;
      const quality = { boldHeaders, realPmids, fakePmids, numberCount, lineCount, resultChars: result.length };

      const score = boldHeaders * 10 + realPmids * 5 + numberCount * 3 + Math.min(lineCount, 20) * 2 + Math.min(result.length / 100, 20) - fakePmids * 20;

      log.stage('synthesis_scored', { attempt, score: Math.round(score), ...quality });

      if (score > bestScore) {
        bestResult = result;
        bestScore = score;
        bestQuality = quality;
      }

      const ciCount = (result.match(/95%\s*CI/gi) || []).length;
      const pValCount = (result.match(/p\s*[<=<]\s*0\.\d+/gi) || []).length;
      const nCount = (result.match(/N\s*[=:]\s*[\d,]+/gi) || []).length;
      const dataDense = ciCount >= 2 || (pValCount >= 2 && nCount >= 2);

      const isGarbage = boldHeaders < 1 || result.length < 100 || fakePmids > 0;
      const isWeak = !dataDense && result.length < 2000;

      if (!isGarbage && !isWeak) break;

      if (fakePmids > 0) {
        log.warn('synthesis_fake_pmids_detected', { attempt, fakePmids, realPmids });
      }
      if (isWeak && !isGarbage) {
        log.warn('synthesis_weak_data_density', { attempt, ciCount, pValCount, nCount, chars: result.length });
      }

      log.warn('synthesis_retry_reason', { attempt, isGarbage, isWeak, ...quality, ciCount, pValCount, nCount });
      if (attempt < MAX_ATTEMPTS) {
        log.stage('synthesis_retrying', { attempt, reason: 'quality_below_threshold' });
      }
    }

    if (!bestResult) {
      log.error('synthesize_all_attempts_failed', undefined, { attempts: MAX_ATTEMPTS });
      log.done(502, { reason: 'ai_failed' });
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    // Post-processing: clean PMID citations
    // Strip bracket ref contamination: (PMID: 33428176, 6) → (PMID: 33428176)
    bestResult = bestResult.replace(/\(PMID[:\s]*(\d{7,8}),?\s*\d{1,3}\)/gi, '(PMID: $1)');
    // Strip fake PMIDs (too short, ≤4 digits — 5+ digit ones go to auto-correction below)
    const veryShortPmids = (bestResult.match(/\(PMID[:\s]*\d{1,4}(?!\d)\)/gi) || []).length;
    if (veryShortPmids > 0) {
      bestResult = bestResult.replace(/\(PMID[:\s]*\d{1,4}(?!\d)\)/gi, '[citation needed]');
      log.warn('fake_pmids_stripped', { count: veryShortPmids });
    }
    // Validate PMIDs against input — auto-correct truncated ones, strip hallucinated
    const inputPmids: Set<string> = new Set(
      (prompt.match(/PMID:\s*(\d{7,8})/g) || []).map((m: string) => m.replace(/PMID:\s*/, ''))
    );
    const inputPmidArr: string[] = Array.from(inputPmids);
    if (inputPmids.size > 0) {
      let hallucinated = 0;
      let corrected = 0;
      bestResult = bestResult.replace(/\(PMID[:\s]*(\d{5,8})\)/gi, (_match, pmid: string) => {
        if (inputPmids.has(pmid)) return `(PMID: ${pmid})`;
        // Try to auto-correct: truncated PMID that is a prefix of an input PMID
        const prefixMatch = inputPmidArr.find(p => p.startsWith(pmid) && p.length - pmid.length <= 2);
        // Also try suffix match (leading digit dropped)
        const suffixMatch = !prefixMatch ? inputPmidArr.find(p => p.endsWith(pmid) && p.length - pmid.length <= 2) : undefined;
        const bestMatch = prefixMatch || suffixMatch;
        if (bestMatch) {
          corrected++;
          return `(PMID: ${bestMatch})`;
        }
        hallucinated++;
        return '[citation needed]';
      });
      if (corrected > 0) {
        log.info('pmids_auto_corrected', { count: corrected, inputPmidCount: inputPmids.size });
      }
      if (hallucinated > 0) {
        log.warn('hallucinated_pmids_stripped', { count: hallucinated, inputPmidCount: inputPmids.size });
      }
    }

    const flags: string[] = [];
    if ((bestQuality.boldHeaders as number) < 2) flags.push('low_headers');
    if ((bestQuality.realPmids as number) < 2) flags.push('low_pmids');
    if (bestResult.length < 200) flags.push('short_result');
    if ((bestQuality.numberCount as number) < 1) flags.push('no_numbers');
    if ((bestQuality.fakePmids as number) > 0) flags.push('had_fake_pmids');

    if (flags.length >= 3) {
      degraded = true;
      log.warn('result_quality_degraded', { ...bestQuality, flags, degraded: true });
    } else if (flags.length > 0) {
      log.warn('result_quality_partial', { ...bestQuality, flags });
    }
    log.stage('result_quality', bestQuality);
    log.stage('tracking_usage', { tier, model: tierModel });
    trackUsage(identifier, tier, tierModel);

    log.done(200, { tier, resultBytes: bestResult.length, remaining, score: Math.round(bestScore), degraded });
    return NextResponse.json({ result: bestResult, remaining, degraded });
  } catch (err) {
    log.error('synthesize_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}
