// Structured JSON-line logger for Vercel Function logs.
//
// Each log entry is a single-line JSON object, making it greppable in the
// Vercel dashboard and filterable with `jq` in exported logs. Every request
// gets a short reqId so you can trace the full lifecycle (start → stages →
// done/error) of a single request even under concurrent load.
//
// Usage in an API route:
//
//   const log = createLogger('api/synthesize');
//   log.start({ tier, keywordsLen: prompt.length });
//   log.stage('rate_limit_check', { remaining });
//   try {
//     const result = await callGemini(...);
//     log.stage('gemini_done', { model, bytes: result.length });
//     log.done(200);
//     return NextResponse.json({ result });
//   } catch (err) {
//     log.error('gemini_call_failed', err, { model });
//     log.done(502);
//     return NextResponse.json({ error: '...' }, { status: 502 });
//   }

type LogLevel = 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

function makeReqId(): string {
  // 8-char base36 — ~2.8T combinations, collision-safe within a single window
  return Math.random().toString(36).slice(2, 10);
}

function serializeError(err: unknown): LogContext {
  if (err instanceof Error) {
    const out: LogContext = {
      errName: err.name,
      errMessage: err.message,
    };
    // Keep stack compact: top 5 frames, joined so each log line stays one line
    if (err.stack) {
      out.errStack = err.stack.split('\n').slice(0, 6).map((s) => s.trim()).join(' | ');
    }
    // Common fields on fetch/Upstash/Gemini errors
    const anyErr = err as { cause?: unknown; code?: unknown; status?: unknown };
    if (anyErr.cause !== undefined) out.errCause = String(anyErr.cause).slice(0, 200);
    if (anyErr.code !== undefined) out.errCode = String(anyErr.code);
    if (anyErr.status !== undefined) out.errStatus = String(anyErr.status);
    return out;
  }
  return { errMessage: String(err).slice(0, 500) };
}

function emit(level: LogLevel, route: string, reqId: string, msg: string, ctx?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    route,
    reqId,
    msg,
    ...(ctx || {}),
  };
  // JSON-lines: one object per line
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export class RouteLogger {
  private readonly reqId: string;
  private readonly route: string;
  private readonly t0: number;
  private lastMark: number;

  constructor(route: string, reqId?: string) {
    this.route = route;
    this.reqId = reqId || makeReqId();
    this.t0 = performance.now();
    this.lastMark = this.t0;
  }

  get id(): string {
    return this.reqId;
  }

  /** Log request start. Call once at the top of the handler. */
  start(ctx?: LogContext): void {
    emit('info', this.route, this.reqId, 'start', ctx);
  }

  /** Mark a stage completion with timing since last mark and since start. */
  stage(name: string, ctx?: LogContext): void {
    const now = performance.now();
    const ms = Math.round(now - this.lastMark);
    const totalMs = Math.round(now - this.t0);
    this.lastMark = now;
    emit('info', this.route, this.reqId, `stage:${name}`, { ms, totalMs, ...(ctx || {}) });
  }

  /** Log an informational event (no timing). */
  info(msg: string, ctx?: LogContext): void {
    emit('info', this.route, this.reqId, msg, ctx);
  }

  /** Log a recoverable issue (e.g., primary model failed, falling back). */
  warn(msg: string, ctx?: LogContext): void {
    emit('warn', this.route, this.reqId, msg, ctx);
  }

  /** Log an error with normalized error fields. */
  error(msg: string, err?: unknown, ctx?: LogContext): void {
    const errCtx = err !== undefined ? serializeError(err) : {};
    emit('error', this.route, this.reqId, msg, { ...errCtx, ...(ctx || {}) });
  }

  /** Log request completion. Always call before returning. */
  done(status: number, ctx?: LogContext): void {
    const totalMs = Math.round(performance.now() - this.t0);
    emit('info', this.route, this.reqId, 'done', { status, totalMs, ...(ctx || {}) });
  }
}

export function createLogger(route: string, reqId?: string): RouteLogger {
  return new RouteLogger(route, reqId);
}

/** Hash-like masking for identifiers in logs (not cryptographic). */
export function maskId(value: string | null | undefined): string {
  if (!value) return 'anon';
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
}
