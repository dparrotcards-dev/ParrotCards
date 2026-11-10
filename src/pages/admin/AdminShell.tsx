import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  Sparkles,
  CreditCard,
  Cpu,
  TrendingUp,
  Activity,
  KeyRound,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IUser } from '../../types';

const NAV_ITEMS = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Seekers & Users', to: '/admin/users', icon: Users },
  { label: 'Personalized Decks', to: '/admin/decks', icon: Layers },
  { label: '55-Card Catalog', to: '/admin/cards', icon: Sparkles },
  { label: 'Cosmic Store', to: '/admin/store', icon: ShoppingCart },
  { label: 'Payments & Revenue', to: '/admin/payments', icon: CreditCard },
  { label: 'Analytics & Trends', to: '/admin/analytics', icon: TrendingUp },
  { label: 'System Health', to: '/admin/system', icon: Activity },
  { label: 'Change Password', to: '/admin/change-password', icon: KeyRound },
];

export const AdminShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const [adminUser, setAdminUser] = useState<IUser | null>(() => {
    try {
      const saved = localStorage.getItem('pc_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminLoading, setAdminLoading] = useState<boolean>(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('pc_admin_token');
    const adminSaved = localStorage.getItem('pc_admin_user');
    if (adminToken && adminSaved) {
      try {
        setAdminUser(JSON.parse(adminSaved));
      } catch {
        setAdminUser(null);
      }
    } else if (user && ['admin', 'superadmin', 'analytics_manager', 'content_manager', 'support_admin'].includes(user.role)) {
      setAdminUser(user);
    } else {
      setAdminUser(null);
    }
    setAdminLoading(false);
  }, [user, location.pathname]);

  const isAuthorized =
    adminUser && ['admin', 'superadmin', 'analytics_manager', 'content_manager', 'support_admin'].includes(adminUser.role);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-[#1A1817] flex flex-col items-center justify-center space-y-4 text-[#FFFDF9]">
        <div className="w-10 h-10 border-3 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-sm text-[#8C6D3B]">Authorizing Super Admin Credentials...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#1A1817] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#23201F] border border-[#7A1C1C]/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#7A1C1C]/20 border border-[#7A1C1C]/40 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#FFFDF9]">Administrative Access Restricted</h2>
          <p className="text-xs text-[#D6CEBE] leading-relaxed">
            {adminUser
              ? `Your account (${adminUser.email}) does not have administrative privileges.`
              : 'You must be signed in with an authorized administrative account to access this command portal.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="py-2.5 px-6 rounded-2xl bg-[#8C6D3B] text-[#FFFDF9] text-xs font-bold transition-all shadow-lg hover:brightness-110"
            >
              Sign In As Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-[#FFFDF9] text-xs font-semibold transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    localStorage.removeItem('pc_admin_token');
    localStorage.removeItem('pc_admin_user');
    setAdminUser(null);
    navigate('/admin/login');
  };

  const currentRouteName =
    NAV_ITEMS.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))?.label ||
    'Command Dashboard';

  return (
    <div className="min-h-screen bg-[#1A1817] text-[#FFFDF9] flex flex-col antialiased selection:bg-[#8C6D3B]/30 selection:text-[#FFFDF9]">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 h-16 bg-[#1A1817]/95 backdrop-blur-xl border-b border-[#8C6D3B]/20 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 text-[#D6CEBE] hover:text-[#FFFDF9] rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#8C6D3B] text-lg font-bold">✦</span>
            <span className="font-serif text-lg font-bold tracking-wider text-[#8C6D3B] uppercase">
              Parrot Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/deck')}
            className="p-2 text-[#D6CEBE] hover:text-[#8C6D3B] rounded-xl hover:bg-white/5 transition-colors"
            title="View Seeker Deck"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-white/5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Shell (Desktop Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-[#23201F] border-r border-[#8C6D3B]/20 transition-all duration-300 relative z-30 ${
            collapsed ? 'w-20' : 'w-[232px]'
          }`}
        >
          {/* Brand Logo & Collapse Toggle */}
          <div className="h-14 px-4 border-b border-[#8C6D3B]/20 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-[#8C6D3B] text-xl">✦</span>
                <div>
                  <div className="font-serif text-base font-bold text-[#8C6D3B] uppercase tracking-wider leading-none">
                    Parrot Cards
                  </div>
                  <div className="text-[10px] text-[#D6CEBE] font-medium tracking-wide">
                    Super Admin Console
                  </div>
                </div>
              </div>
            )}
            {collapsed && (
              <span className="text-[#8C6D3B] text-xl font-bold mx-auto">✦</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl text-[#D6CEBE] hover:text-[#FFFDF9] hover:bg-white/5 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#8C6D3B] text-[#FFFDF9] font-bold shadow-md shadow-[#8C6D3B]/20'
                        : 'text-[#D6CEBE] hover:text-[#FFFDF9] hover:bg-white/5'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer User Pill */}
          <div className="p-3 border-t border-[#8C6D3B]/20">
            <div
              className={`flex items-center gap-3 p-2 rounded-2xl bg-white/5 ${
                collapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#8C6D3B]/20 border border-[#8C6D3B]/40 text-[#8C6D3B] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {adminUser?.name ? adminUser.name[0].toUpperCase() : 'A'}
                </div>
                {!collapsed && (
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#FFFDF9] truncate">{adminUser?.name || 'Hemant Paliwal'}</div>
                    <div className="text-[10px] text-[#D6CEBE] truncate font-mono">{adminUser?.email}</div>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-[#D6CEBE] hover:text-rose-400 hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-72 max-w-[80vw] bg-[#111033] border-r border-white/15 h-full flex flex-col z-50 p-4 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[#C9A45C] text-xl">✦</span>
                  <span className="font-serif text-base font-bold text-[#C9A45C] uppercase tracking-wider">
                    Parrot Admin
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#C9A45C] text-[#08071B] font-bold shadow-md'
                            : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate('/deck');
                  }}
                  className="flex items-center gap-1.5 text-[#C9A45C]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Seeker View</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-rose-400 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Page Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#1A1817]">
          {/* Top Bar for Desktop */}
          <header className="hidden lg:flex h-14 bg-[#1A1817]/95 backdrop-blur-xl border-b border-[#8C6D3B]/20 px-8 items-center justify-between sticky top-0 z-20">
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-3">
              <span className="text-[#8C6D3B] text-xs font-mono font-medium">Console</span>
              <span className="text-[#8C6D3B]/40">/</span>
              <span className="font-serif font-bold text-sm text-[#FFFDF9]">{currentRouteName}</span>
            </div>

            {/* Quick Status Pill & Global Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gemini 3.5 Lite • Atlas Online</span>
              </div>

              <button
                onClick={() => navigate('/deck')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#8C6D3B]/20 text-xs text-[#D6CEBE] hover:text-[#FFFDF9] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Seeker View</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#7A1C1C]/20 hover:bg-[#7A1C1C]/30 border border-[#7A1C1C]/40 text-xs text-rose-200 font-medium transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          {/* Page Routed Content Container */}
          <main className="flex-1 min-w-0 w-full p-4 sm:p-5 lg:px-10 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
