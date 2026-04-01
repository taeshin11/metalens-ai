'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const t = useTranslations('auth');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-[var(--color-border)]">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary)]/10 rounded-full">
                  <span className="text-3xl">🔬</span>
                </div>

                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {t('loginTitle')}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {t('loginDesc')}
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <button
                  onClick={() => signIn('google')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary-light)] hover:shadow-md transition-all group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-dark)]">
                    {t('continueWithGoogle')}
                  </span>
                </button>

                {/* Benefits */}
                <div className="space-y-2 pt-2">
                  {['benefit1', 'benefit2', 'benefit3'].map((key) => (
                    <div key={key} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-success)]">&#10003;</span>
                      {t(key)}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)] pt-2">
                  {t('termsNote')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
