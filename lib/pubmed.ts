import type { RouteLogger } from './logger';
import { fetchPapersBatch, isPapersDbEnabled } from './papers-db';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string;
  doi?: string;
  pubTypes: string[]; // e.g. "Review", "Guideline", "Meta-Analysis", "Randomized Controlled Trial"
  /** Truncated full text from papers.db when available (PMC-linked papers only). */
  fullText?: string;
  /** Whether fullText was truncated for transport size control. */
  fullTextTruncated?: boolean;
  /** Specialty tag from papers.db curation (oncology, cardiology, etc.). */
  specialty?: string;
  /** Where this article's body came from. */
  source?: 'papers-db' | 'pubmed';
}

async function fetchWithRetry(url: string, step: string, retries = 2, log?: RouteLogger): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      // PubMed rate limit (429) or server error — retry
      if (res.status === 429 || res.status >= 500) {
        log?.warn('pubmed_http_retry', { step, status: res.status, attempt: i + 1, retries });
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          continue;
        }
      }
      throw new Error(`PubMed ${step} returned ${res.status}`);
    } catch (err) {
      lastErr = err;
      const isAbort = err instanceof Error && err.name === 'AbortError';
      log?.warn('pubmed_fetch_attempt_failed', {
        step,
        attempt: i + 1,
        retries,
        errName: err instanceof Error ? err.name : 'unknown',
        errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
        timedOut: isAbort,
      });
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`PubMed ${step} request failed after retries`);
}

// Words that hurt PubMed search when used as plain text
const NOISE_WORDS = new Set([
  'vs', 'vs.', 'versus', 'compared', 'comparison', 'meta-analysis', 'meta analysis',
  'metaanalysis', 'systematic review', 'systematic-review', 'efficacy', 'effectiveness',
  'treatment', 'therapy', 'outcomes', 'outcome', 'effect', 'effects', 'study', 'studies',
  'clinical', 'patients', 'analysis', 'review', 'research', 'evidence',
]);

function cleanKeywords(raw: string): string {
  // Split on commas or spaces, remove noise, rejoin
  const tokens = raw
    .split(/[,\s]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0 && !NOISE_WORDS.has(t));

  // If we stripped too much, fall back to original
  if (tokens.length < 2) return raw;
  return tokens.join(' ');
}

async function esearch(term: string, maxResults: number, log?: RouteLogger): Promise<string[]> {
  const url = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const res = await fetchWithRetry(url, 'esearch', 2, log);
  let data;
  try {
    data = await res.json();
  } catch (err) {
    log?.error('pubmed_esearch_json_parse_failed', err, { termPreview: term.slice(0, 60) });
    throw new Error('PubMed esearch returned invalid JSON');
  }
  return data.esearchresult?.idlist || [];
}

