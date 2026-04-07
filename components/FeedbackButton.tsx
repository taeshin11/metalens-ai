'use client';

import { useState, useRef, useEffect } from 'react';
import { CONTACT_EMAIL } from '@/lib/constants';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function handleSend() {
    if (!feedback.trim()) return;
    const subject = encodeURIComponent('MetaLens AI Feedback');
    const body = encodeURIComponent(feedback.trim());
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_self');
    setFeedback('');
    setOpen(false);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:bg-[var(--color-primary-dark)] transition-all hover:scale-105 text-sm font-medium opacity-80 hover:opacity-100"
        aria-label="Send feedback"
        aria-expanded={open}
      >
        <span>{open ? '\u2715' : '\uD83D\uDCA1'}</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Popover panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-[4.5rem] right-6 z-50 w-[min(22rem,calc(100vw-3rem))] bg-white rounded-2xl shadow-xl border border-[var(--color-border)] p-5 animate-in fade-in slide-in-from-bottom-2"
          role="dialog"
          aria-label="Feedback form"
        >
          <p
            className="text-sm font-semibold text-[var(--color-text-primary)] mb-3"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Send us feedback
          </p>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What can we improve?"
            rows={4}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary,#f9fafb)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">
              Opens your email client
            </span>
            <button
              onClick={handleSend}
              disabled={!feedback.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
