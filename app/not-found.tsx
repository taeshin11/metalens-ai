import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Source Sans 3', sans-serif", margin: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#faf8f5',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: '#b8d8cf',
              fontFamily: 'Outfit, sans-serif',
            }}>
              404
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#2d3436',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '0.5rem',
            }}>
              Page Not Found
            </h1>
            <p style={{ color: '#636e72', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#7fb8a8',
                color: 'white',
                borderRadius: '1rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
