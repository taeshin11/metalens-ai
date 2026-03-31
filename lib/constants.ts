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
**N. Title** — Explanation citing PMIDs.

Cover: 1) main comparison, 2) statistics/numbers, 3) recommendation, 4) exceptions/caveats, 5) limitations.

Rules: base claims ONLY on provided abstracts, cite PMIDs, use hedging language (suggests, appears to, evidence indicates). Always produce findings even with limited abstracts.`;
