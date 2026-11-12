import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { ICard } from '../types';
import { SUIT_METADATA } from './SuitTabs';

interface Card3DProps {
  card: ICard;
  onOpenDetail?: (card: ICard) => void;
  onUnlock?: (card: ICard) => void;
  onUnlockPass?: () => void;
}

const SIGN_NAMES = [
  'Aries • Mesha',
  'Taurus • Vrishabha',
  'Gemini • Mithuna',
  'Cancer • Karka',
  'Leo • Simha',
  'Virgo • Kanya',
  'Libra • Tula',
  'Scorpio • Vrischika',
  'Sagittarius • Dhanus',
  'Capricorn • Makara',
  'Aquarius • Kumbha',
  'Pisces • Meena',
];

const HOUSE_LORDS = [
  'Mars',
  'Venus',
  'Mercury',
  'Moon',
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Saturn',
  'Jupiter',
];

export const Card3D: React.FC<Card3DProps> = ({
  card,
  onOpenDetail,
  onUnlock,
  onUnlockPass,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto-reset flipped state whenever the card changes or if card is locked
  useEffect(() => {
    setIsFlipped(false);
  }, [card.key, card.cardId, card.isUnlocked]);

  const isCardActuallyUnlocked = Boolean(card.isUnlocked);
  const showBack = isCardActuallyUnlocked && isFlipped;

  const suitMeta = SUIT_METADATA[card.suit] || SUIT_METADATA.Dharma;
  const isRed = suitMeta.red;
  const rankColor = isRed ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#2B2927';

  const fmtDeg = (d: number | null | undefined) => {
    if (d == null || isNaN(d)) return '—';
    const deg = Math.floor(d);
    const min = Math.floor((d % 1) * 60);
    return `${deg}° ${String(min).padStart(2, '0')}'`;
  };

  const astro = card.astronomicalPlacement || {};
  const karakaCode = astro.kar?.code || (card.isSovereign ? 'AK' : null);

  const formatSign = () => {
    if (astro.sign != null && astro.sign >= 0 && astro.sign < 12) {
      return SIGN_NAMES[astro.sign];
    }
    if (astro.signName) {
      const idx = SIGN_NAMES.findIndex((s) => s.toLowerCase().startsWith(astro.signName!.toLowerCase()));
      if (idx !== -1) return SIGN_NAMES[idx];
      return astro.signName;
    }
    return '—';
  };

  const formatNavamsha = () => {
    if (astro.navamshaSignName) return astro.navamshaSignName;
    if (astro.navamshaSign != null && astro.navamshaSign >= 0 && astro.navamshaSign < 12) {
      return SIGN_NAMES[astro.navamshaSign].split(' • ')[0];
    }
    if (astro.sign != null && astro.deg != null) {
      const absDeg = astro.sign * 30 + astro.deg;
      const navSign = Math.floor((absDeg % 120) / (30 / 9)) % 12;
      return SIGN_NAMES[navSign]?.split(' • ')[0] || '—';
    }
    return '—';
  };

  const fmtNadi = () => {
    if (!astro.nadi) return '—';
    const trimmed = String(astro.nadi).trim();
    if (/^\d+$/.test(trimmed)) {
      return `#${trimmed} of 150`;
    }
    return trimmed;
  };

  const resolvedHouseLord =
    astro.houseLord || (astro.sign != null && astro.sign >= 0 && astro.sign < 12 ? HOUSE_LORDS[astro.sign] : '—');

  const rows = [
    ['Sign (Rashi)', formatSign()],
    ['Position', fmtDeg(astro.deg)],
    ['House', astro.house ? String(astro.house) : '—'],
    ['Birth star', astro.nak || '—'],
    ['Pada', astro.pada != null ? String(astro.pada) : '—'],
    ['Star lord', astro.lord || '—'],
    ['Nadi', fmtNadi()],
    ['Navamsha (D9)', formatNavamsha()],
    ['House lord', resolvedHouseLord],
    ...(astro.kar && astro.kar.name && astro.kar.code ? [['Key planet (Karaka)', `${astro.kar.name} (${astro.kar.code})`]] : []),
    ...(astro.ruler ? [['Division ruler', astro.ruler]] : []),
    ...(astro.state ? [['Condition', astro.state]] : []),
  ];

  const hasAstroData = isCardActuallyUnlocked && (astro.sign != null || astro.deg != null || astro.nak != null);

  return (
    <div
      className="relative h-[clamp(310px,50vh,415px)] max-h-full max-w-[min(285px,calc(100vw-88px))] mx-auto select-none"
      style={{ aspectRatio: '2.7 / 4' }}
    >
      <div
        className="w-full h-full relative cursor-pointer"
        onClick={() => {
          if (isCardActuallyUnlocked) {
            setIsFlipped(!isFlipped);
          } else {
            onUnlock?.(card);
          }
        }}
      >
        {/* ================= FRONT FACE (EXACT VINTAGE VELLUM EMBLEM) ================= */}
        <div
          className={`absolute inset-0 rounded-2xl border-[1.5px] overflow-hidden flex flex-col justify-between p-2.5 sm:p-3 transition-all duration-300 ${
            showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } ${
            card.isSovereign
              ? 'border-[#8C6D3B] shadow-[0_16px_36px_rgba(140,109,59,0.32),0_0_20px_rgba(140,109,59,0.2)]'
              : 'border-[#8C6D3B]/60 shadow-[0_12px_28px_rgba(80,60,30,0.14)]'
          }`}
          style={{
            background: '#FAF5EE',
            color: rankColor,
          }}
        >
          {/* Inner Hairline Framing */}
          <div className="absolute inset-1.5 rounded-xl border border-[#8C6D3B]/20 pointer-events-none z-0" />

          {/* Ornate Corner Fleurons */}
          <div className="absolute top-1.5 left-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 14V6a4 4 0 0 1 4-4h8" />
              <circle cx="6" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute top-1.5 right-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 14V6a4 4 0 0 0-4-4h-8" />
              <circle cx="18" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 left-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10v8a4 4 0 0 0 4 4h8" />
              <circle cx="6" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 10v8a4 4 0 0 1-4 4h-8" />
              <circle cx="18" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>

          {/* Top-Left Corner Index */}
          <div className="text-left font-serif leading-none select-none z-10 pt-0.5 pl-0.5">
            <span className="text-base sm:text-lg lg:text-xl font-bold block tracking-tight font-cinzel" style={{ color: rankColor }}>
              {card.rank}
            </span>
            <span className="text-xs sm:text-sm lg:text-base mt-0.5 block font-bold leading-none" style={{ color: rankColor }}>
              {suitMeta.symbol}
            </span>
          </div>

          {/* Top-Right Badge (FREE or PAID) */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
            {card.isFree ? (
              <div className="px-2 py-0.5 rounded-full bg-[#E8F3EB] text-[#2E5A36] font-sans font-bold text-[8px] sm:text-[8.5px] tracking-wider uppercase border border-[#B8D7BE] shadow-xs">
                FREE
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded-full bg-[#FAF0D9] text-[#8C6D3B] font-sans font-bold text-[8px] sm:text-[8.5px] tracking-wider uppercase border border-[#D5B87D] shadow-xs">
                ₹2 PAID
              </div>
            )}
          </div>

          {/* Center Card Content */}
          <div className="relative text-center my-auto px-1.5 z-10 select-none flex flex-col items-center">
            {/* Sunburst Emblem */}
            <img
              src="/card_emblem_sun.png"
              alt="Sunburst Emblem"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain my-0.5 select-none pointer-events-none"
            />

            {/* Suit & Label */}
            <div className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.16em] text-[#8C6D3B] uppercase mb-0.5 font-cinzel">
              {suitMeta.name} · {card.label}
            </div>

            {/* Card Title */}
            <h2 className="font-cinzel text-sm sm:text-base md:text-[18px] font-bold leading-tight mb-0.5 text-[#1A1817] tracking-tight">
              {card.title}
            </h2>

            {/* Quote Epigram */}
            {card.line && (
              <p className="font-cormorant italic text-[10.5px] sm:text-[12px] leading-snug text-[#3D3833] max-w-[210px] mx-auto opacity-95">
                "{card.line}"
              </p>
            )}

            {/* Bottom Coordinates Pill */}
            {hasAstroData && (
              <div className="mt-1 sm:mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF5EE] border border-[#8C6D3B]/40 text-[8.5px] sm:text-[9.5px] font-sans font-medium text-[#1A1817] tracking-wide inline-block shadow-xs">
                {formatSign().split(' • ')[0]} {fmtDeg(astro.deg)} · {astro.nak || '—'} {astro.pada ? `P${astro.pada}` : ''}
              </div>
            )}
          </div>

          {/* Bottom-Right Inverted Corner Index */}
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 font-serif leading-none rotate-180 text-right select-none z-10">
            <span className="text-base sm:text-lg lg:text-xl font-bold block tracking-tight font-cinzel" style={{ color: rankColor }}>
              {card.rank}
            </span>
            <span className="text-xs sm:text-sm lg:text-base mt-0.5 block font-bold leading-none" style={{ color: rankColor }}>
              {suitMeta.symbol}
            </span>
          </div>

          {/* ================= LOCK OVERLAY ================= */}
          {!isCardActuallyUnlocked && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onUnlock?.(card);
              }}
              className="absolute inset-0 rounded-2xl bg-[#1A1817]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-5 text-center text-[#FAF7F2] space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2]/10 border border-[#8C6D3B]/60 flex items-center justify-center text-[#8C6D3B] shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#8C6D3B] tracking-wide">A Sealed Card</h3>
                <p className="text-[11px] text-[#D8CCA8] mt-0.5 max-w-[200px] leading-tight font-serif">
                  Unlock {card.label} or access the 55-card deck.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[190px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock?.(card);
                  }}
                  className="w-full py-2 px-3.5 rounded-xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Unlock Card · ₹2
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlockPass?.();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#FAF7F2]/10 border border-[#8C6D3B]/40 text-[#D8CCA8] text-[10.5px] font-cinzel hover:bg-[#FAF7F2]/15 transition-all"
                >
                  Complete Deck Pass · ₹25
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= BACK FACE (EXACT VINTAGE ASTRO TABLE - IMAGE 2) ================= */}
        <div
          className={`absolute inset-0 rounded-2xl border-[1.5px] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 shadow-xl transition-opacity duration-300 ${
            showBack ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${
            card.isSovereign ? 'border-[#8C6D3B]' : 'border-[#8C6D3B]/60'
          }`}
          style={{
            background: '#FAF5EE',
            color: '#1A1817',
          }}
        >
          {/* Inner Hairline Framing */}
          <div className="absolute inset-1.5 rounded-xl border border-[#8C6D3B]/20 pointer-events-none z-0" />

          {/* Ornate Corner Fleurons */}
          <div className="absolute top-1.5 left-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 14V6a4 4 0 0 1 4-4h8" />
              <circle cx="6" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute top-1.5 right-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 14V6a4 4 0 0 0-4-4h-8" />
              <circle cx="18" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 left-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10v8a4 4 0 0 0 4 4h8" />
              <circle cx="6" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-[#8C6D3B]/70 pointer-events-none select-none z-10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 10v8a4 4 0 0 1-4 4h-8" />
              <circle cx="18" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>

          {/* Header with Title */}
          <div className="relative text-center pb-1 pt-0.5 border-b border-[#8C6D3B]/25 z-10">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#73582D] tracking-wide inline-flex items-center gap-1.5">
              <span className="text-xs text-[#8C6D3B]">✦</span>
              <span>{card.label}</span>
              <span className="text-xs text-[#8C6D3B]">✦</span>
            </h3>
          </div>

          {/* Astronomical Placement Rows Matching Image 2 */}
          {!isCardActuallyUnlocked ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 text-center space-y-2 z-10">
              <div className="w-9 h-9 rounded-full bg-[#8C6D3B]/10 border border-[#8C6D3B]/50 flex items-center justify-center text-[#8C6D3B] shadow-md">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-[#73582D]">Placement Sealed</h4>
                <p className="text-[10px] text-[#595147] mt-0.5 max-w-[180px] font-serif">
                  Unlock {card.label} to reveal its exact sign, degree, nakshatra pada & harmonics.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock?.(card);
                }}
                className="py-1.5 px-3 rounded-lg bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-[11px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
              >
                Unlock Card · ₹2
              </button>
            </div>
          ) : !hasAstroData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
              <div className="w-7 h-7 rounded-full border-2 border-[#8C6D3B]/40 border-t-[#8C6D3B] animate-spin mx-auto" />
              <p className="font-serif text-xs text-[#8C6D3B]">Aligning celestial coordinates…</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 my-1 space-y-0.5 overflow-y-auto pr-0.5 card-chart-scrollbar z-10">
              {rows.map(([label, val], idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-1 py-1 border-b border-[#8C6D3B]/15 text-[9px] sm:text-[10px] leading-tight"
                >
                  <span className="min-w-0 text-[#595147] font-serif break-words">{label}</span>
                  <span className="min-w-0 font-sans font-bold text-[#1A1817] text-right break-words">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Celestial Sun/Moon Motif Matching Image 2 */}
          <div className="pt-1 border-t border-[#8C6D3B]/20 text-center flex flex-col items-center z-10">
            <img
              src="/card_motif_moon.png"
              alt="Celestial Phases"
              className="w-24 sm:w-28 object-contain my-0.5 select-none pointer-events-none"
            />
            <span className="text-[9.5px] sm:text-[10px] text-[#73582D] italic font-cormorant">
              ✦ Placement in your birth sky ✦
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
