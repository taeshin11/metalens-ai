#!/usr/bin/env npx tsx
/**
 * Eval harness — runs test cases against current prompts and scores output.
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/eval-prompts.ts
 *   GEMINI_API_KEY=... npx tsx scripts/eval-prompts.ts --cache   # use cached results
 *
 * Output: per-case scores + aggregate score (0-100).
 * Results cached to scripts/.eval-cache/ for reruns.
 */

import { TEST_CASES, scoreOutput, type ScoreBreakdown } from './eval-fixtures';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(__dirname, '.eval-cache');
const PUBMED_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

const META_ANALYSIS_PROMPT = `Synthesize these PubMed abstracts into exactly {pointCount} key findings.

Format each finding as: **N. Title** — detailed conclusion with specific data, statistics, and (PMIDs).

PRIORITY ORDER for findings (most important first):
1) Established guidelines or consensus recommendations — if any abstracts are from practice guidelines, systematic reviews, or consensus statements, their conclusions should come FIRST as they represent the highest level of evidence
2) Key treatment/intervention recommendation — what does the overall evidence suggest as the standard approach?
3) Main comparative finding between the subjects — include effect sizes, odds ratios, or percentages
4) Key quantitative outcomes — specific rates, p-values, confidence intervals, or NNT
5) Important exception or subgroup where the opposite may be true — specify the population or condition
6) Safety concerns or adverse effects — if relevant
7) Limitations of current evidence — gaps, heterogeneity, bias risks

Rules:
- ORDER findings by CLINICAL IMPORTANCE, not by the order the abstracts appear
- Give highest weight to: practice guidelines > systematic reviews/meta-analyses > RCTs > observational studies
- Extract and cite specific numbers from the abstracts (percentages, p-values, sample sizes, effect sizes)
- Cite PMIDs for each claim
- Use hedging language ("suggests", "appears to", "evidence indicates")
- Each finding should be 2-4 sentences with concrete data
- If a guideline or review article contradicts individual studies, note the guideline position first`;

const GAP_FINDER_PROMPT = `You are a research gap analyst. Analyze these PubMed abstracts to help a researcher determine if their research idea is novel.

Your output should have exactly {pointCount} sections, formatted as **N. Section Title** — content.

REQUIRED SECTIONS (in this order):
1) **Existing Research Landscape** — What study designs exist on this topic? (RCTs, cohort, case-control, meta-analyses, reviews, case reports). List study types with counts and key PMIDs.
2) **Key Findings So Far** — What is already established/known? Summarize the consensus from the literature with specific data.
3) **Research Gaps Identified** — What has NOT been studied? What study designs are MISSING? What populations, outcomes, or comparisons are unexplored? This is the most important section.
4) **Suggested Research Directions** — Based on the gaps, propose 2-3 specific study ideas. Include: study design (RCT, prospective cohort, etc.), target population, primary outcome, estimated sample size if inferrable.
5) **Novelty Assessment** — If the researcher were to conduct a new study on this topic, how novel would it be? Rate as: "Highly Novel" (no similar studies), "Moderately Novel" (few studies, different design needed), or "Low Novelty" (well-studied area, need unique angle).
6) **Similar Existing Studies** — List the most directly relevant existing studies with PMIDs, designs, and sample sizes.
7) **Recommended Next Steps** — What should the researcher do next?

Rules:
- Be specific about what EXISTS vs what DOES NOT EXIST
- Cite PMIDs for every claim about existing studies
- When identifying gaps, explain WHY the gap matters clinically
- If the topic is well-studied, be honest — suggest unique angles instead
- Use evidence hierarchy: systematic reviews > RCTs > cohort > case-control > case series`;

async function searchPubMed(keywords: string): Promise<string[]> {
  const url = `${PUBMED_ESEARCH}?db=pubmed&retmode=json&retmax=10&sort=relevance&term=${encodeURIComponent(keywords)}`;
  const res = await fetch(url);
  const json = await res.json() as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist || [];
}

async function fetchAbstracts(pmids: string[]): Promise<string> {
  if (pmids.length === 0) return '';
  const url = `${PUBMED_EFETCH}?db=pubmed&retmode=xml&id=${pmids.join(',')}`;
  const res = await fetch(url);
  return res.text();
}

function parseAbstracts(xml: string): { pmid: string; title: string; abstract: string; journal: string; year: string }[] {
  const articles: { pmid: string; title: string; abstract: string; journal: string; year: string }[] = [];
  const articleBlocks = xml.split('<PubmedArticle>').slice(1);

  for (const block of articleBlocks) {
    const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
    const title = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, '') || '';
    const abstractParts = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    const abstract = abstractParts
      ? abstractParts.map(p => p.replace(/<[^>]*>/g, '')).join(' ')
      : '';
    const journal = block.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] || '';
    const year = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';

    if (pmid && abstract) {
      articles.push({ pmid, title, abstract, journal, year });
    }
  }
  return articles;
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: 'You are a medical research analyst. Output ONLY your final structured answer.',
      temperature: 0.2,
      maxOutputTokens: 8000,
    },
  });

  return response.text?.trim() ?? '';
}

