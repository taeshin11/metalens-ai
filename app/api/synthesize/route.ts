import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { TIER_CONFIG } from '@/lib/constants';
import { trackUsage } from '@/lib/usage-tracker';
import type { Tier } from '@/lib/constants';

// Allow up to 60s for AI synthesis on Vercel
export const maxDuration = 60;

const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';
const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const tier: Tier = session?.tier || 'free';
    const identifier = session?.email || request.headers.get('x-forwarded-for') || 'anon';

    // Server-side rate limit (Upstash Redis)
    const rl = await checkRateLimit(identifier, tier);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Daily limit reached', limit: rl.limit, tier },
        { status: 429 },
      );
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Use tier-appropriate model
    const result = await synthesize(prompt, tier);

    if (!result) {
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    // Track usage for admin dashboard
    trackUsage(identifier, tier, TIER_CONFIG[tier].model);

    return NextResponse.json({ result, remaining: rl.remaining });
  } catch {
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function synthesize(prompt: string, tier: Tier): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const tierModel = TIER_CONFIG[tier].model;

  // Strategy 1: Tier-specific Gemini model
  if (geminiKey) {
    try {
      const result = await callGemini(prompt, geminiKey, tierModel);
      if (result && result.trim()) return result;
    } catch {
      // Primary model failed — try fallback
    }
  }

  // Strategy 2: Gemini fallback (Flash-Lite is cheapest)
  if (geminiKey) {
    try {
      const result = await callGemini(prompt, geminiKey, 'gemini-2.0-flash-lite');
      if (result && result.trim()) return result;
    } catch {
      // Fallback also failed
    }
  }

  // Strategy 3: Pollinations (free, no key needed)
  try {
    const result = await callPollinations(prompt, 'openai');
    if (result && result.trim()) return result;
  } catch {
    // Pollinations failed
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

  return cleanResponse(response.text ?? '');
}

async function callPollinations(prompt: string, model = 'openai'): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_MSG },
          { role: 'user', content: prompt },
        ],
        model,
        temperature: 0.2,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.text();
    return cleanResponse(raw);
  } finally {
    clearTimeout(timeout);
  }
}

const FAILURE_PHRASES = [
  'analysis could not be completed',
  'unable to complete',
  'try again with different',
  'I cannot provide',
  'I\'m unable to',
  'sorry, I cannot',
];

function cleanResponse(raw: string): string {
  let text = raw;

  // Handle JSON responses (OpenAI-compatible format)
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      // Direct message object: {"role":"assistant","content":"..."}
      if (parsed.role === 'assistant' && typeof parsed.content === 'string') {
        text = parsed.content.trim();
      } else if (typeof parsed.content === 'string') {
        text = parsed.content.trim();
      } else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message) {
        const msg = parsed.choices[0].message;
        if (typeof msg.content === 'string' && msg.content.trim()) {
          text = msg.content.trim();
        }
        // Never use reasoning_content — it's internal AI thinking, not the answer
      }
    }
  } catch { /* not JSON */ }

  // Detect if entire text is raw JSON with reasoning_content (not parsed above)
  if (text.startsWith('{"role"') || text.startsWith('"reasoning_content"')) {
    return '';
  }

  // Strip reasoning preamble
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);
  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.substring(0, match.index);
    if (/We need|Let's|Let me|I need|Must use|translate|translation/i.test(preamble)) {
      text = text.substring(match.index);
    }
  }

  // Strip Pollinations ads
  text = text.replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '');

  text = text.trim();

  // Detect failure responses
  const lower = text.toLowerCase();
  if (text.length < 300 && FAILURE_PHRASES.some(p => lower.includes(p))) return '';

  return text;
}
