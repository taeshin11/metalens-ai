'use client';

import { CONTACT_EMAIL } from '@/lib/constants';

export default function FeedbackButton() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=MetaLens%20AI%20Feedback&body=Hi%20SPINAI%20team%2C%0A%0AI%20have%20a%20suggestion%3A%0A%0A`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:bg-[var(--color-primary-dark)] transition-all hover:scale-105 text-sm font-medium opacity-80 hover:opacity-100"
      aria-label="Send feedback"
    >
      <span>💡</span>
      <span className="hidden sm:inline">Feedback</span>
    </a>
  );
}
