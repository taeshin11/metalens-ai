'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function isKakaoTalk(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export default function KakaoWebviewGuard() {
  const t = useTranslations('kakao');
  const [show, setShow] = useState(false);
  const [isAnd, setIsAnd] = useState(false);

  useEffect(() => {
    if (isKakaoTalk()) {
      setIsAnd(isAndroid());

      if (isAndroid()) {
        const url = window.location.href;
        const intentUrl =
          'intent://' +
          url.replace(/^https?:\/\//, '') +
          '#Intent;scheme=https;package=com.android.chrome;end;';
        window.location.href = intentUrl;

        // intent 실패 대비 — 500ms 후에도 카카오면 안내 표시
        setTimeout(() => {
          if (isKakaoTalk()) setShow(true);
        }, 500);
      } else {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
          {t('title')}
        </h2>

        <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', lineHeight: 1.6 }}>
          {isAnd ? t('descAndroid') : t('descIos')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isAnd && (
            <a
              href={
                'intent://' +
                currentUrl.replace(/^https?:\/\//, '') +
                '#Intent;scheme=https;package=com.android.chrome;end;'
              }
              style={{
                display: 'block',
                padding: '12px',
                backgroundColor: '#1A73E8',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
              }}
            >
              {t('openChrome')}
            </a>
          )}

          <button
            onClick={() => {
              navigator.clipboard?.writeText(currentUrl).catch(() => {});
              alert(t('copied'));
            }}
            style={{
              padding: '12px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('copyUrl')}
          </button>
        </div>
      </div>
    </div>
  );
}
