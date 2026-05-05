import { persistTrace, type StoredLogEntry, type StoredTrace } from './log-store';

type LogLevel = 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

function makeReqId(): string {
  return Math.random().toString(36).slice(2, 10);
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

function emit(level: LogLevel, route: string, reqId: string, msg: string, ctx?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    route,
    reqId,
    msg,
    ...(ctx || {}),
  };
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
  private readonly buffer: StoredLogEntry[] = [];
  private sawError = false;
  private sawWarning = false;

  constructor(route: string, reqId?: string) {
    this.route = route;
    this.reqId = reqId || makeReqId();
    this.t0 = performance.now();
    this.lastMark = this.t0;
  }

  get id(): string {
    return this.reqId;
  }

  private push(level: LogLevel, msg: string, ctx?: LogContext): void {
    const entry: StoredLogEntry = {
      ts: new Date().toISOString(),
      level,
      route: this.route,
      reqId: this.reqId,
      msg,
      ...(ctx || {}),
    };
    this.buffer.push(entry);
    if (level === 'error') this.sawError = true;
    if (level === 'warn') this.sawWarning = true;
  }

  start(ctx?: LogContext): void {
    this.push('info', 'start', ctx);
    emit('info', this.route, this.reqId, 'start', ctx);
  }

  stage(name: string, ctx?: LogContext): void {
    const now = performance.now();
    const ms = Math.round(now - this.lastMark);
    const totalMs = Math.round(now - this.t0);
    this.lastMark = now;
    const enriched = { ms, totalMs, ...(ctx || {}) };
    this.push('info', `stage:${name}`, enriched);
    emit('info', this.route, this.reqId, `stage:${name}`, enriched);
  }

  info(msg: string, ctx?: LogContext): void {
    this.push('info', msg, ctx);
    emit('info', this.route, this.reqId, msg, ctx);
  }

  warn(msg: string, ctx?: LogContext): void {
    this.push('warn', msg, ctx);
    emit('warn', this.route, this.reqId, msg, ctx);
  }

  error(msg: string, err?: unknown, ctx?: LogContext): void {
    const errCtx = err !== undefined ? serializeError(err) : {};
    const merged = { ...errCtx, ...(ctx || {}) };
    this.push('error', msg, merged);
    emit('error', this.route, this.reqId, msg, merged);
  }

  done(status: number, ctx?: LogContext): void {
    const totalMs = Math.round(performance.now() - this.t0);
    const enriched = { status, totalMs, ...(ctx || {}) };
    this.push('info', 'done', enriched);
    emit('info', this.route, this.reqId, 'done', enriched);

    if (this.sawError || this.sawWarning) {
      const trace: StoredTrace = {
        reqId: this.reqId,
        route: this.route,
        startedAt: this.buffer[0]?.ts || new Date().toISOString(),
        totalMs,
        status,
        hasError: this.sawError,
        hasWarning: this.sawWarning,
        entries: this.buffer,
      };
      persistTrace(trace).catch(() => {});
    }
  }
}

export function createLogger(route: string, reqId?: string): RouteLogger {
  return new RouteLogger(route, reqId);
}

export function maskId(value: string | null | undefined): string {
  if (!value) return 'anon';
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
}

export type { LogContext, LogLevel };
