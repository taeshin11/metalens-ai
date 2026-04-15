import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About MetaLens AI — AI-Powered Medical Meta-Analysis by SPINAI',
  description:
    'Learn about MetaLens AI by SPINAI — our mission to democratize medical research insights with free AI-powered meta-analysis from 40M+ PubMed papers.',
  keywords:
    'MetaLens AI, SPINAI, about, medical research AI, meta-analysis tool, PubMed AI, evidence-based medicine',
};

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-8"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        About MetaLens AI
      </h1>

      <div className="space-y-6">
        {/* Mission */}
        <Section icon="🎯" title="Our Mission">
          <p>
            MetaLens AI was created with a singular mission: to make evidence-based medical research
            accessible to everyone. We believe that the power of scientific literature should not be
            locked behind paywalls, complex search interfaces, or hours of manual reading. By
            combining the vast repository of PubMed — the world&apos;s largest biomedical database
            containing over 40 million citations — with cutting-edge generative AI, MetaLens AI
            delivers instant, structured meta-analysis summaries that distill the collective
            findings of hundreds of research papers into clear, actionable insights.
          </p>
          <p className="mt-3">
            Our goal is to bridge the gap between raw scientific data and practical understanding.
            Whether you are a medical student preparing for exams, a pharmacist evaluating drug
            interactions, a clinical researcher surveying the landscape of a new therapeutic area,
            or a curious individual seeking reliable health information, MetaLens AI empowers you
            to make informed decisions grounded in the best available evidence.
          </p>
        </Section>

        {/* The Problem We Solve */}
        <Section icon="💡" title="The Problem We Solve">
          <p>
            Every day, thousands of new biomedical articles are published across the globe.
            PubMed alone indexes more than 1.5 million new citations each year, spanning topics
            from oncology and cardiology to pharmacology and public health. For healthcare
            professionals and researchers, staying up to date with the latest evidence is not
            just a professional requirement — it is an ethical obligation that directly impacts
            patient outcomes.
          </p>
          <p className="mt-3">
            Yet the traditional process of conducting a literature review is painstakingly slow.
            A conventional systematic review can take anywhere from six months to over a year to
            complete. Even a focused search on PubMed requires researchers to manually sift through
            dozens or hundreds of abstracts, evaluate study quality, extract key findings, and
            synthesize results — a process that typically consumes 20 to 40 hours of skilled labor
            for a single topic.
          </p>
          <p className="mt-3">
            MetaLens AI compresses this workflow from hours to seconds. By automating the search,
            retrieval, and synthesis steps, we free researchers to focus on what matters most:
            interpreting results, designing studies, and caring for patients.
          </p>
        </Section>

        {/* How Our Technology Works */}
        <Section icon="⚙️" title="How Our Technology Works">
          <p>
            MetaLens AI operates through a sophisticated multi-stage pipeline that combines proven
            biomedical infrastructure with state-of-the-art artificial intelligence:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>PubMed E-Utilities API:</strong> When you enter a medical keyword or research
              question, MetaLens AI queries the National Library of Medicine&apos;s PubMed database in
              real time using the official E-Utilities API. This ensures that every search draws
              from the same authoritative source used by researchers and clinicians worldwide.
            </li>
            <li>
              <strong>Smart Abstract Retrieval:</strong> Our system retrieves the most relevant
              abstracts based on your query, applying relevance ranking and recency filters to
              surface the most pertinent studies. Depending on your subscription tier, we analyze
              between 10 and 80 abstracts per query.
            </li>
            <li>
              <strong>Google Gemini AI Synthesis:</strong> The retrieved abstracts are processed by
              Google&apos;s Gemini large language model, which has been specifically prompted to perform
              structured meta-analysis. The AI identifies common themes, compares study outcomes,
              notes areas of consensus and disagreement, and generates a coherent summary that
              mirrors the structure of a professional systematic review.
            </li>
            <li>
              <strong>Structured Output:</strong> Results are presented in a clear, organized format
              including an executive summary, key findings, methodology overview, areas of
              agreement, conflicting evidence, clinical implications, and suggestions for future
              research.
            </li>
          </ul>
        </Section>

        {/* Transparency & Data Integrity */}
        <Section icon="🔍" title="Transparency and Data Integrity">
          <p>
            We take the accuracy and transparency of our analyses seriously. Every MetaLens AI
            report includes full citations with PubMed IDs (PMIDs) so you can verify any claim
            against the original source material. We do not fabricate references or generate
            fictional studies — every citation in our reports links directly to a real, published
            paper in the PubMed database.
          </p>
          <p className="mt-3">
            That said, we are transparent about the limitations of AI-generated analysis. While
            MetaLens AI provides valuable research summaries, it is not a substitute for a formal
            systematic review conducted by domain experts following PRISMA guidelines. AI can
            occasionally misinterpret nuanced statistical findings or overlook methodological
            limitations that a trained reviewer would catch. We encourage all users to treat
            MetaLens AI results as a starting point for further investigation, not as definitive
            medical guidance.
          </p>
        </Section>

        {/* Who We Serve */}
        <Section icon="👥" title="Who We Serve">
          <p>
            MetaLens AI is designed for a broad audience of healthcare professionals, researchers,
            and lifelong learners:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Medical Students:</strong> Quickly survey the literature on clinical topics,
              prepare for case presentations, and understand the evidence base behind treatment
              guidelines.
            </li>
            <li>
              <strong>Pharmacists and Pharmacy Students:</strong> Evaluate drug efficacy, compare
              therapeutic alternatives, and stay current with pharmacological research.
            </li>
            <li>
              <strong>Clinical Researchers:</strong> Rapidly assess the existing body of evidence
              before designing new studies, identify knowledge gaps, and generate hypotheses.
            </li>
            <li>
              <strong>Physicians and Clinicians:</strong> Access concise evidence summaries at the
              point of care to support clinical decision-making and patient consultations.
            </li>
            <li>
              <strong>Public Health Professionals:</strong> Monitor emerging evidence on population
              health topics, vaccine effectiveness, and epidemiological trends.
            </li>
            <li>
              <strong>Health-Curious Individuals:</strong> Gain a deeper understanding of medical
              topics backed by peer-reviewed research rather than anecdotal sources.
            </li>
          </ul>
        </Section>

        {/* About SPINAI */}
        <Section icon="🏢" title="About SPINAI">
          <p>
            MetaLens AI is developed and maintained by SPINAI, an independent software studio
            focused on building intelligent tools that solve real-world problems in healthcare and
            scientific research. We believe that artificial intelligence should serve as an
            equalizer — giving individuals and small teams access to capabilities that were
            previously available only to well-funded research institutions.
          </p>
          <p className="mt-3">
            Our development philosophy centers on three principles: <strong>accessibility</strong>
            {' '}(keeping our core features free), <strong>transparency</strong> (always showing our
            sources), and <strong>continuous improvement</strong> (regularly updating our AI models
            and search capabilities based on user feedback).
          </p>
        </Section>

        {/* Open Access */}
        <Section icon="🌐" title="Our Commitment to Open Access">
          <p>
            We are firm believers in open access to scientific knowledge. MetaLens AI&apos;s Free
            tier provides meaningful analytical capability at no cost — not a crippled trial, but
            a genuinely useful tool. Our Pro tier offers expanded capacity for
            power users who need to analyze more papers per query and run more analyses per month,
            but the core experience remains available to everyone.
          </p>
          <p className="mt-3">
            MetaLens AI supports eight languages to serve the global research community. We are
            continuously expanding our language support and feature set to reach more researchers
            in more countries.
          </p>
        </Section>

        {/* Contact */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
          <h2
            className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center gap-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span>✉️</span> Contact Us
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
            Have questions, feedback, or partnership inquiries? We would love to hear from you.
            Reach out to us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . We typically respond within 24 to 48 hours.
          </p>
        </section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)]">
      <h2
        className="text-2xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center gap-3"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        <span>{icon}</span> {title}
      </h2>
      <div className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
        {children}
      </div>
    </section>
  );
}
