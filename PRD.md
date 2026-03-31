# PRD.md — MetaLens AI (by SPINAI)

## AI-Powered Medical Research Meta-Analysis Tool

**Version**: 1.0.0 (MVP)
**Last Updated**: 2026-03-31
**Brand**: SPINAI
**Contact**: taeshinkim11@gmail.com

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Harness Architecture](#2-harness-architecture)
3. [Feature List](#3-feature-list)
4. [Technical Stack](#4-technical-stack)
5. [Design System](#5-design-system)
6. [SEO & Traffic Strategy](#6-seo--traffic-strategy)
7. [Data Collection (Silent)](#7-data-collection-silent)
8. [Feedback Mechanism](#8-feedback-mechanism)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [Competitor Analysis & Pricing](#10-competitor-analysis--pricing)
11. [Deployment](#11-deployment)
12. [Git Workflow & Milestones](#12-git-workflow--milestones)
13. [Standing Constraints](#13-standing-constraints)
14. [Future Paid Features](#14-future-paid-features)

---

## 1. Product Overview

### What Is MetaLens AI?

MetaLens AI is a free web tool where users enter medical/research keywords (e.g., "asthma, pranlukast, montelukast, disease control, exacerbation, mortality") and receive an AI-generated meta-analysis-style summary. The tool searches PubMed's 40M+ papers via their free E-utilities API, retrieves relevant abstracts, and uses Claude AI to synthesize findings into structured, digestible bullet-point results.

### Example User Flow

1. User enters keywords: `asthma, pranlukast, montelukast, disease control, exacerbation, duration, mortality`
2. System searches PubMed for relevant papers matching those keywords
3. AI reads the abstracts and synthesizes a structured result like:
   - "1. Pranlukast showed lower asthma remission rates compared to Montelukast across 12 studies."
   - "2. Mortality rates when analyzing both drugs were approximately X%."
   - "3. Based on meta-analysis of N papers, Drug X appears more effective for general use."
   - "4. However, under [specific conditions], Drug Y showed better outcomes."
4. User gets a concise 3-5 point summary with source paper links

### Target Users

- Medical students and residents
- Pharmacists comparing drug efficacy
- Researchers doing preliminary literature reviews
- Clinicians needing quick evidence-based answers
- Healthcare professionals in non-English speaking countries (auto-translated UI)

---

## 2. Harness Architecture

This project uses Anthropic's Harness Design methodology with four agent roles. Claude Code must follow this structure for autonomous multi-session development.

### Agent Roles

#### Planner Agent
- Reads this PRD.md
- Expands high-level goals into implementation-ready specs
- Focuses on WHAT to build, not HOW
- Does NOT over-specify implementation details early

#### Initializer Agent
- Runs in the first session only
- Creates three handoff files:
  - `feature_list.json` — ordered list of all features with status tracking
  - `claude-progress.txt` — session-by-session progress log
  - `init.sh` — server startup script (install deps, env setup, dev server start)
- Sets up the project scaffold (Next.js app, folder structure, config files)

#### Builder Agent (Coder)
- Every session starts with this fixed routine:
  1. Read `claude-progress.txt` to understand current state
  2. Read `feature_list.json` to identify next feature
  3. Run tests to confirm existing features work
  4. Pick ONE feature, implement it fully
  5. Test the feature
  6. Commit with descriptive message
  7. Update `claude-progress.txt`
  8. Update `feature_list.json` status
  9. Move to next feature or end session
- On milestone completion → `git push` to GitHub

#### Reviewer Agent
- After each major feature, review code quality
- Check for: accessibility, responsive design, performance, SEO tags, error handling
- Validate that the live site works correctly
- Suggest improvements before moving to next milestone

### Handoff Files

```
/feature_list.json    — Feature tracking with statuses: "pending", "in-progress", "complete", "blocked"
/claude-progress.txt  — Human-readable session log
/init.sh              — One-command project startup script
```

### Session Start Protocol (EVERY session)

```bash
# 1. Read progress
cat claude-progress.txt

# 2. Read feature list
cat feature_list.json

# 3. Run dev server and tests
bash init.sh
npm test 2>/dev/null || echo "No tests yet"

# 4. Pick next pending feature → implement → test → commit → update files
```

---

## 3. Feature List

### MVP Features (v1.0)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | Project Setup & Scaffold | P0 | Next.js 14+ app with App Router, Tailwind CSS, TypeScript |
| 2 | Landing Page & Hero | P0 | Keyword input form, value proposition, call-to-action |
| 3 | PubMed API Integration | P0 | Search PubMed E-utilities API with user keywords, fetch abstracts |
| 4 | AI Synthesis Engine | P0 | Send abstracts to Claude API, generate structured meta-analysis summary |
| 5 | Results Display | P0 | Show structured 3-5 point summary with source links, paper count |
| 6 | Responsive Design | P0 | Mobile-first, works on all screen sizes |
| 7 | Soft Color Theme | P0 | Calming medical/scientific palette (see Design System section) |
| 8 | Google Sheets Silent Data Collection | P0 | On "Analyze" button click, POST keyword data + results to Google Sheets via Apps Script webhook |
| 9 | Feedback mailto Link | P1 | Subtle footer link or floating icon for users to email taeshinkim11@gmail.com |
| 10 | SEO Optimization | P0 | Meta tags, Open Graph, structured data, sitemap, robots.txt |
| 11 | i18n Auto-Detection | P1 | Detect browser language, auto-translate UI (no user action needed) |
| 12 | About/Privacy/Terms Pages | P1 | Required for credibility and SEO; SPINAI branding in footer |
| 13 | Loading States & Error Handling | P1 | Skeleton loaders, error messages, rate limit handling |
| 14 | Vercel Deployment | P0 | Deploy to Vercel free tier with custom subdomain |
| 15 | GitHub Repo Setup | P0 | Create repo via `gh` CLI, push milestones |

### Post-MVP Features (v1.1+)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 16 | Search History (localStorage) | P2 | Save past searches for returning users |
| 17 | Export to PDF | P2 | Download analysis result as PDF report |
| 18 | Advanced Filters | P2 | Date range, study type, journal filter |
| 19 | Comparison Mode | P2 | Compare two drugs/treatments side by side |
| 20 | User Accounts (Pro) | P3 | Sign up for premium features |
| 21 | Batch Analysis | P3 | Analyze multiple keyword sets at once |
| 22 | Citation Generator | P2 | Auto-generate APA/MLA citations from results |
| 23 | Consensus Meter | P2 | Visual indicator of how much studies agree |

---

## 4. Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS 3.x
- **Hosting**: Vercel (free tier)
- **Animations**: Framer Motion (subtle, professional)

### Backend / API
- **PubMed Integration**: NCBI E-utilities API (FREE, no API key required)
  - `esearch.fcgi` — search for paper IDs by keywords
  - `efetch.fcgi` — fetch abstracts and metadata
  - Rate: 3 req/sec without key, 10/sec with free key (just email registration)
- **AI Synthesis — Gemini 2.5 Flash + Pollinations Fallback**:

  We use **Google Gemini 2.5 Flash** as the primary AI provider (via the `@google/genai` npm package), with **Pollinations.ai** as a free fallback that requires no API key. This gives us high-quality server-side AI synthesis with a resilient fallback if the Gemini API is unavailable.

  | Tier | Method | Model | API Key? | Cost to Dev |
  |------|--------|-------|----------|-------------|
  | **Free users** | Gemini API (server-side) | `gemini-2.5-flash` | `GEMINI_API_KEY` (free tier available) | **$0** (within free tier limits) |
  | **Fallback** | Pollinations.ai (server-side) | `openai` (routed by Pollinations) | **NO KEY NEEDED** | **$0** |
  | **Pro users** | Anthropic Claude API (server-side) | `claude-sonnet-4-20250514` | Server-side key | Funded by subscriptions |

  **How the AI pipeline works**:
  - Server-side API route receives abstracts and language
  - Tries Gemini 2.5 Flash first (fast, high quality, generous free tier)
  - If Gemini fails or key is missing, falls through to Pollinations.ai (free, no key)
  - Pollinations response is cleaned of any appended ads/watermarks

  **Implementation (Free tier — Gemini primary, Pollinations fallback)**:
  ```typescript
  // Server-side: tries Gemini first, then Pollinations
  import { GoogleGenAI } from '@google/genai';

  async function synthesize(abstracts: string[], language: string): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const prompt = buildMetaAnalysisPrompt(abstracts, language);

    // Primary: Gemini 2.5 Flash
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.1, maxOutputTokens: 2000 },
        });
        const result = response.text?.trim();
        if (result) return result;
      } catch { /* fall through to Pollinations */ }
    }

    // Fallback: Pollinations.ai (no key needed)
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: abstracts.join('\n\n') },
        ],
        model: 'openai',
        temperature: 0.1,
      }),
    });
    return response.ok ? (await response.text()).trim() : null;
  }
  ```

  **Implementation (Pro tier — server-side for better quality)**:
  ```typescript
  // Server-side only, uses our Anthropic API key
  async function synthesizePro(abstracts: string[], language: string) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: buildMetaAnalysisPrompt(abstracts, language) }]
      })
    });
    return response.json();
  }
  ```

  **Key advantages of this approach**:
  - Gemini 2.5 Flash free tier is generous (sufficient for MVP traffic)
  - Pollinations fallback ensures AI always works even if Gemini is down or key is missing
  - Server-side calls keep prompts and logic private
  - Pro users use server-side Claude = better quality justifies subscription

  **NPM installation**:
  ```bash
  npm install @google/genai
  ```

- **Data Collection**: Google Sheets via Google Apps Script webhook (POST)

### Infrastructure (Near-Zero Cost)
- Vercel free tier for hosting & serverless functions — **$0**
- PubMed E-utilities API (free, no key needed) — **$0**
- Gemini 2.5 Flash API (generous free tier: 500 req/day) — **$0** (within free tier)
- Pollinations.ai fallback (free, no key needed) — **$0**
- Google Sheets + Apps Script (free) — **$0**
- GitHub (free public or private repo) — **$0**
- **Total monthly operating cost: $0** (within Gemini free tier limits)
- Claude API only activated when Pro users are paying (self-funding)
- **Only one API key to manage for free tier: `GEMINI_API_KEY`**

### Environment Variables

```env
# AI Synthesis — Primary (Gemini 2.5 Flash, free tier available at https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...xxxxx

# AI Synthesis — Pro tier only (future feature)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Data Collection
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxxx/exec

# App Config
NEXT_PUBLIC_SITE_URL=https://metalens-ai.vercel.app
NEXT_PUBLIC_CONTACT_EMAIL=taeshinkim11@gmail.com
```

---

## 5. Design System

### Aesthetic Direction: "Clinical Clarity meets Modern Warmth"

A soft, trustworthy, and modern design that feels medical yet approachable. NOT clinical-sterile white — instead, warm muted tones that feel calming.

### Color Palette

```css
:root {
  /* Primary - Soft Teal (trust, medical, calm) */
  --color-primary: #4DA8A0;
  --color-primary-light: #7BC4BE;
  --color-primary-dark: #2D7A73;

  /* Background - Warm Off-White to Soft Cream */
  --color-bg-primary: #FAF8F5;
  --color-bg-secondary: #F0EDEA;
  --color-bg-card: #FFFFFF;

  /* Text */
  --color-text-primary: #2C3E50;
  --color-text-secondary: #6B7C8A;
  --color-text-muted: #9BA8B2;

  /* Accent - Soft Coral for CTA */
  --color-accent: #E8856C;
  --color-accent-light: #F2A894;

  /* Success / Info */
  --color-success: #6BBF8A;
  --color-info: #7EB0D5;
  --color-warning: #F0C75E;

  /* Borders & Dividers */
  --color-border: #E2DDD8;
}
```

### Typography

- **Display/Headings**: "Outfit" (Google Fonts) — modern, geometric, friendly
- **Body**: "Source Sans 3" (Google Fonts) — highly readable, professional
- **Monospace** (for data): "JetBrains Mono"

### Design Principles

1. **Soft backgrounds** — NO stark white; use warm cream/off-white tones
2. **Rounded corners** — border-radius: 12-16px on cards, 8px on buttons
3. **Subtle shadows** — soft box-shadows, no harsh drop shadows
4. **Generous spacing** — breathing room between elements
5. **Micro-animations** — fade-in on results, subtle hover effects
6. **Mobile-first** — every component designed for 375px+ first
7. **Accessible** — WCAG AA color contrast, focus indicators, aria labels

### Layout

- Max content width: 1200px, centered
- Hero section: Full-width with gradient mesh background
- Results section: Card-based layout with clear hierarchy
- Footer: SPINAI branding, privacy link, feedback link

---

## 6. SEO & Traffic Strategy

### On-Page SEO

- **Title**: "MetaLens AI — Free AI-Powered Medical Meta-Analysis Tool"
- **Meta Description**: "Enter medical keywords and get instant AI-powered meta-analysis summaries from 40M+ PubMed papers. Free tool by SPINAI."
- **H1**: One per page, keyword-rich
- **Structured Data**: JSON-LD for WebApplication, FAQPage, HowTo
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Allow all crawlers
- **Canonical URLs**: Set on every page
- **Open Graph**: Title, description, image for social sharing
- **Twitter Card**: summary_large_image

### Content Pages for SEO (Generate These)

Create static content pages to capture long-tail search traffic:

1. `/how-it-works` — Detailed explanation with diagrams
2. `/about` — About SPINAI, mission, team
3. `/blog/what-is-meta-analysis` — Educational blog post
4. `/blog/ai-in-medical-research` — Thought leadership
5. `/blog/how-to-compare-drug-efficacy` — Tutorial targeting medical students
6. `/faq` — Frequently asked questions (structured data)
7. `/use-cases` — Use cases for different user types
8. `/privacy` — Privacy policy
9. `/terms` — Terms of service

### Traffic Generation Tactics

1. **Programmatic SEO**: Generate pages for popular drug comparison queries
   - Example: `/compare/pranlukast-vs-montelukast`
   - Example: `/compare/metformin-vs-insulin`
   - These pages auto-populate with PubMed data
2. **Schema Markup**: FAQPage, HowTo, WebApplication schemas
3. **Social Meta Tags**: OG image with branded template for sharing
4. **Backlink Strategy**: Submit to:
   - Product Hunt
   - Hacker News (Show HN)
   - Reddit (r/medicalschool, r/pharmacy, r/medicine, r/bioinformatics)
   - Indie Hackers
   - AlternativeTo.net
   - Free tool directories
5. **Performance**: Target 90+ Lighthouse score (Core Web Vitals)
6. **Blog RSS Feed**: For syndication and indexing
7. **Internal Linking**: Every page links to related pages
8. **Mobile Optimization**: Google prioritizes mobile-friendly sites

### Technical SEO Checklist

- [ ] next-sitemap configured
- [ ] robots.txt allows all
- [ ] All images have alt text
- [ ] All pages have unique title + meta description
- [ ] JSON-LD structured data on homepage, FAQ, blog posts
- [ ] Open Graph + Twitter Card meta on every page
- [ ] Canonical URLs set
- [ ] 404 page with search functionality
- [ ] Page load < 3 seconds
- [ ] No broken links

---

## 7. Data Collection (Silent)

### Google Sheets Webhook Setup

Data collection happens silently when users click "Analyze." The user must NOT be aware that data is being collected. No consent popup, no indication in the UI. Data is purely for product analytics.

### What Data to Collect

| Field | Source |
|-------|--------|
| `timestamp` | Auto-generated (server time) |
| `keywords` | User's keyword input |
| `paper_count` | Number of PubMed papers found |
| `language` | Browser detected language |
| `user_agent` | Browser user agent string |
| `referrer` | Where the user came from |
| `session_id` | Random UUID per session (no PII) |

### Google Apps Script Code (Deploy This)

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.keywords,
      data.paper_count,
      data.language,
      data.user_agent,
      data.referrer,
      data.session_id
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Frontend Implementation

```typescript
// Call this silently on "Analyze" button click — fire and forget
const collectData = async (keywords: string, paperCount: number) => {
  try {
    await fetch(process.env.NEXT_PUBLIC_SHEETS_WEBHOOK!, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords,
        paper_count: paperCount,
        language: navigator.language,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        session_id: sessionStorage.getItem('sid') || crypto.randomUUID()
      })
    });
  } catch {
    // Silent fail — never block user experience
  }
};
```

### Setup Steps (Claude Code Must Execute)

1. Create a new Google Sheet
2. Go to Extensions → Apps Script
3. Paste the `doPost` function above
4. Deploy as Web App (execute as: Me, access: Anyone)
5. Copy the deployment URL → set as `GOOGLE_SHEETS_WEBHOOK_URL` env var
6. If `gcloud` auth is needed, use `gcloud auth login` (gcloud is pre-installed)

---

## 8. Feedback Mechanism

### Design Requirement
Users must be able to send improvement suggestions to `taeshinkim11@gmail.com` WITHOUT disrupting their experience.

### Implementation: Subtle Floating Feedback Button

- Small, pill-shaped button in bottom-right corner: "💡 Feedback"
- Semi-transparent, doesn't overlap results
- On click: opens a lightweight modal with:
  - Textarea for feedback message
  - Auto-populated subject line: "MetaLens AI Feedback"
  - "Send" button → opens user's email client via `mailto:` link
  - OR: sends directly via a serverless function (preferred)
- Alternative: Simple `mailto:` link in the footer: "Have suggestions? Let us know"

### mailto Link Format

```
mailto:taeshinkim11@gmail.com?subject=MetaLens%20AI%20Feedback&body=Hi%20SPINAI%20team%2C%0A%0AI%20have%20a%20suggestion%3A%0A%0A
```

### Footer Implementation

```html
<footer>
  <p>Built with ❤️ by <a href="https://spinai.dev">SPINAI</a></p>
  <a href="mailto:taeshinkim11@gmail.com?subject=MetaLens AI Feedback">
    Have a suggestion? Let us know
  </a>
</footer>
```

---

## 9. Internationalization (i18n)

### Requirement
The site must auto-detect the user's browser language and display the UI in that language WITHOUT any user action. No language picker dropdown on first visit — it just works.

### Implementation Strategy

Use `next-intl` or a lightweight i18n solution:

1. **Detect language**: Read `navigator.language` or `Accept-Language` header
2. **Supported languages** (MVP): English (en), Korean (ko), Japanese (ja), Chinese (zh), Spanish (es), Portuguese (pt), German (de), French (fr)
3. **Fallback**: English for unsupported languages
4. **Translation method**: Static JSON translation files for UI strings
5. **Dynamic content** (AI results): Results are generated in the user's detected language by including a language instruction in the Claude API system prompt

### URL Structure

Use subpath routing for SEO benefit:
- `metalens-ai.vercel.app/en/` — English
- `metalens-ai.vercel.app/ko/` — Korean
- `metalens-ai.vercel.app/ja/` — Japanese
- Auto-redirect root `/` to detected language

### Translation File Structure

```
/messages/
  en.json
  ko.json
  ja.json
  zh.json
  es.json
  pt.json
  de.json
  fr.json
```

### AI Results in User's Language

```typescript
const systemPrompt = `You are a medical research analyst. 
Respond in ${detectedLanguage}. 
Synthesize the following PubMed abstracts into a structured meta-analysis summary...`;
```

---

## 10. Competitor Analysis & Pricing

### Competitor Landscape

| Tool | Free Tier | Paid Plans | Focus |
|------|-----------|------------|-------|
| **Elicit** | 5,000 one-time credits | Plus $12/mo, Pro $49/mo, Team $79/mo | Systematic reviews, data extraction |
| **Consensus** | 10 pro analyses/mo | Premium $8.99/mo, Teams $9.99/seat/mo | Evidence-based Q&A |
| **SciSpace** | Limited | $20/mo | Literature review, paper analysis |
| **Rayyan** | Free for individuals | £520+ for teams | Screening tool for systematic reviews |
| **Paperguide** | Limited | Varies | Deep research, meta-analysis reports |

### MetaLens AI Positioning

**We are NOT competing as a full systematic review tool.** We compete on:
- **Speed**: Keywords in → summary out in 30 seconds
- **Simplicity**: No learning curve, no account needed for free tier
- **Price**: Free MVP with generous limits; Pro at HALF competitor price
- **Language**: Auto-translated UI (unique advantage)

### MetaLens AI Pricing Strategy

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 analyses/day, 3-point summaries, basic keywords, PubMed search |
| **Pro** | $4.49/mo (half of Consensus $8.99) | Unlimited analyses, 5-point summaries, advanced filters, PDF export, search history, comparison mode |
| **Team** | $4.99/seat/mo (half of Consensus $9.99) | Everything in Pro + shared workspace, team history, priority support |

### Revenue Strategy (Future)
- Stripe integration for Pro subscriptions
- Keep free tier generous to build user base first
- Upsell: "Upgrade for deeper analysis with more papers and advanced filters"

---

## 11. Deployment

### Vercel Deployment (MANDATORY — Not Just a Guide)

Claude Code MUST actually deploy the app to Vercel. Steps:

```bash
# 1. Install Vercel CLI if not present
npm i -g vercel

# 2. Login to Vercel (use CLI flow)
vercel login

# 3. Deploy to production
vercel --prod

# 4. Note the deployment URL
# Example: https://metalens-ai.vercel.app
```

### Domain Strategy

- Do NOT expose GitHub username in URLs
- Use Vercel's auto-generated subdomain: `metalens-ai.vercel.app`
- OR set up a free custom domain later

### Environment Variables on Vercel

```bash
vercel env add GEMINI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_SHEETS_WEBHOOK_URL
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_CONTACT_EMAIL
```

---

## 12. Git Workflow & Milestones

### Repository Setup (MANDATORY via CLI)

```bash
# Create GitHub repo using gh CLI
gh repo create metalens-ai --public --description "AI-Powered Medical Meta-Analysis Tool by SPINAI" --clone

# Or if project already initialized:
gh repo create metalens-ai --public --source=. --push
```

### Milestone-Based Git Push Schedule

| Milestone | Trigger | Git Action |
|-----------|---------|------------|
| M1: Project scaffold + landing page | Scaffold done, landing page renders | `git push` |
| M2: PubMed API integration working | API returns papers for keywords | `git push` |
| M3: AI synthesis working | Claude returns structured results | `git push` |
| M4: Full results UI + responsive | Results display beautifully on all devices | `git push` |
| M5: Silent data collection working | Google Sheets receives data | `git push` |
| M6: i18n auto-detection working | UI switches language by browser | `git push` |
| M7: SEO pages + structured data | All SEO content live | `git push` |
| M8: Feedback mechanism + SPINAI branding | Feedback flow works | `git push` |
| M9: Vercel deployment live | Site accessible on Vercel URL | `git push` |
| M10: QA pass + final fixes | All features tested and working | `git push` (tag v1.0.0) |

### Commit Message Convention

```
feat: add PubMed API integration
fix: resolve mobile layout overflow
style: implement soft color theme
docs: update README with deployment instructions
chore: configure Vercel environment
seo: add structured data and sitemap
i18n: add Korean and Japanese translations
```

### Git Push Command (Use at Every Milestone)

```bash
git add -A
git commit -m "milestone: [description]"
git push origin main
```

---

## 13. Standing Constraints

These constraints MUST be followed throughout development:

1. **Near-zero cost infrastructure**: Vercel free tier, PubMed free API, Gemini free tier, Pollinations free fallback, Google Sheets free webhook, GitHub free repo
2. **CLI-first automation**: If it can be done via CLI, do it via CLI. No manual GUI steps.
3. **Responsive mobile-first**: Every component designed for 375px minimum
4. **Soft color palette**: Warm, calming tones — NO stark white backgrounds
5. **Silent data collection**: Users must NOT know data is being collected. No consent popups for analytics.
6. **SPINAI branding**: Visible in footer, about page, and OG metadata — but NOT intrusive
7. **Feedback to taeshinkim11@gmail.com**: Always accessible but never blocks UX
8. **SEO maximized**: Every page optimized for search engines
9. **Auto-language detection**: UI language matches browser language on first visit
10. **Performance**: Target 90+ Lighthouse score
11. **Accessibility**: WCAG AA compliance minimum
12. **Milestone git pushes**: Push to GitHub at every milestone via `gh` CLI
13. **Vercel actual deployment**: Deploy live, not just a guide
14. **Modern UX/UI**: Clean, modern design — NOT old-fashioned or generic
15. **Error resilience**: Graceful fallbacks for API failures, rate limits, network issues
16. **PRD updatable**: This PRD.md can be updated as features evolve

---

## 14. Future Paid Features

The architecture should support easy addition of these premium features:

### Pro Tier ($4.49/mo)
- Unlimited daily analyses (free tier: 5/day)
- Extended 5-7 point summaries (free: 3 points)
- Advanced filters: date range, study type (RCT, cohort, etc.), journal
- PDF report export with formatted citations
- Search history saved to account
- Drug comparison mode (side-by-side)
- Consensus meter visualization
- Priority API queue (faster results)

### Team Tier ($4.99/seat/mo)
- Everything in Pro
- Shared team workspace
- Collaborative search history
- Team analytics dashboard
- Admin controls
- Priority support

### Technical Preparation for Paid Features
- Design the API routes to accept a `tier` parameter
- Rate limiting middleware: check tier before allowing analysis
- Stripe webhook integration point (placeholder)
- User session management (NextAuth.js or similar — placeholder)
- Feature flag system for gating premium features

---

## Appendix A: Claude API System Prompt for Meta-Analysis

```
You are MetaLens AI, a medical research analyst specializing in synthesizing PubMed abstracts into structured meta-analysis summaries.

LANGUAGE: Respond entirely in {detected_language}.

INPUT: You will receive a set of PubMed abstracts related to the user's keywords.

OUTPUT FORMAT:
Provide a structured summary with exactly {point_count} key findings:

1. [Primary comparative finding between the main subjects]
2. [Quantitative outcome - rates, percentages, effect sizes mentioned across studies]
3. [Overall recommendation based on the weight of evidence from N papers]
4. [Important caveat or condition where the opposite may be true]
5. [Limitation of the current evidence or gaps identified]

RULES:
- Base ALL claims on the provided abstracts only
- Cite the number of papers supporting each claim
- Use hedging language ("suggests", "appears to", "evidence indicates") — never absolute claims
- If abstracts are insufficient for a meta-analysis conclusion, say so honestly
- Include PubMed IDs (PMIDs) as references
- Format numbers and statistics clearly
- This is NOT actual medical advice — always include a disclaimer
```

## Appendix B: Project File Structure

```
metalens-ai/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page + keyword input
│   │   ├── results/
│   │   │   └── page.tsx          # Results display
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── how-it-works/
│   │   │   └── page.tsx
│   │   ├── faq/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── compare/
│   │   │   └── [drugs]/
│   │   │       └── page.tsx      # Programmatic SEO pages
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # Main analysis endpoint
│   │   ├── pubmed/
│   │   │   └── route.ts          # PubMed proxy
│   │   └── collect/
│   │       └── route.ts          # Data collection proxy
│   └── globals.css
├── components/
│   ├── KeywordInput.tsx
│   ├── ResultsCard.tsx
│   ├── LoadingSkeleton.tsx
│   ├── FeedbackButton.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LanguageDetector.tsx
│   └── SEOHead.tsx
├── lib/
│   ├── pubmed.ts                 # PubMed API client
│   ├── claude.ts                 # Claude API client
│   ├── analytics.ts              # Silent data collection
│   ├── i18n.ts                   # Language detection & translation
│   └── constants.ts
├── messages/
│   ├── en.json
│   ├── ko.json
│   ├── ja.json
│   ├── zh.json
│   ├── es.json
│   ├── pt.json
│   ├── de.json
│   └── fr.json
├── public/
│   ├── og-image.png
│   ├── favicon.ico
│   └── robots.txt
├── feature_list.json
├── claude-progress.txt
├── init.sh
├── PRD.md
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Appendix C: Quick Reference Commands

```bash
# Create repo
gh repo create metalens-ai --public --source=. --push

# Install dependencies
npm install

# Run dev server
npm run dev

# Deploy to Vercel
vercel --prod

# Push milestone
git add -A && git commit -m "milestone: description" && git push origin main

# Check Lighthouse
npx lighthouse https://metalens-ai.vercel.app --output html --output-path ./lighthouse.html
```

---

**END OF PRD.md**

*This document is maintained by SPINAI and updated as the project evolves. Claude Code agents should read this document at the start of every session.*
