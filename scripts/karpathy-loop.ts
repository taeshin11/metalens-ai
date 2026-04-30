#!/usr/bin/env npx tsx
/**
 * Karpathy Loop — automated prompt optimization.
 *
 * Cycle:
 *   1. Propose a prompt mutation
 *   2. Run eval with the mutated prompt
 *   3. If score improves → write to constants.ts + commit
 *   4. If not → revert
 *   5. Repeat
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/karpathy-loop.ts [--rounds N] [--dry-run]
 *
 * The loop uses Gemini itself to propose prompt improvements,
 * creating a self-improving feedback loop.
 */

import { TEST_CASES, scoreOutput, type ScoreBreakdown, type TestCase } from './eval-fixtures';
import * as fs from 'fs';
import * as path from 'path';

const CONSTANTS_PATH = path.resolve(__dirname, '../lib/constants.ts');
const RESULTS_DIR = path.join(__dirname, '.karpathy-results');
const PUBMED_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

// --- PubMed helpers (same as eval) ---

async function searchPubMed(keywords: string): Promise<string[]> {
  const url = `${PUBMED_ESEARCH}?db=pubmed&retmode=json&retmax=10&sort=relevance&term=${encodeURIComponent(keywords)}`;
  const res = await fetch(url);
  const json = await res.json() as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist || [];
}

async function fetchAbstracts(pmids: string[]): Promise<string> {
  const url = `${PUBMED_EFETCH}?db=pubmed&retmode=xml&id=${pmids.join(',')}`;
  return (await fetch(url)).text();
}

function parseAbstracts(xml: string): { pmid: string; title: string; abstract: string; journal: string; year: string }[] {
  const articles: { pmid: string; title: string; abstract: string; journal: string; year: string }[] = [];
  for (const block of xml.split('<PubmedArticle>').slice(1)) {
    const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
    const title = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, '') || '';
    const abstractParts = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    const abstract = abstractParts ? abstractParts.map(p => p.replace(/<[^>]*>/g, '')).join(' ') : '';
    const journal = block.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] || '';
    const year = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';
    if (pmid && abstract) articles.push({ pmid, title, abstract, journal, year });
  }
  return articles;
}

// --- Gemini ---

async function callGemini(prompt: string, systemInstruction: string, temperature = 0.2): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction, temperature, maxOutputTokens: 8000 },
  });
  return response.text?.trim() ?? '';
}

// --- Prompt mutation via Gemini ---

async function proposePromptMutation(currentPrompt: string, scores: ScoreBreakdown, mode: string): Promise<string> {
  const weakest = Object.entries({
    structure: scores.structure,
    dataDensity: scores.dataDensity,
    citations: scores.citations,
    relevance: scores.relevance,
  }).sort((a, b) => a[1] - b[1])[0];

  const mutationPrompt = `You are a prompt engineer optimizing a medical research AI prompt.

Current prompt (for ${mode}):
---
${currentPrompt}
---

Current eval scores (each out of 25):
- Structure: ${scores.structure} (numbered points, bold headers, proper format)
- Data Density: ${scores.dataDensity} (numbers, percentages, p-values, CIs in output)
- Citations: ${scores.citations} (PMID references present)
- Relevance: ${scores.relevance} (topical accuracy)

Weakest dimension: ${weakest[0]} (${weakest[1]}/25)

TASK: Output an IMPROVED version of the prompt that specifically targets the weakest dimension.

Rules:
- Keep the same overall structure and intent
- Make targeted, specific changes (not wholesale rewrites)
- Add or strengthen instructions that would improve the weak dimension
- The prompt must still contain {pointCount} placeholder
- Output ONLY the improved prompt text, nothing else
- No markdown code blocks, no explanation`;

  return callGemini(mutationPrompt, 'You are a prompt optimization expert.', 0.4);
}

// --- Eval runner ---

interface ArticleCache {
  [keywords: string]: { pmid: string; title: string; abstract: string; journal: string; year: string }[];
}

async function evalPrompt(
  prompt: string,
  testCases: TestCase[],
  mode: 'meta-analysis' | 'gap-finder',
  articleCache: ArticleCache,
): Promise<{ avgScore: number; breakdown: ScoreBreakdown; perCase: { id: string; score: ScoreBreakdown }[] }> {
  const cases = testCases.filter(tc => tc.mode === mode);
  const perCase: { id: string; score: ScoreBreakdown }[] = [];

  for (const tc of cases) {
    // Fetch articles (cached)
    if (!articleCache[tc.keywords]) {
      const pmids = await searchPubMed(tc.keywords);
      const xml = await fetchAbstracts(pmids);
      articleCache[tc.keywords] = parseAbstracts(xml);
    }
    const articles = articleCache[tc.keywords];
    if (articles.length === 0) continue;

    const pointCount = mode === 'gap-finder' ? 7 : 5;
    const systemPrompt = prompt.replace(/{pointCount}/g, String(pointCount));
    const abstractsText = articles.map((a, i) =>
      `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract}`
    ).join('\n\n---\n\n');

    const fullPrompt = `${systemPrompt}\n\n--- ABSTRACTS ---\n\n${abstractsText}`;

    try {
      const output = await callGemini(fullPrompt, 'You are a medical research analyst. Output ONLY your final structured answer.');
      const score = scoreOutput(output, tc);
      perCase.push({ id: tc.id, score });
      console.log(`    ${tc.id}: ${score.total}/100`);
    } catch (err) {
      console.error(`    ${tc.id}: error — ${err instanceof Error ? err.message : err}`);
      perCase.push({ id: tc.id, score: { structure: 0, dataDensity: 0, citations: 0, relevance: 0, total: 0 } });
    }
  }

  const avg = (key: keyof ScoreBreakdown) => perCase.length ? perCase.reduce((s, r) => s + r.score[key], 0) / perCase.length : 0;
  const breakdown: ScoreBreakdown = {
    structure: avg('structure'),
    dataDensity: avg('dataDensity'),
    citations: avg('citations'),
    relevance: avg('relevance'),
    total: avg('total'),
  };

  return { avgScore: breakdown.total, breakdown, perCase };
}

