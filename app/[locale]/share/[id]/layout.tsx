import type { Metadata } from 'next';
import { Redis } from '@upstash/redis';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

interface SharePayload {
  keywords: string;
  result: { english: string; translated?: string | null };
  articles: { pmid: string }[];
  mode: 'meta-analysis' | 'gap-finder';
  createdAt: number;
}

function firstSentence(text: string, maxLen = 160): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const match = trimmed.match(/^(.+?[.!?])\s/);
  const sentence = match ? match[1] : trimmed;
  return sentence.length > maxLen ? sentence.slice(0, maxLen - 1) + '…' : sentence;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'share' });

  const url = `${SITE_URL}/${locale}/share/${id}`;
  const fallbackTitle = t('title');
  const fallbackDesc = t('sharedBy');

  let title = fallbackTitle;
  let description = fallbackDesc;

  try {
    const redis = Redis.fromEnv();
    const raw = await redis.get(`share:${id}`);
    if (raw) {
      const data = (typeof raw === 'string' ? JSON.parse(raw) : raw) as SharePayload;
      const keywordsSnippet = data.keywords.length > 80
        ? data.keywords.slice(0, 79) + '…'
        : data.keywords;
      title = `${fallbackTitle}: ${keywordsSnippet}`;
      const summary = data.result?.translated || data.result?.english || '';
      if (summary) description = firstSentence(summary);
    }
  } catch {
    // Silently fall back to generic metadata — never block page render on Redis errors
  }

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
