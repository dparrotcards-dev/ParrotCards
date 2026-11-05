import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Share2, Compass, ArrowLeft, Check, Shield } from 'lucide-react';
import { useDeck } from '../context/DeckContext';

export const SovereignAvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, deck, cards } = useDeck();
  const [copied, setCopied] = useState<boolean>(false);

  if (!deck || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Crown className="w-12 h-12 text-gold animate-bounce" />
        <h2 className="font-serif text-2xl text-gold font-bold">No Sovereign Deck Calculated Yet</h2>
        <p className="text-sm text-mute max-w-sm">
          Please enter your birth details to reveal your Sovereign Avatar.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-gold text-cosmos-void font-bold text-xs uppercase tracking-wider"
        >
          Enter the Sky
        </Link>
      </div>
    );
  }

  const sovereignCard = cards.find((c) => c.key === deck.sovereignCardKey) || cards[0];
  const astro = sovereignCard?.astronomicalPlacement || {};

  const handleCopyShare = () => {
    const text = `✦ Parrot Cards — Sovereign Avatar ✦\nSeeker: ${profile.name}\nAvatar: "${deck.avatarPhrase}"\nSoul Planet (Atma Karaka): ${deck.sovereignCardKey}\nDraw your deck: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
      <div className="w-full space-y-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/deck')}
          className="inline-flex items-center gap-1.5 text-xs text-mute hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to 55-Card Deck</span>
        </button>

        {/* Majestic Sovereign Card Emblem */}
        <div className="relative bg-[#FFFDF9] border-2 border-[#8C6D3B]/40 rounded-3xl p-8 sm:p-12 shadow-[0_16px_40px_rgba(26,24,23,0.08)] text-center space-y-6">
          {/* Top Crown Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#8C6D3B] text-[#FAF7F2] text-xs font-bold tracking-widest uppercase font-cinzel shadow-md mx-auto">
            <Crown className="w-4 h-4" />
            <span>Crowned Atma Karaka</span>
          </div>

          {/* Sovereign Avatar Phrase */}
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#6B635B] block font-cinzel font-bold">
              The Sovereign Sky of {profile.name}
            </span>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#8C6D3B] leading-tight">
              "{deck.avatarPhrase}"
            </h1>
          </div>

          {/* Atma Karaka Soul Planet Badge */}
          <div className="inline-block px-4 py-2 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 text-xs">
            <span className="text-[#6B635B] font-serif">King of the Soul:</span>{' '}
            <strong className="text-[#8C6D3B] font-cinzel text-base">{deck.sovereignCardKey}</strong>{' '}
            <span className="text-[#6B635B] font-serif">
              ({astro.signName || 'Zodiac'}, House {astro.house || 1})
            </span>
          </div>

          {/* Poetic Synthesis */}
          <p className="font-cormorant italic text-base sm:text-xl text-[#3D3833] leading-relaxed max-w-xl mx-auto">
            {deck.avatarSummary}
          </p>

          {/* Astronomical Anchor Details */}
          <div className="pt-6 border-t border-[#8C6D3B]/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
              <span className="text-[10px] text-[#6B635B] uppercase block font-cinzel">Sign</span>
              <span className="font-bold text-[#1A1817] font-serif">{astro.signName || 'Mesha'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
              <span className="text-[10px] text-[#6B635B] uppercase block font-cinzel">Degree</span>
              <span className="font-bold text-[#1A1817] font-mono">{astro.deg?.toFixed(2) || '0.00'}°</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
              <span className="text-[10px] text-[#6B635B] uppercase block font-cinzel">Nakshatra</span>
              <span className="font-bold text-[#1A1817] font-serif">{astro.nak || 'Ashwini'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
              <span className="text-[10px] text-[#6B635B] uppercase block font-cinzel">Chara Karaka</span>
              <span className="font-bold text-[#8C6D3B] font-cinzel">Atma Karaka (AK)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCopyShare}
              className="py-3 px-6 rounded-2xl bg-[#F2ECE1] hover:bg-[#EAE1D2] border border-[#8C6D3B]/30 text-[#1A1817] text-xs font-cinzel font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#2E5A36]" /> : <Share2 className="w-4 h-4 text-[#8C6D3B]" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Share Sovereign Avatar'}</span>
            </button>
            <Link
              to="/profile/astronomy"
              className="py-3 px-6 rounded-2xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider font-cinzel shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Full Sky Chart</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
