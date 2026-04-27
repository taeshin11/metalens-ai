// Read-only HTTP API over papers.db (HemoChat-curated PubMed cache).
//
// Runs locally on the user's machine; MetaLens (deployed on Vercel) reaches
// it through a tunnel (Cloudflare Tunnel / Tailscale Funnel / ngrok). The
// SQLite file is opened in readonly + WAL mode so it does not interfere
// with HemoChat's writer process.
//
// Auth: shared X-API-Key header (env: PAPERS_API_KEY).
// Logs: JSON-line, same shape as MetaLens lib/logger.ts.

import { createServer } from 'node:http';
import { URL } from 'node:url';
import { performance } from 'node:perf_hooks';
import Database from 'better-sqlite3';

const DB_PATH = process.env.PAPERS_DB_PATH || 'D:/HemoChat/data/papers.db';
const PORT = Number(process.env.PORT || 4319);
const API_KEY = process.env.PAPERS_API_KEY || '';
const HOST = process.env.HOST || '127.0.0.1';

if (!API_KEY) {
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'error',
    route: 'papers-api',
    msg: 'startup_no_api_key',
    hint: 'Set PAPERS_API_KEY env to a long random string',
  }));
  process.exit(1);
}

// Open in readonly + immutable=0 + WAL so HemoChat's writer can keep updating
const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

console.log(JSON.stringify({
  ts: new Date().toISOString(),
  level: 'info',
  route: 'papers-api',
  msg: 'db_opened',
  path: DB_PATH,
  readonly: true,
}));

// --- Prepared statements ---

const stmtBatchByPmid = db.prepare(`
  SELECT pmid, title, authors, journal, year, abstract,
         specialty, pmc_id, full_text
  FROM papers
  WHERE pmid IN (SELECT value FROM json_each(?))
`);

const stmtSearch = db.prepare(`
  SELECT p.pmid, p.title, p.authors, p.journal, p.year, p.abstract,
         p.specialty, p.pmc_id,
         CASE WHEN p.full_text IS NOT NULL AND length(p.full_text) > 100 THEN 1 ELSE 0 END AS has_full_text,
         bm25(papers_fts) AS score
  FROM papers_fts
  JOIN papers p ON p.rowid = papers_fts.rowid
  WHERE papers_fts MATCH ?
    AND (? = '' OR p.specialty = ?)
  ORDER BY bm25(papers_fts)
  LIMIT ?
`);

const stmtCountTotal = db.prepare('SELECT COUNT(*) AS c FROM papers');

// --- Helpers ---

function makeReqId() {
  return Math.random().toString(36).slice(2, 10);
}

