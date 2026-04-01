'use client';

import { useState } from 'react';
import { SITE_URL } from '@/lib/constants';

interface ShareButtonsProps {
  keywords: string;
  paperCount: number;
}

export default function ShareButtons({ keywords, paperCount }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${SITE_URL}/en?q=${encodeURIComponent(keywords)}`;
  const shareText = `I just analyzed ${paperCount} PubMed papers on "${keywords}" using MetaLens AI — free AI-powered meta-analysis tool!`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`AI Meta-Analysis: ${keywords}`)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-muted)]">Share:</span>

      {/* Twitter/X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)]/10 transition-colors"
        title="Share on X"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)]/10 transition-colors"
        title="Share on LinkedIn"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
        </svg>
      </a>

      {/* Reddit */}
      <a
        href={redditUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)]/10 transition-colors"
        title="Share on Reddit"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.762c.036.214.054.432.054.654 0 3.342-3.89 6.052-8.686 6.052s-8.686-2.71-8.686-6.052c0-.222.018-.44.054-.654a1.606 1.606 0 01-.616-1.262 1.612 1.612 0 012.828-1.052c1.398-.978 3.326-1.607 5.482-1.68l1.033-4.854a.413.413 0 01.493-.307l3.388.716a1.152 1.152 0 012.168.392 1.15 1.15 0 01-1.15 1.152 1.148 1.148 0 01-1.083-.772l-2.978-.63-.905 4.262c2.12.086 4.013.716 5.388 1.68a1.612 1.612 0 012.828 1.052 1.606 1.606 0 01-.615 1.263zM8.354 12.845a1.152 1.152 0 100 2.305 1.152 1.152 0 000-2.305zm7.292 0a1.152 1.152 0 100 2.305 1.152 1.152 0 000-2.305zm-6.532 4.173c.101.078 1.293.968 2.886.968 1.594 0 2.786-.89 2.887-.968a.253.253 0 00-.182-.433c-.08 0-.162.03-.226.089-.01.008-.985.744-2.479.744-1.494 0-2.469-.736-2.479-.744a.316.316 0 00-.226-.089.253.253 0 00-.181.433z"/>
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)]/10 transition-colors text-xs"
        title="Copy link"
      >
        {copied ? (
          <span className="text-[var(--color-success)] font-medium">Copied!</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
