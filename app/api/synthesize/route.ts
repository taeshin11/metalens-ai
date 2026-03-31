import { NextRequest, NextResponse } from 'next/server';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const SYSTEM_MSG = 'You are a medical research analyst. Output ONLY your final structured answer. No thinking, planning, or reasoning text.';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Try up to 2 times (retry once on failure)
    const result = await callPollinationsWithRetry(prompt, 2);

    if (!result) {
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('timed out')) {
      return NextResponse.json({ error: 'AI synthesis timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

async function callPollinationsWithRetry(prompt: string, maxRetries: number): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await callPollinations(prompt);
      if (result) return result;
    } catch {
      if (attempt < maxRetries - 1) {
        // Wait 2s before retry
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
    }
  }
  return null;
}

async function callPollinations(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);

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
      }),
    });

    if (!response.ok) {
      // Pollinations returned error — throw to trigger retry
      throw new Error(`Pollinations returned ${response.status}`);
    }

    const raw = await response.text();
    return cleanResponse(raw);
  } finally {
    clearTimeout(timeout);
  }
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

  return text.trim();
}

function stripReasoningPreamble(text: string): string {
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);

  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.substring(0, match.index);
    const indicators = ['We need to', 'Let\'s identify', 'Let\'s craft', 'Let me',
      'I need to', 'Must use', 'Must cite', 'Let\'s produce', 'We have many'];
    if (indicators.some(i => preamble.includes(i))) {
      return text.substring(match.index);
    }
  }

  return text;
}
