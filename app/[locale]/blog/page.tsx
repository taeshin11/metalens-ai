import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Medical research insights, AI in healthcare, and meta-analysis tutorials from MetaLens AI by SPINAI.',
};

const posts = [
  {
    slug: 'what-is-meta-analysis',
    title: 'What Is a Meta-Analysis? A Beginner\'s Guide',
    excerpt: 'Learn what meta-analysis is, why it matters in medical research, and how AI is making it accessible to everyone.',
    date: '2026-03-15',
    readTime: '6 min read',
    tag: 'Education',
  },
  {
    slug: 'ai-in-medical-research',
    title: 'How AI Is Transforming Medical Research in 2026',
    excerpt: 'From literature reviews to drug discovery, artificial intelligence is reshaping how we approach medical science.',
    date: '2026-03-20',
    readTime: '8 min read',
    tag: 'AI & Healthcare',
  },
  {
    slug: 'how-to-compare-drug-efficacy',
    title: 'How to Compare Drug Efficacy: A Practical Guide',
    excerpt: 'A step-by-step tutorial for medical students and pharmacists on comparing treatment outcomes using published evidence.',
    date: '2026-03-25',
    readTime: '7 min read',
    tag: 'Tutorial',
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-4xl font-bold text-[var(--color-text-primary)] mb-4"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Blog
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-12">
        Insights on medical research, AI, and evidence-based medicine.
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
                  {post.tag}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.date}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.readTime}</span>
              </div>
              <h2
                className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors mb-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {post.title}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
