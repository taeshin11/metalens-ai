import { NextRequest, NextResponse } from 'next/server';

// Allow up to 60s for AI synthesis on Vercel
export const maxDuration = 60;

const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';
const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Try Gemini first, then Pollinations fallback
    const result = await synthesize(prompt);

    if (!result) {
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function synthesize(prompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  // Strategy 1: Gemini 2.5 Flash (free tier)
  if (geminiKey) {
    try {
      const result = await callGemini(prompt, geminiKey, 'gemini-2.5-flash');
      if (result && result.trim()) return result;
    } catch {
      // Free tier exhausted (429) — fall through to paid model
    }
  }

  // Strategy 2: Gemini 2.0 Flash-Lite (cheapest paid — ~$0.075/1M tokens)
  if (geminiKey) {
    try {
      const result = await callGemini(prompt, geminiKey, 'gemini-2.0-flash-lite');
      if (result && result.trim()) return result;
    } catch {
      // Paid model also failed — fall through to Pollinations
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
      if (typeof parsed.content === 'string') {
        text = parsed.content.trim();
      } else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message) {
        const msg = parsed.choices[0].message;
        // Prefer content, fall back to reasoning_content (some models put output there)
        const extracted = msg.content || msg.reasoning_content || '';
        if (typeof extracted === 'string' && extracted.trim()) {
          text = extracted.trim();
        }
      }
    }
  } catch { /* not JSON */ }

  // Strip reasoning preamble
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);
  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.substring(0, match.index);
    if (/We need|Let's|Let me|I need|Must use/i.test(preamble)) {
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
