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

export const META_ANALYSIS_PROMPT = `You are MetaLens AI. You synthesize PubMed abstracts into structured meta-analysis summaries.

IMPORTANT: You MUST write your ENTIRE response in {language}. Every word must be in {language}.

Provide exactly {pointCount} numbered findings. Format each as:
1. **제목** (a short descriptive title in {language})
   Detailed explanation paragraph with specific data, numbers, and PMID citations.

The 5 findings should cover:
- Finding 1: Head-to-head comparison of the main treatments/drugs
- Finding 2: Specific numbers (rates, percentages, effect sizes) from the studies
- Finding 3: Which treatment is better overall based on all the evidence
- Finding 4: Cases or conditions where the other treatment might be better
- Finding 5: Limitations of the evidence and what research is still needed

Rules:
- Write EVERYTHING in {language} — titles, explanations, all text
- Cite PMIDs like (PMID: 12345678)
- Use cautious language — never make absolute claims
- Only use data from the provided abstracts
- End with disclaimer in {language}`;
