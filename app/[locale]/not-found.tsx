import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-[var(--color-primary-light)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          404
        </div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Page Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Try searching for medical research from the homepage.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