export async function searchPubMed(keywords: string, maxResults = 20, log?: RouteLogger): Promise<string[]> {
  // Strategy 1: Try original query
  log?.stage('pubmed_esearch_strategy1_original');
  let ids = await esearch(keywords, maxResults, log);
  if (ids.length >= 3) {
    log?.info('pubmed_esearch_strategy1_hit', { count: ids.length });
    return ids;
  }

  // Strategy 2: Clean noise words and retry
  const cleaned = cleanKeywords(keywords);
  if (cleaned !== keywords.toLowerCase().trim()) {
    log?.stage('pubmed_esearch_strategy2_cleaned', { original: keywords.slice(0, 60), cleaned: cleaned.slice(0, 60) });
    ids = await esearch(cleaned, maxResults, log);
    if (ids.length >= 3) {
      log?.info('pubmed_esearch_strategy2_hit', { count: ids.length });
      return ids;
    }
  }

  // Strategy 3: Progressive relaxation
  const tokens = cleaned.split(/[,\s]+/).filter(t => t.trim().length > 0);
  if (tokens.length > 3) {
    log?.stage('pubmed_esearch_strategy3_relaxation', { tokenCount: tokens.length });
    for (let drop = 1; drop < tokens.length - 2; drop++) {
      const relaxed = tokens.slice(0, tokens.length - drop).join(' ');
      ids = await esearch(relaxed, maxResults, log);
      if (ids.length >= 3) {
        log?.info('pubmed_esearch_strategy3_hit', { drop, remaining: tokens.length - drop, count: ids.length });
        return ids;
      }
    }
  }

  // Strategy 4: Try OR instead of AND for multi-keyword queries
  if (tokens.length >= 3) {
    log?.stage('pubmed_esearch_strategy4_or');
    const core = tokens.slice(0, 2).join(' AND ');
    const rest = tokens.slice(2).join(' OR ');
    const orQuery = `(${core}) AND (${rest})`;
    ids = await esearch(orQuery, maxResults, log);
    if (ids.length >= 3) {
      log?.info('pubmed_esearch_strategy4_hit', { count: ids.length });
      return ids;
    }

    // Last resort: just the core terms
    log?.stage('pubmed_esearch_strategy4_core_only');
    ids = await esearch(core, maxResults, log);
    if (ids.length > 0) {
      log?.info('pubmed_esearch_strategy4_core_hit', { count: ids.length });
      return ids;
    }
  }

  log?.warn('pubmed_esearch_all_strategies_empty', { originalKeywordsLen: keywords.length });
  return ids;
}

