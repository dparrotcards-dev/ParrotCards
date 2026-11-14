import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bird,
  ChevronDown,
  CreditCard,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IUser } from '../../types';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Cards Management', to: '/admin/cards', icon: Layers },
  { label: 'Products Management', to: '/admin/store', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Transactions', to: '/admin/transactions', icon: CreditCard },
  { label: 'Change Password', to: '/admin/change-password', icon: KeyRound },
] as const;

const PAGE_COPY: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Cosmic Store Overview & Insights' },
  '/admin/users': { title: 'Users', subtitle: 'Manage customers and their account details' },
  '/admin/cards': { title: 'Cards Management', subtitle: 'Manage all 55 cards, their content, and access settings.' },
  '/admin/store': { title: 'Products Management', subtitle: 'Manage all store products, categories, price and inventory' },
  '/admin/orders': { title: 'Orders', subtitle: 'Manage customer orders, shipping and delivery status' },
  '/admin/payments': { title: 'Orders', subtitle: 'Manage customer orders, shipping and delivery status' },
  '/admin/transactions': { title: 'Transactions', subtitle: 'View and manage all payment transactions' },
  '/admin/change-password': { title: 'Change Password', subtitle: 'Update administrative login credentials securely' },
};

export const AdminShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<IUser | null>(() => {
    try {
      const saved = localStorage.getItem('pc_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminLoading, setAdminLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem('pc_admin_token');
    localStorage.removeItem('pc_admin_user');
    setAdminUser(null);
    navigate('/admin/login');
  };

  const currentPage = PAGE_COPY[location.pathname] || {
    title: 'Admin Panel',
    subtitle: 'Parrot Cards cosmic store administration',
  };

  const navigation = () => (
    <nav className="space-y-2" aria-label="Admin navigation">
      {NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={`${item.label}-${index}`}
            to={item.to}
            onClick={() => setMobileDrawerOpen(false)}
            className={({ isActive }) =>
              `admin-nav-link flex items-center gap-4 rounded-2xl px-5 py-3 text-[15px] font-semibold transition-all ${
                isActive ? 'admin-nav-link-active' : 'text-[#35261d] hover:bg-[#a56a1a]/[0.09]'
              }`
            }
          >
            <Icon className="h-6 w-6 shrink-0" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-[#fbf5ea] flex flex-col items-center justify-center gap-4 text-[#382219]">
        <div className="h-10 w-10 rounded-full border-2 border-[#a86a12] border-t-transparent animate-spin" />
        <p className="font-serif text-base">Opening your cosmic store console…</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#fbf5ea] flex items-center justify-center px-4 text-[#382219]">
        <div className="max-w-md rounded-[28px] border border-[#c9974c]/45 bg-[#fffaf2] p-8 text-center shadow-[0_18px_50px_rgba(86,54,20,0.12)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#a66a16]/10 text-[#8c5812]">
            <Truck className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold">Administrative Access Restricted</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#725f4c]">
            {adminUser
              ? `Your account (${adminUser.email}) does not have administrative privileges.`
              : 'Please sign in with an authorised administrator account.'}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/admin/login')}
              className="rounded-xl bg-[#603308] px-5 py-2.5 text-sm font-bold text-[#fffaf1] transition hover:bg-[#7d4812]"
            >
              Sign In As Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl border border-[#b88335]/50 px-5 py-2.5 text-sm font-bold text-[#694316] transition hover:bg-[#f5ead9]"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal min-h-screen text-[#2f1b12]">
      <header className="admin-mobile-header lg:hidden">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="rounded-xl p-2 text-[#704413] hover:bg-[#9a6417]/10"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 text-center">
          <div className="font-serif text-lg font-bold leading-none">{currentPage.title}</div>
          <div className="mt-0.5 truncate text-[10px] text-[#80654d]">{currentPage.subtitle}</div>
        </div>
        <button onClick={handleLogout} className="rounded-xl p-2 text-[#704413] hover:bg-[#9a6417]/10" aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-screen">
        <aside className="admin-sidebar hidden w-[270px] shrink-0 flex-col lg:flex" aria-label="Parrot Cards admin sidebar">
          <div className="px-6 pb-4 pt-7 text-center">
            <div className="admin-logo-ring mx-auto flex h-[94px] w-[158px] items-center justify-center">
              <Bird className="h-[57px] w-[57px] text-[#a8650c]" strokeWidth={1.2} />
            </div>
            <div className="mt-[-2px] font-serif text-[26px] font-bold tracking-[0.02em] text-[#331a0f]">PARROT CARDS</div>
            <div className="admin-brand-divider mx-auto mt-2 w-[162px]" />
            <p className="mt-2 font-serif text-[12px] font-bold tracking-[0.16em] uppercase text-[#6B4E36] leading-tight">
              COSMIC STORE<br />ADMIN PANEL
            </p>
          </div>

          <div className="border-t border-[#a96e21]/20 px-2 py-5">{navigation()}</div>
          <div className="admin-sidebar-ornament mt-auto flex justify-center py-6 opacity-75" aria-hidden="true">
            <svg width="68" height="34" viewBox="0 0 68 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M34 2C34 2 28 12 28 18C28 22 30.5 25 34 25C37.5 25 40 22 40 18C40 12 34 2 34 2Z" stroke="#B88A4F" strokeWidth="1.2" fill="#F4E9D9" />
              <path d="M34 10C27 12 18 17 18 22C18 25.5 21 27 25 26C29 25 32 20 34 16" stroke="#B88A4F" strokeWidth="1.2" fill="#F4E9D9" />
              <path d="M34 10C41 12 50 17 50 22C50 25.5 47 27 43 26C39 25 36 20 34 16" stroke="#B88A4F" strokeWidth="1.2" fill="#F4E9D9" />
              <path d="M34 25V32M10 28C18 28 26 29 34 29C42 29 50 28 58 28" stroke="#B88A4F" strokeWidth="1" strokeLinecap="round" />
              <circle cx="34" cy="25" r="1.5" fill="#B88A4F" />
              <circle cx="10" cy="28" r="1" fill="#B88A4F" />
              <circle cx="58" cy="28" r="1" fill="#B88A4F" />
            </svg>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="admin-main-header hidden lg:flex">
            <div className="min-w-[280px]">
              <h1 className="font-serif text-[38px] font-bold leading-none tracking-[-0.03em] text-[#27140d]">{currentPage.title}</h1>
              <p className="mt-1.5 font-serif text-[17px] leading-none text-[#67412a]">{currentPage.subtitle}</p>
            </div>

            <div className="hidden flex-1 items-center justify-center xl:flex" aria-hidden="true">
              <div className="admin-header-ornament flex items-center gap-4">
                <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#B88A4F]/60" />
                <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1C16 1 13 6 13 9.5C13 11.5 14.5 13 16 13C17.5 13 19 11.5 19 9.5C19 6 16 1 16 1Z" stroke="#B88A4F" strokeWidth="1.2" fill="#F4E9D9" />
                  <path d="M16 6C12 7.5 7 10 7 12.5C7 14.5 9 15.5 11 15C13 14.5 15 11.5 16 9.5" stroke="#B88A4F" strokeWidth="1.1" fill="#F4E9D9" />
                  <path d="M16 6C20 7.5 25 10 25 12.5C25 14.5 23 15.5 21 15C19 14.5 17 11.5 16 9.5" stroke="#B88A4F" strokeWidth="1.1" fill="#F4E9D9" />
                  <circle cx="16" cy="13" r="1" fill="#B88A4F" />
                </svg>
                <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#B88A4F]/60" />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative rounded-full p-2 text-[#3b2115] transition hover:bg-[#a56a1a]/10" aria-label="Notifications">
                <Bell className="h-7 w-7" strokeWidth={1.9} />
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#fffaf2] bg-[#bd3025]" />
              </button>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl py-1.5 pl-1 pr-2 transition hover:bg-[#a56a1a]/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0e5d5] text-[#452b1b]">
                    <UserRound className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  <span className="font-serif text-xl font-bold">{adminUser?.name || 'Admin'}</span>
                  <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 top-[60px] z-30 w-40 rounded-xl border border-[#c99a58]/35 bg-[#fffaf3] p-1.5 shadow-[0_12px_30px_rgba(72,44,17,.16)]">
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#7c251d] hover:bg-[#f8e9e5]">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </details>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-5 xl:px-7">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 h-full w-full bg-[#291408]/40 backdrop-blur-[2px]" onClick={() => setMobileDrawerOpen(false)} aria-label="Close navigation menu" />
          <aside className="admin-mobile-drawer relative flex h-full w-[286px] flex-col px-3 pb-6 pt-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between px-3">
              <div className="flex items-center gap-2 text-[#3a2011]">
                <Bird className="h-7 w-7 text-[#a8650c]" />
                <span className="font-serif text-xl font-bold">PARROT CARDS</span>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} className="rounded-xl p-2 text-[#704413] hover:bg-[#9a6417]/10" aria-label="Close navigation menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {navigation()}
            <button onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-[#7c251d] hover:bg-[#f5e5df]">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
