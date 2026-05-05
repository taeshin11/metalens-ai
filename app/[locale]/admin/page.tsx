'use client';

import { useAuth } from '@/components/AuthProvider';
import { isAdmin } from '@/lib/admin';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TIER_CONFIG } from '@/lib/constants';

interface LogTrace {
  reqId: string;
  route: string;
  startedAt: string;
  totalMs: number;
  status: number;
  hasError: boolean;
  hasWarning: boolean;
  entries: { ts: string; level: string; msg: string; [key: string]: unknown }[];
}

interface AdminStats {
  overview: {
    totalCalls: number;
    todayCalls: number;
    uniqueUsers: number;
    todayUsers: number;
    totalSignups: number;
  };
  costs: {
    today: number;
    week: number;
    month: number;
    total: number;
    apiMonth: number;
    paymentFees: number;
  };
  revenue: {
    proUsers: number;
    grossMonthly: number;
    paymentFees: number;
    netRevenue: number;
    apiCost: number;
    netProfit: number;
  };
  tierBreakdown: Record<string, number>;
  dailyData: {
    date: string;
    totalCalls: number;
    callsByTier: Record<string, number>;
    estimatedCost: number;
  }[];
  recentSignups: { timestamp: number; email: string; name: string }[];
  topUsers: { email: string; count: number }[];
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<LogTrace[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logSource, setLogSource] = useState<'server' | 'client'>('server');
  const [clientLogs, setClientLogs] = useState<Record<string, unknown>[]>([]);

