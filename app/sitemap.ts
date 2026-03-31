import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/how-it-works', '/faq', '/privacy', '/terms'];
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

  return entries;
}
