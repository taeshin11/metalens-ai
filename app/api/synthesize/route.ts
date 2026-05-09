import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { TIER_CONFIG } from '@/lib/constants';
import { trackUsage } from '@/lib/usage-tracker';
import { ADMIN_EMAILS } from '@/lib/admin';
import { createLogger, maskId } from '@/lib/logger';
import { callGeminiWithFallback } from '@/lib/gemini';
import type { Tier } from '@/lib/constants';

export const maxDuration = 60;

// ── Step 1: Extract structured data from each abstract ──
const EXTRACT_SYSTEM = 'You are a medical data extractor. Output ONLY valid JSON. No markdown, no explanation.';

const EXTRACT_PROMPT = `For each abstract below, extract a JSON object with these fields:
- pmid (string)
- design (string): "meta-analysis", "systematic-review", "RCT", "cohort", "case-control", "cross-sectional", "case-report", or "review"
- mainEffect (string): the primary quantitative result, e.g. "HR 0.78" or "reduced HbA1c by 1.2%"
- ci (string or null): confidence interval, e.g. "95% CI: 0.69-0.89"
- pValue (string or null): e.g. "p<0.001"
- sampleSize (string or null): e.g. "N=90,056" or "14 RCTs"
- population (string): who was studied, e.g. "adults with T2DM" or "post-MI patients"
- safety (string or null): adverse effects mentioned
- keyNumbers (string[]): ALL other numbers/statistics from the abstract (max 5)

Return a JSON array. Extract EVERY number — do not skip any statistic.

ABSTRACTS:
`;

// ── Step 2: Synthesize from structured data ──
const SYNTH_SYSTEM = 'You are a medical research analyst. Output ONLY your final structured answer.';

function buildSynthPrompt(extractedData: string, originalPrompt: string): string {
  return `You have two data sources for synthesis:

1. STRUCTURED DATA (extracted statistics — use these as your primary number source):
${extractedData}

2. ORIGINAL ABSTRACTS (for context and narrative):
${originalPrompt.split('--- ABSTRACTS ---')[1] || ''}

Synthesize into exactly 5 key findings using the STRUCTURED DATA numbers.
Every finding MUST include the exact numbers from the structured data — do not paraphrase.

Format: **N. Title** — 3-5 sentences with dense data. Include (PMID: XXXXXXXX) citations.

RULES:
- Pull effect sizes, CIs, p-values, and N= directly from the structured data
- Every finding must have: effect size + p-value + N=
- Order by clinical importance: guidelines > meta-analyses > RCTs > observational
- Include at least one safety/adverse effects finding
- Include at least one subgroup finding if data exists
- Use hedging language ("suggests", "appears to")
- NEVER invent numbers — only use what appears in the structured data
- PMID: use ONLY real 7-8 digit PMIDs from the data`;
}

// ── Step 3: Self-validation prompt ──
const VALIDATE_PROMPT = `Review this medical synthesis for errors. Check:
1. Are all cited PMIDs real 7-8 digit numbers? Flag any that look fake (1-5 digits).
2. Are any statistics inconsistent (e.g., HR > 10, p-value > 1, impossible CI)?
3. Are any claims missing their source PMID?
4. Are numbers vaguely paraphrased instead of exact (e.g., "significantly reduced" instead of "HR 0.78")?

If you find errors, output a CORRECTED version of the synthesis.
If no errors, output the synthesis unchanged.
Output ONLY the final synthesis text, nothing else.

SYNTHESIS TO REVIEW:
`;

