import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FAF8F5 0%, #F0EDEA 40%, #E8F4F3 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(77, 168, 160, 0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(232, 133, 108, 0.1)',
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 64 }}>🔬</span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#2D7A73',
              letterSpacing: -1,
            }}
          >
            MetaLens AI
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#2C3E50',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.3,
            marginBottom: 32,
          }}
        >
          Free AI-Powered Medical Meta-Analysis
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: '#6B7C8A',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 40,
          }}
        >
          Search 40M+ PubMed papers and get instant AI-synthesized research summaries
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 48,
          }}
        >
          {[
            { icon: '📄', label: '40M+ Papers' },
            { icon: '🤖', label: 'AI-Powered' },
            { icon: '🌐', label: '8 Languages' },
            { icon: '✨', label: 'Free to Use' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 20,
                color: '#4DA8A0',
                fontWeight: 500,
              }}
            >
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 40,
            fontSize: 18,
            color: '#9BA8B2',
          }}
        >
          by SPINAI
        </div>
      </div>
    ),
    { ...size }
  );
}
