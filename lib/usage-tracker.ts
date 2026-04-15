import type { Tier } from './constants';
import { TIER_CONFIG } from './constants';

// === In-memory usage tracker (resets on server restart) ===
// For MVP: tracks API calls, estimated costs, and user stats
// Future: persist to database

interface UsageEntry {
  timestamp: number;
  email: string;
  tier: Tier;
  model: string;
  inputTokensEst: number;
  outputTokensEst: number;
}

interface DailyStats {
  date: string;
  totalCalls: number;
  callsByTier: Record<Tier, number>;
  estimatedCost: number;
}

// Cost per 1M tokens (USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.15, output: 0.60 },
  'gemini-2.0-flash-lite': { input: 0.075, output: 0.30 },
};

const usageLog: UsageEntry[] = [];
const signupLog: { timestamp: number; email: string; name: string }[] = [];

export function trackUsage(
  email: string,
  tier: Tier,
  model: string,
  inputTokensEst: number = 5000,
  outputTokensEst: number = 800,
) {
  usageLog.push({
    timestamp: Date.now(),
    email,
    tier,
    model,
    inputTokensEst,
    outputTokensEst,
  });
}

export function trackSignup(email: string, name: string) {
  signupLog.push({ timestamp: Date.now(), email, name });
}

function estimateCost(entry: UsageEntry): number {
  const costs = MODEL_COSTS[entry.model] || MODEL_COSTS['gemini-2.5-flash'];
  return (entry.inputTokensEst * costs.input + entry.outputTokensEst * costs.output) / 1_000_000;
}

function toDateStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function getAdminStats() {
  const now = Date.now();
  const today = toDateStr(now);
  const last30d = now - 30 * 24 * 60 * 60 * 1000;
  const last7d = now - 7 * 24 * 60 * 60 * 1000;

  // Total stats
  const totalCalls = usageLog.length;
  const totalCost = usageLog.reduce((sum, e) => sum + estimateCost(e), 0);

  // Today stats
  const todayEntries = usageLog.filter(e => toDateStr(e.timestamp) === today);
  const todayCalls = todayEntries.length;
  const todayCost = todayEntries.reduce((sum, e) => sum + estimateCost(e), 0);

  // Last 7 days
  const week = usageLog.filter(e => e.timestamp >= last7d);
  const weekCost = week.reduce((sum, e) => sum + estimateCost(e), 0);

  // Last 30 days
  const month = usageLog.filter(e => e.timestamp >= last30d);
  const monthCost = month.reduce((sum, e) => sum + estimateCost(e), 0);

  // Unique users
  const uniqueUsers = new Set(usageLog.map(e => e.email)).size;
  const todayUsers = new Set(todayEntries.map(e => e.email)).size;

  // Calls by tier
  const tierBreakdown: Record<Tier, number> = { free: 0, pro: 0 };
  for (const e of usageLog) tierBreakdown[e.tier]++;

  // Revenue (from paid tiers)
  const proUsers = new Set(usageLog.filter(e => e.tier === 'pro').map(e => e.email)).size;
  const grossRevenue = proUsers * TIER_CONFIG.pro.price;

  // Lemon Squeezy fees: 5% + $0.50 per transaction per user per month
  const lsFeePerUser = (amount: number) => amount * 0.05 + 0.50;
  const totalPaymentFees = proUsers * lsFeePerUser(TIER_CONFIG.pro.price);
  const netRevenue = grossRevenue - totalPaymentFees;
  const estimatedRevenue = grossRevenue;

  // Daily chart data (last 14 days)
  const dailyData: DailyStats[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = toDateStr(d.getTime());
    const dayEntries = usageLog.filter(e => toDateStr(e.timestamp) === dateStr);
    const byTier: Record<Tier, number> = { free: 0, pro: 0 };
    for (const e of dayEntries) byTier[e.tier]++;
    dailyData.push({
      date: dateStr,
      totalCalls: dayEntries.length,
      callsByTier: byTier,
      estimatedCost: dayEntries.reduce((s, e) => s + estimateCost(e), 0),
    });
  }

  // Recent signups
  const recentSignups = signupLog.slice(-20).reverse();

  // Top users by usage
  const userCounts: Record<string, number> = {};
  for (const e of usageLog) userCounts[e.email] = (userCounts[e.email] || 0) + 1;
  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count]) => ({ email, count }));

  return {
    overview: {
      totalCalls,
      todayCalls,
      uniqueUsers,
      todayUsers,
      totalSignups: signupLog.length,
    },
    costs: {
      today: Math.round(todayCost * 10000) / 10000,
      week: Math.round(weekCost * 10000) / 10000,
      month: Math.round(monthCost * 10000) / 10000,
      total: Math.round(totalCost * 10000) / 10000,
      apiMonth: Math.round(monthCost * 10000) / 10000,
      paymentFees: Math.round(totalPaymentFees * 100) / 100,
    },
    revenue: {
      proUsers,
      grossMonthly: Math.round(grossRevenue * 100) / 100,
      paymentFees: Math.round(totalPaymentFees * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      apiCost: Math.round(monthCost * 10000) / 10000,
      netProfit: Math.round((netRevenue - monthCost) * 100) / 100,
    },
    tierBreakdown,
    dailyData,
    recentSignups,
    topUsers,
  };
}
