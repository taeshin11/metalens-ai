export const SITE_NAME = 'MetaLens AI';
export const SITE_DESCRIPTION = 'Enter medical keywords and get instant AI-powered meta-analysis summaries from 40M+ PubMed papers. Free tool by SPINAI.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://metalens-ai.vercel.app';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'taeshinkim11@gmail.com';
export const BRAND_NAME = 'SPINAI';

export const SUPPORTED_LOCALES = ['en', 'ko', 'ja', 'zh', 'es', 'pt', 'de', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// === Tier System ===
export type Tier = 'free' | 'pro' | 'ultra';

export const TIER_CONFIG = {
  free: {
    dailyLimit: 999,              // TEMP: unlimited during beta
    pointCount: 7,                // TEMP: same as Pro during beta
    model: 'gemini-2.5-flash',    // free tier of Gemini
    label: 'Free',
    price: 0,
    yearlyPrice: 0,
  },
  pro: {
    dailyLimit: 50,
    pointCount: 7,
    model: 'gemini-2.0-flash-lite', // cheapest paid Gemini
    label: 'Pro',
    price: 2.99,
    yearlyPrice: 29.99,
  },
  ultra: {
    dailyLimit: 200,
    pointCount: 10,
    model: 'gemini-2.5-flash',     // best Gemini model (paid quota)
    label: 'Ultra',
    price: 6.99,
    yearlyPrice: 69.99,
  },
} as const;

// Lemon Squeezy Variant IDs (set in env)
export const LS_VARIANTS = {
  pro_monthly: process.env.LS_VARIANT_PRO_MONTHLY || '',
  pro_yearly: process.env.LS_VARIANT_PRO_YEARLY || '',
  ultra_monthly: process.env.LS_VARIANT_ULTRA_MONTHLY || '',
  ultra_yearly: process.env.LS_VARIANT_ULTRA_YEARLY || '',
};

// Legacy compat
export const FREE_DAILY_LIMIT = TIER_CONFIG.free.dailyLimit;
export const FREE_POINTS = TIER_CONFIG.free.pointCount;
export const PRO_POINTS = TIER_CONFIG.pro.pointCount;

export const PUBMED_BASE = 'https://pubmed.ncbi.nlm.nih.gov';

export const META_ANALYSIS_PROMPT = `Synthesize these PubMed abstracts into exactly {pointCount} key findings.

Format each finding as: **N. Title** — detailed conclusion with specific data, statistics, and (PMIDs).

PRIORITY ORDER for findings (most important first):
1) Established guidelines or consensus recommendations — if any abstracts are from practice guidelines, systematic reviews, or consensus statements, their conclusions should come FIRST as they represent the highest level of evidence
2) Key treatment/intervention recommendation — what does the overall evidence suggest as the standard approach?
3) Main comparative finding between the subjects — include effect sizes, odds ratios, or percentages
4) Key quantitative outcomes — specific rates, p-values, confidence intervals, or NNT
5) Important exception or subgroup where the opposite may be true — specify the population or condition
6) Safety concerns or adverse effects — if relevant
7) Limitations of current evidence — gaps, heterogeneity, bias risks

Rules:
- ORDER findings by CLINICAL IMPORTANCE, not by the order the abstracts appear
- Give highest weight to: practice guidelines > systematic reviews/meta-analyses > RCTs > observational studies
- Extract and cite specific numbers from the abstracts (percentages, p-values, sample sizes, effect sizes)
- Cite PMIDs for each claim
- Use hedging language ("suggests", "appears to", "evidence indicates")
- Each finding should be 2-4 sentences with concrete data
- If a guideline or review article contradicts individual studies, note the guideline position first`;

export const GAP_FINDER_PROMPT = `You are a research gap analyst. Analyze these PubMed abstracts to help a researcher determine if their research idea is novel.

Your output should have exactly {pointCount} sections, formatted as **N. Section Title** — content.

REQUIRED SECTIONS (in this order):
1) **Existing Research Landscape** — What study designs exist on this topic? (RCTs, cohort, case-control, meta-analyses, reviews, case reports). List study types with counts and key PMIDs.
2) **Key Findings So Far** — What is already established/known? Summarize the consensus from the literature with specific data.
3) **Research Gaps Identified** — What has NOT been studied? What study designs are MISSING? What populations, outcomes, or comparisons are unexplored? This is the most important section.
4) **Suggested Research Directions** — Based on the gaps, propose 2-3 specific study ideas. Include: study design (RCT, prospective cohort, etc.), target population, primary outcome, estimated sample size if inferrable.
5) **Novelty Assessment** — If the researcher were to conduct a new study on this topic, how novel would it be? Rate as: "Highly Novel" (no similar studies), "Moderately Novel" (few studies, different design needed), or "Low Novelty" (well-studied area, need unique angle).
6) **Similar Existing Studies** — List the most directly relevant existing studies with PMIDs, designs, and sample sizes.
7) **Recommended Next Steps** — What should the researcher do next? (e.g., "Focus on prospective design since all existing studies are retrospective", "Consider pediatric population as it is understudied")

Rules:
- Be specific about what EXISTS vs what DOES NOT EXIST
- Cite PMIDs for every claim about existing studies
- When identifying gaps, explain WHY the gap matters clinically
- If the topic is well-studied, be honest — suggest unique angles instead
- Use evidence hierarchy: systematic reviews > RCTs > cohort > case-control > case series`;

