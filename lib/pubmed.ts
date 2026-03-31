const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string;
  doi?: string;
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
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

export async function searchPubMed(keywords: string, maxResults = 20): Promise<string[]> {
  const url = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(keywords)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  return data.esearchresult?.idlist || [];
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

    if (abstract) {
      articles.push({ pmid, title, abstract, authors, journal, year, doi });
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

export async function searchAndFetch(keywords: string, maxResults = 20): Promise<PubMedArticle[]> {
  const pmids = await searchPubMed(keywords, maxResults);
  return fetchAbstracts(pmids);
}
