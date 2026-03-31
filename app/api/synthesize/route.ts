import { NextRequest, NextResponse } from 'next/server';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';

// Models to try in order of preference
const MODELS = ['openai', 'mistral', 'claude'];

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Try each model, with retry on the first one
    const result = await synthesizeWithFallback(prompt);

    if (!result) {
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('timed out') || msg.includes('AbortError')) {
      return NextResponse.json({ error: 'AI synthesis timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function synthesizeWithFallback(prompt: string): Promise<string | null> {
  // Try primary model twice, then fallback models once each
  for (const model of MODELS) {
    const attempts = model === MODELS[0] ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const result = await callPollinations(prompt, model);
        if (result && result.trim()) return result;
      } catch {
        // Continue to next attempt/model
      }
      if (attempt < attempts - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
  return null;
}

async function callPollinations(prompt: string, model: string): Promise<string> {
  const controller = new AbortController();
  // 18s per attempt — allows time for 3+ attempts within Vercel 60s limit
  const timeout = setTimeout(() => controller.abort(), 18000);

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
      }),
    });

    if (!response.ok) {
      throw new Error(`Pollinations returned ${response.status}`);
    }

    const raw = await response.text();
    return cleanResponse(raw);
  } finally {
    clearTimeout(timeout);
  }
}

// Phrases that indicate the AI failed to produce a real analysis
const FAILURE_PHRASES = [
  'analysis could not be completed',
  'could not be completed',
  'unable to complete',
  'cannot complete the analysis',
  'not enough information',
  'insufficient data',
  'try again with different',
  'please try again',
  'I cannot provide',
  'I\'m unable to',
  'I am unable to',
  'sorry, I cannot',
  'sorry, I can\'t',
];

function isFailureResponse(text: string): boolean {
  const lower = text.toLowerCase();
  if (text.length < 300 && FAILURE_PHRASES.some(p => lower.includes(p))) {
    return true;
  }
  return false;
}

function cleanResponse(raw: string): string {
  let text = raw;

  // Handle JSON responses from reasoning models
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        text = parsed.content.trim();
      } else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        text = parsed.choices[0].message.content.trim();
      } else if (typeof parsed.reasoning_content === 'string') {
        text = parsed.reasoning_content;
      }
    }
  } catch {
    // Not JSON
  }

  // Strip reasoning preamble
  text = stripReasoningPreamble(text);

  // Strip Pollinations ads
  text = text.replace(/\n---\s*\n+(\*?\*?Support Pollinations|🌸|Powered by Pollinations)[\s\S]*/i, '');

  text = text.trim();

  // Detect AI failure responses and return empty to trigger retry
  if (isFailureResponse(text)) {
    return '';
  }

  return text;
}

function stripReasoningPreamble(text: string): string {
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);

  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.substring(0, match.index);
    const indicators = ['We need to', 'Let\'s identify', 'Let\'s craft', 'Let me',
      'I need to', 'Must use', 'Must cite', 'Let\'s produce', 'We have many',
      'Let\'s extract', 'Key topics:', 'need to synthesize'];
    if (indicators.some(i => preamble.includes(i))) {
      return text.substring(match.index);
    }
  }

  const numberedPattern = /^1\.\s+\S/m;
  const numMatch = text.match(numberedPattern);
  if (numMatch && numMatch.index !== undefined && numMatch.index > 200) {
    const preamble = text.substring(0, numMatch.index);
    if (/We need|Let's|Let me|Must use/i.test(preamble)) {
      return text.substring(numMatch.index);
    }
  }

  return text;
}
