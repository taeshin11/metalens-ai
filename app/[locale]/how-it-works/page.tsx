import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — AI Medical Meta-Analysis | MetaLens AI',
  description:
    'Learn how MetaLens AI searches 40M+ PubMed papers and uses Google Gemini AI to synthesize medical research into structured meta-analysis summaries in seconds.',
  keywords:
    'how MetaLens AI works, AI meta-analysis process, PubMed search AI, medical research synthesis, step by step guide',
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 text-center"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        How MetaLens AI Works
      </h1>
      <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-xl mx-auto text-lg">
        From keyword to comprehensive meta-analysis in seconds. Here is a detailed look at every
        step of the process.
      </p>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary)]/10 rounded-xl text-2xl">
            ⌨️
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-full"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Step 1
              </span>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Enter Your Medical Keywords
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Start by typing a medical topic, drug name, disease, or clinical question into the
              search bar on the MetaLens AI homepage. You can use simple terms like
              &quot;metformin diabetes&quot; or more specific queries like &quot;SGLT2 inhibitors
              heart failure mortality reduction.&quot; The more specific your query, the more
              focused and relevant your results will be.
            </p>
            <div className="mt-3 bg-[var(--color-bg-secondary)] rounded-lg p-4 text-sm text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-text-primary)]">Pro Tip:</strong> Use specific
              medical terminology rather than general language. For example, instead of
              &quot;blood pressure medicine,&quot; try &quot;ACE inhibitors hypertension
              outcomes.&quot; You can also include study type keywords like &quot;randomized
              controlled trial&quot; or &quot;systematic review&quot; to narrow results to
              particular study designs.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary)]/10 rounded-xl text-2xl">
            🔍
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-full"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Step 2
              </span>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                PubMed Database Search
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Behind the scenes, MetaLens AI connects to the National Library of Medicine&apos;s
              PubMed database through the official E-Utilities API. Your query is translated into
              an optimized PubMed search that scans over 40 million biomedical citations and
              abstracts. The system retrieves the most relevant and recent research papers,
              prioritizing high-quality studies such as randomized controlled trials, systematic
              reviews, and meta-analyses.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mt-2">
              Depending on your subscription tier, MetaLens AI retrieves between 10 abstracts
              (Free tier) and 80 abstracts (Pro tier) per query. Each abstract is fetched in
              real time, ensuring you always receive the most up-to-date research available in the
              PubMed database.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary)]/10 rounded-xl text-2xl">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-full"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Step 3
              </span>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                AI-Powered Synthesis and Analysis
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Once the relevant abstracts are retrieved, they are fed into Google&apos;s Gemini
              large language model, which has been specifically configured to perform structured
              meta-analysis. The AI reads and comprehends each abstract, identifying key findings,
              study methodologies, sample sizes, and conclusions. It then cross-references these
              findings across all retrieved papers to identify patterns of agreement, conflicting
              results, and knowledge gaps.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mt-2">
              The synthesis process takes approximately 10 to 30 seconds, depending on the
              complexity of the topic and the number of abstracts being analyzed. During this
              time, the AI is performing work that would typically take a human researcher several
              hours to complete manually.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-[var(--color-primary)]/10 rounded-xl text-2xl">
            📊
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold text-[var(--color-primary)] px-2 py-0.5 bg-[var(--color-primary)]/10 rounded-full"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Step 4
              </span>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Review Your Structured Results
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Your results are presented in a clear, professionally structured format that mirrors
              the conventions of academic systematic reviews. The report typically includes an
              executive summary of the overall findings, a breakdown of key themes and outcomes,
              areas where the literature shows strong consensus, any conflicting or contradictory
              results, clinical implications, and suggestions for further research.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mt-2">
              Every claim in the report is backed by specific PubMed citations with clickable PMID
              links, so you can immediately verify any finding against the original source paper.
              You can also save your analysis results to your account for future reference, export
              them, or run additional queries to explore related topics.
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
        <h2
          className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-6 flex items-center gap-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span>💡</span> Tips for Getting the Best Results
        </h2>
        <div className="text-[var(--color-text-secondary)] leading-relaxed space-y-4">
          <div className="flex gap-3">
            <span className="text-[var(--color-primary)] font-bold flex-shrink-0">1.</span>
            <p>
              <strong>Be specific with your queries.</strong> Instead of searching for a broad
              term like &quot;cancer,&quot; narrow it down to &quot;immunotherapy non-small cell
              lung cancer survival&quot; for more focused and relevant results.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--color-primary)] font-bold flex-shrink-0">2.</span>
            <p>
              <strong>Use medical terminology.</strong> PubMed indexes papers using MeSH (Medical
              Subject Headings) terms. Using proper medical vocabulary will improve the quality
              of retrieved studies.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--color-primary)] font-bold flex-shrink-0">3.</span>
            <p>
              <strong>Combine related terms.</strong> A query like &quot;statin cardiovascular
              prevention elderly&quot; will retrieve more targeted results than searching for
              each term separately.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--color-primary)] font-bold flex-shrink-0">4.</span>
            <p>
              <strong>Check the cited sources.</strong> Always click through to the original
              PubMed articles to verify key claims, especially if you plan to use the information
              in clinical or academic contexts.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--color-primary)] font-bold flex-shrink-0">5.</span>
            <p>
              <strong>Upgrade for deeper analysis.</strong> If you need more comprehensive
              coverage, the Pro tier analyzes significantly more abstracts per query
              (up to 80), providing a more thorough synthesis of the available evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
