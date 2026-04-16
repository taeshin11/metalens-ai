'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-[var(--color-primary-light)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Oops
        </div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Something went wrong
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-2xl font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
