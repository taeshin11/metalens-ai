import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | MetaLens AI',
  description:
    'Frequently asked questions about MetaLens AI — accuracy, pricing, languages, data sources, privacy, and how our AI meta-analysis works.',
  keywords:
    'MetaLens AI FAQ, medical meta-analysis questions, PubMed AI tool help, free research tool, AI medical research',
};

const faqs: { question: string; answer: string }[] = [
  {
    question: 'What is MetaLens AI and what does it do?',
    answer:
      'MetaLens AI is a free, AI-powered medical research tool that generates structured meta-analysis summaries from the PubMed database. When you enter a medical keyword or clinical question, MetaLens AI searches over 40 million PubMed citations in real time, retrieves the most relevant abstracts, and uses Google Gemini AI to synthesize the findings into a comprehensive, organized report. Think of it as having a research assistant that can read and summarize hundreds of medical papers in seconds, highlighting areas of consensus, conflicting evidence, and clinical implications.',
  },
  {
    question: 'How does the AI analysis work behind the scenes?',
    answer:
      'MetaLens AI uses a multi-stage pipeline. First, your query is sent to the National Library of Medicine\'s PubMed E-Utilities API, which retrieves relevant biomedical abstracts ranked by relevance and recency. These abstracts are then passed to Google\'s Gemini large language model, which has been specifically prompted to perform structured meta-analysis. The AI reads each abstract, identifies key findings, study methodologies, and conclusions, then cross-references them to find patterns of agreement and disagreement across the literature. The entire process typically takes 10 to 30 seconds.',
  },
  {
    question: 'Is the data and analysis from MetaLens AI reliable?',
    answer:
      'MetaLens AI retrieves data exclusively from PubMed, the world\'s most authoritative biomedical database maintained by the U.S. National Library of Medicine. Every citation in our reports links to a real, published paper with a verifiable PubMed ID (PMID). However, it is important to understand that MetaLens AI provides AI-generated summaries, not formal systematic reviews. While the AI does an excellent job of identifying trends and synthesizing findings, it may occasionally misinterpret nuanced statistical results or overlook methodological limitations. We recommend treating MetaLens AI results as a high-quality starting point for further research, not as a substitute for expert clinical judgment or formal evidence review.',
  },
  {
    question: 'What is PubMed and why does MetaLens AI use it?',
    answer:
      'PubMed is a free search engine maintained by the National Center for Biotechnology Information (NCBI) at the U.S. National Library of Medicine. It provides access to over 40 million citations and abstracts from biomedical literature, including journals indexed in MEDLINE, life science journals, and online books. PubMed is the gold standard database used by researchers, clinicians, and medical students worldwide. MetaLens AI uses PubMed because it is the most comprehensive, authoritative, and regularly updated source of biomedical research data available, ensuring that our analyses are grounded in peer-reviewed scientific evidence.',
  },
  {
    question: 'What are the differences between the Free, Pro, and Ultra plans?',
    answer:
      'The Free tier gives you access to MetaLens AI\'s core functionality at no cost, analyzing up to 10 PubMed abstracts per query with a limited number of monthly analyses. The Pro plan increases this to approximately 40 abstracts per query with significantly more monthly queries, providing broader literature coverage and more thorough synthesis. The Ultra plan offers our most comprehensive analysis at up to 80 abstracts per query with the highest monthly limit, making it ideal for researchers and professionals who need deep, exhaustive literature reviews. All tiers include the same structured report format with full PubMed citations, AI-powered synthesis, and multi-language support.',
  },
  {
    question: 'What languages does MetaLens AI support?',
    answer:
      'MetaLens AI currently supports eight languages: English, Korean, Japanese, Chinese (Simplified), Spanish, French, German, and Portuguese. You can select your preferred language from the language selector in the navigation bar. When a non-English language is selected, the AI will generate the meta-analysis summary in your chosen language while still drawing from the full English-language PubMed database. This means you get access to the global body of biomedical research, presented in the language most comfortable for you.',
  },
  {
    question: 'How does MetaLens AI handle my privacy and personal data?',
    answer:
      'We take your privacy seriously. MetaLens AI collects minimal personal data — primarily what is needed for account authentication through Clerk (such as your email address) and basic usage analytics to improve our service. Your search queries are processed in real time and are not permanently stored or shared with third parties for marketing purposes. We use Google Analytics to understand usage patterns. You can review our full Privacy Policy for detailed information about data collection, storage, third-party services, and your rights under GDPR and CCPA.',
  },
  {
    question: 'How should I cite MetaLens AI results in academic work?',
    answer:
      'If you use MetaLens AI results in academic papers, presentations, or reports, we recommend citing the individual PubMed sources referenced in the analysis rather than citing MetaLens AI itself as a primary source. Each finding in your MetaLens AI report includes PMID links that you can use to locate the original papers for proper citation. If you wish to acknowledge MetaLens AI as a tool in your methodology section, you can describe it as: "Literature search and preliminary synthesis were assisted by MetaLens AI (https://metalens-ai.com), an AI-powered meta-analysis tool that queries the PubMed database." Always verify key claims against the original source papers before including them in formal academic work.',
  },
  {
    question: 'Is MetaLens AI a substitute for professional medical advice?',
    answer:
      'No. MetaLens AI is a research and educational tool, not a clinical decision-making system. The summaries and analyses generated by MetaLens AI are derived from published research literature and are intended to help users explore and understand the current state of evidence on a given topic. They should never be used as a basis for self-diagnosis, self-treatment, or to replace the judgment of a qualified healthcare professional. If you have health concerns, always consult a licensed physician or appropriate healthcare provider. MetaLens AI is designed to support — not replace — the expertise of trained medical professionals.',
  },
  {
    question: 'Can I use MetaLens AI for commercial or institutional purposes?',
    answer:
      'MetaLens AI can be used for personal, educational, and professional research purposes under our standard Terms of Service. Individual healthcare professionals, students, and researchers are welcome to use the tool in their daily work. For large-scale institutional deployments, API integration, or commercial redistribution of MetaLens AI outputs, please contact us at taeshinkim11@gmail.com to discuss licensing options. Please note that while our analysis reports are free to use for personal and educational purposes, you should always verify findings independently before using them in clinical, regulatory, or commercial contexts.',
  },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 text-center"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Frequently Asked Questions
      </h1>
      <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-xl mx-auto">
        Everything you need to know about MetaLens AI, our technology, data sources, and how to
        get the most out of your medical research analysis.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden"
          >
            <summary className="cursor-pointer px-6 py-5 text-lg font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors list-none flex items-center justify-between">
              {faq.question}
              <span className="text-[var(--color-text-muted)] group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                ▾
              </span>
            </summary>
            <div className="px-6 pb-5 text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50 pt-4">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
