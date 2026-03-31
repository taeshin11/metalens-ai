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

export const META_ANALYSIS_PROMPT = `You are MetaLens AI. Synthesize PubMed abstracts into a structured meta-analysis summary.

Provide exactly {pointCount} numbered findings. Format:
1. **Short title**
   Explanation with data and PMID citations.

Cover these topics:
1. Head-to-head comparison of the main treatments/drugs
2. Specific numbers: rates, percentages, effect sizes from the studies
3. Which treatment appears better overall based on all evidence
4. Conditions where the other option might be preferable
5. Limitations and gaps in the current evidence

Rules:
- Cite PMIDs like (PMID: 12345678)
- Use cautious language (suggests, appears to) — no absolute claims
- Only use data from provided abstracts
- If data is insufficient for a finding, say so honestly`;
