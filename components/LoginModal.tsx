'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setSubmitting(true);
    setError('');

    const ok = await login(email.trim(), name.trim());
    setSubmitting(false);

    if (ok) {
      onClose();
    } else {
      setError(t('loginError'));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-[var(--color-border)] relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

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

                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {t('nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      required
                      className="w-full px-4 py-3 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      required
                      className="w-full px-4 py-3 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting || !email.trim() || !name.trim()}
                    className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ...
                      </span>
                    ) : (
                      t('startFree')
                    )}
                  </button>
                </form>

                <div className="space-y-2 pt-1">
                  {['benefit1', 'benefit2', 'benefit3'].map((key) => (
                    <div key={key} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-success)]">&#10003;</span>
                      {t(key)}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)]">
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
