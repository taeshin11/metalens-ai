import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';
const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Try Gemini first (if API key is set), then fall back to Pollinations
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
  // Strategy 1: Gemini API (if key is configured)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callGemini(prompt, geminiKey);
        if (result && result.trim()) return result;
      } catch {
        if (attempt < 1) await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  // Strategy 2: Pollinations (free, no key needed — fallback)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await callPollinations(prompt);
      if (result && result.trim()) return result;
    } catch {
      if (attempt < 1) await new Promise(r => setTimeout(r, 1500));
    }
  }

  return null;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_MSG,
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });

  return cleanResponse(response.text ?? '');
}

async function callPollinations(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

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
        model: 'openai',
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

  // Handle JSON responses
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.content === 'string') text = parsed.content.trim();
      else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content)
        text = parsed.choices[0].message.content.trim();
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