function log(level, reqId, msg, ctx) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    route: 'papers-api',
    reqId,
    msg,
    ...(ctx || {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function parseAuthors(s) {
  if (!s) return [];
  // HemoChat stored authors as JSON-ish or comma-joined strings; handle both.
  try {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v.slice(0, 10);
  } catch { /* not json */ }
  return s.split(/[,;]/).map(t => t.trim()).filter(Boolean).slice(0, 10);
}

function shapePaper(row, opts = {}) {
  const { includeFullText = false, fullTextLimit = 4000 } = opts;
  const out = {
    pmid: row.pmid,
    title: row.title,
    authors: parseAuthors(row.authors),
    journal: row.journal || '',
    year: row.year || '',
    abstract: row.abstract || '',
    specialty: row.specialty || '',
    pmcId: row.pmc_id || null,
    hasFullText: !!(row.full_text && row.full_text.length > 100),
  };
  if (includeFullText && row.full_text) {
    out.fullText = row.full_text.length > fullTextLimit
      ? row.full_text.slice(0, fullTextLimit) + ' …[truncated]'
      : row.full_text;
    out.fullTextTruncated = row.full_text.length > fullTextLimit;
    out.fullTextOriginalLength = row.full_text.length;
  }
  return out;
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

async function readJson(req, maxBytes = 256_000) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('body_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// FTS5 query sanitization — escape quotes, drop dangerous chars
function sanitizeFtsQuery(raw) {
  return raw
    .replace(/["']/g, ' ')
    .replace(/[^\p{L}\p{N}\s\-]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 1)
    .slice(0, 12)
    .join(' ');
}

// --- Routes ---

const server = createServer(async (req, res) => {
  const reqId = makeReqId();
  const t0 = performance.now();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  log('info', reqId, 'start', { method: req.method, path });

  // Healthz is unauthenticated for monitoring
  if (req.method === 'GET' && path === '/healthz') {
    send(res, 200, { ok: true, ts: new Date().toISOString() });
    log('info', reqId, 'done', { status: 200, totalMs: Math.round(performance.now() - t0) });
    return;
  }

  // Auth gate
  const provided = req.headers['x-api-key'];
  if (!provided || provided !== API_KEY) {
    log('warn', reqId, 'auth_failed', { hasHeader: !!provided });
    send(res, 401, { error: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET' && path === '/stats') {
      const total = stmtCountTotal.get();
      send(res, 200, { totalPapers: total.c });
      log('info', reqId, 'done', { status: 200, totalMs: Math.round(performance.now() - t0) });
      return;
    }

    if (req.method === 'POST' && path === '/papers/batch') {
      const body = await readJson(req);
      const pmids = Array.isArray(body.pmids) ? body.pmids.slice(0, 100) : [];
      const includeFullText = !!body.includeFullText;
      const fullTextLimit = Math.min(Number(body.fullTextLimit) || 4000, 16000);

      if (pmids.length === 0) {
        send(res, 400, { error: 'pmids array required' });
        log('warn', reqId, 'invalid_body', { reason: 'no_pmids' });
        return;
      }

      log('info', reqId, 'stage:lookup_start', {
        pmidCount: pmids.length,
        includeFullText,
        fullTextLimit,
      });

      const rows = stmtBatchByPmid.all(JSON.stringify(pmids));
      const papers = rows.map(r => shapePaper(r, { includeFullText, fullTextLimit }));
      const foundIds = new Set(papers.map(p => p.pmid));
      const missing = pmids.filter(id => !foundIds.has(id));
      const fullTextHits = papers.filter(p => p.hasFullText).length;

      log('info', reqId, 'stage:lookup_done', {
        requested: pmids.length,
        hit: papers.length,
        miss: missing.length,
        fullTextHits,
        ms: Math.round(performance.now() - t0),
      });

      send(res, 200, { papers, missing });
      log('info', reqId, 'done', { status: 200, totalMs: Math.round(performance.now() - t0) });
      return;
    }

    if (req.method === 'GET' && path === '/search') {
      const rawQ = url.searchParams.get('q') || '';
      const specialty = (url.searchParams.get('specialty') || '').trim();
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
      const includeFullText = url.searchParams.get('includeFullText') === '1';
      const ftsQuery = sanitizeFtsQuery(rawQ);

      log('info', reqId, 'stage:search_start', {
        rawQLen: rawQ.length,
        ftsQueryLen: ftsQuery.length,
        specialty,
        limit,
      });

      if (!ftsQuery) {
        send(res, 400, { error: 'q required (after sanitization)' });
        return;
      }

      const rows = stmtSearch.all(ftsQuery, specialty, specialty, limit);
      const papers = rows.map(r => shapePaper(r, { includeFullText, fullTextLimit: 4000 }));
      const fullTextHits = papers.filter(p => p.hasFullText).length;

      log('info', reqId, 'stage:search_done', {
        results: papers.length,
        fullTextHits,
        ms: Math.round(performance.now() - t0),
      });

      send(res, 200, { papers, query: ftsQuery, specialty: specialty || null });
      log('info', reqId, 'done', { status: 200, totalMs: Math.round(performance.now() - t0) });
      return;
    }

    send(res, 404, { error: 'Not found' });
    log('info', reqId, 'done', { status: 404, totalMs: Math.round(performance.now() - t0) });
  } catch (err) {
    log('error', reqId, 'handler_crashed', {
      errName: err instanceof Error ? err.name : 'unknown',
      errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
      errStack: err instanceof Error && err.stack
        ? err.stack.split('\n').slice(0, 6).map(s => s.trim()).join(' | ')
        : undefined,
    });
    send(res, 500, { error: 'Internal' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    route: 'papers-api',
    msg: 'listening',
    host: HOST,
    port: PORT,
    db: DB_PATH,
  }));
});

function shutdown(sig) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    route: 'papers-api',
    msg: 'shutdown',
    signal: sig,
  }));
  server.close();
  db.close();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
