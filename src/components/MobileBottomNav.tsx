import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Store, Sun, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/cosmic-store' && (location.pathname.startsWith('/cosmic-store') || location.pathname === '/cart')) return true;
    if (path === '/account' && location.pathname === '/my-daily-resonance') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
    >
      {/* Background Bar with Top Rounded Corners & Subtle Top Shadow */}
      <div
        className="relative border-t border-[#E5DDD0] bg-[#FAF7F2]/95 backdrop-blur-md rounded-t-[22px] shadow-[0_-4px_22px_rgba(60,40,15,0.08)] px-1.5 sm:px-2"
        style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex h-16 items-center justify-between">
          {/* 1. HOME */}
          <Link
            to="/"
            className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname === '/' ? 'text-[#8C6D3B]' : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <Home className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9px] font-bold uppercase tracking-[0.08em] min-[360px]:text-[10px] ${
                location.pathname === '/' ? 'text-[#8C6D3B] font-extrabold' : 'text-[#5C4E3D]'
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. ABOUT */}
          <Link
            to="/about"
            className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isCurrent('/about') ? 'text-[#8C6D3B]' : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <Info className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9px] font-bold uppercase tracking-[0.08em] min-[360px]:text-[10px] ${
                isCurrent('/about') ? 'text-[#8C6D3B] font-extrabold' : 'text-[#5C4E3D]'
              }`}
            >
              About
            </span>
          </Link>

          {/* 3. STORE (Floating Golden Action Button in Center) */}
          <div className="flex min-w-0 flex-1 justify-center">
            <Link
              to="/cosmic-store"
              aria-current={isCurrent('/cosmic-store') ? 'page' : undefined}
              className="relative -top-4 flex h-16 w-full items-center justify-center transition-transform active:scale-95"
              aria-label="Cosmic Store"
            >
              <div className={`relative flex h-[54px] w-[54px] flex-col items-center justify-center rounded-full ring-4 ring-[#FAF7F2] transition-colors ${
                isCurrent('/cosmic-store')
                  ? 'bg-gradient-to-b from-[#C99C42] via-[#B4882F] to-[#966E20] shadow-[0_6px_18px_rgba(150,110,32,0.4)]'
                  : 'border border-[#D8C6A7] bg-[#F5EDDF] text-[#765722]'
              }`}>
                <Store className={`h-5 w-5 stroke-[2] ${isCurrent('/cosmic-store') ? 'text-white' : 'text-[#8C6D3B]'}`} />
                <span className={`mt-0.5 font-cinzel text-[8.5px] font-bold uppercase tracking-wider ${
                  isCurrent('/cosmic-store') ? 'text-white' : 'text-[#765722]'
                }`}>
                  Store
                </span>
              </div>
            </Link>
          </div>

          {/* DAILY RESONANCE */}
          <Link
            to="/daily-resonance"
            aria-label="Daily Resonance"
            aria-current={isCurrent('/daily-resonance') ? 'page' : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isCurrent('/daily-resonance') ? 'text-[#8C6D3B]' : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <Sun className="h-5 w-5 stroke-[1.8]" />
            <span aria-hidden="true" className={`mt-1 whitespace-nowrap font-cinzel text-[8px] font-bold uppercase tracking-normal min-[360px]:text-[9px] ${
              isCurrent('/daily-resonance') ? 'text-[#8C6D3B] font-extrabold' : 'text-[#5C4E3D]'
            }`}>
              Resonance
            </span>
          </Link>

          {/* 4. PROFILE */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isCurrent('/account') || isCurrent('/login')
                ? 'text-[#8C6D3B]'
                : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <UserIcon className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9px] font-bold uppercase tracking-[0.08em] min-[360px]:text-[10px] ${
                isCurrent('/account') || isCurrent('/login')
                  ? 'text-[#8C6D3B] font-extrabold'
                  : 'text-[#5C4E3D]'
              }`}
            >
              Profile
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
