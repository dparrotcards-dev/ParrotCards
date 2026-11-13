import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart,
  Info,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { WishlistDrawer } from './WishlistDrawer';

interface NavbarProps {
  isHome?: boolean;
  isDeck?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isHome = false, isDeck = false }) => {
  const { isAuthenticated } = useAuth();
  const { entitlements } = useDeck();
  const location = useLocation();
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = React.useState(false);

  // Sync wishlist & cart counts (real-time from localStorage)
  const [wishlistCount, setWishlistCount] = React.useState<number>(() => {
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

  const [cartCount, setCartCount] = React.useState<number>(() => {
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

  React.useEffect(() => {
    const handleSync = () => {
      try {
        const w = localStorage.getItem('pc_wishlist');
        if (w) {
          const parsed = JSON.parse(w);
          setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setWishlistCount(0);
        }

        const c = localStorage.getItem('pc_cart');
        if (c) {
          const parsed = JSON.parse(c);
          setCartCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setCartCount(0);
        }
      } catch {
        setWishlistCount(0);
        setCartCount(0);
      }
    };
    handleSync();
    const handleOpenWishlist = () => setWishlistDrawerOpen(true);
    window.addEventListener('storage', handleSync);
    window.addEventListener('pc_store_updated', handleSync);
    window.addEventListener('pc_open_wishlist', handleOpenWishlist);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('pc_store_updated', handleSync);
      window.removeEventListener('pc_open_wishlist', handleOpenWishlist);
    };
  }, []);

  const isPassActive = Boolean(isAuthenticated && entitlements?.isDeckPassActive);
  const isCurrent = (to: string) => {
    if (to === '/deck') return location.pathname === '/deck';
    if (to === '/about') return location.pathname === '/about';
    if (to === '/cosmic-store') return location.pathname === '/cosmic-store';
    if (to === '/cart') return location.pathname === '/cart';
    if (to === '/support') return location.pathname === '/support';
    if (to === '/account') {
      return (
        location.pathname === '/account' ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/saved-deck' ||
        location.pathname === '/purchased-cards' ||
        location.pathname === '/payments/history'
      );
    }
    return location.pathname === to;
  };
  return (
    <header className="sticky top-0 z-50 w-full px-1 sm:px-4 lg:px-6 select-none py-px sm:py-1.5 relative">
      <div
        className="relative z-50 mx-auto flex h-[44px] max-w-[1360px] items-center justify-between rounded-[16px] border border-[#E5DDD0] bg-[#FFFDF9] px-2 shadow-[0_2px_12px_rgba(70,50,20,0.06)] transition-all duration-200 sm:h-[48px] sm:rounded-2xl sm:px-4 lg:px-5 select-none"
      >
        {/* ═══ BRAND LOGO ═══ */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="group flex items-center gap-1.5 sm:gap-2 select-none cursor-pointer outline-none caret-transparent">
            <span
              aria-hidden="true"
              className="shrink-0 select-none text-[18px] sm:text-[20px] leading-none text-[#9A7130] transition-transform duration-200 group-hover:scale-110"
            >
              {'\u2726'}
            </span>
            <div className="flex flex-col select-none pointer-events-none">
              <span className="font-cinzel text-[15px] max-[359px]:text-[14px] sm:text-[17px] font-bold uppercase leading-none tracking-[0.08em] sm:tracking-[0.09em] text-[#171512] transition-colors group-hover:text-[#8C6D3B]">
                Parrot Cards
              </span>
              <span className="hidden sm:flex font-cinzel text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-[0.13em] text-[#635B50] items-center gap-1 leading-none mt-0.5">
                <span>DRAW THE DECK</span>
                <span className="text-[#9A7130] text-[7px]">{'\u2726'}</span>
                <span>REMEMBER THE SELF</span>
              </span>
            </div>
          </Link>
          <span aria-hidden="true" className="mx-2.5 sm:mx-3.5 hidden h-5 w-px bg-[#E2D9CC] lg:block" />
        </div>

        {/* ═══ DESKTOP CENTER NAVIGATION ═══ */}
        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex lg:gap-6 xl:gap-8 2xl:gap-9 select-none caret-transparent">
          {/* ABOUT */}
          <Link
            to="/about"
            className={`relative flex items-center gap-1.5 font-cinzel text-[11px] xl:text-[11.5px] font-bold uppercase tracking-[0.06em] select-none cursor-pointer outline-none caret-transparent transition-colors pb-1 px-1 ${
              isCurrent('/about') ? 'text-[#8C6D3B]' : 'text-[#1A1817] hover:text-[#8C6D3B]'
            }`}
          >
            <Info aria-hidden="true" className="h-4 w-4 stroke-[1.8] text-[#9A7130] pointer-events-none" />
            <span className="pointer-events-none select-none">About</span>
            {isCurrent('/about') && (
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#8C6D3B] rounded-full pointer-events-none" />
            )}
          </Link>

          {/* COSMIC STORE */}
          <Link
            to="/cosmic-store"
            className={`relative flex items-center gap-1.5 font-cinzel text-[11px] xl:text-[11.5px] font-bold uppercase tracking-[0.06em] select-none cursor-pointer outline-none caret-transparent transition-colors pb-1 px-1 ${
              isCurrent('/cosmic-store') ? 'text-[#8C6D3B]' : 'text-[#1A1817] hover:text-[#8C6D3B]'
            }`}
          >
            <Store aria-hidden="true" className="h-4 w-4 stroke-[1.8] text-[#9A7130] pointer-events-none" />
            <span className="pointer-events-none select-none">Cosmic Store</span>
            {isCurrent('/cosmic-store') && (
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#8C6D3B] rounded-full pointer-events-none" />
            )}
          </Link>

          {/* WISHLIST & CART ACTION ICONS */}
          <div className="flex items-center gap-3 pl-1 sm:pl-2 select-none">
            {/* WISHLIST (HEART WITH RED BADGE) */}
            <button
              type="button"
              onClick={() => setWishlistDrawerOpen(true)}
              title={`Wishlist (${wishlistCount})`}
              className="group relative flex items-center justify-center p-1 text-[#9A7130] select-none cursor-pointer outline-none caret-transparent transition-transform hover:scale-110"
            >
              <Heart aria-hidden="true" className="h-[19px] w-[19px] stroke-[1.8] text-[#9A7130] transition-colors group-hover:text-[#8C6D3B]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#A34335] px-0.5 text-[9px] font-bold leading-none text-white shadow-xs pointer-events-none select-none">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* CART (SHOPPING CART) */}
            <Link
              to="/cart"
              title="Shopping Cart"
              className="group relative flex items-center justify-center p-1 text-[#9A7130] select-none cursor-pointer outline-none caret-transparent transition-transform hover:scale-110"
            >
              <ShoppingCart aria-hidden="true" className="h-[19px] w-[19px] stroke-[1.8] text-[#9A7130] transition-colors group-hover:text-[#8C6D3B]" />
            </Link>
          </div>
        </nav>

        {/* ═══ RIGHT ACTIONS (MY PROFILE & PREMIUM) ═══ */}
        <div className="flex items-center gap-1.5 max-[359px]:gap-0 sm:gap-2.5 lg:gap-3.5 select-none shrink-0">
          {/* Vertical divider */}
          <span aria-hidden="true" className="hidden h-5 w-px bg-[#E2D9CC] lg:block" />

          {/* MY PROFILE */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className={`relative hidden items-center gap-1.5 font-cinzel text-[11px] xl:text-[11.5px] font-bold uppercase tracking-[0.06em] select-none cursor-pointer outline-none caret-transparent transition-colors hover:text-[#8C6D3B] lg:flex pb-1 px-1 ${
              isCurrent('/account') ? 'text-[#8C6D3B]' : 'text-[#1A1817]'
            }`}
          >
            <UserIcon aria-hidden="true" className="h-4 w-4 stroke-[1.8] text-[#9A7130] pointer-events-none" />
            <span className="pointer-events-none select-none">My Profile</span>
            {isCurrent('/account') && (
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#8C6D3B] rounded-full pointer-events-none" />
            )}
          </Link>

          {/* Mobile Wishlist & Cart icons (visible on < lg) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
            <Link
              to="/cart"
              title="Cart"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#9A7130] transition-colors hover:bg-[#8C6D3B]/10 cursor-pointer"
            >
              <ShoppingCart aria-hidden="true" className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] stroke-[1.8]" />
            </Link>
          </div>

          {/* PREMIUM BUTTON */}
          <Link
            to="/pricing"
            aria-label={isPassActive ? 'Premium Active' : 'Explore Premium'}
            title={isPassActive ? 'Premium Active' : 'Explore Premium'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#987033] via-[#B3873C] to-[#8E6529] sm:h-auto sm:w-auto sm:px-3.5 sm:py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-[0.05em] text-white shadow-xs transition-all hover:brightness-110 shrink-0"
          >
            {isPassActive ? (
              <Shield aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.8] text-white" />
            ) : (
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.8] text-white" />
            )}
            <span className="hidden whitespace-nowrap sm:inline ml-1.5">Premium</span>
          </Link>

        </div>
      </div>

      {/* ═══ WISHLIST SLIDE-OVER DRAWER ═══ */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
      />
    </header>
  );
};
