import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const LOG_KEY = 'metalens:error_logs';
const LOG_TTL = 7 * 24 * 60 * 60; // 7 days

export interface StoredLogEntry {
  ts: string;
  level: string;
  route: string;
  reqId: string;
  msg: string;
  [key: string]: unknown;
}

export interface StoredTrace {
  reqId: string;
  route: string;
  startedAt: string;
  totalMs: number;
  status: number;
  hasError: boolean;
  hasWarning: boolean;
  entries: StoredLogEntry[];
}

export async function persistTrace(trace: StoredTrace): Promise<void> {
  try {
    const score = Date.now();
    const member = JSON.stringify(trace);
    await redis.zadd(LOG_KEY, { score, member });
    const count = await redis.zcard(LOG_KEY);
    if (count > 500) {
      await redis.zremrangebyrank(LOG_KEY, 0, count - 501);
    }
  } catch {
    // Don't let log persistence break the request
  }
}

export interface LogQuery {
  limit?: number;
  offset?: number;
  route?: string;
  level?: 'error' | 'warn' | 'all';
  search?: string;
}

export async function queryTraces(query: LogQuery): Promise<{ traces: StoredTrace[]; total: number }> {
  const total = await redis.zcard(LOG_KEY);
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  const raw = await redis.zrange(LOG_KEY, '+inf', '-inf', {
    byScore: true,
    rev: true,
    offset,
    count: limit + 50,
  }) as string[];

  let traces: StoredTrace[] = raw.map(r => {
    try { return JSON.parse(r) as StoredTrace; }
    catch { return null; }
  }).filter((t): t is StoredTrace => t !== null);

  if (query.route) {
    traces = traces.filter(t => t.route.includes(query.route!));
  }
  if (query.level === 'error') {
    traces = traces.filter(t => t.hasError);
  } else if (query.level === 'warn') {
    traces = traces.filter(t => t.hasWarning || t.hasError);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    traces = traces.filter(t =>
      JSON.stringify(t).toLowerCase().includes(s)
    );
  }

  return { traces: traces.slice(0, limit), total };
}

export async function clearTraces(): Promise<number> {
  const count = await redis.zcard(LOG_KEY);
  await redis.del(LOG_KEY);
  return count;
}

// ── Client-side error logs ──

const CLIENT_LOG_KEY = 'metalens:client_errors';

export interface ClientLogEntry {
  ts: string;
  level: string;
  component: string;
  msg: string;
  sid: string;
  url?: string;
  [key: string]: unknown;
}

export async function queryClientLogs(limit = 50): Promise<ClientLogEntry[]> {
  const raw = await redis.zrange(CLIENT_LOG_KEY, '+inf', '-inf', {
    byScore: true, rev: true, count: limit, offset: 0,
  }) as string[];

  return raw.map(r => {
    try { return JSON.parse(r) as ClientLogEntry; }
    catch { return null; }
  }).filter((e): e is ClientLogEntry => e !== null);
}
