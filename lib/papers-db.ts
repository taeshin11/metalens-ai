// Turso (libSQL) client for papersdb — 3M medical papers with FTS5.
//
// Activates only when both TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set.
// Otherwise the helpers no-op and MetaLens falls back to PubMed-only.
//
// Used by lib/pubmed.ts during efetch to enrich abstracts from the DB.

import { createClient, type Client } from '@libsql/client';
import type { RouteLogger } from './logger';

export interface PapersDbPaper {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  abstract: string;
  specialty: string;
  pmcId: string | null;
  hasFullText: boolean;
  fullText?: string;
  fullTextTruncated?: boolean;
  fullTextOriginalLength?: number;
}

interface BatchResponse {
  papers: PapersDbPaper[];
  missing: string[];
}

let _client: Client | null = null;

function getClient(): Client | null {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  _client = createClient({ url, authToken });
  return _client;
}

export function isPapersDbEnabled(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export async function fetchPapersBatch(
  pmids: string[],
  opts: { includeFullText?: boolean; fullTextLimit?: number; timeoutMs?: number } = {},
  log?: RouteLogger,
): Promise<BatchResponse | null> {
  const client = getClient();
  if (!client) return null;
  if (pmids.length === 0) return { papers: [], missing: [] };

  const { timeoutMs = 8000 } = opts;

  log?.stage('papers_db_batch_start', {
    pmidCount: pmids.length,
  });

  try {
    const placeholders = pmids.map(() => '?').join(', ');
    const query = `SELECT pmid, title, authors, journal, year, abstract, specialty FROM papers WHERE pmid IN (${placeholders})`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const result = await Promise.race([
      client.execute({ sql: query, args: pmids }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () =>
          reject(new Error('Turso query timed out'))
        );
      }),
    ]);
    clearTimeout(timer);

    const papers: PapersDbPaper[] = result.rows.map((row) => ({
      pmid: String(row.pmid),
      title: String(row.title || ''),
      authors: parseAuthors(row.authors),
      journal: String(row.journal || ''),
      year: String(row.year || ''),
      abstract: String(row.abstract || ''),
      specialty: String(row.specialty || ''),
      pmcId: null,
      hasFullText: false,
    }));

    const hitIds = new Set(papers.map((p) => p.pmid));
    const missing = pmids.filter((id) => !hitIds.has(id));

    log?.stage('papers_db_batch_done', {
      requested: pmids.length,
      hit: papers.length,
      miss: missing.length,
      fullTextHits: 0,
    });

    return { papers, missing };
  } catch (err) {
    const timedOut = err instanceof Error && err.message.includes('timed out');
    log?.warn('papers_db_batch_failed', {
      timedOut,
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
    });
    return null;
  }
}

function parseAuthors(raw: unknown): string[] {
  if (!raw) return [];
  const str = String(raw);
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON — fall through to comma split
  }
  return str
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== 'et al.' && s.toLowerCase() !== 'et al');
}