export async function fetchAbstracts(pmids: string[], log?: RouteLogger): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  // Stage A — try papers.db first (when configured) for full text + abstract.
  // PubMed's MeSH-tuned esearch already gave us the PMID ranking; here we
  // only need bodies, so paper-by-PMID lookup beats efetch when the cache
  // has the paper.
  let dbHits: PubMedArticle[] = [];
  let missingFromDb = pmids;

  if (isPapersDbEnabled()) {
    const batch = await fetchPapersBatch(pmids, { includeFullText: true, fullTextLimit: 4000 }, log);
    if (batch) {
      dbHits = batch.papers
        .filter((p) => p.abstract && p.abstract.length > 0)
        .map((p) => ({
          pmid: p.pmid,
          title: p.title,
          abstract: p.abstract,
          authors: p.authors,
          journal: p.journal,
          year: p.year,
          doi: undefined, // papers.db schema does not currently store DOI separately
          pubTypes: [], // papers.db has no pubType column; PubMed rerank below if we fall through
          fullText: p.fullText,
          fullTextTruncated: p.fullTextTruncated,
          specialty: p.specialty || undefined,
          source: 'papers-db' as const,
        }));
      const dbHitIds = new Set(dbHits.map((a) => a.pmid));
      missingFromDb = pmids.filter((id) => !dbHitIds.has(id));
      log?.stage('papers_db_lookup_resolved', {
        requested: pmids.length,
        dbHits: dbHits.length,
        missingForPubmed: missingFromDb.length,
        fullTextCount: dbHits.filter((a) => a.fullText).length,
      });
    } else {
      log?.warn('papers_db_unavailable_falling_back', { pmidCount: pmids.length });
    }
  }

  // Stage B — fetch the rest (or everything if papers.db disabled/failed) from PubMed.
  let pubmedHits: PubMedArticle[] = [];
  if (missingFromDb.length > 0) {
    const url = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${missingFromDb.join(',')}&retmode=xml`;
    log?.stage('pubmed_efetch_start', { pmidCount: missingFromDb.length });
    const res = await fetchWithRetry(url, 'efetch', 2, log);
    const xml = await res.text();
    log?.stage('pubmed_efetch_done', { xmlBytes: xml.length });

    const parsed = parseArticlesFromXml(xml);
    pubmedHits = parsed.map((a) => ({ ...a, source: 'pubmed' as const }));
    log?.stage('pubmed_xml_parsed', {
      requestedPmids: missingFromDb.length,
      parsedArticles: pubmedHits.length,
      droppedNoAbstract: missingFromDb.length - pubmedHits.length,
    });
  }

  // Preserve the original PMID order from esearch (relevance-sorted).
  const byPmid = new Map<string, PubMedArticle>();
  for (const a of dbHits) byPmid.set(a.pmid, a);
  for (const a of pubmedHits) if (!byPmid.has(a.pmid)) byPmid.set(a.pmid, a);
  const ordered = pmids.map((id) => byPmid.get(id)).filter((a): a is PubMedArticle => !!a);

  log?.stage('fetch_abstracts_done', {
    requested: pmids.length,
    dbHits: dbHits.length,
    pubmedHits: pubmedHits.length,
    finalCount: ordered.length,
    fullTextCount: ordered.filter((a) => a.fullText).length,
  });

  return ordered;
}

function parseArticlesFromXml(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const block = match[1];
    const pmid = extractTag(block, 'PMID') || '';
    const title = extractTag(block, 'ArticleTitle') || 'Untitled';
    const abstract = extractAbstract(block);
    const journal = extractTag(block, 'Title') || '';
    const year = extractTag(block, 'Year') || '';
    const authors = extractAuthors(block);
    const doi = extractDoi(block);

    const pubTypes = extractPubTypes(block);

    if (abstract) {
      articles.push({ pmid, title, abstract, authors, journal, year, doi, pubTypes });
    }
  }

  return articles;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : null;
}

function extractAbstract(xml: string): string {
  const abstractMatch = /<Abstract>([\s\S]*?)<\/Abstract>/.exec(xml);
  if (!abstractMatch) return '';
  const abstractBlock = abstractMatch[1];
  const texts: string[] = [];
  const textRegex = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
  let m;
  while ((m = textRegex.exec(abstractBlock)) !== null) {
    texts.push(m[1].replace(/<[^>]+>/g, '').trim());
  }
  return texts.length > 0 ? texts.join(' ') : abstractBlock.replace(/<[^>]+>/g, '').trim();
}

function extractAuthors(xml: string): string[] {
  const authors: string[] = [];
  const authorRegex = /<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<ForeName>([^<]*)<\/ForeName>[\s\S]*?<\/Author>/g;
  let m;
  while ((m = authorRegex.exec(xml)) !== null) {
    authors.push(`${m[2]} ${m[1]}`);
  }
  return authors.slice(0, 5);
}

function extractDoi(xml: string): string | undefined {
  const match = /<ArticleId IdType="doi">([^<]+)<\/ArticleId>/.exec(xml);
  return match ? match[1] : undefined;
}

function extractPubTypes(xml: string): string[] {
  const types: string[] = [];
  const re = /<PublicationType[^>]*>([^<]+)<\/PublicationType>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    types.push(m[1].trim());
  }
  return types;
}

// Priority score for sorting: guidelines & reviews first
function articlePriority(article: PubMedArticle): number {
  const types = article.pubTypes.map(t => t.toLowerCase());
  const title = article.title.toLowerCase();

  // Highest priority: practice guidelines
  if (types.some(t => t.includes('practice guideline') || t.includes('guideline'))) return 0;
  // Clinical consensus
  if (types.some(t => t.includes('consensus'))) return 1;
  // Systematic reviews & meta-analyses
  if (types.some(t => t.includes('systematic review') || t.includes('meta-analysis'))) return 2;
  if (title.includes('systematic review') || title.includes('meta-analysis')) return 2;
  // Review articles
  if (types.some(t => t === 'review')) return 3;
  // RCTs
  if (types.some(t => t.includes('randomized controlled trial') || t.includes('clinical trial'))) return 4;
  // Everything else
  return 5;
}

export async function searchAndFetch(keywords: string, maxResults = 20, log?: RouteLogger): Promise<PubMedArticle[]> {
  const pmids = await searchPubMed(keywords, maxResults, log);
  const articles = await fetchAbstracts(pmids, log);

  // Sort: guidelines → systematic reviews → reviews → RCTs → others
  articles.sort((a, b) => articlePriority(a) - articlePriority(b));

  return articles;
}
