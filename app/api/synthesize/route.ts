import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { TIER_CONFIG } from '@/lib/constants';
import { trackUsage } from '@/lib/usage-tracker';
import { ADMIN_EMAILS } from '@/lib/admin';
import { createLogger, maskId, RouteLogger } from '@/lib/logger';
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
      const rl = await checkRateLimit(identifier, tier);
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

    const result = await synthesize(prompt, tier, log);

    if (!result) {
      log.error('synthesize_returned_null');
      log.done(502, { reason: 'ai_failed' });
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    log.stage('tracking_usage', { tier, model: TIER_CONFIG[tier].model });
    trackUsage(identifier, tier, TIER_CONFIG[tier].model);

    log.done(200, { tier, resultBytes: result.length, remaining });
    return NextResponse.json({ result, remaining });
  } catch (err) {
    log.error('synthesize_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function synthesize(prompt: string, tier: Tier, log: RouteLogger): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    log.error('gemini_key_missing');
    return null;
  }

  const tierModel = TIER_CONFIG[tier].model;

  // Strategy 1: Tier-specific Gemini model
  log.stage('gemini_primary_start', { model: tierModel });
  try {
    const result = await callGemini(prompt, geminiKey, tierModel);
    if (result && result.trim()) {
      log.stage('gemini_primary_done', { model: tierModel, bytes: result.length });
      return result;
    }
    log.warn('gemini_primary_empty', { model: tierModel });
  } catch (err) {
    log.warn('gemini_primary_failed', { model: tierModel, ...errCtx(err) });
  }

  // Strategy 2: Gemini fallback (Flash-Lite is cheapest)
  const fallbackModel = 'gemini-2.0-flash-lite';
  log.stage('gemini_fallback_start', { model: fallbackModel });
  try {
    const result = await callGemini(prompt, geminiKey, fallbackModel);
    if (result && result.trim()) {
      log.stage('gemini_fallback_done', { model: fallbackModel, bytes: result.length });
      return result;
    }
    log.warn('gemini_fallback_empty', { model: fallbackModel });
  } catch (err) {
    log.error('gemini_fallback_failed', err, { model: fallbackModel });
  }

  return null;
}

function errCtx(err: unknown): Record<string, string> {
  if (err instanceof Error) return { errName: err.name, errMessage: err.message };
  return { errMessage: String(err).slice(0, 200) };
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_MSG,
      temperature: 0.2,
      maxOutputTokens: 8000,
    },
  });

  return response.text?.trim() ?? '';
}
