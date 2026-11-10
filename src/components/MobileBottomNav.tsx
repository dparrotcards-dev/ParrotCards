import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, ShoppingCart, Heart, User as UserIcon } from 'lucide-react';
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
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleOpenWishlist = () => {
    window.dispatchEvent(new Event('pc_open_wishlist'));
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5DDD0] bg-[#FFFDF9]/95 backdrop-blur-md shadow-[0_-3px_16px_rgba(70,50,20,0.08)] lg:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex h-14 items-center justify-around px-2">
        {/* MY DECK */}
        <Link
          to="/deck"
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isCurrent('/deck') ? 'text-[#8C6D3B]' : 'text-[#6B635B] hover:text-[#1A1817]'
          }`}
        >
          <div className="relative">
            <Layers className="h-5 w-5 stroke-[1.8]" />
          </div>
          <span className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
            isCurrent('/deck') ? 'border-b-[2px] border-[#8C6D3B] pb-0.5' : ''
          }`}>
            My Deck
          </span>
        </Link>

        {/* COSMIC STORE */}
        <Link
          to="/cosmic-store"
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isCurrent('/cosmic-store') ? 'text-[#8C6D3B]' : 'text-[#6B635B] hover:text-[#1A1817]'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8A6730] px-1 text-[9px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
            isCurrent('/cosmic-store') ? 'border-b-[2px] border-[#8C6D3B] pb-0.5' : ''
          }`}>
            Store
          </span>
        </Link>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={handleOpenWishlist}
          className="flex flex-1 flex-col items-center justify-center py-1 text-[#6B635B] transition-all active:scale-95 hover:text-[#1A1817]"
        >
          <div className="relative">
            <Heart className="h-5 w-5 stroke-[1.8] text-[#9A7130]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A34335] px-1 text-[9px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider">
            Wishlist
          </span>
        </button>

        {/* MY PROFILE */}
        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isCurrent('/account') || isCurrent('/login')
              ? 'text-[#8C6D3B]'
              : 'text-[#6B635B] hover:text-[#1A1817]'
          }`}
        >
          <div className="relative">
            <UserIcon className="h-5 w-5 stroke-[1.8]" />
          </div>
          <span className={`mt-1 font-cinzel text-[9.5px] font-bold uppercase tracking-wider ${
            isCurrent('/account') || isCurrent('/login') ? 'border-b-[2px] border-[#8C6D3B] pb-0.5' : ''
          }`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
};

