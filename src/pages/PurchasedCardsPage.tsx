import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useDeck } from '../context/DeckContext';

export const PurchasedCardsPage: React.FC = () => {
  const { cards, entitlements } = useDeck();
  const unlockedCards = cards.filter((c) => c.isUnlocked);

  const isPassActive = entitlements?.isDeckPassActive;
  const expiryDate = entitlements?.deckPassExpiresAt
    ? new Date(entitlements.deckPassExpiresAt)
    : null;

  const daysLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
      <div>
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] mb-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1A1817]">Purchased Cards & Pass Status</h1>
        <p className="text-xs text-[#8C6D3B] mt-1 font-medium">
          Review your unlocked cosmic archetypes and 30-day deck pass validity.
        </p>
      </div>

      {/* 30-Day Pass Banner */}
      {isPassActive ? (
        <div className="p-6 rounded-3xl bg-[#FFFDF9] border-2 border-emerald-600/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">
                All 55 Cards Unlocked
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1817]">30-Day Deck Pass Active</h2>
              <p className="text-xs text-[#1A1817]/70 mt-0.5">
                Expires on <strong className="text-[#1A1817] font-semibold">{expiryDate?.toLocaleDateString()}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-serif text-3xl font-bold text-emerald-800">{daysLeft}</span>
            <span className="text-xs text-[#1A1817]/70 block font-medium">days remaining</span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/30 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#1A1817]">Unlock Complete 55-Card Sky</h3>
            <p className="text-xs text-[#1A1817]/70">
              Get 30 days of unrestricted access to all 55 cards, 3 Master Keys, and Gemini oracle interpretations.
            </p>
          </div>
          <Link
            to="/pricing"
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
          >
            Get 30-Day Pass · ₹25
          </Link>
        </div>
      )}

      {/* Unlocked Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1A1817]">
          Your Unlocked Cards ({unlockedCards.length} of 55)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {unlockedCards.map((card) => {
            const isRed = card.suit === 'Artha' || card.suit === 'Kama';
            const isMaster = card.suit === 'MasterKey';
            const suitColor = isMaster ? '#8C6D3B' : isRed ? '#7A1C1C' : '#2B2927';

            return (
              <div
                key={card.cardId}
                className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-sm hover:shadow-md transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-base" style={{ color: suitColor }}>
                    {card.rank}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2ECE1] border border-[#8C6D3B]/20 font-semibold"
                    style={{ color: suitColor }}
                  >
                    {card.suit}
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#1A1817] truncate group-hover:text-[#8C6D3B] transition-colors">
                  {card.title}
                </h4>
                <p className="text-[11px] text-[#1A1817]/70 line-clamp-2 leading-relaxed">
                  {card.shortSummary}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
