import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_NAME, SITE_URL, SUPPORTED_LOCALES } from '@/lib/constants';

// Google Analytics Measurement ID — replace with your actual GA4 ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Map locales to BCP-47 hreflang codes.
// Naver prefers ko-KR, Baidu prefers zh-CN, Yandex prefers ru (we don't have ru yet).
const HREFLANG_MAP: Record<string, string> = {
  en: 'en',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  es: 'es',
  pt: 'pt',
  de: 'de-DE',
  fr: 'fr-FR',
};
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeJsonLd from '@/components/HomeJsonLd';
import AuthProvider from '@/components/AuthProvider';
import KakaoWebviewGuard from '@/components/KakaoWebviewGuard';
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
      'clinical research', 'drug efficacy', 'research gap finder',
      'biomedical research', 'healthcare AI', 'literature review tool',
      'medical AI tool', 'PubMed search', 'SPINAI',
    ],
    openGraph: {
      title,
      description,
      url: localeUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: SITE_NAME }],
      countryName: 'US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
      creator: '@spinai_dev',
      site: '@metalensai',
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 },
    authors: [{ name: 'SPINAI', url: SITE_URL }],
    creator: 'SPINAI',
    publisher: 'SPINAI',
    verification: {
      google: ['WddgcbVJsL2BGHNAje5m6DK56IcR0Mw5UOqozI2Xtrc', 'aNnJOiFANf2bXdlGMVZmhPQ-qTyTn6KDE7Pig6AVYRA'],
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: {
        'naver-site-verification': 'd181f015498ff7d7b280da0749bce165a3b44e01',
        ...(process.env.NEXT_PUBLIC_BAIDU_VERIFICATION && {
          'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION,
        }),
        ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && {
          'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION,
        }),
      },
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
        {/* — Google Analytics (GA4) — */}
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
              }}
            />
          </>
        )}

        {/* — hreflang alternate links for all supported locales — */}
        {SUPPORTED_LOCALES.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={HREFLANG_MAP[l] || l}
            href={`${SITE_URL}/${l}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en`} />

        {/* — RSS feed — */}
        <link rel="alternate" type="application/rss+xml" title="MetaLens AI Blog" href="/feed.xml" />

        {/* — Portal-friendly meta tags (Naver/Bing/Baidu/Yandex) — */}
        <meta httpEquiv="content-language" content={HREFLANG_MAP[locale] || locale} />
        <meta name="author" content="SPINAI" />
        <meta name="copyright" content="SPINAI" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="3 days" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        {/* Naver SmartBlock / Blog indexing hints */}
        <meta property="me2:post_tag" content="메타분석,의학연구,pubmed,AI,논문검색" />
        <meta name="NaverBot" content="All" />
        <meta name="Yeti" content="All" />
        {/* Baidu — prevent transcoding of mobile pages, disable translation prompt */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        {locale === 'zh' && <meta name="google" content="notranslate" />}
        {/* Bing/Yahoo — explicit indexing */}
        <meta name="msnbot" content="index,follow" />
        {/* Yandex — mark content as authoritative for CIS users */}
        <meta name="yandex" content="all" />
        {/* Yahoo Japan — og:locale:alternate for ja */}
        {locale === 'ja' && <meta property="og:locale:alternate" content="en_US" />}

        {/* — Preconnect hints for external domains — */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pubmed.ncbi.nlm.nih.gov" />
        <link rel="dns-prefetch" href="https://eutils.ncbi.nlm.nih.gov" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* — Google Fonts — */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            <KakaoWebviewGuard />
            <HomeJsonLd />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
