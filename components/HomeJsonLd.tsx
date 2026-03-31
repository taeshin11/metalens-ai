import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, CONTACT_EMAIL } from '@/lib/constants';

export default function HomeJsonLd() {
  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'SPINAI',
      email: CONTACT_EMAIL,
      url: SITE_URL,
    },
    featureList: [
      'AI-powered medical meta-analysis',
      'PubMed database search (40M+ papers)',
      'Structured research summaries',
      'Multi-language support (8 languages)',
      'Drug comparison analysis',
      'Free to use — no account required',
    ],
    screenshot: `${SITE_URL}/opengraph-image`,
    softwareVersion: '1.0.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use MetaLens AI for Medical Research Analysis',
    description: 'A step-by-step guide to using MetaLens AI to analyze medical research papers from PubMed.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter Medical Keywords',
        text: 'Type medical terms, drug names, or conditions you want to investigate (e.g., "asthma, pranlukast, montelukast, efficacy").',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'AI Searches PubMed',
        text: 'MetaLens AI searches PubMed\'s database of 40M+ biomedical papers to find the most relevant studies for your query.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get AI-Synthesized Results',
        text: 'Receive a structured meta-analysis summary with key findings, statistics, recommendations, and direct links to source papers.',
      },
    ],
    totalTime: 'PT30S',
    tool: { '@type': 'HowToTool', name: 'Web Browser' },
  };

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SPINAI',
    url: SITE_URL,
    email: CONTACT_EMAIL,
    description: 'AI-powered tools for medical research accessibility',
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </>
  );
}
