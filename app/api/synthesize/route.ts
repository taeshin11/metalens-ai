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
    const result = await callGeminiWithFallback({
      prompt,
      systemInstruction: SYSTEM_MSG,
      temperature: 0.2,
      maxOutputTokens: 8000,
      model: tierModel,
      log,
    });

    if (!result) {
      log.error('synthesize_returned_null');
      log.done(502, { reason: 'ai_failed' });
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    const boldHeaders = (result.match(/\*\*\d+\./g) || []).length;
    const pmidCount = (result.match(/PMID[:\s]*\d{7,8}/gi) || []).length;
    const numberCount = (result.match(/\d+\.?\d*%/g) || []).length;
    const lineCount = result.split('\n').filter(l => l.trim()).length;
    const quality = { boldHeaders, pmidCount, numberCount, lineCount, resultChars: result.length };

    const flags: string[] = [];
    if (boldHeaders < 2) flags.push('low_headers');
    if (pmidCount < 2) flags.push('low_pmids');
    if (result.length < 200) flags.push('short_result');
    if (numberCount < 1) flags.push('no_numbers');

    if (flags.length > 0) {
      log.warn('result_quality_degraded', { ...quality, flags });
    }
    log.stage('result_quality', quality);
    log.stage('tracking_usage', { tier, model: tierModel });
    trackUsage(identifier, tier, tierModel);

    log.done(200, { tier, resultBytes: result.length, remaining, boldHeaders, pmidCount });
    return NextResponse.json({ result, remaining });
  } catch (err) {
    log.error('synthesize_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}