// --- Constants.ts updater ---

function readCurrentPrompt(mode: 'meta-analysis' | 'gap-finder'): string {
  const src = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const varName = mode === 'gap-finder' ? 'GAP_FINDER_PROMPT' : 'META_ANALYSIS_PROMPT';
  const match = src.match(new RegExp(`export const ${varName} = \`([\\s\\S]*?)\`;`));
  return match?.[1] || '';
}

function writePrompt(mode: 'meta-analysis' | 'gap-finder', newPrompt: string, dryRun: boolean): boolean {
  if (dryRun) {
    console.log(`  [dry-run] would write ${mode} prompt (${newPrompt.length} chars)`);
    return true;
  }
  const src = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const varName = mode === 'gap-finder' ? 'GAP_FINDER_PROMPT' : 'META_ANALYSIS_PROMPT';
  const regex = new RegExp(`(export const ${varName} = \`)([\\s\\S]*?)(\`;)`);
  if (!regex.test(src)) {
    console.error(`  [error] could not find ${varName} in constants.ts`);
    return false;
  }
  const updated = src.replace(regex, `$1${newPrompt}$3`);
  fs.writeFileSync(CONSTANTS_PATH, updated);
  return true;
}

// --- Main loop ---

async function main() {
  const args = process.argv.slice(2);
  const rounds = parseInt(args.find(a => a.startsWith('--rounds'))?.split('=')[1] || args[args.indexOf('--rounds') + 1] || '3', 10);
  const dryRun = args.includes('--dry-run');

  console.log(`\n=== Karpathy Loop ===`);
  console.log(`Rounds: ${rounds} | Dry run: ${dryRun}\n`);

  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const articleCache: ArticleCache = {};

  for (const mode of ['meta-analysis', 'gap-finder'] as const) {
    console.log(`\n--- Optimizing: ${mode} ---\n`);

    let currentPrompt = readCurrentPrompt(mode);
    if (!currentPrompt) {
      console.error(`Could not read ${mode} prompt from constants.ts`);
      continue;
    }

    // Baseline eval
    console.log('  [baseline] evaluating current prompt...');
    const baseline = await evalPrompt(currentPrompt, TEST_CASES, mode, articleCache);
    console.log(`  [baseline] score: ${baseline.avgScore.toFixed(1)}/100\n`);

    let bestScore = baseline.avgScore;
    let bestPrompt = currentPrompt;

    for (let round = 1; round <= rounds; round++) {
      console.log(`  [round ${round}/${rounds}] proposing mutation...`);

      // Propose
      const mutated = await proposePromptMutation(bestPrompt, baseline.breakdown, mode);
      if (!mutated || mutated.length < 100) {
        console.log(`  [round ${round}] mutation too short, skipping`);
        continue;
      }

      // Eval
      console.log(`  [round ${round}] evaluating mutation...`);
      const result = await evalPrompt(mutated, TEST_CASES, mode, articleCache);
      const delta = result.avgScore - bestScore;

      console.log(`  [round ${round}] score: ${result.avgScore.toFixed(1)}/100 (delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)})`);

      if (delta > 0) {
        console.log(`  [round ${round}] ✓ IMPROVEMENT — adopting mutation`);
        bestScore = result.avgScore;
        bestPrompt = mutated;
      } else {
        console.log(`  [round ${round}] ✗ no improvement — reverting`);
      }

      // Save round result
      const roundResult = {
        round,
        mode,
        score: result.avgScore,
        delta,
        adopted: delta > 0,
        prompt: mutated.slice(0, 200) + '...',
        breakdown: result.breakdown,
      };
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${mode}_round_${round}.json`),
        JSON.stringify(roundResult, null, 2),
      );
    }

    // Write best prompt if improved
    if (bestScore > baseline.avgScore) {
      console.log(`\n  [${mode}] Final: ${baseline.avgScore.toFixed(1)} → ${bestScore.toFixed(1)} (+${(bestScore - baseline.avgScore).toFixed(1)})`);
      writePrompt(mode, bestPrompt, dryRun);
    } else {
      console.log(`\n  [${mode}] No improvement found. Keeping current prompt.`);
    }
  }

  console.log('\n=== Loop complete ===\n');
}

main().catch(console.error);
