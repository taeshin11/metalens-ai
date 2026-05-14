import { Redis } from '@upstash/redis';
import type { RouteLogger } from './logger';

const redis = Redis.fromEnv();
const MAX_SAVED = 50;

export interface SavedAnalysis {
  id: string;
  keywords: string;
  mode: 'meta-analysis' | 'gap-finder';
  resultEnglish: string;
  resultTranslated: string | null;
  articles: { pmid: string; title: string; authors: string[]; journal: string; year: string; doi?: string }[];
  consensusScore: number | null;
  consensusLevel: string | null;
  filters: Record<string, string> | null;
  createdAt: number;
}

function indexKey(userId: string) { return `saved_idx:${userId}`; }
function dataKey(id: string) { return `saved_data:${id}`; }

export async function listSaved(userId: string, log?: RouteLogger): Promise<SavedAnalysis[]> {
  log?.stage('saved_list_start', { userId: maskEmail(userId) });

  const ids = await redis.zrange<string[]>(indexKey(userId), 0, MAX_SAVED - 1, { rev: true });
  log?.stage('saved_list_index_read', { idCount: ids?.length || 0 });

  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get(dataKey(id));
  const results = await pipeline.exec<(string | null)[]>();

  const analyses: SavedAnalysis[] = [];
  let corruptCount = 0;
  let nullCount = 0;
  for (let i = 0; i < results.length; i++) {
    const raw = results[i];
    if (!raw) { nullCount++; continue; }
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      analyses.push(parsed as SavedAnalysis);
    } catch {
      corruptCount++;
    }
  }

  if (corruptCount > 0 || nullCount > 0) {
    log?.warn('saved_list_data_issues', { corruptCount, nullCount, validCount: analyses.length });
  }
  log?.stage('saved_list_done', { total: analyses.length, corruptCount, nullCount });
  return analyses;
}

export async function saveAnalysis(userId: string, data: SavedAnalysis, log?: RouteLogger): Promise<{ ok: boolean; count: number }> {
  const key = indexKey(userId);
  const dataBytes = JSON.stringify(data).length;

  log?.stage('saved_store_start', {
    userId: maskEmail(userId),
    id: data.id,
    keywords: data.keywords.slice(0, 40),
    mode: data.mode,
    articleCount: data.articles.length,
    resultChars: data.resultEnglish.length,
    dataBytes,
  });

  const count = await redis.zcard(key);
  log?.stage('saved_store_count_check', { currentCount: count, max: MAX_SAVED });

  if (count >= MAX_SAVED) {
    const oldest = await redis.zrange<string[]>(key, 0, 0);
    if (oldest?.[0]) {
      await redis.zrem(key, oldest[0]);
      await redis.del(dataKey(oldest[0]));
      log?.info('saved_evicted_oldest', { evictedId: oldest[0], reason: 'max_reached' });
    }
  }

  await redis.zadd(key, { score: data.createdAt, member: data.id });
  log?.stage('saved_store_index_written', { id: data.id });

  await redis.set(dataKey(data.id), JSON.stringify(data));
  log?.stage('saved_store_data_written', { id: data.id, bytes: dataBytes });

  const newCount = await redis.zcard(key);
  log?.stage('saved_store_done', { id: data.id, total: newCount });
  return { ok: true, count: newCount };
}

export async function deleteSaved(userId: string, analysisId: string, log?: RouteLogger): Promise<boolean> {
  log?.stage('saved_delete_start', { userId: maskEmail(userId), id: analysisId });

  const removed = await redis.zrem(indexKey(userId), analysisId);
  log?.stage('saved_delete_index_removed', { id: analysisId, removed: !!removed });

  await redis.del(dataKey(analysisId));
  log?.stage('saved_delete_data_removed', { id: analysisId });

  const remaining = await redis.zcard(indexKey(userId));
  log?.stage('saved_delete_done', { id: analysisId, removed: !!removed, remaining });
  return !!removed;
}

export async function getSavedCount(userId: string): Promise<number> {
  return await redis.zcard(indexKey(userId));
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email.slice(0, 3) + '***';
  return local.slice(0, 2) + '***@' + domain;
}
