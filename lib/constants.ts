export const SITE_NAME = 'MetaLens AI';
export const SITE_DESCRIPTION = 'Enter medical keywords and get instant AI-powered meta-analysis summaries from 40M+ PubMed papers. Free tool by SPINAI.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://metalens-ai.com';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'taeshinkim11@gmail.com';
export const BRAND_NAME = 'SPINAI';

export const SUPPORTED_LOCALES = ['en', 'ko', 'ja', 'zh', 'es', 'pt', 'de', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

// === Tier System ===
export type Tier = 'free' | 'pro';

export const TIER_CONFIG = {
  free: {
    dailyLimit: 3,       // lifetime total limit for free tier
    pointCount: 3,
    model: 'gemini-2.5-flash',
    label: 'Free',
    price: 0,
    yearlyPrice: 0,
  },
  pro: {
    dailyLimit: 200,
    pointCount: 10,
    model: 'gemini-2.5-flash',
    label: 'Pro',
    price: 4.99,
    yearlyPrice: 39.99,
  },
} as const;

// Lemon Squeezy Variant IDs (set in env)
export const LS_VARIANTS = {
  pro_monthly: process.env.LS_VARIANT_PRO_MONTHLY || '',
  pro_yearly: process.env.LS_VARIANT_PRO_YEARLY || '',
};

// Legacy compat
export const FREE_DAILY_LIMIT = TIER_CONFIG.free.dailyLimit;
export const FREE_POINTS = TIER_CONFIG.free.pointCount;
export const PRO_POINTS = TIER_CONFIG.pro.pointCount;

export const BETA_END = new Date('2026-04-16T00:00:00Z');

export const PUBMED_BASE = 'https://pubmed.ncbi.nlm.nih.gov';

export const META_ANALYSIS_PROMPT = `Synthesize these PubMed abstracts into exactly {pointCount} key findings.

Format each finding as: **N. Title** — detailed conclusion with specific data, statistics, and (PMIDs).

PRIORITY ORDER for findings (most important first):
1) Established guidelines or consensus recommendations
2) Key treatment/intervention recommendation
3) Main comparative finding — include effect sizes, odds ratios, or percentages
4) Key quantitative outcomes — specific rates, p-values, CIs, or NNT
5) Important exception or subgroup where the opposite may be true
6) Safety concerns or adverse effects — if relevant
7) Limitations of current evidence — gaps, heterogeneity, bias risks

Rules:
- ORDER findings by CLINICAL IMPORTANCE, not by the order the abstracts appear
- Give highest weight to: practice guidelines > systematic reviews/meta-analyses > RCTs > observational studies
- Each finding MUST be 3-5 sentences long with dense quantitative data
- MANDATORY in every finding — all three must appear:
  (a) exact effect size (HR, OR, RR, SMD, mean difference, or percentage)
  (b) p-value written as p<0.001 or p=0.03 (extract from abstract; if truly absent write "p-value not reported")
  (c) sample size written as N=1089 or (8 RCTs, N=3507) — always use N= prefix, never just "patients"
- EXAMPLES:
  BAD: "significant differences in weight change" — vague, no numbers
  BAD: "3507 patients across six studies" — missing N= prefix and stats
  GOOD: "weight -6.3 kg vs +1.9 kg (ETD -5.17, 95% CI: -5.88 to -4.46, p<0.0001, N=1089)"
  GOOD: "SMD -0.99 (95% CI: -1.27 to -0.71, 6 RCTs, N=3507)"
- When 95% CI is available, ALWAYS include it: (95% CI: X.XX–X.XX)
- Do NOT paraphrase numbers as "significant" or "substantial" — write the actual number
- PMID citation format: (PMID: 38947123). Rules:
  - Use ONLY the real 7-8 digit PMID from the abstracts above
  - NEVER append bracket numbers: BAD "(PMID: 33428176, 6)" GOOD "(PMID: 33428176)"
  - NEVER invent a PMID — if unsure, omit the citation entirely
  - Each finding should cite 1-2 PMIDs, never more than 3
- Use hedging language ("suggests", "appears to", "evidence indicates")
- If a guideline contradicts individual studies, note the guideline position first`;

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
- Cite PMIDs using the ACTUAL numeric PMID from the abstracts above, e.g. (PMID: 38947123). NEVER use bracket references like [1] or [2]. NEVER invent or guess a PMID — only cite PMIDs that appear in the provided abstracts. A real PMID is always 7-8 digits long
- Include specific numbers: sample sizes, effect sizes, p-values, confidence intervals for each cited study
- When identifying gaps, explain WHY the gap matters clinically
- If the topic is well-studied, be honest — suggest unique angles instead
- Use evidence hierarchy: systematic reviews > RCTs > cohort > case-control > case series`;

