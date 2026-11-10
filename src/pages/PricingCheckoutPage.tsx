import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, CheckCircle2, Crown, Zap, Clock } from 'lucide-react';
import { UnlockModal } from '../components/UnlockModal';
import { useDeck } from '../context/DeckContext';
import { useAuth } from '../context/AuthContext';

export const PricingCheckoutPage: React.FC = () => {
  const { entitlements } = useDeck();
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'CARD' | 'PASS'>('PASS');

  const isPassActive = entitlements?.isDeckPassActive;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">
      {/* Page Heading */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[#8C6D3B] text-2xl font-serif">✦</span>
        <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-[#8C6D3B]">
          Cosmic Self-Discovery Pricing
        </h1>
        <p className="font-cormorant italic text-sm sm:text-base text-[#6B635B]">
          Honest, transparent access to your complete birth sky. No recurring subscriptions.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free Horizon */}
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest font-bold text-[#8C6D3B] font-cinzel">
              Foundation
            </div>
            <div>
              <div className="font-cinzel text-3xl font-bold text-[#1A1817]">Free</div>
              <div className="text-xs text-[#6B635B] mt-1 font-serif">First three cards open to all seekers</div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#5C5650] pt-4 border-t border-[#8C6D3B]/15 font-serif">
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#2E5A36] flex-shrink-0" />
                <span>Lagna (Ascendant · The Incarnation Gate)</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#2E5A36] flex-shrink-0" />
                <span>Sun (Surya · The Soul's Throne)</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#2E5A36] flex-shrink-0" />
                <span>Moon (Chandra · The Ocean of Feeling)</span>
              </li>
              <li className="flex items-center gap-2 text-[#827A73]">
                <CheckCircle2 className="w-4 h-4 text-[#827A73] flex-shrink-0" />
                <span>Permanent access with no expiration</span>
              </li>
            </ul>
          </div>
          <Link
            to="/deck"
            className="w-full py-3 rounded-2xl bg-[#F2ECE1] hover:bg-[#EAE1D2] border border-[#8C6D3B]/30 text-center text-xs font-bold uppercase tracking-wider text-[#1A1817] font-cinzel transition-all"
          >
            Draw Free Cards
          </Link>
        </div>

        {/* Tier 2: Complete 30-Day Deck Pass (Featured) */}
        <div className="relative bg-[#FFFDF9] border-2 border-[#8C6D3B] rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_12px_36px_rgba(140,109,59,0.25)] md:scale-105 my-2 md:my-0 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#8C6D3B] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-widest font-cinzel shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest font-bold text-[#8C6D3B] flex items-center gap-1.5 font-cinzel">
              <Crown className="w-4 h-4" />
              <span>Full Access Pass</span>
            </div>
            <div>
              <div className="font-cinzel text-4xl sm:text-5xl font-bold text-[#8C6D3B]">₹25</div>
              <div className="text-xs text-[#6B635B] mt-1 flex items-center gap-1 font-serif">
                <Clock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Valid for 30 full days · Single payment</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#5C5650] pt-4 border-t border-[#8C6D3B]/20 font-serif">
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>All 55 Personalized Cards fully unlocked</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>3 Sovereign Master Keys (Identity, Perception, Spanda)</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>Gemini AI deep interpretations & inquiry questions</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>Complete Vedic astronomical data & Nadi D150 analysis</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              setMode('PASS');
              setModalOpen(true);
            }}
            className="w-full py-3.5 rounded-2xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider font-cinzel shadow-md active:scale-95 transition-all"
          >
            {isPassActive ? 'Pass Currently Active' : 'Get 30-Day Pass · ₹25'}
          </button>
        </div>

        {/* Tier 3: Single Card Unlock */}
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest font-bold text-[#8C6D3B] font-cinzel">
              Micro Unlock
            </div>
            <div>
              <div className="font-cinzel text-3xl font-bold text-[#1A1817]">₹2</div>
              <div className="text-xs text-[#6B635B] mt-1 font-serif">Per individual card · Lifetime access</div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#5C5650] pt-4 border-t border-[#8C6D3B]/15 font-serif">
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>Permanent unlock of any individual card</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>Front artwork & back chart positions</span>
              </li>
              <li className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span>Gemini AI reflection prompt for that card</span>
              </li>
              <li className="flex items-center gap-2 text-[#827A73]">
                <CheckCircle2 className="w-4 h-4 text-[#827A73] flex-shrink-0" />
                <span>No recurring charge</span>
              </li>
            </ul>
          </div>
          <Link
            to="/deck"
            className="w-full py-3 rounded-2xl bg-[#F2ECE1] hover:bg-[#EAE1D2] border border-[#8C6D3B]/30 text-center text-xs font-bold uppercase tracking-wider text-[#1A1817] font-cinzel transition-all"
          >
            Pick a Card to Unlock
          </Link>
        </div>
      </div>

      {/* Security Banner */}
      <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/20 flex items-center justify-center gap-3 text-xs text-[#6B635B] text-center font-serif">
        <Shield className="w-5 h-5 text-[#8C6D3B] flex-shrink-0" />
        <span>
          Payments secured by Razorpay with 256-bit bank-grade encryption. Test mode enabled for development.
        </span>
      </div>

      {modalOpen && (
        <UnlockModal
          mode={mode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