  const fetchLogs = async () => {
    try {
      if (logSource === 'client') {
        const res = await fetch('/api/admin/logs?source=client&limit=100');
        if (res.ok) {
          const data = await res.json();
          setClientLogs(data.logs);
        }
        return;
      }
      const params = new URLSearchParams({ limit: '100', level: logFilter });
      if (logSearch) params.set('search', logSearch);
      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.traces);
        setLogsTotal(data.total);
      }
    } catch { /* ignore */ }
  };

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) {
        setError('Access denied');
        return;
      }
      const data = await res.json();
      setStats(data);
      setError('');
    } catch {
      setError('Failed to load stats');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push(`/${locale}`);
      return;
    }
    if (user && isAdmin(user.email)) {
      fetchStats();
      fetchLogs();
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (user && isAdmin(user.email)) fetchLogs();
  }, [logFilter, logSource]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) return null;

  if (error === 'Access denied') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Access Denied</p>
      </div>
    );
  }

  const maxCalls = stats ? Math.max(...stats.dailyData.map(d => d.totalCalls), 1) : 1;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            CEO Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            MetaLens AI — SPINAI Admin Panel
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {!stats ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards Row 1: Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard label="Total API Calls" value={stats.overview.totalCalls} color="primary" />
            <KPICard label="Today Calls" value={stats.overview.todayCalls} color="info" />
            <KPICard label="Unique Users" value={stats.overview.uniqueUsers} color="success" />
            <KPICard label="Today Active" value={stats.overview.todayUsers} color="warning" />
            <KPICard label="Total Signups" value={stats.overview.totalSignups} color="accent" />
          </div>

          {/* Financials Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <FinanceCard label="Gross Revenue" value={stats.revenue.grossMonthly} prefix="$" variant="revenue" />
            <FinanceCard label="Payment Fees" value={stats.revenue.paymentFees} prefix="-$" variant="cost" />
            <FinanceCard label="API Cost" value={stats.revenue.apiCost} prefix="-$" variant="cost" />
            <FinanceCard label="Net Revenue" value={stats.revenue.netRevenue} prefix="$" variant="revenue" />
            <FinanceCard label="Today API Cost" value={stats.costs.today} prefix="$" variant="cost" />
          </div>

          {/* Profit Breakdown */}
          <div className={`p-6 rounded-2xl border ${stats.revenue.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Net Profit (Monthly)</p>
                <p className={`text-3xl font-bold mt-1 ${stats.revenue.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenue.netProfit >= 0 ? '+' : ''}{formatMoney(stats.revenue.netProfit)}
                </p>
              </div>
              <div className="text-right space-y-1 text-xs text-[var(--color-text-muted)]">
                <p>Pro: <strong>{stats.revenue.proUsers}</strong> x ${TIER_CONFIG.pro.price} = <strong>${(stats.revenue.proUsers * TIER_CONFIG.pro.price).toFixed(2)}</strong></p>
                <p className="border-t border-[var(--color-border)] pt-1 mt-1">Gross: <strong>${stats.revenue.grossMonthly}</strong></p>
                <p className="text-orange-500">- Lemon Squeezy (5%+$0.50): <strong>-${stats.revenue.paymentFees}</strong></p>
                <p className="text-orange-500">- Gemini API: <strong>-{formatMoney(stats.revenue.apiCost)}</strong></p>
                <p className={`font-bold border-t border-[var(--color-border)] pt-1 mt-1 ${stats.revenue.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  = Net: {formatMoney(stats.revenue.netProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Usage by Tier */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Usage by Tier
              </h2>
              <div className="space-y-4">
                {(['free', 'pro'] as const).map(tier => {
                  const count = stats.tierBreakdown[tier] || 0;
                  const total = stats.overview.totalCalls || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors = { free: '#9BA8B2', pro: '#4DA8A0' };
                  return (
                    <div key={tier}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">{tier}</span>
                        <span className="text-[var(--color-text-muted)]">{count} calls ({pct}%)</span>
                      </div>
                      <div className="h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: colors[tier] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Daily API Calls (14 days)
              </h2>
              <div className="flex items-end gap-1.5 h-40">
                {stats.dailyData.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-[var(--color-text-muted)]">{d.totalCalls}</span>
                    <div
                      className="w-full bg-[var(--color-primary)] rounded-t transition-all duration-300 min-h-[2px]"
                      style={{ height: `${Math.max((d.totalCalls / maxCalls) * 120, 2)}px` }}
                    />
                    <span className="text-[8px] text-[var(--color-text-muted)] rotate-[-45deg] w-8 text-center">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Users and Signups */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Users */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Top Users by Usage
              </h2>
              {stats.topUsers.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No usage data yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.topUsers.map((u, i) => (
                    <div key={u.email} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm text-[var(--color-text-primary)]">{maskEmail(u.email)}</span>
                      </div>
                      <span className="text-sm font-mono text-[var(--color-text-muted)]">{u.count} calls</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Signups */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Recent Signups
              </h2>
              {stats.recentSignups.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No signups yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentSignups.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{maskEmail(s.email)}</p>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatTime(s.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Daily Cost Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 font-medium text-[var(--color-text-secondary)]">Date</th>
                    <th className="text-right py-2 font-medium text-[var(--color-text-secondary)]">Calls</th>
                    <th className="text-right py-2 font-medium text-[var(--color-text-secondary)]">Free</th>
                    <th className="text-right py-2 font-medium text-[var(--color-text-secondary)]">Pro</th>
                    <th className="text-right py-2 font-medium text-[var(--color-text-secondary)]">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyData.filter(d => d.totalCalls > 0).reverse().map(d => (
                    <tr key={d.date} className="border-b border-[var(--color-border)]/50">
                      <td className="py-2 text-[var(--color-text-primary)]">{d.date}</td>
                      <td className="py-2 text-right font-mono">{d.totalCalls}</td>
                      <td className="py-2 text-right font-mono text-[var(--color-text-muted)]">{d.callsByTier.free || 0}</td>
                      <td className="py-2 text-right font-mono text-[var(--color-primary)]">{d.callsByTier.pro || 0}</td>
                      <td className="py-2 text-right font-mono">{formatMoney(d.estimatedCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.dailyData.filter(d => d.totalCalls > 0).length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No data yet — stats populate as users make API calls</p>
              )}
            </div>
          </div>
          {/* Error Log Viewer */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Error Logs {logSource === 'server' ? `(${logsTotal} traces)` : `(${clientLogs.length} client)`}
              </h2>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center bg-[var(--color-bg-secondary)] rounded-lg p-0.5 mr-2">
                  <button onClick={() => setLogSource('server')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${logSource === 'server' ? 'bg-white shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>Server</button>
                  <button onClick={() => setLogSource('client')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${logSource === 'client' ? 'bg-white shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>Client</button>
                </div>
                <select
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value as 'all' | 'error' | 'warn')}
                  className="px-3 py-1.5 text-xs border border-[var(--color-border)] rounded-lg bg-white"
                >
                  <option value="all">All</option>
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings+</option>
                </select>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchLogs()}
                  className="px-3 py-1.5 text-xs border border-[var(--color-border)] rounded-lg w-40"
                />
                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]"
                >
                  Search
                </button>
              </div>
            </div>

            {logSource === 'client' ? (
              clientLogs.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No client errors found</p>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {clientLogs.map((entry, i) => (
                    <div key={i} className={`px-3 py-2 text-[11px] font-mono rounded border ${
                      entry.level === 'error' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${entry.level === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {String(entry.level).toUpperCase()}
                        </span>
                        <span className="text-[var(--color-text-secondary)]">{String(entry.component || '')}</span>
                        <span className="text-[var(--color-text-primary)] font-medium">{String(entry.msg || '')}</span>
                        {entry.url ? <span className="text-[var(--color-text-muted)]">{String(entry.url)}</span> : null}
                        <span className="text-[var(--color-text-muted)] ml-auto">{String(entry.ts || '').split('T')[1]?.split('.')[0]}</span>
                      </div>
                      {entry.errMessage ? (
                        <div className="mt-1 text-red-600 break-all">{String(entry.errMessage)}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )
            ) : logs.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No error traces found</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.map(trace => (
                  <div
                    key={trace.reqId}
                    className={`border rounded-xl overflow-hidden ${trace.hasError ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'}`}
                  >
                    <button
                      onClick={() => setExpandedLog(expandedLog === trace.reqId ? null : trace.reqId)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${trace.hasError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {trace.hasError ? 'ERR' : 'WARN'}
                        </span>
                        <span className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{trace.route}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{trace.totalMs}ms</span>
                        <span className={`text-[10px] font-mono ${trace.status >= 400 ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`}>{trace.status}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(trace.startedAt).toLocaleString()}</span>
                        <span className="text-xs">{expandedLog === trace.reqId ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {expandedLog === trace.reqId && (
                      <div className="border-t border-[var(--color-border)] bg-white px-4 py-3">
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] mb-2">reqId: {trace.reqId}</div>
                        <div className="space-y-1">
                          {trace.entries.map((entry, i) => (
                            <div
                              key={i}
                              className={`flex gap-2 text-[11px] font-mono py-0.5 ${
                                entry.level === 'error' ? 'text-red-600 bg-red-50 px-2 rounded' :
                                entry.level === 'warn' ? 'text-yellow-700 bg-yellow-50 px-2 rounded' :
                                'text-[var(--color-text-secondary)]'
                              }`}
                            >
                              <span className="text-[var(--color-text-muted)] flex-shrink-0 w-20">{entry.ts.split('T')[1]?.split('.')[0]}</span>
                              <span className="flex-shrink-0 w-10 text-center">{entry.level}</span>
                              <span className="flex-1 break-all">
                                {entry.msg}
                                {Object.keys(entry).filter(k => !['ts', 'level', 'route', 'reqId', 'msg'].includes(k)).length > 0 && (
                                  <span className="text-[var(--color-text-muted)] ml-2">
                                    {JSON.stringify(
                                      Object.fromEntries(Object.entries(entry).filter(([k]) => !['ts', 'level', 'route', 'reqId', 'msg'].includes(k)))
                                    )}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Helper components

function KPICard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'var(--color-primary)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    accent: 'var(--color-accent)',
  };
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-2" style={{ color: colorMap[color] }}>{value.toLocaleString()}</p>
    </div>
  );
}

function FinanceCard({ label, value, prefix, variant }: { label: string; value: number; prefix: string; variant: 'cost' | 'revenue' }) {
  return (
    <div className={`rounded-2xl border p-5 ${variant === 'cost' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-2 ${variant === 'cost' ? 'text-orange-600' : 'text-green-600'}`}>
        {prefix}{value.toFixed(4)}
      </p>
    </div>
  );
}

function formatMoney(n: number): string {
  return '$' + n.toFixed(4);
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return user.slice(0, 3) + '***@' + domain;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString();
}
