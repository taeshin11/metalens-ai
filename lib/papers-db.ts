// HTTP client for the papers-api server (papers.db wrapper).
//
// Activates only when both PAPERS_API_URL and PAPERS_API_KEY are set.
// Otherwise the helpers no-op and MetaLens falls back to PubMed-only.
//
// Used by lib/pubmed.ts during efetch to enrich abstracts with full_text
// from the local cache without giving up PubMed's MeSH-tuned search.

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

function getConfig(): { url: string; key: string } | null {
  const url = process.env.PAPERS_API_URL?.replace(/\/+$/, '');
  const key = process.env.PAPERS_API_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function isPapersDbEnabled(): boolean {
  return getConfig() !== null;
}

export async function fetchPapersBatch(
  pmids: string[],
  opts: { includeFullText?: boolean; fullTextLimit?: number; timeoutMs?: number } = {},
  log?: RouteLogger,
): Promise<BatchResponse | null> {
  const cfg = getConfig();
  if (!cfg) return null;
  if (pmids.length === 0) return { papers: [], missing: [] };

  const { includeFullText = true, fullTextLimit = 4000, timeoutMs = 8000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  log?.stage('papers_db_batch_start', {
    pmidCount: pmids.length,
    includeFullText,
    fullTextLimit,
  });

  try {
    const res = await fetch(`${cfg.url}/papers/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': cfg.key,
      },
      body: JSON.stringify({ pmids, includeFullText, fullTextLimit }),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (!res.ok) {
      log?.warn('papers_db_batch_http_failed', { status: res.status });
      return null;
    }

    const data = (await res.json()) as BatchResponse;
    const fullTextHits = data.papers.filter((p) => p.fullText).length;
    log?.stage('papers_db_batch_done', {
      requested: pmids.length,
      hit: data.papers.length,
      miss: data.missing.length,
      fullTextHits,
    });
    return data;
  } catch (err) {
    clearTimeout(timer);
    const aborted = err instanceof Error && err.name === 'AbortError';
    log?.warn('papers_db_batch_failed', {
      timedOut: aborted,
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
    });
    return null;
  }
}
