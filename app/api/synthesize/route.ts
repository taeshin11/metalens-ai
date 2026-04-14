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
        const errorMsg = tier === 'free'
          ? 'Free usage limit reached. Upgrade to Pro for more analyses.'
          : 'Daily limit reached. Resets at midnight UTC.';
        return NextResponse.json(
          { error: errorMsg, limit: rl.limit, tier },
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
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const isPro = tier === 'pro' || tier === 'ultra';

  // Pro/Ultra: try Claude first (higher quality)
  if (isPro && anthropicKey) {
    try {
      const result = await callClaude(prompt, anthropicKey);
      if (result && result.trim()) return result;
    } catch {
      // Claude failed — fall through to Gemini
    }
  }

  // Free or Claude fallback: use Gemini
  if (!geminiKey) return null;

  try {
    const result = await callGemini(prompt, geminiKey, 'gemini-2.5-flash');
    if (result && result.trim()) return result;
  } catch {
    // Primary model failed — try fallback
  }

  // Last resort: Gemini Flash-Lite
  try {
    const result = await callGemini(prompt, geminiKey, 'gemini-2.0-flash-lite');
    if (result && result.trim()) return result;
  } catch {
    // All models failed
  }

  return null;
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_MSG,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? '';
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
