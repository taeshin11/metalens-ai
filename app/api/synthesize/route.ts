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
        model: 'openai-large',
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI synthesis failed' }, { status: 502 });
    }

    const text = await response.text();
    return NextResponse.json({ result: text });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
