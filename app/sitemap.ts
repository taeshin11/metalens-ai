import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/how-it-works', '/faq', '/privacy', '/terms', '/blog', '/use-cases'];
  const blogSlugs = ['what-is-meta-analysis', 'ai-in-medical-research', 'how-to-compare-drug-efficacy'];
  const compareSlugs = [
    'pranlukast-vs-montelukast', 'metformin-vs-insulin', 'ibuprofen-vs-acetaminophen',
    'lisinopril-vs-losartan', 'omeprazole-vs-pantoprazole', 'sertraline-vs-fluoxetine',
  ];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : 0.7,
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