export async function POST(request: NextRequest) {
  const log = createLogger('api/synthesize');
  log.start();

  try {
    log.stage('auth_start');
    const session = await getSession();
    const isAdmin = !!(session?.email && ADMIN_EMAILS.includes(session.email.toLowerCase()));
    const tier: Tier = isAdmin ? 'pro' : (session?.tier || 'free');
    const identifier = session?.email || request.headers.get('x-forwarded-for') || 'anon';
    log.stage('auth_done', { user: maskId(session?.email), tier, isAdmin });

    let remaining = 999;
    if (!isAdmin) {
      const rl = await checkRateLimit(identifier, tier, log);
      if (!rl.allowed) {
        const errorMsg = tier === 'free'
          ? 'Free usage limit reached. Upgrade to Pro for more analyses.'
          : 'Daily limit reached. Resets at midnight UTC.';
        log.done(429, { reason: 'rate_limited', tier });
        return NextResponse.json({ error: errorMsg, limit: rl.limit, tier }, { status: 429 });
      }
      remaining = rl.remaining;
    }

    const { prompt } = await request.json();
    if (!prompt) {
      log.done(400, { reason: 'missing_prompt' });
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    log.stage('body_parsed', { promptLen: prompt.length });

    const tierModel = TIER_CONFIG[tier].model;
    const isPro = tier === 'pro' || isAdmin;

    // ════════════════════════════════════════════
    // HARNESS PIPELINE (Pro) vs SINGLE-SHOT (Free)
    // ════════════════════════════════════════════

    let bestResult = '';
    let degraded = false;

    if (isPro) {
      // ── Pro: 3-step harness pipeline ──
      log.stage('harness_start', { mode: '3-step' });

      // Step 1: Extract structured data
      log.stage('step1_extract_start');
      const abstracts = prompt.split('--- ABSTRACTS ---')[1] || '';
      const extractResult = await callGeminiWithFallback({
        prompt: EXTRACT_PROMPT + abstracts,
        systemInstruction: EXTRACT_SYSTEM,
        temperature: 0.1,
        maxOutputTokens: 4000,
        model: tierModel,
        log,
      });

      if (!extractResult) {
        log.warn('step1_extract_failed_fallback_single_shot');
        // Fallback to single-shot
        bestResult = await singleShot(prompt, tierModel, log);
      } else {
        log.stage('step1_extract_done', { chars: extractResult.length });

        // Step 2: Synthesize from structured data
        log.stage('step2_synthesize_start');
        const synthPrompt = buildSynthPrompt(extractResult, prompt);
        const synthResult = await callGeminiWithFallback({
          prompt: synthPrompt,
          systemInstruction: SYNTH_SYSTEM,
          temperature: 0.2,
          maxOutputTokens: 8000,
          model: tierModel,
          log,
        });

        if (!synthResult) {
          log.warn('step2_synthesize_failed_fallback_single_shot');
          bestResult = await singleShot(prompt, tierModel, log);
        } else {
          log.stage('step2_synthesize_done', { chars: synthResult.length });

          // Step 3: Self-validation (only if time budget allows)
          const elapsed = log.id; // just use as proxy — real check below
          log.stage('step3_validate_start');
          const validated = await callGeminiWithFallback({
            prompt: VALIDATE_PROMPT + synthResult,
            systemInstruction: SYNTH_SYSTEM,
            temperature: 0.1,
            maxOutputTokens: 8000,
            model: tierModel,
            log,
          });

          bestResult = validated || synthResult;
          log.stage('step3_validate_done', {
            chars: bestResult.length,
            changed: validated !== synthResult,
          });
        }
      }

      log.stage('harness_done', { chars: bestResult.length });
    } else {
      // ── Free: single-shot with retry ──
      log.stage('single_shot_start');
      bestResult = await singleShot(prompt, tierModel, log);
    }

    if (!bestResult) {
      log.error('synthesize_all_failed');
      log.done(502, { reason: 'ai_failed' });
      return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
    }

    // ── Post-processing ──
    bestResult = bestResult.replace(/\(PMID[:\s]*(\d{7,8}),?\s*\d{1,3}\)/gi, '(PMID: $1)');
    const fakePmids = (bestResult.match(/PMID[:\s]*\d{1,5}(?!\d)/gi) || []).length;
    if (fakePmids > 0) {
      bestResult = bestResult.replace(/\(PMID[:\s]*\d{1,5}(?!\d)\)/gi, '[citation needed]');
      log.warn('fake_pmids_stripped', { count: fakePmids });
    }

    // Quality scoring
    const quality = scoreResult(bestResult);
    if (quality.flags.length >= 3) {
      degraded = true;
      log.warn('result_quality_degraded', { ...quality, degraded: true });
    }
    log.stage('result_quality', quality);

    trackUsage(identifier, tier, tierModel);
    log.done(200, { tier, resultBytes: bestResult.length, remaining, score: quality.score, degraded, pipeline: isPro ? 'harness' : 'single-shot' });
    return NextResponse.json({ result: bestResult, remaining, degraded });
  } catch (err) {
    log.error('synthesize_handler_crashed', err);
    log.done(502, { reason: 'unexpected_error' });
    return NextResponse.json({ error: 'AI synthesis failed. Please try again.' }, { status: 502 });
  }
}

// ── Single-shot with retry (for Free tier) ──
async function singleShot(prompt: string, model: string, log: any): Promise<string> {
  const MAX_ATTEMPTS = 2;
  let bestResult = '';
  let bestScore = -1;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await callGeminiWithFallback({
      prompt,
      systemInstruction: SYNTH_SYSTEM,
      temperature: 0.2,
      maxOutputTokens: 8000,
      model,
      log,
    });

    if (!result) continue;

    const q = scoreResult(result);
    if (q.score > bestScore) {
      bestResult = result;
      bestScore = q.score;
    }

    const isGarbage = q.boldHeaders < 1 || result.length < 100 || q.fakePmids > 0;
    if (!isGarbage) break;

    log.warn('single_shot_retry', { attempt, ...q });
  }

  return bestResult;
}

// ── Scoring helper ──
function scoreResult(result: string) {
  const boldHeaders = (result.match(/\*\*\d+\./g) || []).length;
  const realPmids = (result.match(/PMID[:\s]*\d{7,8}/gi) || []).length;
  const fakePmids = (result.match(/PMID[:\s]*\d{1,5}(?!\d)/gi) || []).length;
  const numberCount = (result.match(/\d+\.?\d*%/g) || []).length;
  const ciCount = (result.match(/95%\s*CI/gi) || []).length;
  const pValCount = (result.match(/p\s*[<=<]\s*0\.\d+/gi) || []).length;
  const nCount = (result.match(/N\s*[=:]\s*[\d,]+/gi) || []).length;
  const score = boldHeaders * 10 + realPmids * 5 + numberCount * 3 + ciCount * 3 + pValCount * 5 + nCount * 3 - fakePmids * 20;

  const flags: string[] = [];
  if (boldHeaders < 2) flags.push('low_headers');
  if (realPmids < 2) flags.push('low_pmids');
  if (result.length < 200) flags.push('short_result');
  if (numberCount < 1) flags.push('no_numbers');
  if (fakePmids > 0) flags.push('had_fake_pmids');

  return { score: Math.round(score), boldHeaders, realPmids, fakePmids, numberCount, ciCount, pValCount, nCount, flags, resultChars: result.length };
}