function getCachePath(id: string): string {
  return path.join(CACHE_DIR, `${id}.json`);
}

interface CachedResult {
  output: string;
  articles: number;
  timestamp: number;
}

async function runTestCase(tc: typeof TEST_CASES[0], useCache: boolean): Promise<{ output: string; score: ScoreBreakdown }> {
  const cachePath = getCachePath(tc.id);

  if (useCache && fs.existsSync(cachePath)) {
    const cached: CachedResult = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    console.log(`  [cache hit] ${tc.id} (${cached.articles} papers)`);
    return { output: cached.output, score: scoreOutput(cached.output, tc) };
  }

  // Search PubMed
  console.log(`  [pubmed] searching: ${tc.keywords}`);
  const pmids = await searchPubMed(tc.keywords);
  if (pmids.length === 0) {
    console.log(`  [skip] no PubMed results for ${tc.id}`);
    return { output: '', score: { structure: 0, dataDensity: 0, citations: 0, relevance: 0, total: 0 } };
  }

  const xml = await fetchAbstracts(pmids);
  const articles = parseAbstracts(xml);
  console.log(`  [pubmed] ${articles.length} articles fetched`);

  // Build prompt
  const pointCount = tc.mode === 'gap-finder' ? 7 : 5;
  const template = tc.mode === 'gap-finder' ? GAP_FINDER_PROMPT : META_ANALYSIS_PROMPT;
  const systemPrompt = template.replace(/{pointCount}/g, String(pointCount));

  const abstractsText = articles.map((a, i) =>
    `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract}`
  ).join('\n\n---\n\n');

  const fullPrompt = `${systemPrompt}\n\n--- ABSTRACTS ---\n\n${abstractsText}`;

  // Call Gemini
  console.log(`  [gemini] calling (${fullPrompt.length} chars)...`);
  const output = await callGemini(fullPrompt);
  console.log(`  [gemini] got ${output.length} chars`);

  // Cache
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cached: CachedResult = { output, articles: articles.length, timestamp: Date.now() };
  fs.writeFileSync(cachePath, JSON.stringify(cached, null, 2));

  return { output, score: scoreOutput(output, tc) };
}

async function main() {
  const useCache = process.argv.includes('--cache');
  console.log(`\n=== MetaLens Prompt Eval ===`);
  console.log(`Mode: ${useCache ? 'cached' : 'live (API calls)'}\n`);

  const results: { id: string; score: ScoreBreakdown }[] = [];

  for (const tc of TEST_CASES) {
    console.log(`[${tc.id}] (${tc.mode})`);
    try {
      const { score } = await runTestCase(tc, useCache);
      results.push({ id: tc.id, score });
      console.log(`  Score: ${score.total}/100 (S:${score.structure} D:${score.dataDensity} C:${score.citations} R:${score.relevance})\n`);
    } catch (err) {
      console.error(`  [error] ${err instanceof Error ? err.message : err}\n`);
      results.push({ id: tc.id, score: { structure: 0, dataDensity: 0, citations: 0, relevance: 0, total: 0 } });
    }
  }

  // Aggregate
  const avgTotal = results.reduce((s, r) => s + r.score.total, 0) / results.length;
  const avgStructure = results.reduce((s, r) => s + r.score.structure, 0) / results.length;
  const avgData = results.reduce((s, r) => s + r.score.dataDensity, 0) / results.length;
  const avgCitations = results.reduce((s, r) => s + r.score.citations, 0) / results.length;
  const avgRelevance = results.reduce((s, r) => s + r.score.relevance, 0) / results.length;

  console.log('=== AGGREGATE ===');
  console.log(`Total:      ${avgTotal.toFixed(1)} / 100`);
  console.log(`Structure:  ${avgStructure.toFixed(1)} / 25`);
  console.log(`Data:       ${avgData.toFixed(1)} / 25`);
  console.log(`Citations:  ${avgCitations.toFixed(1)} / 25`);
  console.log(`Relevance:  ${avgRelevance.toFixed(1)} / 25`);
  console.log('');

  // Write summary
  const summary = {
    timestamp: new Date().toISOString(),
    avgScore: Math.round(avgTotal * 10) / 10,
    breakdown: { structure: avgStructure, dataDensity: avgData, citations: avgCitations, relevance: avgRelevance },
    cases: results,
  };
  const summaryPath = path.join(CACHE_DIR, '_summary.json');
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Summary written to ${summaryPath}`);

  return avgTotal;
}

main().catch(console.error);
