import Link from 'next/link';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Medical research insights, AI in healthcare, and meta-analysis tutorials from MetaLens AI by SPINAI.',
};

const posts = [
  {
    slug: 'what-is-meta-analysis',
    titleKey: 'post1Title',
    excerptKey: 'post1Excerpt',
    date: '2026-03-15',
    readTime: '6 min',
    tagKey: 'tagEducation',
  },
  {
    slug: 'ai-in-medical-research',
    titleKey: 'post2Title',
    excerptKey: 'post2Excerpt',
    date: '2026-03-20',
    readTime: '8 min',
    tagKey: 'tagAI',
  },
  {
    slug: 'how-to-compare-drug-efficacy',
    titleKey: 'post3Title',
    excerptKey: 'post3Excerpt',
    date: '2026-03-25',
    readTime: '7 min',
    tagKey: 'tagTutorial',
  },
  {
    slug: 'understanding-forest-plots',
    titleKey: 'post4Title',
    excerptKey: 'post4Excerpt',
    date: '2026-04-01',
    readTime: '7 min',
    tagKey: 'tagStatistics',
  },
  {
    slug: 'systematic-review-protocol',
    titleKey: 'post5Title',
    excerptKey: 'post5Excerpt',
    date: '2026-04-05',
    readTime: '8 min',
    tagKey: 'tagTutorial',
  },
  {
    slug: 'publication-bias-detection',
    titleKey: 'post6Title',
    excerptKey: 'post6Excerpt',
    date: '2026-04-08',
    readTime: '6 min',
    tagKey: 'tagStatistics',
  },
  {
    slug: 'p-values-statistical-significance',
    titleKey: 'post7Title',
    excerptKey: 'post7Excerpt',
    date: '2026-04-10',
    readTime: '7 min',
    tagKey: 'tagEducation',
  },
  {
    slug: 'evidence-based-medicine-guide',
    titleKey: 'post8Title',
    excerptKey: 'post8Excerpt',
    date: '2026-04-11',
    readTime: '8 min',
    tagKey: 'tagClinical',
  },
  {
    slug: 'research-grant-proposal',
    titleKey: 'post9Title',
    excerptKey: 'post9Excerpt',
    date: '2026-04-12',
    readTime: '9 min',
    tagKey: 'tagResearch',
  },
  {
    slug: 'systematic-review-vs-meta-analysis',
    titleKey: 'post10Title',
    excerptKey: 'post10Excerpt',
    date: '2026-04-13',
    readTime: '6 min',
    tagKey: 'tagEducation',
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <BlogContent locale={locale} />;
}

function BlogContent({ locale }: { locale: string }) {
  const t = useTranslations('blog');

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-4"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {t('title')}
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-12">
        {t('subtitle')}
      </p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="block group"
          >
            <article className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-full">
                  {t(post.tagKey)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.date}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.readTime}</span>
              </div>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors mb-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {t(post.titleKey)}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t(post.excerptKey)}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
