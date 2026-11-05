import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Compass, User as UserIcon, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';

interface NavbarProps {
  isHome?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isHome = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, deck, entitlements, clearSession } = useDeck();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Deck pass and premium status is ONLY active when the user is logged in
  const isPassActive = Boolean(isAuthenticated && entitlements?.isDeckPassActive);

  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        isHome
          ? 'bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#8C6D3B]/25 shadow-[0_2px_8px_rgba(80,60,30,0.06)]'
          : 'backdrop-blur-sm bg-[#FAF7F2]/80 border-b border-[#8C6D3B]/25'
      }`}
    >
      <div className={`max-w-[1240px] mx-auto px-6 sm:px-12 flex items-center justify-between ${isHome ? 'h-14 sm:h-15' : 'h-16'}`}>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="text-[#8C6D3B] text-2xl group-hover:scale-110 transition-transform select-none">✦</span>
          <div>
            <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-[#1A1817] group-hover:text-[#8C6D3B] uppercase block leading-none transition-colors">
              Parrot Cards
            </span>
            <span className="text-[10px] text-[#6B635B] italic font-serif hidden sm:block tracking-wide">
              Draw the deck your birth sky dealt you
            </span>
          </div>
        </Link>

        {/* Center / Seeker Context */}
        {profile && (
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="text-[#6B635B]">
              Sky for: <strong className="text-[#8C6D3B] font-serif text-sm">{profile.name}</strong>
            </span>
            {deck && (
              <Link
                to="/avatar"
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5EE]/80 border border-[#8C6D3B]/40 text-[#8C6D3B] hover:bg-[#FAF5EE] shadow-sm transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="font-serif font-semibold tracking-wide">Sovereign Avatar</span>
              </Link>
            )}
            <Link
              to="/profile/astronomy"
              className="flex items-center gap-1.5 text-[#595147] hover:text-[#1A1817] transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#595147]" />
              <span>Sky Alignment</span>
            </Link>
          </div>
        )}

        {/* Right Navigation & Status */}
        <div className="flex items-center gap-3">
          {/* Deck Pass Status Badge */}
          {isPassActive ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#161D15] border border-[#8C6D3B]/80 text-[#E0C37D] text-xs font-serif font-semibold shadow-inner">
              <Shield className="w-3.5 h-3.5 text-[#E0C37D]" />
              <span>Premium Active</span>
            </div>
          ) : (
            <Link
              to="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8C6D3B] text-[#FAF7F2] hover:bg-[#73582D] text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium</span>
            </Link>
          )}

          <Link
            to="/deck"
            className="text-xs uppercase tracking-widest font-cinzel font-bold text-[#1A1817] hover:text-[#8C6D3B] transition-colors hidden sm:block"
          >
            MY DECK
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/account"
                className="w-7 h-7 rounded-full border border-[#8C6D3B]/40 bg-[#FAF5EE]/60 flex items-center justify-center text-[#1A1817] hover:border-[#8C6D3B] transition-colors"
                title="Account Settings"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#8C6D3B]" />
              </Link>
              <button
                onClick={async () => {
                  clearSession();
                  await logout();
                }}
                className="text-xs text-[#595147] hover:text-[#7A1C1C] transition-colors hidden sm:block font-serif"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl border border-[#8C6D3B]/40 hover:border-[#8C6D3B] text-xs font-semibold text-[#1A1817] hover:text-[#8C6D3B] bg-[#FAF5EE]/70 transition-all font-serif"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-[#6B635B] hover:text-[#1A1817]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FAF7F2] border-b border-[#8C6D3B]/20 px-4 py-4 space-y-3 text-sm shadow-lg">
          {profile && (
            <div className="pb-2 border-b border-[#8C6D3B]/15 text-xs text-[#6B635B]">
              Sky alignment for: <strong className="text-[#8C6D3B] font-serif">{profile.name}</strong>
            </div>
          )}
          <Link
            to="/deck"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#1A1817] hover:text-[#8C6D3B] font-serif"
          >
            ✦ 55-Card Deck
          </Link>
          <Link
            to="/avatar"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#1A1817] hover:text-[#8C6D3B] font-serif"
          >
            ♛ Sovereign Avatar
          </Link>
          <Link
            to="/profile/astronomy"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#1A1817] hover:text-[#8C6D3B] font-serif"
          >
            🧭 Birth Sky Chart
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#8C6D3B] font-semibold"
          >
            ✨ Pricing & Unlock Pass (₹2 / ₹25)
          </Link>
          <Link
            to="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#6B635B] hover:text-[#1A1817]"
          >
            Account & Purchased Passes
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#6B635B] hover:text-[#1A1817]"
          >
            About Parrot Cards
          </Link>
          {isAuthenticated ? (
            <button
              onClick={async () => {
                clearSession();
                await logout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-[#7A1C1C] pt-2 border-t border-[#8C6D3B]/15"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#8C6D3B] pt-2 border-t border-[#8C6D3B]/15 font-semibold"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
