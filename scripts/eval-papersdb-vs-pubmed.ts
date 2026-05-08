#!/usr/bin/env npx tsx
/**
 * Quality comparison: PubMed-only vs papers.db (11M papers)
 *
 * For each test query:
 * 1. Fetch abstracts from PubMed API (production path)
 * 2. Fetch same PMIDs + full text from papers.db (enhanced path)
 * 3. Synthesize both with identical prompt
 * 4. Score both on detailed rubric
 * 5. Compare
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/eval-papersdb-vs-pubmed.ts
 */

import Database from 'better-sqlite3';

const DB_PATH = process.env.PAPERS_DB_PATH || 'D:/HemoChat/data/papers.db';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) { console.error('GEMINI_API_KEY required'); process.exit(1); }

// ── Test queries ──
const QUERIES = [
  { id: 'statin-cv', q: 'statin cardiovascular mortality LDL', topic: 'Cardiology' },
  { id: 'metformin-t2d', q: 'metformin insulin type 2 diabetes HbA1c', topic: 'Endocrinology' },
  { id: 'ssri-depression', q: 'sertraline fluoxetine depression SSRI efficacy', topic: 'Psychiatry' },
];

// ── Scoring rubric (0-100) ──
interface ScoreCard {
  structure: number;       // 0-15: numbered points, bold headers, 3-5 sentences each
  pmidAccuracy: number;    // 0-15: real PMIDs (7-8 digit), no fakes, no brackets
  dataDensity: number;     // 0-20: effect sizes, CIs, p-values, N=, OR/HR/RR
  clinicalDepth: number;   // 0-15: guideline hierarchy, subgroup analysis, safety
  evidenceGrading: number; // 0-10: distinguishes RCT vs observational, meta-analysis weight
  dataCompleteness: number;// 0-15: numbers from abstracts actually extracted (not paraphrased)
  hedgingLanguage: number; // 0-10: appropriate uncertainty ("suggests", "appears to")
  total: number;
}

function scoreOutput(output: string, abstractTexts: string[]): ScoreCard {
  if (!output || output.length < 50) {
    return { structure: 0, pmidAccuracy: 0, dataDensity: 0, clinicalDepth: 0, evidenceGrading: 0, dataCompleteness: 0, hedgingLanguage: 0, total: 0 };
  }

  // Structure (0-15)
  const headers = (output.match(/\*\*\d+\./g) || []).length;
  const lines = output.split('\n').filter(l => l.trim()).length;
  const avgSentencesPerFinding = output.split(/\*\*\d+\./).filter(s => s.trim()).map(s => s.split(/[.!?]\s/).length);
  const goodLength = avgSentencesPerFinding.filter(n => n >= 3 && n <= 6).length;
  let structure = Math.min(5, headers * 1) + Math.min(5, Math.floor(lines / 3)) + Math.min(5, goodLength * 2);

  // PMID accuracy (0-15)
  const realPmids = (output.match(/PMID[:\s]*\d{7,8}/gi) || []).length;
  const fakePmids = (output.match(/PMID[:\s]*\d{1,5}(?!\d)/gi) || []).length;
  const bracketRefs = (output.match(/\[\d+\]/g) || []).length;
  let pmidAccuracy = Math.min(10, realPmids * 2) + (fakePmids === 0 ? 3 : 0) + (bracketRefs === 0 ? 2 : 0);

  // Data density (0-20)
  const cis = (output.match(/95%\s*CI/gi) || []).length;
  const pvals = (output.match(/p\s*[<=<]\s*0\.\d+/gi) || []).length;
  const ns = (output.match(/N\s*[=:]\s*[\d,]+/gi) || []).length;
  const effectSizes = (output.match(/\b(OR|RR|HR|SMD|MD)\s*[=:≈]?\s*\d/gi) || []).length;
  const percentages = (output.match(/\d+\.?\d*%/g) || []).length;
  let dataDensity = Math.min(5, cis * 1.5) + Math.min(5, pvals * 2) + Math.min(4, ns * 2) + Math.min(3, effectSizes * 1.5) + Math.min(3, percentages * 0.5);

  // Clinical depth (0-15)
  const guidelineWords = (output.match(/\b(guideline|recommendation|first-line|consensus|standard of care)\b/gi) || []).length;
  const subgroupWords = (output.match(/\b(subgroup|elderly|pediatric|youth|children|women|men|age|renal|hepatic|obese)\b/gi) || []).length;
  const safetyWords = (output.match(/\b(adverse|safety|side effect|toxicity|discontinuation|mortality|bleeding|hypoglycemia)\b/gi) || []).length;
  let clinicalDepth = Math.min(5, guidelineWords * 2) + Math.min(5, subgroupWords * 1) + Math.min(5, safetyWords * 1);

  // Evidence grading (0-10)
  const evidenceWords = (output.match(/\b(meta-analysis|systematic review|RCT|randomized|cohort|observational|case-control)\b/gi) || []).length;
  const studyCounts = (output.match(/\d+\s*(studies|trials|RCTs)/gi) || []).length;
  let evidenceGrading = Math.min(6, evidenceWords * 1.5) + Math.min(4, studyCounts * 2);

  // Data completeness (0-15) — how many numbers from abstracts made it into output
  const abstractNumbers = new Set<string>();
  for (const abs of abstractTexts) {
    const nums = abs.match(/\d+\.?\d*/g) || [];
    nums.filter(n => parseFloat(n) > 0.001 && parseFloat(n) < 100000).forEach(n => abstractNumbers.add(n));
  }
  let matchCount = 0;
  for (const n of abstractNumbers) {
    if (output.includes(n)) matchCount++;
  }
  const completenessRatio = abstractNumbers.size > 0 ? matchCount / Math.min(abstractNumbers.size, 30) : 0;
  let dataCompleteness = Math.round(completenessRatio * 15);

  // Hedging language (0-10)
  const hedges = (output.match(/\b(suggests?|appears? to|evidence indicates|may|likely|appears)\b/gi) || []).length;
  const overstated = (output.match(/\b(proves?|definitively|certainly|always|never)\b/gi) || []).length;
  let hedgingLanguage = Math.min(7, hedges * 2) + (overstated === 0 ? 3 : 0);

  // Clamp
  structure = Math.min(15, Math.round(structure));
  pmidAccuracy = Math.min(15, Math.round(pmidAccuracy));
  dataDensity = Math.min(20, Math.round(dataDensity));
  clinicalDepth = Math.min(15, Math.round(clinicalDepth));
  evidenceGrading = Math.min(10, Math.round(evidenceGrading));
  dataCompleteness = Math.min(15, Math.round(dataCompleteness));
  hedgingLanguage = Math.min(10, Math.round(hedgingLanguage));

  const total = structure + pmidAccuracy + dataDensity + clinicalDepth + evidenceGrading + dataCompleteness + hedgingLanguage;

  return { structure, pmidAccuracy, dataDensity, clinicalDepth, evidenceGrading, dataCompleteness, hedgingLanguage, total };
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── PubMed fetch ──
async function fetchPubMed(query: string): Promise<{ pmid: string; title: string; abstract: string; journal: string; year: string }[]> {
  const esearch = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=8&sort=relevance&term=${encodeURIComponent(query)}`);
  const ids = ((await esearch.json()) as any).esearchresult?.idlist || [];
  if (ids.length === 0) return [];

  await sleep(500);
  const xml = await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}`)).text();

  return xml.split('<PubmedArticle>').slice(1).map(block => {
    const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
    const title = (block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] || '').replace(/<[^>]+>/g, '');
    const abs = (block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g) || []).map(p => p.replace(/<[^>]*>/g, '')).join(' ');
    const journal = block.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] || '';
    const year = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';
    return { pmid, title, abstract: abs, journal, year };
  }).filter(a => a.abstract);
}

