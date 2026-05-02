import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { COMPARISONS } from '@/lib/comparisons';
import { koreanBlogPosts } from '@/lib/blog-content-ko';
import { japaneseBlogPosts } from '@/lib/blog-content-ja';
import { chineseBlogPosts } from '@/lib/blog-content-zh';
import { germanBlogPosts } from '@/lib/blog-content-de';
import { frenchBlogPosts } from '@/lib/blog-content-fr';
import { spanishBlogPosts } from '@/lib/blog-content-es';
import { portugueseBlogPosts } from '@/lib/blog-content-pt';

type BlogContent = {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tag: string;
  sections: { heading: string; body: string }[];
};

const blogPosts: Record<string, BlogContent> = {
  'what-is-meta-analysis': {
    title: 'What Is a Meta-Analysis? A Beginner\'s Guide',
    description: 'Learn what meta-analysis is, why it matters in medical research, and how AI tools like MetaLens make it accessible.',
    date: '2026-03-15',
    readTime: '6 min read',
    tag: 'Education',
    sections: [
      {
        heading: 'What Is a Meta-Analysis?',
        body: 'A meta-analysis is a statistical method that combines the results of multiple scientific studies addressing a related research question. Unlike a single study that might have a limited sample size or specific conditions, a meta-analysis pools data from many studies to produce a more reliable estimate of an effect.\n\nFor example, if 20 different clinical trials have each studied whether Drug A is more effective than Drug B for treating hypertension, a meta-analysis would systematically combine those findings to reach a stronger, more generalizable conclusion.',
      },
      {
        heading: 'Why Does Meta-Analysis Matter?',
        body: 'Meta-analyses sit at the top of the evidence hierarchy in medicine. They provide the strongest form of evidence because they:\n\n- Increase statistical power by combining sample sizes across studies\n- Reduce the impact of individual study biases\n- Resolve conflicts when different studies show contradictory results\n- Identify patterns and effects that individual studies might miss\n- Guide clinical practice guidelines and policy decisions\n\nWhen a doctor decides which treatment to recommend, meta-analyses are often the gold standard they turn to.',
      },
      {
        heading: 'The Traditional Meta-Analysis Process',
        body: 'Conducting a traditional meta-analysis is time-intensive. Researchers must:\n\n1. Define a clear research question\n2. Search multiple databases (PubMed, Cochrane, Embase) for relevant studies\n3. Screen thousands of papers for inclusion/exclusion criteria\n4. Extract data from each qualifying study\n5. Assess the quality and risk of bias in each study\n6. Apply statistical methods (fixed-effect or random-effects models)\n7. Interpret results and write up findings\n\nThis process can take weeks to months, even for experienced researchers.',
      },
      {
        heading: 'How AI Is Changing Meta-Analysis',
        body: 'AI tools like MetaLens AI are making preliminary meta-analysis accessible to everyone. While they don\'t replace formal systematic reviews, they can:\n\n- Search PubMed\'s 40M+ papers in seconds\n- Identify relevant studies based on keywords\n- Read and synthesize abstracts automatically\n- Generate structured summaries with key findings\n- Provide source citations for verification\n\nThis is particularly valuable for medical students doing preliminary literature reviews, pharmacists comparing drug options, and researchers scoping a topic before committing to a full systematic review.',
      },
      {
        heading: 'Limitations to Keep in Mind',
        body: 'AI-powered meta-analysis tools have important limitations:\n\n- They work with abstracts, not full-text papers\n- They cannot perform formal statistical pooling\n- Results should be verified against original sources\n- They may miss relevant studies or include low-quality ones\n- They are not a substitute for clinical judgment\n\nAlways treat AI-generated summaries as a starting point for further investigation, not as definitive medical evidence.',
      },
    ],
  },
  'ai-in-medical-research': {
    title: 'How AI Is Transforming Medical Research in 2026',
    description: 'Explore how artificial intelligence is reshaping medical research from drug discovery to literature reviews.',
    date: '2026-03-20',
    readTime: '8 min read',
    tag: 'AI & Healthcare',
    sections: [
      {
        heading: 'The AI Revolution in Healthcare',
        body: 'Artificial intelligence has moved from a futuristic concept to an everyday tool in medical research. In 2026, AI assists researchers at nearly every stage of the scientific process \u2014 from generating hypotheses to analyzing results.\n\nThe convergence of large language models, massive biomedical datasets, and affordable cloud computing has created an unprecedented acceleration in how quickly we can process and understand medical evidence.',
      },
      {
        heading: 'Literature Review and Evidence Synthesis',
        body: 'One of the most impactful applications of AI in medicine is automated literature review. Tools powered by AI can:\n\n- Search millions of papers in seconds (vs. weeks of manual searching)\n- Identify relevant studies based on semantic understanding, not just keyword matching\n- Summarize findings across dozens of papers into structured summaries\n- Detect trends and consensus across large bodies of evidence\n\nMetaLens AI is part of this wave, making PubMed\'s 40M+ papers accessible through simple keyword searches and AI-powered synthesis.',
      },
      {
        heading: 'Drug Discovery and Development',
        body: 'AI is dramatically accelerating the drug discovery pipeline:\n\n- Molecular modeling: AI predicts how drug candidates will interact with biological targets\n- Clinical trial optimization: Machine learning identifies ideal patient populations and endpoints\n- Repurposing: AI finds new uses for existing drugs by analyzing patterns across studies\n- Safety prediction: Models flag potential side effects before costly clinical trials\n\nWhat once took years of trial-and-error can now be narrowed down in months, saving billions in development costs.',
      },
      {
        heading: 'Diagnostic AI',
        body: 'AI-powered diagnostics are already in clinical use:\n\n- Medical imaging: AI detects cancers, fractures, and retinal diseases in radiology and ophthalmology images with accuracy matching or exceeding specialists\n- Pathology: Digital pathology AI assists in analyzing tissue samples\n- Genomics: AI interprets genetic variants and predicts disease risk\n- Wearables: Continuous monitoring with AI-powered alerts for cardiac events and other conditions\n\nThese tools augment clinicians rather than replace them, providing a second opinion and catching subtle findings.',
      },
      {
        heading: 'Challenges and Ethical Considerations',
        body: 'Despite the promise, AI in medical research faces important challenges:\n\n- Bias: AI models can perpetuate biases present in training data, potentially disadvantaging underrepresented populations\n- Transparency: "Black box" models can be difficult to interpret in clinical settings\n- Validation: AI tools need rigorous clinical validation before deployment\n- Privacy: Patient data used to train models must be protected\n- Misinformation: AI can generate plausible-sounding but incorrect medical information\n\nResponsible development and regulation are essential to ensure AI benefits all patients equitably.',
      },
      {
        heading: 'Looking Ahead',
        body: 'The future of AI in medical research is bright. We can expect:\n\n- Personalized medicine powered by AI analysis of individual patient data\n- Real-time evidence synthesis as new studies are published\n- AI-assisted clinical decision support integrated into electronic health records\n- Collaborative AI tools that help research teams work more efficiently across borders\n\nTools like MetaLens AI represent just the beginning of a transformation that will make medical evidence more accessible, understandable, and actionable for everyone.',
      },
    ],
  },
  'understanding-forest-plots': {
    title: 'Understanding Forest Plots and Funnel Plots in Meta-Analysis',
    description: 'A visual guide to interpreting forest plots and funnel plots — two essential tools for communicating meta-analysis results.',
    date: '2026-04-01',
    readTime: '7 min read',
    tag: 'Statistics',
    sections: [
      {
        heading: 'What Is a Forest Plot?',
        body: 'A forest plot is the signature visualization of a meta-analysis. It displays the results of individual studies as horizontal lines with squares, and combines them into a single diamond at the bottom representing the pooled estimate.\n\nEach component tells a story:\n- **The square**: the point estimate (e.g., odds ratio, mean difference) for each individual study\n- **The horizontal line**: the 95% confidence interval — wider means more uncertainty\n- **The size of the square**: proportional to the study\'s statistical weight (larger studies get bigger squares)\n- **The vertical line**: the line of no effect (usually 0 for differences, 1 for ratios)\n- **The diamond**: the pooled effect across all studies (width = confidence interval)',
      },
      {
        heading: 'How to Read a Forest Plot',
        body: 'Reading a forest plot from top to bottom:\n\n1. Look at each study\'s square position — is it to the left or right of the null line?\n2. Check the confidence interval — does it cross the null line? If so, that study is not statistically significant on its own\n3. Notice the diamond at the bottom — if it doesn\'t cross the null line, the pooled result is statistically significant\n4. Look for consistency — are most studies pointing in the same direction?\n\nA forest plot that shows most squares on one side with a diamond that doesn\'t cross the null line indicates strong, consistent evidence for an effect.',
      },
      {
        heading: 'The I² Statistic: Measuring Heterogeneity',
        body: 'Heterogeneity refers to variability among study results beyond what would be expected by chance. The I² statistic quantifies this:\n\n- **I² 0–25%**: Low heterogeneity — studies are fairly consistent\n- **I² 26–50%**: Moderate heterogeneity\n- **I² 51–75%**: Substantial heterogeneity\n- **I² >75%**: High heterogeneity — results vary considerably\n\nHigh heterogeneity is a red flag. It may indicate that studies measured different things, included different patient populations, or used different interventions. When I² is high, a random-effects model is preferred over a fixed-effect model.',
      },
      {
        heading: 'What Is a Funnel Plot?',
        body: 'A funnel plot is used to detect publication bias — the tendency for positive studies to be published more often than negative ones.\n\nIn a funnel plot:\n- Each study is plotted as a dot\n- The x-axis shows the effect size\n- The y-axis shows the study\'s precision (usually standard error or sample size)\n- Large precise studies cluster at the top; small imprecise studies scatter at the bottom\n\nIf there\'s no publication bias, the dots form a symmetrical inverted funnel shape. Asymmetry — especially gaps at the bottom corners — suggests that small negative studies may be missing from the literature.',
      },
      {
        heading: 'Common Misinterpretations to Avoid',
        body: 'Several common mistakes when reading these plots:\n\n- **Confusing statistical and clinical significance**: A statistically significant pooled result may still represent a clinically trivial effect size\n- **Ignoring heterogeneity**: A pooled estimate is misleading if I² is very high\n- **Over-interpreting funnel plot asymmetry**: Small asymmetries may just reflect chance, especially with fewer than 10 studies\n- **Missing the scale**: The x-axis scale matters — odds ratios of 0.95 vs 0.50 are very different\n\nAlways read the forest plot in context with the full methods section of the review.',
      },
      {
        heading: 'How MetaLens AI Uses These Visualizations',
        body: 'MetaLens AI automatically generates forest plots and funnel plots when sufficient quantitative data can be extracted from study abstracts.\n\nThe Meta-Analysis tab shows:\n- Individual study estimates with confidence intervals\n- The pooled diamond with 95% CI\n- I² heterogeneity statistic\n- Publication bias funnel plot\n\nThese visualizations help you quickly grasp the direction, magnitude, and consistency of evidence — all from a simple keyword search.',
      },
    ],
  },
  'systematic-review-protocol': {
    title: 'How to Write a Systematic Review Protocol',
    description: 'Step-by-step guidance on creating a PRISMA-compliant systematic review protocol, from PICO framework to pre-registration.',
    date: '2026-04-05',
    readTime: '8 min read',
    tag: 'Tutorial',
    sections: [
      {
        heading: 'Why Write a Protocol First?',
        body: 'A systematic review protocol is a pre-specified plan written before the review is conducted. It\'s the foundation of rigorous, transparent, reproducible research.\n\nWriting the protocol first:\n- Prevents "outcome switching" (changing your research question after seeing the results)\n- Forces you to think through your methods before encountering potential biases\n- Allows peer review of your methods before you invest weeks of work\n- Creates accountability when registered in databases like PROSPERO\n\nWithout a protocol, systematic reviews are vulnerable to the same biases they\'re designed to overcome.',
      },
      {
        heading: 'Step 1: Define Your PICO Question',
        body: 'Every systematic review starts with a well-structured clinical question using the PICO framework:\n\n- **P**opulation: Who are you studying? (e.g., adults with type 2 diabetes)\n- **I**ntervention: What treatment or exposure? (e.g., metformin)\n- **C**omparison: What are you comparing to? (e.g., placebo or other drug)\n- **O**utcome: What are you measuring? (e.g., HbA1c reduction at 6 months)\n\nA well-formed PICO question might be: "In adults with type 2 diabetes (P), does metformin (I) compared to placebo (C) reduce HbA1c by ≥1% at 6 months (O)?"\n\nYour PICO determines everything else — your search strategy, inclusion/exclusion criteria, and data extraction form.',
      },
      {
        heading: 'Step 2: Specify Inclusion and Exclusion Criteria',
        body: 'Pre-specify exactly which studies you will include and exclude:\n\n**Include:**\n- Study types (e.g., RCTs only, or also cohort studies)\n- Population characteristics (age range, diagnosis, setting)\n- Minimum follow-up duration\n- Outcomes reported\n- Language restrictions (if any)\n\n**Exclude:**\n- Case reports and editorials\n- Studies below a minimum sample size\n- Studies with a high risk of bias (define how you will assess this)\n- Duplicate publications\n\nBe as specific as possible. Vague criteria lead to inconsistent screening decisions.',
      },
      {
        heading: 'Step 3: Plan Your Search Strategy',
        body: 'A comprehensive systematic review searches multiple databases:\n\n- **PubMed/MEDLINE**: Essential for biomedical topics\n- **Embase**: Especially for European clinical trials\n- **Cochrane Central Register**: Randomized trials\n- **CINAHL**: Nursing and allied health\n- **ClinicalTrials.gov**: Unpublished or ongoing trials (reduces publication bias)\n\nFor each database, develop a search string using:\n- MeSH terms (controlled vocabulary) AND free-text keywords\n- Boolean operators (AND, OR, NOT)\n- Truncation (*) and wildcards\n\nDocument your exact search string — it must be reproducible. Tools like MetaLens AI can help with initial scoping before you commit to a full search.',
      },
      {
        heading: 'Step 4: Data Extraction Form',
        body: 'Before you start extracting data, design your extraction form. For each included study, you\'ll typically record:\n\n- Study ID, author, year, country\n- Study design and follow-up\n- Population characteristics (sample size, age, sex, baseline severity)\n- Intervention details (dose, duration, comparator)\n- Outcome data (means, SDs, event rates, effect estimates, CIs, p-values)\n- Risk of bias assessment\n\nPilot your form on 2-3 studies before full-scale extraction. Two reviewers extracting independently with arbitration reduces errors.',
      },
      {
        heading: 'Step 5: Register Your Protocol',
        body: 'Pre-registering your protocol increases transparency and credibility:\n\n- **PROSPERO** (prospero.york.ac.uk): The most widely used registry for systematic reviews\n- **Open Science Framework** (osf.io): Suitable for any research type\n- **Cochrane**: If conducting a Cochrane review\n\nRegistration gives you a datestamped record showing your methods were decided before you saw the data. Most high-impact journals now expect or require registration for systematic reviews.\n\nOnce registered, any deviations from your protocol must be reported and justified in your paper.',
      },
      {
        heading: 'Using AI Tools in Systematic Reviews',
        body: 'AI tools like MetaLens AI are valuable for the scoping phase — before you write your formal protocol:\n\n- Rapidly scan the existing literature to assess whether a systematic review is warranted\n- Identify the key papers and journals in your area\n- Understand the current state of evidence and likely effect sizes\n- Refine your PICO question based on what\'s actually been studied\n\nHowever, AI tools do not replace a formal systematic review. They work from abstracts, may miss relevant studies, and cannot perform formal risk-of-bias assessments. Use them to inform and accelerate your protocol development, not to replace it.',
      },
    ],
  },
  'publication-bias-detection': {
    title: 'Publication Bias: What It Is and How to Detect It',
    description: 'A clear explanation of publication bias in medical research, its impact on meta-analyses, and statistical methods to detect and correct for it.',
    date: '2026-04-08',
    readTime: '6 min read',
    tag: 'Statistics',
    sections: [
      {
        heading: 'What Is Publication Bias?',
        body: 'Publication bias is the tendency for positive or statistically significant study results to be published more often than negative or null results. When a drug works, the study gets published. When it doesn\'t work, it often ends up in a file drawer.\n\nThis creates a distorted picture of the evidence. If you only read published literature, you may conclude that a treatment is more effective than it really is, simply because the studies showing it doesn\'t work were never published.',
      },
      {
        heading: 'Why Publication Bias Matters for Meta-Analyses',
        body: 'Meta-analyses pool data from published studies. If publication bias exists, the pooled estimate will be inflated — it will overestimate the treatment effect.\n\nThis has real-world consequences:\n- Clinical guidelines may recommend treatments that are less effective than evidence suggests\n- Patients receive treatments with worse benefit-risk profiles than expected\n- Replication studies fail, leading to "reproducibility crises"\n\nThe most famous example is the Cochrane review of antidepressants. When unpublished trial data held by the FDA were included, the true effect sizes were substantially smaller than suggested by published literature alone.',
      },
      {
        heading: 'The Funnel Plot: Visual Detection',
        body: 'The funnel plot is the most commonly used tool for visually detecting publication bias.\n\nIn a symmetric funnel, small studies scatter widely around the true effect, while large studies cluster narrowly around it — forming an inverted funnel.\n\nAsymmetry in the lower-left corner of the funnel suggests missing small studies with negative results. This gap implies publication bias.\n\nHowever, funnel plot asymmetry can also be caused by:\n- Heterogeneity (different true effects in different populations)\n- Chance (especially with <10 studies)\n- Outcome reporting bias (selectively reporting outcomes)\n\nFunnel plots require at least 10 studies to be reliably interpreted.',
      },
      {
        heading: 'Statistical Tests for Publication Bias',
        body: 'Several statistical tests quantify funnel plot asymmetry:\n\n- **Egger\'s test**: A weighted linear regression of the standard normal deviate against precision. p < 0.05 suggests asymmetry\n- **Begg\'s test**: A rank correlation test; less powerful than Egger\'s\n- **Trim and Fill**: Estimates the number of missing studies, adds imputed values, and recalculates the pooled estimate\n\nThese tests have limited power with few studies (<10) and can miss publication bias when it exists or flag it when it doesn\'t. They are supplements to, not replacements for, comprehensive grey literature searches.',
      },
      {
        heading: 'Strategies to Minimize Publication Bias',
        body: 'The best defense against publication bias is to prevent it from occurring:\n\n1. **Search clinical trial registries** (ClinicalTrials.gov, WHO ICTRP) for registered but unpublished trials\n2. **Search conference abstracts** for preliminary results that were never published\n3. **Contact authors** of included studies to ask about unpublished work\n4. **Search grey literature**: theses, government reports, regulatory documents\n5. **Pre-register your review** in PROSPERO to commit to publishing regardless of results\n\nRegulatory agencies like the FDA now require trial registration before patient enrollment begins, which has improved the situation but not eliminated it.',
      },
      {
        heading: 'How MetaLens AI Addresses This',
        body: 'MetaLens AI generates funnel plots in the Meta-Analysis tab to help you visually assess publication bias in your topic area. The tool also:\n\n- Searches PubMed comprehensively for your keyword combination\n- Includes older studies (not just recent high-impact ones)\n- Provides source citations so you can check for trial registration status yourself\n\nRemember that all AI-assisted literature tools face the same fundamental limitation: they work with published literature. For a definitive systematic review, supplementing PubMed with unpublished data sources remains essential.',
      },
    ],
  },
  'p-values-statistical-significance': {
    title: 'p-Values and Statistical Significance in Medical Research',
    description: 'What p-values actually mean, why p < 0.05 is often misunderstood, and how to interpret statistical results in clinical studies.',
    date: '2026-04-10',
    readTime: '7 min read',
    tag: 'Education',
    sections: [
      {
        heading: 'What Is a p-Value?',
        body: 'The p-value is one of the most widely used and widely misunderstood statistics in medical research.\n\nThe formal definition: the p-value is the probability of observing results at least as extreme as those found, assuming the null hypothesis is true.\n\nThe null hypothesis is usually "there is no effect" or "the two treatments are equal." A small p-value means: if there truly were no effect, it would be very unlikely to see results this extreme by chance.\n\nA p-value of 0.03 means: if the null hypothesis were true, you\'d see results this extreme or more extreme only 3% of the time by chance.',
      },
      {
        heading: 'What p < 0.05 Does NOT Mean',
        body: 'The p < 0.05 threshold is deeply embedded in medical research, but it\'s often interpreted incorrectly:\n\n**p < 0.05 does NOT mean:**\n- There is a 95% chance the result is correct\n- The treatment definitely works\n- The effect is clinically meaningful\n- The study will replicate\n- The null hypothesis is false\n\n**p < 0.05 DOES mean:**\n- If the null hypothesis were true, results this extreme would occur less than 5% of the time by chance\n- The finding meets an arbitrary threshold for "statistical significance"\n\nThe 0.05 threshold was chosen by Ronald Fisher in the 1920s as a rule of thumb — not a fundamental law of nature.',
      },
      {
        heading: 'Statistical Significance vs. Clinical Significance',
        body: 'A statistically significant result is not necessarily clinically meaningful.\n\n**Example:** A large trial with 50,000 patients finds that a new drug reduces blood pressure by 1 mmHg (p = 0.0001). This is highly statistically significant but clinically meaningless — a 1 mmHg difference has no impact on cardiovascular outcomes.\n\nConversely, a small trial with 30 patients finds a drug reduces tumor size by 40% (p = 0.08). This misses the 0.05 threshold but may represent a genuinely important effect that deserves further investigation.\n\nAlways ask: What is the effect size? Is it clinically meaningful? What is the confidence interval? Does it include the minimum clinically important difference?',
      },
      {
        heading: 'Confidence Intervals Are More Informative',
        body: 'A 95% confidence interval (CI) tells you more than a p-value alone.\n\nIf the 95% CI for an odds ratio is 1.2 to 3.4:\n- The best estimate is the midpoint (roughly 2.0)\n- You can be 95% confident the true effect lies between 1.2 and 3.4\n- Since 1.0 (no effect) is excluded, the result is statistically significant\n\nConfidence intervals communicate:\n- The direction of the effect\n- The magnitude of the effect\n- The precision of the estimate\n- Whether the effect is clinically meaningful\n\nA CI that stretches from 0.9 to 12.0 is technically significant if 1.0 is excluded, but the huge range tells you the estimate is very imprecise.',
      },
      {
        heading: 'Multiple Comparisons and the Problem of P-Hacking',
        body: 'If you run 20 statistical tests and use p < 0.05 as your threshold, you\'d expect 1 "significant" result purely by chance — even if nothing is actually happening.\n\nThis is called the multiple comparisons problem, and it leads to p-hacking: running many analyses and selectively reporting the ones that reach p < 0.05.\n\nTo address this:\n- **Bonferroni correction**: Divide the threshold by the number of comparisons (e.g., 0.05/10 = 0.005)\n- **Pre-registration**: Commit to your primary outcome before collecting data\n- **False Discovery Rate (FDR)**: Controls for the expected proportion of false positives\n\nWhen reading a study with multiple outcomes, check whether the primary outcome was pre-specified and whether corrections for multiple comparisons were applied.',
      },
      {
        heading: 'Beyond p-Values: Effect Sizes',
        body: 'The American Statistical Association and many journals now recommend moving beyond binary p < 0.05 decisions and reporting effect sizes with confidence intervals.\n\nCommon effect size measures:\n- **Cohen\'s d**: Standardized mean difference (d = 0.2 small, 0.5 medium, 0.8 large)\n- **Odds Ratio (OR)**: Ratio of odds of outcome in exposed vs. unexposed\n- **Relative Risk (RR)**: Ratio of risk in treated vs. control group\n- **Absolute Risk Reduction (ARR)**: Difference in event rates (clinically most intuitive)\n- **Number Needed to Treat (NNT)**: 1/ARR — how many patients need treatment for one to benefit\n\nMetaLens AI extracts and displays these effect sizes from published abstracts, giving you a richer picture than p-values alone.',
      },
    ],
  },
  'evidence-based-medicine-guide': {
    title: 'Evidence-Based Medicine: A Practical Guide for Clinicians',
    description: 'How to integrate the best available evidence with clinical expertise and patient values — the three pillars of evidence-based medicine.',
    date: '2026-04-11',
    readTime: '8 min read',
    tag: 'Clinical',
    sections: [
      {
        heading: 'What Is Evidence-Based Medicine?',
        body: 'Evidence-based medicine (EBM) is the conscientious, explicit, and judicious use of current best evidence in making decisions about the care of individual patients.\n\nThe term was coined by Gordon Guyatt at McMaster University in the early 1990s and has since transformed how medical education, clinical guidelines, and healthcare policy are developed.\n\nEBM rests on three pillars:\n1. **Best available evidence**: High-quality research, ideally RCTs and meta-analyses\n2. **Clinical expertise**: The clinician\'s knowledge, experience, and judgment\n3. **Patient values and preferences**: What matters to this specific patient\n\nAll three must be integrated. Evidence alone is not enough — it must be applied in context.',
      },
      {
        heading: 'The Evidence Hierarchy',
        body: 'Not all evidence is created equal. The hierarchy from strongest to weakest:\n\n1. **Systematic reviews and meta-analyses** — Pool results from multiple high-quality studies\n2. **Randomized controlled trials (RCTs)** — Gold standard for causation\n3. **Cohort studies** — Follow groups over time; good for rare exposures\n4. **Case-control studies** — Compare cases with controls; good for rare outcomes\n5. **Cross-sectional studies** — Snapshot in time; shows associations not causation\n6. **Case reports and expert opinion** — Anecdotal; weakest form of evidence\n\nThe Cochrane hierarchy is useful, but context matters. A well-designed observational study may outweigh a poorly-conducted RCT. Numbers at the top don\'t guarantee quality.',
      },
      {
        heading: 'Asking Answerable Clinical Questions',
        body: 'The first step in EBM practice is translating a clinical problem into an answerable question using PICO:\n\n**Clinical scenario:** A 65-year-old male with AF and CKD stage 3 — should you prescribe a DOAC or warfarin?\n\n**PICO question:**\n- **P**: Adults with non-valvular AF and CKD stage 3\n- **I**: Direct oral anticoagulants (DOACs)\n- **C**: Warfarin\n- **O**: Stroke, systemic embolism, major bleeding at 12 months\n\nWith a well-formed question, tools like MetaLens AI can search PubMed and synthesize the evidence in seconds, giving you a starting point for the literature.',
      },
      {
        heading: 'Appraising the Evidence',
        body: 'Finding evidence is only the first step — you must critically appraise it:\n\n**For RCTs, ask:**\n- Was randomization truly random? Was allocation concealed?\n- Were participants and clinicians blinded?\n- Was follow-up complete? Were ITT analyses used?\n- Is the control group clinically relevant?\n\n**For meta-analyses, ask:**\n- Was the search comprehensive? Were unpublished studies sought?\n- Were inclusion criteria appropriate?\n- Was heterogeneity assessed and explained?\n- Is there evidence of publication bias?\n\nThe CONSORT checklist (for RCTs) and PRISMA checklist (for systematic reviews) provide structured frameworks for appraisal.',
      },
      {
        heading: 'Applying Evidence to Individual Patients',
        body: 'Even the best evidence comes from populations — you\'re treating an individual.\n\nKey questions when applying evidence:\n- Is my patient similar to those in the trial? (age, comorbidities, severity)\n- Were patients like mine excluded from the trial?\n- How does the NNT translate to my patient\'s baseline risk?\n- Are there contraindications or interactions in my patient?\n- What does my patient value? Would they accept the trade-off between efficacy and side effects?\n\nA treatment with NNT = 50 over 5 years may be worthwhile for a high-risk patient but not for a low-risk patient, even though the relative risk reduction is the same.',
      },
      {
        heading: 'EBM in the Age of AI',
        body: 'AI is changing how clinicians access and apply evidence:\n\n- **Literature tools** like MetaLens AI make systematic evidence synthesis available at the point of care\n- **Clinical decision support** systems embed evidence into electronic health records\n- **AI diagnostic tools** are beginning to equal specialists in radiology and pathology\n\nHowever, AI cannot replace the clinical judgment and human empathy that characterize good medicine. AI tools may miss nuance, have training data biases, or generate plausible-sounding errors.\n\nThe clinician\'s role is evolving from memorizing evidence to critically evaluating AI outputs and integrating them with patient context. The three pillars of EBM — evidence, expertise, and patient values — remain as relevant as ever.',
      },
    ],
  },
  'research-grant-proposal': {
    title: 'How to Write a Winning Research Grant Proposal',
    description: 'A practical, step-by-step guide to structuring a compelling research grant proposal, from specific aims to budget justification.',
    date: '2026-04-12',
    readTime: '9 min read',
    tag: 'Research',
    sections: [
      {
        heading: 'The Anatomy of a Grant Proposal',
        body: 'Research grants follow a standard structure regardless of the funding agency. Understanding this structure helps you write a proposal that reviewers can evaluate efficiently.\n\nThe core sections of most biomedical grants (such as NIH R01):\n1. **Specific Aims** (1 page) — The most critical section\n2. **Research Strategy**: Significance, Innovation, Approach\n3. **Preliminary Data** — Your track record and feasibility evidence\n4. **Human Subjects / Animals** — Ethics and compliance\n5. **Budget and Justification**\n6. **Biographical Sketches** (CVs)\n\nFor smaller grants (career awards, foundation grants), the structure is simpler but the principles are the same.',
      },
      {
        heading: 'The Specific Aims Page: Your Most Important Page',
        body: 'The Specific Aims page is the first thing reviewers read and often determines whether they read the rest carefully.\n\nA strong Specific Aims page structure:\n\n**Paragraph 1 — The Hook (2-3 sentences):** State the clinical or scientific problem. Make clear why it matters. End with: "Despite X, nothing is known about Y."\n\n**Paragraph 2 — Your Solution (3-4 sentences):** Introduce your approach, your preliminary data showing feasibility, and your long-term goal.\n\n**Paragraph 3 — The Aims:** List 2-3 specific, testable aims. Each should be answerable independently so the whole grant doesn\'t fail if one aim does.\n\n**Closing Paragraph:** Summarize impact — what will we know after this grant that we don\'t know now?\n\nGet colleagues to read only this page and explain back to you what you\'re proposing.',
      },
      {
        heading: 'Significance and Innovation',
        body: 'Reviewers score grants on significance, innovation, and approach.\n\n**Significance** answers: Why does this matter?\n- Describe the public health burden (prevalence, mortality, cost)\n- Cite the knowledge gap — what is unknown or uncertain\n- State what will change if your hypothesis is confirmed\n- Reference meta-analyses and systematic reviews to establish the current evidence base\n\n**Innovation** answers: What\'s new about your approach?\n- Is this a new hypothesis, method, population, or technology?\n- How does your approach differ from what others have done?\n- Be specific — "novel" without specifics is a red flag for reviewers',
      },
      {
        heading: 'Preliminary Data: Proving Feasibility',
        body: 'Preliminary data is your evidence that you can execute the proposed work.\n\nStrong preliminary data:\n- Demonstrates technical feasibility (you can do the experiments)\n- Shows proof-of-concept (the hypothesis has supporting evidence)\n- Establishes your team\'s expertise and track record\n- Provides power calculations for sample size determination\n\nIf you don\'t have preliminary data:\n- Use published data from your own or others\' work to support your power calculations\n- Use AI tools like MetaLens AI to rapidly synthesize existing evidence and derive expected effect sizes\n- Pilot small, cheap experiments before submitting major grants\n\nFunding agencies fund people as much as projects. Your track record matters.',
      },
      {
        heading: 'The Research Approach: Design and Rigor',
        body: 'The Approach section is the heart of your science. It should show that your methods are rigorous and that you\'ve anticipated potential problems.\n\nFor each aim:\n1. **Rationale**: Why this experimental design?\n2. **Methods**: Detailed but clear description of participants, interventions, measurements\n3. **Statistical Analysis Plan**: Pre-specified, adequately powered, appropriate methods\n4. **Potential Pitfalls and Alternatives**: What could go wrong, and how will you handle it?\n\nReviewers look for: Is this feasible? Is this rigorous? Has the team thought about what could go wrong?\n\nAvoid overpromising. Reviewers respect teams that have thought about limitations and have backup plans.',
      },
      {
        heading: 'Budget and Common Mistakes',
        body: 'The budget must be justified, not just listed.\n\n**Common budget mistakes:**\n- Under-budgeting to seem economical (reviewers know the true costs)\n- Over-budgeting without justification\n- Forgetting indirect costs (overhead, typically 26-60% of direct costs)\n- Not accounting for salary escalations over multi-year grants\n\n**The justification section** must explain why each cost is necessary for the proposed work. Be specific.\n\n**Common overall proposal mistakes:**\n- Trying to do too much (aim for depth, not breadth)\n- Not clearly stating your hypothesis\n- Ignoring feedback from previous reviews\n- Submitting before getting colleagues to read it\n- Weak Specific Aims page\n\nGet a mock review from colleagues before submission. Revise and resubmit if not funded on the first try — most successful grants are funded on the second or third submission.',
      },
    ],
  },
  'systematic-review-vs-meta-analysis': {
    title: 'Systematic Review vs Meta-Analysis: Key Differences Explained',
    description: 'A clear comparison of systematic reviews and meta-analyses — what they are, how they differ, and when each approach is appropriate.',
    date: '2026-04-13',
    readTime: '6 min read',
    tag: 'Education',
    sections: [
      {
        heading: 'The Basics: Definitions',
        body: 'These two terms are often used interchangeably but they describe different things — and not all systematic reviews are meta-analyses.\n\n**Systematic Review**: A rigorous, reproducible synthesis of all available evidence on a specific research question. Uses a documented, pre-specified search strategy and explicit inclusion/exclusion criteria. The results may be presented narratively.\n\n**Meta-Analysis**: A statistical technique for combining quantitative results from multiple studies into a single pooled estimate. Meta-analysis is often performed within a systematic review, but not always.\n\nSimply put: a systematic review is the process; meta-analysis is one possible output of that process.',
      },
      {
        heading: 'When Can You Perform a Meta-Analysis?',
        body: 'Meta-analysis requires that studies are sufficiently similar to combine statistically. You need:\n\n- **Similar PICO**: Comparable populations, interventions, comparators, and outcomes\n- **Quantitative data**: Effect sizes, confidence intervals, or enough data to calculate them\n- **Adequate number of studies**: At least 3-5 studies (more is better for power)\n- **Acceptable heterogeneity**: If I² > 75%, pooling may be misleading\n\nWhen studies are too heterogeneous — measuring different things in different populations with different methods — a narrative (descriptive) systematic review is more appropriate than forcing a statistical pooling that would be meaningless.',
      },
      {
        heading: 'Advantages and Disadvantages of Each',
        body: '**Systematic Review without Meta-Analysis:**\n✓ Can include qualitative and heterogeneous studies\n✓ Avoids spurious precision from inappropriate pooling\n✓ Better for complex interventions with multiple components\n✗ More subjective — narrative synthesis can introduce bias\n✗ Harder to summarize for clinical decision-making\n\n**Meta-Analysis:**\n✓ Provides a single summary estimate with confidence interval\n✓ More statistical power than any individual study\n✓ Directly informs clinical practice guidelines\n✗ Can produce false precision if studies are heterogeneous\n✗ Vulnerable to publication bias\n✗ Garbage in, garbage out — only as good as the included studies',
      },
      {
        heading: 'Rapid Reviews and Scoping Reviews',
        body: 'Between informal literature reviews and full systematic reviews, several intermediate approaches exist:\n\n**Rapid Review**: Streamlines systematic review methods to answer a question quickly (weeks vs. months). Acceptable for urgent policy questions. Explicitly acknowledges limitations.\n\n**Scoping Review**: Maps the existing literature on a broad topic to identify gaps, not to answer a specific question. Does not require quality assessment of included studies. Often a precursor to a full systematic review.\n\n**Narrative Review**: An expert synthesis without systematic search methods. Faster but more prone to bias. Less reproducible. Still valuable for educational purposes.\n\nTools like MetaLens AI are best described as AI-assisted rapid scoping — they provide a quick synthesis of PubMed evidence to inform your thinking, without the rigor of a formal systematic review.',
      },
      {
        heading: 'The PRISMA and MOOSE Reporting Standards',
        body: 'High-quality systematic reviews and meta-analyses should follow established reporting standards:\n\n- **PRISMA** (Preferred Reporting Items for Systematic Reviews and Meta-Analyses): 27-item checklist for reporting systematic reviews. Requires a flow diagram showing study selection.\n- **MOOSE** (Meta-analysis Of Observational Studies in Epidemiology): For meta-analyses of observational studies.\n- **PRISMA-P**: Checklist for systematic review protocols.\n- **Cochrane Handbook**: The most comprehensive guidance for Cochrane reviews.\n\nMost major medical journals require PRISMA compliance for submission. Following these standards improves transparency and reproducibility.',
      },
      {
        heading: 'How to Choose the Right Approach',
        body: 'Use this decision tree:\n\n1. **Is your question specific enough for PICO?**\n   - Yes → Systematic review (with possible meta-analysis)\n   - No → Scoping review or narrative review\n\n2. **Are there enough primary studies?**\n   - <3 good studies → Narrative systematic review\n   - ≥3 studies with similar PICO → Consider meta-analysis\n\n3. **Is heterogeneity acceptable?**\n   - I² < 50% → Meta-analysis likely appropriate\n   - I² > 75% → Narrative synthesis; explore sources of heterogeneity\n\n4. **Do you have enough time and resources?**\n   - Full systematic review takes 6-12 months with a team\n   - Consider starting with a scoping review using tools like MetaLens AI',
      },
    ],
  },
  'how-to-compare-drug-efficacy': {
    title: 'How to Compare Drug Efficacy: A Practical Guide',
    description: 'A step-by-step tutorial for medical students and pharmacists on comparing treatment outcomes using published evidence.',
    date: '2026-03-25',
    readTime: '7 min read',
    tag: 'Tutorial',
    sections: [
      {
        heading: 'Why Compare Drug Efficacy?',
        body: 'Comparing drug efficacy is one of the most common tasks in clinical practice and pharmacy. Whether you\'re a medical student studying pharmacology, a pharmacist advising patients, or a clinician choosing between treatment options, understanding how to evaluate comparative effectiveness is essential.\n\nThe challenge is that efficacy data is scattered across thousands of published studies, each with different methodologies, patient populations, and endpoints. This guide will help you navigate that complexity.',
      },
      {
        heading: 'Step 1: Define Your Comparison',
        body: 'Start by clearly defining what you want to compare:\n\n- Which drugs? (e.g., pranlukast vs. montelukast)\n- For which condition? (e.g., asthma control)\n- Which outcomes? (e.g., exacerbation rates, symptom scores, mortality)\n- In which population? (e.g., adults, children, elderly)\n\nA well-defined comparison helps you find relevant studies and avoid comparing apples to oranges.',
      },
      {
        heading: 'Step 2: Search the Literature',
        body: 'PubMed is the primary database for biomedical research. Effective search strategies include:\n\n- Use MeSH terms (Medical Subject Headings) for precise searching\n- Combine drug names with condition terms using AND/OR operators\n- Filter by study type (randomized controlled trials provide the strongest evidence)\n- Look for systematic reviews and meta-analyses first, as they\'ve already done the synthesis work\n\nTools like MetaLens AI can accelerate this step by searching PubMed and synthesizing results automatically.',
      },
      {
        heading: 'Step 3: Evaluate Study Quality',
        body: 'Not all studies are created equal. When comparing drugs, prioritize:\n\n- Randomized controlled trials (RCTs) over observational studies\n- Head-to-head comparisons over placebo-controlled studies\n- Larger sample sizes over smaller ones\n- Longer follow-up periods for chronic conditions\n- Studies with clinically relevant endpoints (mortality, hospitalization) over surrogate markers\n\nUse tools like the Cochrane Risk of Bias tool to assess study quality systematically.',
      },
      {
        heading: 'Step 4: Compare Outcomes',
        body: 'When comparing drug efficacy across studies, look at:\n\n- Effect sizes: How large is the difference between treatments?\n- Confidence intervals: How precise is the estimate?\n- Statistical significance: Is the difference likely real (p < 0.05)?\n- Clinical significance: Is the difference meaningful for patients?\n- Number needed to treat (NNT): How many patients need treatment for one to benefit?\n\nA statistically significant difference might not be clinically meaningful, and vice versa.',
      },
      {
        heading: 'Step 5: Consider Safety and Tolerability',
        body: 'Efficacy is only half the picture. Also compare:\n\n- Common side effects and their frequency\n- Serious adverse events\n- Drug interactions\n- Contraindications in specific populations\n- Patient adherence and convenience (dosing frequency, route of administration)\n\nThe best drug is often not the most efficacious one, but the one with the best balance of efficacy, safety, cost, and patient acceptance.',
      },
      {
        heading: 'Using MetaLens AI for Drug Comparison',
        body: 'MetaLens AI simplifies drug comparison by:\n\n1. Enter both drug names and the condition as keywords (e.g., "pranlukast, montelukast, asthma, efficacy")\n2. The tool searches PubMed for relevant studies\n3. AI synthesizes the findings into a structured summary\n4. You get key comparative findings with source citations\n\nWhile this doesn\'t replace a formal systematic review, it gives you a rapid evidence overview in seconds instead of hours. Use it as a starting point, then dive deeper into the most relevant papers.',
      },
    ],
  },
};

