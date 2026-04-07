'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';

type AdVariant = 'banner' | 'inline';

interface AdBannerProps {
  /** Ad display variant: 'banner' for horizontal top bar, 'inline' for between content sections */
  variant?: AdVariant;
  /** Additional CSS class */
  className?: string;
}

/**
 * Google AdSense ad banner component.
 * Only renders for free-tier (non-paying) users.
 *
 * HOW TO ACTIVATE:
 * 1. Replace the data-ad-slot values below with your actual AdSense ad unit IDs.
 * 2. The AdSense publisher ID (ca-pub-7098271335538021) is already loaded in layout.tsx <head>.
 * 3. Once approved by Google, remove the placeholder overlay and the ads will render automatically.
 */
export default function AdBanner({ variant = 'banner', className = '' }: AdBannerProps) {
  const { user, loading } = useAuth();
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  // Only show ads to free-tier users (not logged in = free, or explicitly free tier)
  const isFreeUser = !user || user.tier === 'free';

  useEffect(() => {
    if (!isFreeUser || loading || pushed.current || !adRef.current) return;

    // Push the ad once the component mounts
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or ad-blocker active — silent fail
    }
  }, [isFreeUser, loading]);

  // Don't render anything for paid users
  if (!isFreeUser) return null;

  // Don't render while auth is loading to avoid flash
  if (loading) return null;

  const isBanner = variant === 'banner';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: '#f5f5f5',
        borderRadius: 8,
        border: '1px solid #e8e8e8',
        minHeight: isBanner ? 90 : 250,
        maxWidth: isBanner ? '100%' : 336,
        width: '100%',
        margin: isBanner ? '12px auto' : '16px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* "Advertisement" label — required by AdSense policy */}
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 8,
          fontSize: 10,
          color: '#999',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          zIndex: 1,
        }}
      >
        Advertisement
      </span>

      <div ref={adRef} style={{ width: '100%', textAlign: 'center' }}>
        {/*
         * =====================================================
         * GOOGLE ADSENSE AD UNIT
         * =====================================================
         * Replace data-ad-slot with your actual ad unit ID from
         * https://www.google.com/adsense/
         *
         * Banner variant  (728x90):  slot for leaderboard ads
         * Inline variant  (300x250): slot for medium rectangle ads
         *
         * The data-ad-client is already set in layout.tsx <head>.
         * =====================================================
         */}
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: isBanner ? 90 : 250,
          }}
          data-ad-client="ca-pub-7098271335538021"
          data-ad-slot={isBanner ? 'REPLACE_WITH_BANNER_SLOT_ID' : 'REPLACE_WITH_INLINE_SLOT_ID'}
          data-ad-format={isBanner ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="true"
        />
      </div>

      {/*
       * Placeholder overlay — remove this block once your AdSense
       * ad units are approved and the data-ad-slot values are real.
       */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#bbb',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          pointerEvents: 'none',
        }}
      >
        {isBanner ? 'Ad space — 728 x 90' : 'Ad space — 300 x 250'}
      </div>
    </div>
  );
}
