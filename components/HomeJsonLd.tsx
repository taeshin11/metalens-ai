import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, CONTACT_EMAIL } from '@/lib/constants';

export default function HomeJsonLd() {
  const jsonLd = {
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
    },
    featureList: [
      'AI-powered medical meta-analysis',
      'PubMed database search (40M+ papers)',
      'Structured research summaries',
      'Multi-language support (8 languages)',
      'Free to use',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
