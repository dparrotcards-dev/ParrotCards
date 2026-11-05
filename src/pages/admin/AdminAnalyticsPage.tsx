import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Users,
  CreditCard,
  Layers,
  Sparkles,
  Calendar,
  Percent,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminAnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<string>('30d');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalytics(range);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const dailyRevenue = analytics?.dailyRevenue || [];
  const dailyUsers = analytics?.dailyUsers || [];
  const dailyDecks = analytics?.dailyDecks || [];
  const popularCardUnlocks = analytics?.popularCardUnlocks || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Analytics & Conversion Growth
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Aggregated conversion rates, card unlock demand, and verified income trajectories
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                range === r
                  ? 'bg-[#C9A45C] text-[#08071B] font-bold shadow-md'
                  : 'bg-white/5 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6]'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6]"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Conversion Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Free-to-Paid Conversion</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
            {analytics?.conversionRate ?? 0}%
          </div>
          <p className="text-[11px] text-[#A7A4C4] font-mono">
            {analytics?.uniquePayingUsersCount ?? 0} paying customers
          </p>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Paid Transactions</span>
            <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#C9A45C]">
            {analytics?.totalPaidOrders ?? 0}
          </div>
          <p className="text-[11px] text-[#A7A4C4] font-mono">Orders captured during selected period</p>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Selected Interval</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-[#F6F0E6]">
            Past {range.toUpperCase()}
          </div>
          <p className="text-[11px] text-[#A7A4C4] font-mono">Real database timeseries group</p>
        </div>
      </div>

      {/* Daily Revenue Distribution Graph */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#F6F0E6]">Verified Revenue Trajectory</h3>
            <p className="text-xs text-[#A7A4C4] font-serif italic">Real daily financial intake from Razorpay captures</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">₹ INR Net</span>
        </div>

        {dailyRevenue.length > 0 ? (
          <div className="h-44 flex items-end gap-2.5 px-2 pt-6 border-b border-white/10 overflow-x-auto custom-scrollbar">
            {dailyRevenue.map((item: any, idx: number) => {
              const maxRev = Math.max(...dailyRevenue.map((d: any) => d.revenueRupees), 10);
              const heightPct = Math.max(14, Math.round((item.revenueRupees / maxRev) * 100));
              return (
                <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-[#A7A4C4] opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenueRupees}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-md shadow-emerald-500/20"
                  />
                  <span className="text-[9px] font-mono text-[#A7A4C4] truncate w-full text-center">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center text-xs text-[#A7A4C4] italic">
            No revenue recorded during the selected period.
          </div>
        )}
      </div>

      {/* Top Unlocked Cards Demand Ranking */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#F6F0E6]">Most Unlocked Planetary Cards</h3>
            <p className="text-xs text-[#A7A4C4] font-serif italic">Individual ₹2 card unlocks breakdown</p>
          </div>
          <span className="text-xs font-mono text-[#C9A45C]">Real Entitlement Ledger</span>
        </div>

        {popularCardUnlocks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCardUnlocks.map((c: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#F6F0E6]">{c.cardKey}</div>
                  <span className="text-[10px] text-[#A7A4C4]">Planetary Card</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#C9A45C] text-base">{c.unlocksCount}</div>
                  <span className="text-[9px] text-[#A7A4C4]">unlocks</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#A7A4C4] italic">
            No individual card unlocks recorded during the selected period.
          </div>
        )}
      </div>
    </div>
  );
};
