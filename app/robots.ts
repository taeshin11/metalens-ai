import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
      // Google
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
      // Microsoft Bing (also powers DuckDuckGo, Yahoo)
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'msnbot', allow: '/' },
      // Naver (Korea)
      { userAgent: 'Yeti', allow: '/' },
      { userAgent: 'NaverBot', allow: '/' },
      // Daum / Kakao (Korea)
      { userAgent: 'Daum', allow: '/' },
      { userAgent: 'Daumoa', allow: '/' },
      // Baidu (China)
      { userAgent: 'Baiduspider', allow: '/' },
      { userAgent: 'Baiduspider-image', allow: '/' },
      // Sogou (China)
      { userAgent: 'Sogou web spider', allow: '/' },
      // 360 Search (China)
      { userAgent: '360Spider', allow: '/' },
      // Yandex (Russia / CIS)
      { userAgent: 'YandexBot', allow: '/' },
      // DuckDuckGo
      { userAgent: 'DuckDuckBot', allow: '/' },
      // Seznam (Czech)
      { userAgent: 'SeznamBot', allow: '/' },
      // Yahoo Japan uses Googlebot but also has Y!J-BRI, Y!J-BRW
      { userAgent: 'Y!J-BRI', allow: '/' },
      { userAgent: 'Y!J-BRW', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
