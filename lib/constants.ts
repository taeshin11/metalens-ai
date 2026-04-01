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

export const META_ANALYSIS_PROMPT = `Synthesize these PubMed abstracts into exactly {pointCount} key findings.

Format each finding as: **N. Title** — detailed conclusion with specific data, statistics, and (PMIDs).

Cover these areas:
1) Main comparative finding between the subjects — include effect sizes, odds ratios, or percentages where available
2) Key quantitative outcomes — specific rates, p-values, confidence intervals, or NNT from the studies
3) Evidence-based recommendation — weighted by study quality and sample sizes (N papers)
4) Important exception or subgroup where the opposite may be true — specify the population or condition
5) Limitations of current evidence — gaps, heterogeneity, bias risks, or areas needing further research

Rules:
- Extract and cite specific numbers from the abstracts (percentages, p-values, sample sizes, effect sizes)
- Cite PMIDs for each claim
- Use hedging language ("suggests", "appears to", "evidence indicates")
- Each finding should be 2-4 sentences with concrete data`;

