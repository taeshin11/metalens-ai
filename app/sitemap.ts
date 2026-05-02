import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, SITE_URL } from '@/lib/constants';
import { ALL_COMPARE_SLUGS } from '@/lib/comparisons';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/how-it-works', '/faq', '/privacy', '/terms', '/blog', '/use-cases', '/pricing'];
  const blogSlugs = [
    'what-is-meta-analysis',
    'ai-in-medical-research',
    'how-to-compare-drug-efficacy',
    'understanding-forest-plots',
    'systematic-review-protocol',
    'publication-bias-detection',
    'p-values-statistical-significance',
    'evidence-based-medicine-guide',
    'research-grant-proposal',
    'systematic-review-vs-meta-analysis',
  ];
  const compareSlugs = ALL_COMPARE_SLUGS;
  const entries: MetadataRoute.Sitemap = [];

  const priorityMap: Record<string, number> = {
    '': 1.0,
    '/about': 0.8,
    '/pricing': 0.8,
    '/how-it-works': 0.7,
    '/faq': 0.7,
    '/blog': 0.7,
    '/use-cases': 0.6,
    '/privacy': 0.4,
    '/terms': 0.4,
  };

  const freqMap: Record<string, 'daily' | 'weekly' | 'monthly'> = {
    '': 'daily',
    '/blog': 'weekly',
    '/pricing': 'weekly',
  };

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: freqMap[page] || 'monthly',
        priority: priorityMap[page] ?? 0.6,
      });
    }
  }

  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of blogSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
    for (const slug of compareSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/compare/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