// ── Papers.db fetch ──
function fetchFromPapersDb(pmids: string[], db: any): { pmid: string; title: string; abstract: string; journal: string; year: string; fullText: string; hasFullText: boolean }[] {
  const stmt = db.prepare(`
    SELECT pmid, title, authors, journal, year, abstract, full_text
    FROM papers
    WHERE pmid IN (SELECT value FROM json_each(?))
  `);
  const rows = stmt.all(JSON.stringify(pmids));
  return rows.map((r: any) => ({
    pmid: r.pmid,
    title: r.title || '',
    abstract: r.abstract || '',
    journal: r.journal || '',
    year: r.year || '',
    fullText: r.full_text || '',
    hasFullText: !!(r.full_text && r.full_text.length > 100),
  }));
}

// ── Gemini call ──
async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY! });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: 'You are a medical research analyst. Output ONLY your final structured answer.',
          temperature: 0.2,
          maxOutputTokens: 8000,
        },
      });
      const text = response.text?.trim() ?? '';
      if (text) return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('503') && attempt < 3) { console.log(`  [retry ${attempt}] 503`); await sleep(5000); continue; }
      throw err;
    }
  }
  return '';
}

// ── Build prompts ──
function buildPrompt(articles: { pmid: string; title: string; abstract: string; journal: string; year: string; fullText?: string }[], useFullText: boolean): string {
  const header = `Synthesize these PubMed abstracts into exactly 5 key findings.

Format each finding as: **N. Title** — detailed conclusion with specific data, statistics, and (PMIDs).

Rules:
- Each finding MUST be 3-5 sentences with dense quantitative data
- MANDATORY: (a) effect size (b) p-value as p<0.001 (c) sample size as N=X
- Cite PMIDs using ACTUAL 7-8 digit numbers from the abstracts. NEVER invent a PMID.
- Use hedging language ("suggests", "appears to")

--- ABSTRACTS ---

`;
  const body = articles.map((a, i) => {
    let entry = `[${i + 1}] PMID: ${a.pmid}\nTitle: ${a.title}\nJournal: ${a.journal} (${a.year})\nAbstract: ${a.abstract.slice(0, 1000)}`;
    if (useFullText && a.fullText) {
      entry += `\nFullText (truncated): ${a.fullText.slice(0, 3000)}`;
    }
    return entry;
  }).join('\n\n---\n\n');

  return header + body;
}

