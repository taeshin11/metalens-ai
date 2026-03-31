import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let keywords = '';
  try {
    ({ keywords } = await request.json());

    if (!keywords) {
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 });
    }

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Translate the following medical/scientific keywords to English. Return ONLY the English medical terms separated by commas, nothing else. No explanations.\n\nKeywords: ${keywords}`,
          },
        ],
        model: 'openai',
        temperature: 0,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ translated: keywords });
    }

    const translated = await response.text();
    const cleaned = translated.trim().replace(/^["']|["']$/g, '');
    return NextResponse.json({ translated: cleaned || keywords });
  } catch {
    return NextResponse.json({ translated: keywords });
  }
}
