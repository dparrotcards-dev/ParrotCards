import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Calendar, MapPin, Clock, LogOut, Crown, CreditCard, History, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { api } from '../services/api';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { profile, entitlements, clearSession } = useDeck();
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    api
      .get('/account')
      .then((res) => setAccountData(res.data.data))
      .catch((err) => console.error(err));
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A1817]/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/40 flex items-center justify-center text-[#8C6D3B] font-serif text-xl sm:text-2xl font-bold shadow-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1817] truncate">{user?.name}</h1>
            <p className="text-xs text-[#8C6D3B] font-mono truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            clearSession();
            await logout();
            navigate('/');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#7A1C1C]/15 border border-[#8C6D3B]/20 text-[#1A1817] hover:text-[#7A1C1C] text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Status */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 shadow-md space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Entitlement Status
          </span>
          <div className="flex items-center gap-2">
            {entitlements?.isDeckPassActive ? (
              <>
                <Crown className="w-5 h-5 text-emerald-600" />
                <span className="font-serif text-lg font-bold text-emerald-800">30-Day Pass Active</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-[#8C6D3B]" />
                <span className="font-serif text-lg font-bold text-[#1A1817]">Standard Access</span>
              </>
            )}
          </div>
          {entitlements?.deckPassExpiresAt && (
            <p className="text-[11px] font-mono text-[#1A1817]/70">
              Expires: {new Date(entitlements.deckPassExpiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Quick Links */}
        <Link
          to="/purchased-cards"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Unlocked Cards
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">
              {entitlements?.isDeckPassActive ? '55 / 55' : `${(entitlements?.unlockedCardKeys?.length || 0) + 3} / 55`}
            </span>
            <CreditCard className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">View Unlocked Archetypes →</span>
        </Link>

        {/* Payment History */}
        <Link
          to="/payments/history"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Transactions
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">Invoices</span>
            <History className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">View Payment Receipts →</span>
        </Link>

        <Link
          to="/support"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Support
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">Contact Us</span>
            <Phone className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">Get help from our team →</span>
        </Link>
      </div>

      {/* Active Birth Profile Details */}
      {profile && (
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1817]/10">
            <h2 className="font-serif text-xl font-bold text-[#1A1817]">Active Birth Profile</h2>
            <Link
              to="/deck"
              className="text-xs text-[#8C6D3B] hover:underline font-semibold"
            >
              Go to Deck →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Date</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{profile.dateOfBirth}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Time</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{profile.timeOfBirth}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20 sm:col-span-2">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Place</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#7A1C1C] flex-shrink-0" />
                <span className="truncate">{profile.place}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