// ── Main ──
async function main() {
  console.log('Opening papers.db...');
  let db: any;
  try {
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    db.pragma('journal_mode = WAL');
    const { c: totalPapers } = db.prepare('SELECT COUNT(*) AS c FROM papers').get() as any;
    console.log(`papers.db: ${(totalPapers / 1_000_000).toFixed(1)}M papers\n`);
  } catch (err) {
    console.error('Cannot open papers.db:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║    PubMed-Only vs Papers.db Quality Comparison          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const results: { id: string; pubmed: ScoreCard; papersdb: ScoreCard; delta: number }[] = [];

  for (const query of QUERIES) {
    console.log(`━━━ ${query.id} (${query.topic}) ━━━\n`);

    // Step 1: Fetch from PubMed
    console.log('  [1] Fetching PubMed...');
    const pubmedArticles = await fetchPubMed(query.q);
    console.log(`      ${pubmedArticles.length} articles`);

    if (pubmedArticles.length === 0) {
      console.log('      SKIP — no results\n');
      continue;
    }

    // Step 2: Fetch same PMIDs from papers.db + full text
    const pmids = pubmedArticles.map(a => a.pmid);
    console.log('  [2] Looking up papers.db...');
    const dbArticles = fetchFromPapersDb(pmids, db);
    const fullTextCount = dbArticles.filter(a => a.hasFullText).length;
    console.log(`      ${dbArticles.length} found, ${fullTextCount} with full text`);

    // Merge: use PubMed articles but enrich with full text from db
    const enrichedArticles = pubmedArticles.map(pa => {
      const dbMatch = dbArticles.find(da => da.pmid === pa.pmid);
      return { ...pa, fullText: dbMatch?.fullText || '' };
    });

    // Step 3: Synthesize PubMed-only
    console.log('  [3] Synthesis A: PubMed-only...');
    const promptA = buildPrompt(pubmedArticles, false);
    const outputA = await callGemini(promptA);
    console.log(`      ${outputA.length} chars`);

    await sleep(2000);

    // Step 4: Synthesize with full text
    console.log('  [4] Synthesis B: PubMed + papers.db full text...');
    const promptB = buildPrompt(enrichedArticles, true);
    const outputB = await callGemini(promptB);
    console.log(`      ${outputB.length} chars`);

    // Step 5: Score both
    const absTexts = pubmedArticles.map(a => a.abstract);
    const scoreA = scoreOutput(outputA, absTexts);
    const scoreB = scoreOutput(outputB, absTexts.concat(enrichedArticles.filter(a => a.fullText).map(a => a.fullText)));

    results.push({ id: query.id, pubmed: scoreA, papersdb: scoreB, delta: scoreB.total - scoreA.total });

    console.log('\n  ┌─────────────────────┬─────────────┬──────────────┐');
    console.log('  │ Dimension           │ PubMed-Only │ + Papers.db  │');
    console.log('  ├─────────────────────┼─────────────┼──────────────┤');
    for (const dim of ['structure', 'pmidAccuracy', 'dataDensity', 'clinicalDepth', 'evidenceGrading', 'dataCompleteness', 'hedgingLanguage', 'total'] as const) {
      const maxVal = dim === 'total' ? 100 : dim === 'dataDensity' ? 20 : dim === 'structure' || dim === 'pmidAccuracy' || dim === 'clinicalDepth' || dim === 'dataCompleteness' ? 15 : 10;
      const a = String(scoreA[dim]).padStart(3);
      const b = String(scoreB[dim]).padStart(3);
      const d = scoreB[dim] - scoreA[dim];
      const delta = d > 0 ? `+${d}` : d === 0 ? ' 0' : String(d);
      const bar = dim === 'total' ? ' ★' : '';
      console.log(`  │ ${dim.padEnd(19)} │   ${a}/${maxVal.toString().padStart(3)}   │   ${b}/${maxVal.toString().padStart(3)} ${delta.padStart(3)}${bar} │`);
    }
    console.log('  └─────────────────────┴─────────────┴──────────────┘\n');

    await sleep(2000);
  }

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('  AGGREGATE COMPARISON');
  console.log('═══════════════════════════════════════════');
  const avgPubmed = Math.round(results.reduce((s, r) => s + r.pubmed.total, 0) / results.length);
  const avgPapersdb = Math.round(results.reduce((s, r) => s + r.papersdb.total, 0) / results.length);
  const avgDelta = avgPapersdb - avgPubmed;
  console.log(`  PubMed-Only avg: ${avgPubmed}/100`);
  console.log(`  + Papers.db avg: ${avgPapersdb}/100`);
  console.log(`  Delta:           ${avgDelta >= 0 ? '+' : ''}${avgDelta}`);
  console.log(`  Winner:          ${avgDelta > 0 ? 'Papers.db' : avgDelta < 0 ? 'PubMed-Only' : 'Tie'}`);
  console.log('');

  db.close();
}

main().catch(e => console.error('FATAL:', e.message));
