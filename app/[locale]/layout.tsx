import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeJsonLd from '@/components/HomeJsonLd';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('title');
  const description = t('description');
  const localeUrl = `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: [
      'meta-analysis', 'medical research', 'PubMed', 'AI', 'drug comparison',
      'systematic review', 'medical literature', 'research synthesis',
      'evidence-based medicine', 'free medical tool', 'MetaLens AI',
    ],
    openGraph: {
      title,
      description,
      url: localeUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
    robots: { index: true, follow: true },
    verification: {
      google: 'WddgcbVJsL2BGHNAje5m6DK56IcR0Mw5UOqozI2Xtrc',
    },
    alternates: {
      canonical: localeUrl,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    category: 'Health & Medical Research Tool',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <meta name="google-adsense-account" content="ca-pub-7098271335538021" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7098271335538021"
          crossOrigin="anonymous"
        ></script>
        <link rel="alternate" type="application/rss+xml" title="MetaLens AI Blog" href="/feed.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <NextIntlClientProvider messages={messages}>
          <HomeJsonLd />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
