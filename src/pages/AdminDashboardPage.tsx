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
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService, AdminDashboardData } from '../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decks' | 'orders' | 'users' | 'system'>('decks');

  // Verify admin authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/admin/login', { replace: true });
      } else if (user.role !== 'admin') {
        setError('Access Denied: Administrator role required.');
      }
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminService.getStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (authLoading || (loading && !data)) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-sm text-mute">Accessing Sovereign Command Records...</p>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-crimson/15 border border-crimson/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-crimson/20 border border-crimson/40 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-rose-300">Access Restricted</h2>
          <p className="text-xs text-rose-200/80 leading-relaxed">
            Your current logged-in account (<span className="text-ivory font-mono">{user.email}</span>) does not have administrator privileges.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-ivory text-xs font-semibold transition-all"
            >
              Sign In As Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-5 rounded-2xl bg-gold text-cosmos-void text-xs font-bold transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const systemStatus = data?.systemStatus;

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Bar with Admin Identity & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-[11px] font-bold text-gold tracking-wide uppercase">
              👑 Master Admin
            </span>
            <span className="text-xs text-mute flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold">
            Parrot Cards Executive Control Panel
          </h1>
          <p className="text-xs text-mute font-serif italic">
            Logged in as <span className="text-ivory font-mono">{user?.email}</span> ({user?.name || 'Admin'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-ivory font-medium transition-all disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/deck')}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-ivory font-medium transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>View Deck</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-crimson/20 hover:bg-crimson/30 border border-crimson/40 text-xs text-rose-300 font-medium transition-all"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-crimson/20 border border-crimson/40 text-rose-200 text-xs leading-relaxed">
          {error}
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 space-y-2 shadow-xl hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-mute">
            <span className="text-xs font-semibold uppercase tracking-wider">Seekers</span>
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ivory">
            {metrics?.totalUsers ?? '—'}
          </div>
          <div className="text-[11px] text-mute flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Registered accounts</span>
          </div>
        </div>

        {/* Total Decks */}
        <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 space-y-2 shadow-xl hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-mute">
            <span className="text-xs font-semibold uppercase tracking-wider">55-Card Decks</span>
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-gold">
            {metrics?.totalDecks ?? '—'}
          </div>
          <div className="text-[11px] text-mute">Personalized decks drawn</div>
        </div>

        {/* Total Calculations */}
        <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 space-y-2 shadow-xl hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-mute">
            <span className="text-xs font-semibold uppercase tracking-wider">Calculations</span>
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ivory">
            {metrics?.totalCalculations ?? '—'}
          </div>
          <div className="text-[11px] text-mute">Natal skies computed</div>
        </div>

        {/* Revenue & Orders */}
        <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 space-y-2 shadow-xl hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between text-mute">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
            ₹{metrics?.totalRevenueRupees ?? 0}
          </div>
          <div className="text-[11px] text-mute">
            {metrics?.paidOrdersCount ?? 0} paid orders ({metrics?.totalOrders ?? 0} total)
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="bg-cosmos-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-mute uppercase font-semibold">Gemini AI Model</div>
            <div className="font-mono text-ivory font-bold">{systemStatus?.geminiModel || 'gemini-3.5-flash-lite'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-mute uppercase font-semibold">Astronomy Engine</div>
            <div className="font-mono text-ivory font-bold">{systemStatus?.astronomyProvider || 'jagannatha_hora'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-mute uppercase font-semibold">Database Store</div>
            <div className="font-mono text-ivory font-bold">
              {systemStatus?.database?.isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-mute uppercase font-semibold">AI Key Configured</div>
            <div className="font-mono text-ivory font-bold">
              {systemStatus?.geminiConfigured ? 'Active & Ready' : 'Fallback Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Tabs */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => setActiveTab('decks')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'decks'
                ? 'border-gold text-gold font-bold'
                : 'border-transparent text-mute hover:text-ivory'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recent Decks ({data?.recentDecks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-gold text-gold font-bold'
                : 'border-transparent text-mute hover:text-ivory'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Recent Orders ({data?.recentOrders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-gold text-gold font-bold'
                : 'border-transparent text-mute hover:text-ivory'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Recent Users ({data?.recentUsers?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Recent Decks */}
        {activeTab === 'decks' && (
          <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-mute font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Seeker</th>
                    <th className="py-3.5 px-4">Atma Karaka (Soul)</th>
                    <th className="py-3.5 px-4">Sovereign Avatar Moniker</th>
                    <th className="py-3.5 px-4">Generation Type</th>
                    <th className="py-3.5 px-4">Generated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentDecks && data.recentDecks.length > 0 ? (
                    data.recentDecks.map((deck) => (
                      <tr key={deck.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-ivory">{deck.userName}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-gold/15 border border-gold/30 text-gold font-semibold">
                            {deck.sovereignCardKey}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-mute italic max-w-xs truncate" title={deck.avatarPhrase}>
                          "{deck.avatarPhrase}"
                        </td>
                        <td className="py-3.5 px-4">
                          {deck.isAvatarAiGenerated ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                              ✦ Gemini AI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-mute font-semibold text-[10px]">
                              Deterministic Vedic
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-mute text-[11px] font-mono">
                          {new Date(deck.generatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-mute italic">
                        No decks generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Recent Orders */}
        {activeTab === 'orders' && (
          <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-mute font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer Email</th>
                    <th className="py-3.5 px-4">Item Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-gold text-[11px]">{order.orderId}</td>
                        <td className="py-3.5 px-4 text-ivory">{order.userEmail}</td>
                        <td className="py-3.5 px-4 text-mute font-medium">{order.itemType}</td>
                        <td className="py-3.5 px-4 font-bold text-ivory">₹{order.amountRupees}</td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-mute text-[11px] font-mono">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-mute italic">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Recent Users */}
        {activeTab === 'users' && (
          <div className="bg-cosmos-card/80 backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-mute font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.recentUsers && data.recentUsers.length > 0 ? (
                    data.recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-ivory">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono text-mute">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-gold/20 text-gold border border-gold/40'
                                : 'bg-white/10 text-ivory'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-mute text-[11px] font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-mute italic">
                        No users registered yet.
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
