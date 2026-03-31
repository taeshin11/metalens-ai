'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  /** Adsterra ad placement key */
  adKey: string;
  /** Width of the ad (default: 728) */
  width?: number;
  /** Height of the ad (default: 90) */
  height?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Adsterra banner ad component.
 * Place your Adsterra ad key as NEXT_PUBLIC_ADSTERRA_AD_KEY in .env
 * Renders nothing if no ad key is provided.
 */
export default function AdBanner({ adKey, width = 728, height = 90, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!adKey || loaded.current || !adRef.current) return;
    loaded.current = true;

    try {
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      conf.text = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      adRef.current.appendChild(conf);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      script.async = true;
      adRef.current.appendChild(script);
    } catch {
      // Ad blocked or failed — silent fail
    }
  }, [adKey, width, height]);

  if (!adKey) return null;

  return (
    <div
      ref={adRef}
      className={`flex justify-center items-center overflow-hidden ${className}`}
      style={{ minHeight: height, maxWidth: width }}
    />
  );
}
