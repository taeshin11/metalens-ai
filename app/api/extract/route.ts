import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ADMIN_EMAILS } from '@/lib/admin';
import { createLogger, maskId } from '@/lib/logger';

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
  const log = createLogger('api/extract');
  log.start();

  try {
    log.stage('auth_start');
    const session = await getSession();
    const isAdmin = !!(session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()));
    log.stage('auth_done', { user: maskId(session?.email), isAdmin, hasSession: !!session });

    // Require login for data extraction (free guests can't use this)
    if (!session && !isAdmin) {
      log.done(401, { reason: 'login_required' });
      return NextResponse.json({ error: 'Login required for data extraction' }, { status: 401 });
    }

    const { articles } = await request.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      log.done(400, { reason: 'missing_articles', got: typeof articles });
      return NextResponse.json({ error: 'Missing articles' }, { status: 400 });
    }
    log.stage('body_parsed', { articleCount: articles.length });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      log.error('gemini_key_missing');
      log.done(502, { reason: 'no_api_key' });
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    // Split all articles into batches of 20 and process in parallel
    const BATCH_SIZE = 20;
    const batches: typeof articles[] = [];
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      batches.push(articles.slice(i, i + BATCH_SIZE));
    }
    log.stage('batches_prepared', { batchCount: batches.length, batchSize: BATCH_SIZE });

    let successfulBatches = 0;
    let failedBatches = 0;
    const batchPromises = batches.map(async (batch, idx) => {
      const text = batch
        .map((a: { pmid: string; title: string; abstract: string }, i: number) =>
          `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nAbstract: ${a.abstract.slice(0, 800)}`
        )
        .join('\n\n---\n\n');

      try {
        const raw = await callGeminiBatch(text, geminiKey);
        // Parse JSON array from response
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) {
          log.warn('batch_no_json_match', { batchIdx: idx, rawPreview: raw.slice(0, 120) });
          failedBatches++;
          return [];
        }
        try {
          const parsed = JSON.parse(match[0]);
          if (!Array.isArray(parsed)) {
            log.warn('batch_not_array', { batchIdx: idx });
            failedBatches++;
            return [];
          }
          successfulBatches++;
          return parsed;
        } catch (parseErr) {
          log.warn('batch_parse_failed', {
            batchIdx: idx,
            errMessage: parseErr instanceof Error ? parseErr.message : String(parseErr),
            rawPreview: match[0].slice(0, 120),
          });
          failedBatches++;
          return [];
        }
      } catch (err) {
        log.warn('batch_gemini_failed', {
          batchIdx: idx,
          errName: err instanceof Error ? err.name : 'unknown',
          errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
        });
        failedBatches++;
        return [];
      }
    });

    // Run all batches in parallel (Gemini handles each within timeout)
    log.stage('batches_dispatched');
    const batchResults = await Promise.all(batchPromises);
    const combined = batchResults.flat();
    log.stage('batches_complete', {
      successfulBatches,
      failedBatches,
      extractedCount: combined.length,
    });

    log.done(200, { extractedCount: combined.length, totalArticles: articles.length });
    return NextResponse.json({ data: combined });
  } catch (err) {
    log.error('extract_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'Extraction failed' }, { status: 502 });
  }
}
