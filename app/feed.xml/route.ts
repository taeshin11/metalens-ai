import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

const posts = [
  {
    slug: 'what-is-meta-analysis',
    title: 'What Is a Meta-Analysis? A Beginner\'s Guide',
    description: 'Learn what meta-analysis is, why it matters in medical research, and how AI tools like MetaLens make it accessible.',
    date: '2026-03-15',
  },
  {
    slug: 'ai-in-medical-research',
    title: 'How AI Is Transforming Medical Research in 2026',
    description: 'Explore how artificial intelligence is reshaping medical research from drug discovery to literature reviews.',
    date: '2026-03-20',
  },
  {
    slug: 'how-to-compare-drug-efficacy',
    title: 'How to Compare Drug Efficacy: A Practical Guide',
    description: 'A step-by-step tutorial for medical students and pharmacists on comparing treatment outcomes using published evidence.',
    date: '2026-03-25',
  },
];

export async function GET() {
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/en/blog/${post.slug}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${SITE_URL}/en/blog/${post.slug}</guid>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${SITE_URL}/en/blog</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
