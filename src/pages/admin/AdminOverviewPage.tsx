import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  Sparkles,
  CreditCard,
  Cpu,
  Database,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Shield,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { adminService, AdminDashboardData } from '../../services/adminService';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decks' | 'orders' | 'users'>('decks');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminService.getStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executive dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A7A4C4] font-serif italic">Loading executive telemetry...</p>
      </div>
    );
  }

  const metrics = data?.metrics;
  const systemStatus = data?.systemStatus;
  const revenueTrend = data?.revenueTrend || [];
  const userGrowthTrend = data?.userGrowthTrend || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Executive Overview
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Real-time telemetry, verified revenue, and cosmic engine activity
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#F6F0E6] font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Real Data</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-crimson/20 border border-crimson/40 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seekers */}
        <div className="bg-[#111033] border border-white/10 hover:border-[#C9A45C]/30 rounded-2xl p-5 space-y-3 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Seekers</span>
            <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F6F0E6]">
            {metrics?.totalUsers ?? '0'}
          </div>
          <div className="text-[11px] text-[#A7A4C4] flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">●</span>
            <span>Registered user accounts</span>
          </div>
        </div>

        {/* 55-Card Decks */}
        <div className="bg-[#111033] border border-white/10 hover:border-[#C9A45C]/30 rounded-2xl p-5 space-y-3 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Personalized Decks</span>
            <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C] group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#C9A45C]">
            {metrics?.totalDecks ?? '0'}
          </div>
          <div className="text-[11px] text-[#A7A4C4] font-mono">55-card personal skies drawn</div>
        </div>

        {/* Calculations */}
        <div className="bg-[#111033] border border-white/10 hover:border-[#C9A45C]/30 rounded-2xl p-5 space-y-3 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Calculations</span>
            <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C] group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#F6F0E6]">
            {metrics?.totalCalculations ?? '0'}
          </div>
          <div className="text-[11px] text-[#A7A4C4] font-mono">Vedic birth skies computed</div>
        </div>

        {/* Verified Revenue */}
        <div className="bg-[#111033] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
            ₹{metrics?.totalRevenueRupees ?? 0}
          </div>
          <div className="text-[11px] text-[#A7A4C4] font-mono">
            From {metrics?.paidOrdersCount ?? 0} confirmed paid orders
          </div>
        </div>
      </div>

      {/* Secondary Operational Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111033]/60 border border-white/10 rounded-2xl p-3.5 text-xs">
        <div className="space-y-0.5">
          <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Payment Success Rate</div>
          <div className="text-sm font-mono font-bold text-[#F6F0E6]">{metrics?.paymentSuccessRate ?? 100}%</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Active 30-Day Passes</div>
          <div className="text-sm font-mono font-bold text-[#C9A45C]">{metrics?.activePassesCount ?? 0}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">AI Interpretations</div>
          <div className="text-sm font-mono font-bold text-emerald-400">
            {metrics?.aiInterpretationsCount ?? 0} ({metrics?.aiGenerationRate ?? 100}% AI)
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Fallback Synthesized</div>
          <div className="text-sm font-mono font-bold text-[#A7A4C4]">{metrics?.fallbackInterpretationsCount ?? 0}</div>
        </div>
      </div>

      {/* Visual Activity Charts (Real Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend Chart */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#A7A4C4] uppercase tracking-wider">
                7-Day Revenue Trend
              </div>
              <div className="text-lg font-serif font-bold text-[#F6F0E6]">Verified Income (₹)</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
              Live Razorpay
            </span>
          </div>

          {revenueTrend.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="h-32 flex items-end gap-3 px-2 pt-4 border-b border-white/10">
                {revenueTrend.map((d, idx) => {
                  const maxRev = Math.max(...revenueTrend.map((r) => r.revenueRupees), 10);
                  const barHeight = Math.max(12, Math.round((d.revenueRupees / maxRev) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono text-[#A7A4C4] opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{d.revenueRupees}
                      </span>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-md shadow-emerald-500/20"
                      />
                      <span className="text-[9px] font-mono text-[#A7A4C4] truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-[#A7A4C4] italic">
              No payment transactions recorded in the last 7 days.
            </div>
          )}
        </div>

        {/* User Growth Trend Chart */}
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#A7A4C4] uppercase tracking-wider">
                7-Day Registrations
              </div>
              <div className="text-lg font-serif font-bold text-[#F6F0E6]">New Seekers</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9A45C]/10 border border-[#C9A45C]/30 text-[10px] font-mono text-[#C9A45C]">
              Organic Flow
            </span>
          </div>

          {userGrowthTrend.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="h-32 flex items-end gap-3 px-2 pt-4 border-b border-white/10">
                {userGrowthTrend.map((u, idx) => {
                  const maxCount = Math.max(...userGrowthTrend.map((item) => item.count), 5);
                  const barHeight = Math.max(12, Math.round((u.count / maxCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono text-[#A7A4C4] opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.count}
                      </span>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-amber-600 to-[#C9A45C] rounded-t-lg transition-all group-hover:brightness-125 shadow-md shadow-[#C9A45C]/20"
                      />
                      <span className="text-[9px] font-mono text-[#A7A4C4] truncate w-full text-center">
                        {u.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-[#A7A4C4] italic">
              No new accounts registered in the last 7 days.
            </div>
          )}
        </div>
      </div>

      {/* System Service Health Summary Row */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Gemini AI Model</div>
            <div className="font-mono text-[#F6F0E6] font-bold">
              {systemStatus?.geminiModel || 'gemini-3.5-flash-lite'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Astronomy Engine</div>
            <div className="font-mono text-[#F6F0E6] font-bold">{systemStatus?.astronomyProvider || 'jagannatha_hora'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Database Store</div>
            <div className="font-mono text-[#F6F0E6] font-bold">
              {systemStatus?.database?.isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Payment Gateway</div>
            <div className="font-mono text-[#F6F0E6] font-bold">
              {systemStatus?.razorpayConfigured ? 'Razorpay Verified' : 'Standard Webhooks'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('decks')}
              className={`py-2 px-3.5 font-semibold text-xs rounded-xl transition-all ${
                activeTab === 'decks'
                  ? 'bg-[#C9A45C] text-[#08071B] font-bold'
                  : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
              }`}
            >
              Recent Decks ({data?.recentDecks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-3.5 font-semibold text-xs rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#C9A45C] text-[#08071B] font-bold'
                  : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
              }`}
            >
              Recent Orders ({data?.recentOrders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-3.5 font-semibold text-xs rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-[#C9A45C] text-[#08071B] font-bold'
                  : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
              }`}
            >
              Recent Users ({data?.recentUsers?.length || 0})
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'decks') navigate('/admin/decks');
              if (activeTab === 'orders') navigate('/admin/payments');
              if (activeTab === 'users') navigate('/admin/users');
            }}
            className="text-xs text-[#C9A45C] hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Content: Decks */}
        {activeTab === 'decks' && (
          <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Seeker</th>
                    <th className="py-3 px-4">Soul Planet (AK)</th>
                    <th className="py-3 px-4">Sovereign Avatar Moniker</th>
                    <th className="py-3 px-4">AI Mode</th>
                    <th className="py-3 px-4">Generated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentDecks && data.recentDecks.length > 0 ? (
                    data.recentDecks.map((deck) => (
                      <tr key={deck.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#F6F0E6]">{deck.userName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] font-semibold font-mono">
                            {deck.sovereignCardKey}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#A7A4C4] italic max-w-xs truncate" title={deck.avatarPhrase}>
                          "{deck.avatarPhrase}"
                        </td>
                        <td className="py-3 px-4">
                          {deck.isAvatarAiGenerated ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                              ✦ Gemini AI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#A7A4C4] font-semibold text-[10px]">
                              Deterministic Vedic
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#A7A4C4] text-[11px] font-mono">
                          {new Date(deck.generatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#A7A4C4] italic">
                        No decks recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Item Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono text-[#C9A45C] text-[11px]">{order.orderId}</td>
                        <td className="py-3 px-4 text-[#F6F0E6]">{order.userEmail}</td>
                        <td className="py-3 px-4 text-[#A7A4C4] font-medium">{order.itemType}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">₹{order.amountRupees}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              order.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#A7A4C4] text-[11px] font-mono">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#A7A4C4] italic">
                        No orders recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentUsers && data.recentUsers.length > 0 ? (
                    data.recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#F6F0E6]">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-[#A7A4C4]">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/40'
                                : 'bg-white/10 text-[#F6F0E6]'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#A7A4C4] text-[11px] font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#A7A4C4] italic">
                        No users recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
