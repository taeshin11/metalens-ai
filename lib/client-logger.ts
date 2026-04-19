'use client';

// Client-side structured logger — mirrors lib/logger.ts format so server
// and browser logs share the same shape when aggregated.
//
// Usage:
//   import { clog } from '@/lib/client-logger';
//   clog.info('download_start', 'DataTable', { rows: data.length });
//   try { ... } catch (err) { clog.error('download_failed', 'DataTable', err); }
//
// Output: JSON-line via console.log/warn/error so it shows up in the
// browser devtools console AND gets surfaced by any error-tracking
// wrapper the user later adds (Sentry/LogRocket/Vercel Web Analytics).

type LogLevel = 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

// Per-page-load session id — short enough to type, long enough to be unique
let sessionId: string | null = null;
function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return 'ssr';
  try {
    const existing = sessionStorage.getItem('metalens_log_sid');
    if (existing) {
      sessionId = existing;
      return existing;
    }
    const fresh = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('metalens_log_sid', fresh);
    sessionId = fresh;
    return fresh;
  } catch {
    // sessionStorage blocked (Safari private mode, etc.) — use in-memory
    sessionId = Math.random().toString(36).slice(2, 10);
    return sessionId;
  }
}

function serializeError(err: unknown): LogContext {
  if (err instanceof Error) {
    const out: LogContext = {
      errName: err.name,
      errMessage: err.message,
    };
    if (err.stack) {
      out.errStack = err.stack.split('\n').slice(0, 6).map((s) => s.trim()).join(' | ');
    }
    const anyErr = err as { cause?: unknown; code?: unknown; status?: unknown };
    if (anyErr.cause !== undefined) out.errCause = String(anyErr.cause).slice(0, 200);
    if (anyErr.code !== undefined) out.errCode = String(anyErr.code);
    if (anyErr.status !== undefined) out.errStatus = String(anyErr.status);
    return out;
  }
  return { errMessage: String(err).slice(0, 500) };
}

function emit(level: LogLevel, msg: string, component: string, ctx?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    side: 'client',
    component,
    sid: getSessionId(),
    msg,
    ...(ctx || {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const clog = {
  info(msg: string, component: string, ctx?: LogContext) {
    emit('info', msg, component, ctx);
  },
  warn(msg: string, component: string, ctx?: LogContext) {
    emit('warn', msg, component, ctx);
  },
  error(msg: string, component: string, err?: unknown, ctx?: LogContext) {
    const errCtx = err !== undefined ? serializeError(err) : {};
    emit('error', msg, component, { ...errCtx, ...(ctx || {}) });
  },
};