function getLocalizedPost(locale: string, slug: string): BlogContent | undefined {
  const map: Record<string, Record<string, BlogContent>> = {
    ko: koreanBlogPosts,
    ja: japaneseBlogPosts,
    zh: chineseBlogPosts,
    de: germanBlogPosts,
    fr: frenchBlogPosts,
    es: spanishBlogPosts,
    pt: portugueseBlogPosts,
  };
  return (map[locale]?.[slug]) ?? blogPosts[slug];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getLocalizedPost(locale, slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getLocalizedPost(locale, slug);

  if (!post) notFound();

  return <BlogPostContent locale={locale} post={post} />;
}

function BlogPostContent({ locale, post }: { locale: string; post: BlogContent }) {
  const t = useTranslations('blog');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'SPINAI', url: 'https://metalens-ai.com' },
    publisher: { '@type': 'Organization', name: 'SPINAI', url: 'https://metalens-ai.com' },
    mainEntityOfPage: `https://metalens-ai.com/${locale}/blog`,
    image: 'https://metalens-ai.com/opengraph-image',
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors mb-8"
      >
        &larr; {t('backToBlog')}
      </Link>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full">
              {post.tag}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">{post.date}</span>
            <span className="text-sm text-[var(--color-text-muted)]">{post.readTime}</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {post.title}
          </h1>
        </header>

        <div className="space-y-8">
          {post.sections.map((section, i) => (
            <section key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--color-border)]">
              <h2
                className="text-xl sm:text-2xl font-semibold text-[var(--color-primary-dark)] mb-4"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {section.heading}
              </h2>
              <div className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/20 text-center">
          <p className="text-[var(--color-text-primary)] font-medium mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t('tryCTA')}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {t('tryBtn')}
          </Link>
        </div>

        {/* Internal linking: related drug comparisons */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t('relatedComparisons')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(COMPARISONS).slice(0, 4).map(([slug, comp]) => (
              <Link
                key={slug}
                href={`/${locale}/compare/${slug}`}
                className="block p-4 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium text-[var(--color-primary-dark)]">
                  {comp.drug1} vs {comp.drug2}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
