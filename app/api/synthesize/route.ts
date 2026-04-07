import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { TIER_CONFIG } from '@/lib/constants';
import { trackUsage } from '@/lib/usage-tracker';
import { ADMIN_EMAILS } from '@/lib/admin';
import type { Tier } from '@/lib/constants';

// Allow up to 60s for AI synthesis on Vercel
export const maxDuration = 60;

const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase());
    const tier: Tier = isAdmin ? 'ultra' : (session?.tier || 'free');
    const identifier = session?.email || request.headers.get('x-forwarded-for') || 'anon';

    // Admin users skip rate limit
    let remaining = 999;
    if (!isAdmin) {
      const rl = await checkRateLimit(identifier, tier);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Daily limit reached', limit: rl.limit, tier },
          { status: 429 },
        );
      }
      remaining = rl.remaining;
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const result = await synthesize(prompt, tier);

    if (!result) {
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    trackUsage(identifier, tier, TIER_CONFIG[tier].model);

    return NextResponse.json({ result, remaining });
  } catch {
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function synthesize(prompt: string, tier: Tier): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  const tierModel = TIER_CONFIG[tier].model;

  // Strategy 1: Tier-specific Gemini model
  try {
    const result = await callGemini(prompt, geminiKey, tierModel);
    if (result && result.trim()) return result;
  } catch {
    // Primary model failed — try fallback
  }

  // Strategy 2: Gemini fallback (Flash-Lite is cheapest)
  try {
    const result = await callGemini(prompt, geminiKey, 'gemini-2.0-flash-lite');
    if (result && result.trim()) return result;
  } catch {
    // Fallback also failed
  }

  return null;
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
