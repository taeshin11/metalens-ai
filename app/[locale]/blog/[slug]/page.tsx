import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
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
  const post = blogPosts[slug];

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
    author: { '@type': 'Organization', name: 'SPINAI' },
    publisher: { '@type': 'Organization', name: 'SPINAI' },
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
      </article>
    </div>
  );
}
