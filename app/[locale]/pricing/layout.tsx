import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SUPPORTED_LOCALES } from '@/lib/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  const title = t('title');
  const description = t('subtitle');
  const url = `${SITE_URL}/${locale}/pricing`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}/pricing`]),
      ),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
