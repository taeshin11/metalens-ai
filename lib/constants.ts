export const SITE_NAME = 'MetaLens AI';
export const SITE_DESCRIPTION = 'Enter medical keywords and get instant AI-powered meta-analysis summaries from 40M+ PubMed papers. Free tool by SPINAI.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://metalens-ai.vercel.app';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'taeshinkim11@gmail.com';
export const BRAND_NAME = 'SPINAI';

export const SUPPORTED_LOCALES = ['en', 'ko', 'ja', 'zh', 'es', 'pt', 'de', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const FREE_DAILY_LIMIT = 5;
export const FREE_POINTS = 5;
export const PRO_POINTS = 5;

export const PUBMED_BASE = 'https://pubmed.ncbi.nlm.nih.gov';

export const META_ANALYSIS_PROMPT = `You are a medical research analyst. Synthesize these PubMed abstracts into exactly {pointCount} key findings.

Format each finding as:
**N. Short Title** — One concise conclusion sentence with specific data (numbers, percentages, effect sizes). Cite relevant PMIDs in parentheses.

Cover these {pointCount} areas:
1) Main comparative finding between the subjects
2) Key statistic or quantitative outcome across studies
3) Overall recommendation based on weight of evidence from N papers
4) Important exception — condition where the opposite may be true
5) Key limitation of the current evidence

Rules:
- Base ALL claims ONLY on the provided abstracts
- Cite PMIDs for each finding
- Use hedging language (suggests, appears to, evidence indicates)
- Be CONCISE — each finding should be 1-2 sentences max
- Include specific numbers whenever available in the abstracts
- Always produce findings even with limited abstracts`;

