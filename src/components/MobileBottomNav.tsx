import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, ShoppingCart, Heart, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [wishlistCount, setWishlistCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('pc_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('pc_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const w = localStorage.getItem('pc_wishlist');
        setWishlistCount(w ? (JSON.parse(w) || []).length : 0);
        const c = localStorage.getItem('pc_cart');
        setCartCount(c ? (JSON.parse(c) || []).length : 0);
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('pc_store_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('pc_store_updated', handleSync);
    };
  }, []);

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/cosmic-store' && (location.pathname.startsWith('/cosmic-store') || location.pathname === '/cart')) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleOpenWishlist = () => {
    window.dispatchEvent(new Event('pc_open_wishlist'));
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
    >
      {/* Background Bar with Top Rounded Corners & Subtle Top Shadow */}
      <div
        className="relative border-t border-[#E5DDD0] bg-[#FAF7F2]/95 backdrop-blur-md rounded-t-[22px] shadow-[0_-4px_22px_rgba(60,40,15,0.08)] px-2"
        style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex h-16 items-center justify-between">
          {/* 1. HOME */}
          <Link
            to="/"
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              location.pathname === '/' ? 'text-[#8C6D3B]' : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <Home className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
                location.pathname === '/' ? 'text-[#8C6D3B] font-extrabold' : 'text-[#5C4E3D]'
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. ABOUT */}
          <Link
            to="/about"
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isCurrent('/about') ? 'text-[#8C6D3B]' : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <Info className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
                isCurrent('/about') ? 'text-[#8C6D3B] font-extrabold' : 'text-[#5C4E3D]'
              }`}
            >
              About
            </span>
          </Link>

          {/* 3. STORE (Floating Golden Action Button in Center) */}
          <div className="flex flex-1 justify-center">
            <Link
              to="/cosmic-store"
              className="relative -top-4 flex flex-col items-center justify-center transition-transform active:scale-90"
              aria-label="Cosmic Store"
            >
              <div className="relative flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#C99C42] via-[#B4882F] to-[#966E20] shadow-[0_6px_18px_rgba(150,110,32,0.4)] ring-4 ring-[#FAF7F2]">
                <ShoppingCart className="h-5 w-5 stroke-[2] text-white -mt-0.5" />
                <span className="mt-0.5 font-cinzel text-[8.5px] font-bold uppercase tracking-wider text-white">
                  Store
                </span>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8F2D1F] px-1 text-[9px] font-bold text-white shadow-xs border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* 4. WISHLIST */}
          <button
            type="button"
            onClick={handleOpenWishlist}
            className="flex flex-1 flex-col items-center justify-center py-1 text-[#5C4E3D] transition-all active:scale-95 hover:text-[#1A1817]"
          >
            <div className="relative">
              <Heart className="h-5 w-5 stroke-[1.8] text-[#5C4E3D]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A34335] px-1 text-[9px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider text-[#5C4E3D]">
              Wishlist
            </span>
          </button>

          {/* 5. PROFILE */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              isCurrent('/account') || isCurrent('/login')
                ? 'text-[#8C6D3B]'
                : 'text-[#5C4E3D] hover:text-[#1A1817]'
            }`}
          >
            <div className="relative">
              <UserIcon className="h-5 w-5 stroke-[1.8]" />
            </div>
            <span
              className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
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
