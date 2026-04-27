# papers-api — local read-only API over papers.db

Read-only HTTP API over `D:/HemoChat/data/papers.db` (HemoChat-curated PubMed cache, ~9M papers, 707K with full text). Powers MetaLens hybrid retrieval: PubMed esearch supplies search ranking, this API supplies abstracts + full text.

## Why a separate process

papers.db is 82 GB SQLite — cannot ship to Vercel (Lambda 250 MB cap). This server runs on the same machine that hosts HemoChat's writer, opens the DB in readonly + WAL mode, and exposes only the endpoints MetaLens needs.

## Run locally

```bash
cd papers-api
npm install
cp .env.example .env
# edit .env: set PAPERS_API_KEY to a long random string (at least 32 chars)
npm start
```

Server listens on `http://127.0.0.1:4319` by default. Test:

```bash
curl http://127.0.0.1:4319/healthz
curl -H "X-API-Key: <key>" http://127.0.0.1:4319/stats
curl -H "X-API-Key: <key>" "http://127.0.0.1:4319/search?q=metformin+diabetes&limit=5"
```

## Expose to Vercel (production)

Vercel's serverless functions can't reach `127.0.0.1`. Options:

### Cloudflare Tunnel (recommended, free, stable URL)
```bash
cloudflared tunnel --url http://127.0.0.1:4319
# or as a named tunnel with stable subdomain:
cloudflared tunnel create metalens-papers
cloudflared tunnel route dns metalens-papers papers.your-domain.com
cloudflared tunnel run metalens-papers
```

### Tailscale Funnel
```bash
tailscale serve https / http://127.0.0.1:4319
tailscale funnel 443 on
```

### ngrok (dev only)
```bash
ngrok http 4319
```

In MetaLens Vercel env vars set:
- `PAPERS_API_URL` — public tunnel URL (e.g., `https://papers.your-domain.com`)
- `PAPERS_API_KEY` — same value as the local `.env` PAPERS_API_KEY

If `PAPERS_API_URL` is unset, MetaLens falls back to PubMed-only retrieval (graceful).

## Endpoints

### `GET /healthz`
Unauthenticated. `{ ok: true, ts }`.

### `GET /stats`
Returns `{ totalPapers }`.

### `POST /papers/batch`
Body:
```json
{ "pmids": ["12345", "67890"], "includeFullText": true, "fullTextLimit": 4000 }
```
Returns `{ papers: [...], missing: ["..."] }`. Each paper has `hasFullText` flag plus `fullText` (truncated) when requested.

### `GET /search?q=...&specialty=...&limit=20&includeFullText=0|1`
FTS5 search over title+abstract. `specialty` is optional filter (one of the 44 specialty tags).
Returns `{ papers, query, specialty }`.

## Logging

JSON-line to stdout/stderr, same format as MetaLens `lib/logger.ts`. Pipe to `jq` or send to a log collector for production.

## Maintenance

The DB is HemoChat's — papers-api only reads. WAL mode means HemoChat's writer process keeps updating without lock contention.
