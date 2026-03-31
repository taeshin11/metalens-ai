import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai',
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI synthesis failed' }, { status: 502 });
    }

    const raw = await response.text();

    // Pollinations sometimes returns JSON with reasoning_content (from reasoning models)
    // instead of plain text. Extract the actual content.
    const result = extractContent(raw);

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractContent(raw: string): string {
  // Try parsing as JSON first
  try {
    const parsed = JSON.parse(raw);

    // Format: { role: "assistant", reasoning_content: "...", content: "..." }
    if (parsed && typeof parsed === 'object') {
      // Prefer "content" field (the actual answer)
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        return parsed.content.trim();
      }
      // Some models put result in "message.content"
      if (parsed.message && typeof parsed.message.content === 'string') {
        return parsed.message.content.trim();
      }
      // If only reasoning_content exists but no content, the model
      // didn't produce a final answer - use reasoning as fallback
      if (typeof parsed.reasoning_content === 'string' && parsed.reasoning_content.trim()) {
        return parsed.reasoning_content.trim();
      }
      // Array of choices (OpenAI format)
      if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        return parsed.choices[0].message.content.trim();
      }
    }
  } catch {
    // Not JSON — treat as plain text (normal case)
  }

  return raw.trim();
}
