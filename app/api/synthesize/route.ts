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
        messages: [
          {
            role: 'system',
            content: 'You are a medical research analyst. CRITICAL: Output ONLY your final answer. Do NOT output any thinking, reasoning, planning, or internal monologue. Do NOT start with "We need to", "Let me", "Let\'s", "I need to", or any planning text. Start directly with your structured findings. If you catch yourself writing planning text, stop and restart with just the answer.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'openai',
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI synthesis failed' }, { status: 502 });
    }

    const raw = await response.text();
    const result = cleanResponse(raw);

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function cleanResponse(raw: string): string {
  let text = raw;

  // 1. Handle JSON responses (reasoning models return {role, reasoning_content, content})
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.content === 'string' && parsed.content.trim()) {
        text = parsed.content.trim();
      } else if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        text = parsed.choices[0].message.content.trim();
      } else if (typeof parsed.reasoning_content === 'string') {
        // Only reasoning, no content — model failed to produce answer
        // Extract any structured content after reasoning
        text = parsed.reasoning_content;
      }
    }
  } catch {
    // Not JSON, use as-is
  }

  // 2. Strip reasoning/thinking preamble that some models dump
  text = stripReasoningPreamble(text);

  // 3. Strip Pollinations ad footer
  text = stripPollinationsAd(text);

  return text.trim();
}

function stripReasoningPreamble(text: string): string {
  // Detect if the response starts with reasoning/planning text
  // Pattern: "We need to...", "Let's identify...", "Let me...", "I need to..."
  // followed eventually by actual numbered findings

  // Look for the first occurrence of a numbered finding like "1. **" or "**1."
  const findingsPattern = /^(\d+)\.\s*\*\*/m;
  const match = text.match(findingsPattern);

  if (match && match.index !== undefined && match.index > 0) {
    // Check if content before the first finding looks like reasoning
    const preamble = text.substring(0, match.index);
    const reasoningIndicators = [
      'We need to', 'Let\'s identify', 'Let\'s craft', 'Let me',
      'I need to', 'Must use', 'Must cite', 'Must include',
      'Let\'s produce', 'Key topics:', 'We have many abstracts',
      'need to synthesize', 'Let\'s extract',
    ];

    const isReasoning = reasoningIndicators.some(indicator =>
      preamble.includes(indicator)
    );

    if (isReasoning) {
      // Strip the reasoning preamble, keep only the findings
      return text.substring(match.index);
    }
  }

  // Also handle case where entire response is reasoning with no findings
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim() || '';
  const fullReasoning = [
    'We need to produce', 'We need to ', 'Let\'s identify',
    'We have many abstracts', 'I will now', 'Let me analyze',
  ];
  if (fullReasoning.some(p => firstLine.startsWith(p)) && !text.match(/^\d+\.\s*\*\*/m)) {
    // Entire response is reasoning with no structured output
    // Return a fallback message
    return 'The analysis could not be completed. Please try again with different keywords.';
  }

  return text;
}

function stripPollinationsAd(text: string): string {
  const adPatterns = [
    /\n---\s*\n+\*?\*?Support Pollinations[\s\S]*/i,
    /\n---\s*\n+🌸[\s\S]*/,
    /\n---\s*\n+\*?\*?Ad\*?\*?[\s\S]*/i,
    /\n---\s*\n+Powered by Pollinations[\s\S]*/i,
  ];
  let cleaned = text;
  for (const pattern of adPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned;
}
