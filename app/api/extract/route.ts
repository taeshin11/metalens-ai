import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ADMIN_EMAILS } from '@/lib/admin';

// Data extraction uses its own 60s budget, separate from synthesis rate limits
export const maxDuration = 60;

const EXTRACTION_PROMPT = `Extract numerical data from each PubMed abstract. Return a JSON array.

For EACH paper, extract:
- pmid (string)
- sampleSize (integer or null): total N, patients, participants, subjects, cases
- effectSize (number or null): the MAIN quantitative result
- effectType: USE "MD" (mean difference) as the DEFAULT type for ALL studies. Only use "OR"/"RR"/"HR" if explicitly stated in the abstract. This ensures consistency across studies for meta-analysis pooling.
- ciLower (number or null): lower 95% CI
- ciUpper (number or null): upper 95% CI
- pValue (number or null): "p<0.001"→0.001, "p=0.04"→0.04, "significant"→0.05, "NS"→0.5
- outcome (string): what was measured, max 10 words

HOW TO EXTRACT effectSize:
1. If MD/SMD is stated: use it directly
2. If means are given (e.g., "HbA1c 7.2% vs 7.8%"): calculate MD = 7.2 - 7.8 = -0.6
3. If percentages are compared (e.g., "45% vs 32%"): calculate MD = 45 - 32 = 13
4. If OR/RR/HR is explicitly stated: use it with that effectType
5. If change from baseline is given (e.g., "-1.2% vs -0.8%"): calculate MD = -1.2 - (-0.8) = -0.4
6. If only one group's result is stated: use it as effectSize with effectType "other"

CRITICAL RULES:
- Do NOT return all nulls — every abstract has SOME numbers
- Use "MD" as effectType whenever you calculate a difference between two values
- At minimum extract sampleSize and pValue even if effectSize is unclear
- Use CONSISTENT effectType across all studies (prefer "MD" for everything unless OR/RR/HR is explicit)

Output ONLY valid JSON array. No markdown, no explanation.
[{"pmid":"12345","sampleSize":120,"effectSize":-0.6,"effectType":"MD","ciLower":-1.1,"ciUpper":-0.1,"pValue":0.03,"outcome":"HbA1c reduction"}]`;

const SYSTEM_MSG = 'You are a medical data extractor. Output ONLY a valid JSON array. No markdown, no explanation, no reasoning.';

async function callGeminiBatch(abstracts: string, apiKey: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: `${EXTRACTION_PROMPT}\n\n--- ABSTRACTS ---\n\n${abstracts}` }] }],
    config: {
      systemInstruction: SYSTEM_MSG,
      temperature: 0.1,
      maxOutputTokens: 8000,
    },
  });

  return response.text?.trim() ?? '[]';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase());

    // Require login for data extraction (free guests can't use this)
    if (!session && !isAdmin) {
      return NextResponse.json({ error: 'Login required for data extraction' }, { status: 401 });
    }

    const { articles } = await request.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'Missing articles' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    // Split all articles into batches of 20 and process in parallel
    const BATCH_SIZE = 20;
    const batches: typeof articles[] = [];
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      batches.push(articles.slice(i, i + BATCH_SIZE));
    }

    const batchPromises = batches.map(async (batch) => {
      const text = batch
        .map((a: { pmid: string; title: string; abstract: string }, i: number) =>
          `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nAbstract: ${a.abstract.slice(0, 800)}`
        )
        .join('\n\n---\n\n');

      try {
        const raw = await callGeminiBatch(text, geminiKey);
        // Parse JSON array from response
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });

    // Run all batches in parallel (Gemini handles each within timeout)
    const batchResults = await Promise.all(batchPromises);
    const combined = batchResults.flat();

    return NextResponse.json({ data: combined });
  } catch {
    return NextResponse.json({ error: 'Extraction failed' }, { status: 502 });
  }
}
