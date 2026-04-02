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
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) return res;
      // PubMed rate limit (429) or server error — retry
      if (res.status === 429 || res.status >= 500) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          continue;
        }
      }
      throw new Error(`PubMed returned ${res.status}`);
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('PubMed request failed after retries');
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

async function esearch(term: string, maxResults: number): Promise<string[]> {
  const url = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

export async function searchPubMed(keywords: string, maxResults = 20): Promise<string[]> {
  // Strategy 1: Try original query
  let ids = await esearch(keywords, maxResults);
  if (ids.length >= 3) return ids;

  // Strategy 2: Clean noise words and retry
  const cleaned = cleanKeywords(keywords);
  if (cleaned !== keywords.toLowerCase().trim()) {
    ids = await esearch(cleaned, maxResults);
    if (ids.length >= 3) return ids;
  }

  // Strategy 3: Progressive relaxation — drop keywords one at a time from the end
  // "TNF, EGFR, chronic sinusitis, nasal polyp, antibiotics" → try without "antibiotics", etc.
  const tokens = cleaned.split(/[,\s]+/).filter(t => t.trim().length > 0);
  if (tokens.length > 3) {
    for (let drop = 1; drop < tokens.length - 2; drop++) {
      const relaxed = tokens.slice(0, tokens.length - drop).join(' ');
      ids = await esearch(relaxed, maxResults);
      if (ids.length >= 3) return ids;
    }
  }

  // Strategy 4: Try OR instead of AND for multi-keyword queries
  if (tokens.length >= 3) {
    // Keep the first 2-3 most important terms as AND, rest as OR
    const core = tokens.slice(0, 2).join(' AND ');
    const rest = tokens.slice(2).join(' OR ');
    const orQuery = `(${core}) AND (${rest})`;
    ids = await esearch(orQuery, maxResults);
    if (ids.length >= 3) return ids;

    // Last resort: just the core terms
    ids = await esearch(core, maxResults);
    if (ids.length > 0) return ids;
  }

  return ids;
}

export async function fetchAbstracts(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const res = await fetchWithRetry(url);
  const xml = await res.text();
  return parseArticlesFromXml(xml);
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

export async function searchAndFetch(keywords: string, maxResults = 20): Promise<PubMedArticle[]> {
  const pmids = await searchPubMed(keywords, maxResults);
  const articles = await fetchAbstracts(pmids);

  // Sort: guidelines → systematic reviews → reviews → RCTs → others
  articles.sort((a, b) => articlePriority(a) - articlePriority(b));

  return articles;
}
