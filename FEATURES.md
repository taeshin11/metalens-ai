# MetaLens AI — Feature Inventory

> **Maintenance mandate** — This file is the single source of truth for what
> the app does. Any PR that adds, removes, or changes user-facing behavior
> MUST update the relevant section in the same commit. See
> [§ Maintenance Rules](#maintenance-rules) at the bottom.

**Last synced**: 2026-05-05 (matches HEAD of `master`)

---

## 1. Landing Page `/[locale]`
**Source**: `app/[locale]/page.tsx`, `components/KeywordInput.tsx`

### 1.1 Search Form (`components/KeywordInput.tsx`)
- **Mode toggle** (`KeywordInput.tsx:59-84`)
  - `meta-analysis` — synthesizes findings across studies (default)
  - `gap-finder` — identifies research gaps / unexamined areas
- **Keyword input** (`KeywordInput.tsx:87-98`)
  - Max 500 chars (PubMed URL-length guard)
  - Placeholder varies by mode (`hero.placeholder` / `hero.placeholderGap`)
  - Aria-label i18n (`a11y.enterKeywords`)
- **Submit button** (`KeywordInput.tsx:99-114`) with loading state
- **Filter toggle** (`KeywordInput.tsx:117-141`) — expandable panel w/ active-filter count badge

### 1.2 Filter Panel (`KeywordInput.tsx:142-211`)
- **Study Type**: All · RCT · Meta-analysis · Systematic Review · Clinical Trial
- **Date Range**: All · Last 5 years · Last 10 years
- **Age Group**: All · Child · Adolescent · Adult · Elderly

### 1.3 Guest / Login Gating (`page.tsx:64-74`)
- Guests: 1 lifetime search (sessionStorage `guestSearchCount`)
- Login modal triggered after exceed
- Logged-in: server-side rate limit

### 1.4 Auto-Trigger from URL (`page.tsx:54-62`)
- `?q=<keywords>` on mount → runs analysis without click (used by compare pages)

### 1.5 Search History (`page.tsx:42-58, 119-142`)
- localStorage `metalens_history` — last 20 entries {keywords, paperCount, timestamp, mode, resultId}
- Full result cached at `metalens_result_{resultId}` for instant reload
- Old cache evicted on replacement
- Grid of 6 recent searches with click-to-reload
- `clog` logs: `history_load_*`, `history_save_*`

### 1.6 Below-the-Fold (idle only)
- **How It Works** — 4-step overview
- **Popular comparisons** — 6 pre-configured drug pairs, click pre-loads keywords
- **Who is this for** — 4 persona cards (students, pharmacists, researchers, clinicians)

### 1.7 Loading & Error UI
- `LoadingSkeleton` with step indicator (`components/LoadingSkeleton.tsx`)
- Smooth scroll to `#loading-area` on submit (`page.tsx:82-84`)
- Error banner (no results / rate limit / API error) with "Try Again"
- i18n keys: `errors.noResults`, `errors.rateLimit`, `errors.apiError`

### 1.8 Beta Banner (until `BETA_END`=2026-04-16)
- Different copy for logged-in vs guest; guest CTA opens SignIn

---

## 2. Results Display (`components/ResultsCard.tsx`)

### 2.1 Header Row (`ResultsCard.tsx:432-476`)
- Title varies by mode (`results.title` / `results.gapTitle`)
- Paper count badge
- Action buttons:
  - **Share** — POST `/api/share` → copy link, states idle→loading→copied
  - **Export PDF** — `window.open` HTML template w/ print trigger; popup-block detected
  - `clog` logs: `share_*`, `export_pdf_*`

### 2.2 Tab Bar (`ResultsCard.tsx:437-497`)
Four tabs, `activeTab` state: `summary | data | meta | tools`

### 2.3 Tab: Summary (`ResultsCard.tsx:502-597`)
- **Translated summary card** (locale ≠ en) — `result.translated`
- **Key findings / English summary** — title varies by mode
- **Consensus Meter** (meta-analysis mode only, `ResultsCard.tsx:540-574`)
  - SVG circular gauge, 0–100% score
  - Levels: Strong (≥70), Moderate (≥50), Mixed, Limited
  - Keyword scoring: agree vs disagree terms in summary
- **Explore other tabs** — 3 cards → Data / Meta / Tools

### 2.4 Tab: Data (`ResultsCard.tsx:600-634`, Pro-gated via `UpgradeGate`)
- Auto-extraction on first click (5-step `ExtractionLoader`)
- **`components/DataTable.tsx`**:
  - Columns: Study · PMID · N · Effect · Type · 95% CI · p-value · Outcome
  - **Export CSV** (`DataTable.tsx:12-44`) — UTF-8 BOM, Excel-compatible, logs `export_csv_*`
  - **Copy Table** (`DataTable.tsx:46-67`) — tab-separated for paste, logs `copy_table_*`
- Error state with retry

### 2.5 Tab: Meta-Analysis (`ResultsCard.tsx:637-766`, Pro-gated)
- **Pooled Statistics** — 4 stat boxes: Pooled Effect · 95% CI · p-value · I²
  - p<0.05 highlighted green
  - I² bucketed: High (>75) · Moderate (>50) · Low-Moderate (>25) · Low
- **Interpretation banner** — narrative summary
- **Data coverage note** — studies with effect sizes / total
- **`components/ForestPlot.tsx`**:
  - Per-study effect + CI, pooled diamond
  - **Save PNG** (scale ×3) / **Save SVG** buttons → logs `save_png_*`, `save_svg_*`
  - Chart labels in English (academic convention)
- **`components/FunnelPlot.tsx`**:
  - Publication-bias scatter (effect vs SE)
  - Asymmetry auto-detection → i18n interpretation banner (`plots.funnelInterpret{Asym,Sym}Short`)
  - Save PNG / SVG
- **Overall summary** — narrative text w/ disclaimer

### 2.6 Tab: Tools (`ResultsCard.tsx:769-917`, Pro-gated)
- **Abstract Generator** — IMRAD format, 250–350 words
- **Research Proposal Draft** — 7 sections, 400–600 words
- **Citation Generator** (`ResultsCard.tsx:320-362, 833-884`)
  - Formats: APA · MLA · Vancouver
  - Format selector buttons
  - Copy-all button
  - Scrollable list (max 60vh)
- **Journal Recommendation** — top-5 SCI/SCIE journals with IF, scope, review speed, OA
- Each tool logs via `clog`: `writing_tool_start/done/http_failed/crashed`
- All tool requests hit POST `/api/synthesize`

### 2.7 Sources Panel (`ResultsCard.tsx:921-956`)
- Scrollable list (max-h 400px) of every retrieved paper
- PubMed link + authors + journal + year + PMID

### 2.8 Disclaimer + New Search (`ResultsCard.tsx:958-973`)
- Medical disclaimer banner
- "New Search" button → resets all state

### 2.9 Upsell Banner (`components/UpsellBanner.tsx`)
- Rendered for Free tier after analysis
- Dismissible (session only)
- 3 mini-features (Data Table / Meta-Analysis / Forest Plot) + "See Plans" CTA + "From $4.99/mo"
- i18n: `upsell.*`

---

## 3. Pricing Page (`app/[locale]/pricing/page.tsx`, `layout.tsx`)

### 3.1 SEO Layout (`pricing/layout.tsx`)
- Locale-aware `generateMetadata` via `pricing.title` / `pricing.subtitle`
- Canonical + 8-locale hreflang map
- OG/Twitter overrides

### 3.2 Plan Cards (`pricing/page.tsx:189-265`)
- **Free** — $0, 3 lifetime analyses, basic features
- **Pro** — $4.99/mo or $39.99/yr, 200/day, all features, "Most Popular" badge
- Per-feature icons: ✓ included, ✗ excluded, "Soon" badge for upcoming

### 3.3 Billing Toggle (`pricing/page.tsx:168-178`)
- Monthly / Yearly pill; yearly shows save %
- Yearly equivalent monthly price displayed below

### 3.4 Checkout Flow (`pricing/page.tsx:91-132`)
- Redirects to SignIn if not logged in
- POST `/api/lemonsqueezy/checkout` → redirect URL
- Success banner on `?success=true`, auto-reload after 3s
- `clog` logs: `checkout_click`, `checkout_request_start`, `checkout_redirecting`, `checkout_no_url`, `checkout_request_crashed`

### 3.5 Waitlist Form (`pricing/page.tsx:267-289`)
- Fire-and-forget POST to `NEXT_PUBLIC_SHEETS_WEBHOOK`
- `clog` logs: `waitlist_submit_start`, `waitlist_webhook_posted`, `waitlist_webhook_failed`

### 3.6 Competitor Comparison Table (`pricing/page.tsx:291-329`)
- MetaLens vs Elicit ($12) vs Consensus ($8.99)
- 7 feature rows with ✓/✗

### 3.7 Pricing FAQ (`pricing/page.tsx:331-349`)
- 4 items (2 beta-specific, 2 general)

---

## 4. Account Page (`app/[locale]/account/page.tsx`, `layout.tsx`)

### 4.1 SEO Layout (`account/layout.tsx`)
- `robots: { index: false, follow: false }` — auth-gated, excluded from SERP

### 4.2 Auth Wall (`account/page.tsx:18-22`)
- Redirects unauthenticated to `/{locale}` home

### 4.3 Profile Card (`account/page.tsx:65-80`)
- Avatar from first initial, name, email (with info rows)

### 4.4 Subscription Card (`account/page.tsx:82-104`)
- Tier-colored box (free=gray, pro=primary)
- Current plan label, price
- Plan features checklist (analyses/day, pointCount, model, data extraction, full features)

### 4.5 Daily Usage Card (`account/page.tsx:107-130`)
- Progress bar (used/limit), percentage fill
- "Resets daily" note

### 4.6 Logout (`account/page.tsx:50-54, 133-139`)
- `clog` logs: `logout_start`, `logout_done`, `logout_failed`
- Redirects to home

---

## 5. Share Page (`app/[locale]/share/[id]/page.tsx`, `layout.tsx`)

### 5.1 Dynamic OG Metadata (`share/[id]/layout.tsx`)
- Server layout reads Redis `share:{id}` → surfaces keywords + first sentence in OG/Twitter cards
- `robots: { index: false, follow: true }` (7-day TTL, not SERP-worthy)

### 5.2 Client Page (`share/[id]/page.tsx`)
- Fetch from `/api/share?id=...` on mount
- States: loading spinner · not-found (expired) · rendered
- Not-found: "link expired" message + home CTA
- Rendered: shared banner · header · translated + key findings · sources list · disclaimer · "View original" CTA

---

## 6. Compare Pages (`app/[locale]/compare/[drugs]/page.tsx`)

### 6.1 Pre-configured Comparisons (46 slug entries in `sitemap.ts:19-51`)
- 6 hardcoded detail pages (asthma, diabetes, pain, hypertension, GERD, depression)
- 40+ additional slugs for programmatic SEO (cardio, diabetes, pain, psychiatry, respiratory, GI, antibiotics, oncology, dermatology, thyroid, osteoporosis)

### 6.2 Page Structure
- JSON-LD `MedicalWebPage` schema
- Heading w/ drugs + condition
- 2 drug comparison cards
- CTA: "Analyze Drug Comparison" → `/{locale}?q={keywords}` (auto-trigger)
- Disclaimer banner
- "Other comparisons" carousel (4 related pages)

### 6.3 Dynamic Slug Parsing
- Custom slugs (e.g., `aspirin-vs-ibuprofen`) parsed for drug names → generated keywords

### 6.4 Metadata (`compare/[drugs]/page.tsx:70-89`)
- `generateMetadata` per-page with OG tags

---

## 7. Blog

### 7.1 Blog Index (`app/[locale]/blog/page.tsx`)
- Static metadata
- 10 post cards with: title, excerpt, read-time, tag, publish date

### 7.2 Blog Post Page (`app/[locale]/blog/[slug]/page.tsx`)
- `generateMetadata` with per-post OG
- Content loaded from `lib/blog-content-{locale}.ts` (8 language variants)
- 10 posts:
  1. What is Meta-Analysis
  2. AI in Medical Research
  3. How to Compare Drug Efficacy
  4. Understanding Forest Plots
  5. Systematic Review Protocol
  6. Publication Bias Detection
  7. P-Values & Statistical Significance
  8. Evidence-Based Medicine Guide
  9. Research Grant Proposals
  10. Systematic Review vs Meta-Analysis

### 7.3 RSS Feed (`app/feed.xml/...`)
- Linked from layout `<link rel="alternate" type="application/rss+xml">`

---

## 8. Content Pages

| Page | Path | Content |
|------|------|---------|
| About | `/[locale]/about` | Mission, problem, tech, transparency, personas, SPINAI info, open access, contact |
| How It Works | `/[locale]/how-it-works` | 4-step walkthrough + 5 tips |
| FAQ | `/[locale]/faq` | 10 collapsible items + JSON-LD `FAQPage` schema |
| Privacy | `/[locale]/privacy` | "Last Updated: 2026-04-06" + PolicySection blocks |
| Terms | `/[locale]/terms` | Legal terms |
| Use Cases | `/[locale]/use-cases` | User personas + scenarios |

All have static `metadata` exports.

---

## 9. Global UI

### 9.1 Header (`components/Header.tsx`)
- Logo (🔬 + "MetaLens AI") — click dispatches `metalens:home` custom event
- Nav links: Home · How It Works · Pricing · About · FAQ · Blog (8-locale)
- `UserMenu` on desktop
- Mobile hamburger menu (`a11y.toggleMenu`)

### 9.2 Footer (`components/Footer.tsx`)
- Built by SPINAI link
- Duplicate nav links
- Privacy / Terms / Feedback (mailto)
- Copyright © 2025–2026

### 9.3 User Menu (`components/UserMenu.tsx`)
- Not signed in: Clerk SignInButton
- Signed in: Tier badge + "Upgrade" link (free only) + Clerk UserButton avatar

### 9.4 Feedback Widget (`components/FeedbackButton.tsx`)
- Floating bottom-right button (every page)
- Popover with textarea → mailto submit
- Closes on outside click / Escape
- i18n: `feedbackWidget.*`
- `clog` logs: `feedback_send_start`, `feedback_mailto_opened`, `feedback_mailto_failed`

### 9.5 Kakao Webview Guard (`components/KakaoWebviewGuard.tsx`)
- Detects KakaoTalk user agent
- Android: Intent redirect to Chrome
- iOS: modal with "Open in Safari" instructions + Copy URL button
- i18n: `kakao.*`

### 9.6 Auth Provider (`components/AuthProvider.tsx`)
- Wraps Clerk `ClerkProvider`
- `useAuth()` exposes `{ user, loading, openSignIn, logout }`

### 9.7 Upgrade Gate (`components/UpgradeGate.tsx`)
- Blocks Pro features for Free users (admin bypass)
- 1 free trial per feature (sessionStorage `trial_{featureKey}`)
- `clog` logs: `trial_consumed`, `trial_write_failed`, `trial_count_read_failed`

---

## 10. Backend / API Routes

All API routes emit structured JSON-line logs (see §13). Every request gets a `reqId` for cross-stage tracing.

| Route | Method | Purpose | Key logs |
|-------|--------|---------|---------|
| `/api/pubmed` | GET | PubMed esearch+efetch | 4 fallback strategies, XML parse count |
| `/api/synthesize` | POST | Gemini synthesis (all tiers use `gemini-2.5-flash`) | auth→rate_limit→primary→fallback→tracking |
| `/api/extract` | POST | Data extraction (batched, 20 papers/batch) | per-batch success/fail count |
| `/api/translate` | POST | Keyword translation to English for PubMed | primary/fallback/passthrough |
| `/api/translate-result` | POST | Result translation to user locale | primary/fallback |
| `/api/share` | POST/GET | Redis-backed share payload (7-day TTL) | validated→payload_prepared→redis_write/read |
| `/api/lemonsqueezy/checkout` | POST | Create LS checkout URL | auth→variant→url_create |
| `/api/lemonsqueezy/webhook` | POST | LS subscription events | HMAC verify→event→tier set/reset |
| `/api/lemonsqueezy/portal` | POST | LS customer portal URL | auth→portal URL |
| `/api/admin/stats` | GET | Admin dashboard data (admin-gated) | — |

---

## 11. Tier System (`lib/constants.ts`)

| Tier | Daily Limit | Point Count | Model | Price | Features Unlocked |
|------|-------------|-------------|-------|-------|-------------------|
| **free** | 3 (lifetime) | 3 | gemini-2.5-flash | $0 | Search · Summary · Consensus · Citation · Share · PDF export · 1 trial/feature for Pro |
| **pro** | 200/day | 10 | gemini-2.5-flash | $4.99/mo ($39.99/yr) | All free + Data tab · Meta tab (Forest/Funnel) · Tools tab unlocked |

Admin bypass: `ADMIN_EMAILS` in `lib/admin.ts` (env-overridable via `ADMIN_EMAILS` comma-separated) → all gates off.

Tab bar shows **PRO** badge on gated tabs for free-tier users (`ResultsCard.tsx`).

`/api/extract` is rate-limited (shared counter with `/api/synthesize`).

**Beta exception**: Until `BETA_END`=2026-04-16, logged-in users get unlimited (both tiers).

---

## 12. i18n (`messages/{en,ko,ja,zh,es,pt,de,fr}.json`)

8 locales, routed via `[locale]` segment + next-intl middleware.

**Namespaces** (partial list):
- `meta` — SEO title/description
- `hero` — landing form + mode toggle
- `results` — tab labels, findings, sources
- `pricing`, `upsell`, `shareButtons`, `feedbackWidget` — commerce/UX
- `auth`, `account` — user management
- `consensus`, `dataTable`, `plots`, `tools` — results sub-features
- `errors`, `error`, `notFound` — error states
- `nav`, `footer`, `faq`, `blog`, `kakao`, `a11y` — global

hreflang map in `app/[locale]/layout.tsx:17-26` (ko→ko-KR, ja→ja-JP, zh→zh-CN, de→de-DE, fr→fr-FR).

---

## 13. Observability (`lib/logger.ts`, `lib/client-logger.ts`)

### 13.1 Server logger (`RouteLogger`)
- JSON-line format: `{ts, level, route, reqId, msg, ...ctx}`
- Methods: `.start()`, `.stage(name, ctx)`, `.info`, `.warn`, `.error(msg, err, ctx)`, `.done(status, ctx)`
- Auto-tracks per-stage `ms` + `totalMs`
- Normalizes Error: `errName`, `errMessage`, `errStack` (top 6 frames joined), `errCause`, `errCode`, `errStatus`
- `maskId()` helper masks emails/IDs in logs

### 13.2 Client logger (`clog`)
- Mirror format with `side: "client"` tag + `sid` (sessionStorage-backed)
- API: `clog.info/warn/error(msg, component, ctx?)`
- Instrumented ops: 14 user write/save/upload points (see §14)

### 13.3 Library-level instrumentation
- `lib/pubmed.ts` — per-strategy + per-fetch-attempt logs
- `lib/rate-limit.ts` — Redis fail-open logs loudly
- `lib/auth.ts` — Clerk API response bodies on failures
- `lib/usage-tracker.ts` — trackUsage / trackSignup logged

---

## 14. Instrumented User Operations (client)

**Downloads / blob saves**:
- `DataTable.exportCsv` / `copyTable`
- `ForestPlot.handleSavePng` / `handleSaveSvg`
- `FunnelPlot.handleSavePng` / `handleSaveSvg`
- `ResultsCard.handleExportPDF` (popup-block detected)

**API calls from browser**:
- `ResultsCard.handleGenerateTools` (abstract / journal / proposal)
- `ResultsCard.handleShare`
- `ShareButtons.handleCopy`
- `PricingPage.handleCheckout`
- `PricingPage.handleNotify` (waitlist)
- `lib/analytics.collectData`

**Local storage / session storage**:
- HomePage history load + save (QuotaExceededError detected)
- UpgradeGate trial consumption

**Auth / session**:
- AccountPage logout
- FeedbackButton mailto

---

## 15. Infrastructure

| Concern | Implementation |
|---------|----------------|
| Hosting | Vercel (auto-deploy on `master` push) |
| Auth | Clerk (magic link + OAuth) |
| DB / Cache | Upstash Redis (rate limit + share payloads) |
| AI | Google Gemini 2.5 Flash (primary), 2.0 Flash-Lite (fallback) |
| Payments | LemonSqueezy (webhook signature via HMAC-SHA256) |
| Analytics | GA4 (gtag), optional Google Sheets webhook for waitlist |
| i18n | next-intl |
| Sitemap | `app/sitemap.ts` — 8 locales × (9 pages + 10 blog + 46 compare) |
| Robots | `app/robots.ts` — disallow `/api/`, `/admin/` |
| OG Images | `app/opengraph-image.tsx` (`ImageResponse` dynamic) |
| Verification | Google ✅, Naver ✅, Bing/Yandex/Baidu (env-gated) |
| **Hybrid retrieval** | papers-api (sibling Node service over papers.db) — see §16 |

---

## 16. Hybrid Retrieval (papers.db + PubMed)

### 16.1 Architecture
- **Search ranking** — still PubMed esearch (MeSH-tuned, 4 fallback strategies in `lib/pubmed.ts`)
- **Body fetch** — `lib/pubmed.ts:fetchAbstracts` consults papers.db first via `lib/papers-db.ts`, then PubMed efetch for missing PMIDs
- **AI synthesis** — Pro tier sends `useFullText=true` so `buildPrompt` (`lib/synthesis.ts`) includes truncated PMC full text inline; Free tier stays abstract-only for cost predictability

### 16.2 papers-api server (`papers-api/`)
- Node 20+ HTTP server, `better-sqlite3`, readonly + WAL on `D:/HemoChat/data/papers.db` (~9M papers, 707K with full text, 44 specialty tags)
- Endpoints:
  - `GET /healthz` (unauth)
  - `GET /stats` — total paper count
  - `POST /papers/batch` — `{ pmids, includeFullText, fullTextLimit }` → `{ papers, missing }`
  - `GET /search?q=...&specialty=...&limit=20` — FTS5 search (BM25 ranking)
- Auth: shared `X-API-Key` header
- Logs: JSON-line, same shape as `lib/logger.ts`
- Excluded from Vercel deploys via `.vercelignore`
- Tunneling for production: Cloudflare Tunnel / Tailscale Funnel / ngrok (see `papers-api/README.md`)

### 16.3 MetaLens client (`lib/papers-db.ts`)
- Activates only when both `PAPERS_API_URL` and `PAPERS_API_KEY` env vars are set
- `isPapersDbEnabled()`, `fetchPapersBatch(pmids, opts, log)` exported
- Per-request 8s timeout; returns `null` on failure (never blocks PubMed fallback)
- All stages logged via the `RouteLogger` thread

### 16.4 PubMedArticle additions (`lib/pubmed.ts`)
- New optional fields: `fullText`, `fullTextTruncated`, `specialty`, `source: 'papers-db' | 'pubmed'`
- Article order preserved from PubMed esearch ranking (relevance-sorted)

### 16.5 Tier behavior
- **Free**: useFullText=false (abstracts only) — no cost change
- **Pro**: useFullText=true — Gemini receives PMC full-text excerpts when paper is in papers.db; ~5× input tokens but materially better number extraction for meta-analysis

---

---

<a id="maintenance-rules"></a>
## Maintenance Rules

**This file is MANDATORY to update when:**

1. **Adding a feature** — add a new sub-bullet under the relevant tab/section with `file:line` reference.
2. **Removing a feature** — delete the bullet; do NOT leave stale references.
3. **Renaming a tab, route, or significant component** — update every occurrence here (section headings, tables).
4. **Changing tier gating** — update §11 tier table + the affected tab's "Pro-gated" note.
5. **Adding a new API route** — add a row in §10.
6. **Adding a new locale** — update §12 locale list.
7. **Adding a new client write/save/upload point** — add to §14.
8. **Bumping `Last synced`** date at the top of this file.
9. **Touching hybrid retrieval / papers-api** — update §16.

**Review checklist for PRs**:
- [ ] Did this PR touch `components/*.tsx`, `app/[locale]/**/page.tsx`, `app/api/**/route.ts`, `messages/*.json`, or `lib/{logger,client-logger,pubmed,auth,rate-limit,payments,usage-tracker}.ts`?
- [ ] If yes, does the diff include a matching update to `FEATURES.md`?
- [ ] If not obviously user-facing (e.g., refactor with no behavior change), add a comment in the PR stating "no user-facing change — FEATURES.md unchanged".

Enforcement is defined in `CLAUDE.md` / `AGENTS.md` — Claude sessions must update this file as part of any feature-touching commit.
