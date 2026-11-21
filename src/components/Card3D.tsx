import React, { useState, useEffect } from 'react';
import {
  Lock,
  Sparkles,
  Crosshair,
  Home,
  Star,
  Layers,
  Globe,
  Activity,
  Shield,
  CircleDot,
  Hexagon,
} from 'lucide-react';
import { ICard } from '../types';
import { SUIT_METADATA } from './SuitTabs';

interface Card3DProps {
  card: ICard;
  onOpenDetail?: (card: ICard) => void;
  onUnlock?: (card: ICard) => void;
  onUnlockPass?: () => void;
}

const ZODIAC_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

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

// Meaningful role sub-title for the back face ribbon matching Image 4
const CARD_SUBTITLE_MAP: Record<string, string> = {
  janma_lagna: 'BIRTH ASCENDANT',
  lagna: 'BIRTH ASCENDANT',
  surya: 'SOUL ESSENCE',
  sun: 'SOUL ESSENCE',
  chandra: 'MIND & INTUITION',
  moon: 'MIND & INTUITION',
  mangala: 'DRIVE & WILLPOWER',
  mars: 'DRIVE & WILLPOWER',
  budha: 'INTELLECT & COMMERCE',
  mercury: 'INTELLECT & COMMERCE',
  guru: 'WISDOM & DHARMA',
  jupiter: 'WISDOM & DHARMA',
  shukra: 'HARMONY & DESIRE',
  venus: 'HARMONY & DESIRE',
  shani: 'DISCIPLINE & KARMA',
  saturn: 'DISCIPLINE & KARMA',
  rahu: 'EVOLUTIONARY EDGE',
  ketu: 'MOKSHA THRESHOLD',
  atmakaraka: 'SOUL SIGNIFICATOR',
  amatyakaraka: 'CAREER SIGNIFICATOR',
  bhratrikaraka: 'COURAGE SIGNIFICATOR',
  matrikaraka: 'NOURISHMENT SIGNIFICATOR',
  putrakaraka: 'CREATION SIGNIFICATOR',
  gnatikaraka: 'CHALLENGE CATALYST',
  darakaraka: 'PARTNERSHIP SIGNIFICATOR',
  yogi_sphuta: 'PROSPERITY POINT',
  avayogi_sphuta: 'OBSTACLE CATALYST',
};

export const Card3D: React.FC<Card3DProps> = ({
  card,
  onOpenDetail,
  onUnlock,
  onUnlockPass,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardPrice = 2;

  // Auto-reset flipped state whenever the card changes or if card is locked
  useEffect(() => {
    setIsFlipped(false);
  }, [card.key, card.cardId, card.isUnlocked]);

  const isCardActuallyUnlocked = Boolean(card.isUnlocked);
  const showBack = isCardActuallyUnlocked && isFlipped;

  const suitMeta = SUIT_METADATA[card.suit] || SUIT_METADATA.Dharma;
  const isRed = suitMeta.red;
  const rankColor = isRed ? '#8B1E1E' : card.suit === 'MasterKey' ? '#8C6D3B' : '#1E1A17';

  const astro = card.astronomicalPlacement || {};

  const fmtDeg = (d: number | null | undefined) => {
    if (d == null || isNaN(d)) return '—';
    const deg = Math.floor(d);
    const min = Math.floor((d % 1) * 60);
    return `${deg}° ${String(min).padStart(2, '0')}'`;
  };

  const getSignIndex = (signVal: number | null | undefined, signNameVal?: string | null): number | null => {
    if (signVal != null && signVal >= 0 && signVal < 12) return signVal;
    if (signNameVal) {
      const idx = SIGN_NAMES.findIndex((s) => s.toLowerCase().startsWith(signNameVal.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return null;
  };

  const signIdx = getSignIndex(astro.sign, astro.signName);
  const zodiacGlyph = signIdx != null ? ZODIAC_GLYPHS[signIdx] : '✦';

  const formatSign = () => {
    if (signIdx != null) return SIGN_NAMES[signIdx];
    if (astro.signName) return astro.signName;
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

  const navamshaIdx =
    astro.navamshaSign != null && astro.navamshaSign >= 0 && astro.navamshaSign < 12
      ? astro.navamshaSign
      : getSignIndex(null, astro.navamshaSignName);
  const navamshaGlyph = navamshaIdx != null ? ZODIAC_GLYPHS[navamshaIdx] : '✦';

  const formatHouseOrdinal = (h: number | null | undefined): string => {
    if (!h) return '—';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = h % 100;
    return `${h}${s[(v - 20) % 10] || s[v] || s[0]} House`;
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
    astro.houseLord || (signIdx != null ? HOUSE_LORDS[signIdx] : '—');

  const signShort = formatSign().split(' • ')[0];
  const hasAstroData = isCardActuallyUnlocked && (astro.sign != null || astro.deg != null || astro.nak != null);

  // Subtitle for back face ribbon
  const cardKeyNormalized = (card.key || '').toLowerCase();
  const backSubtitle =
    CARD_SUBTITLE_MAP[cardKeyNormalized] ||
    (card.label.toLowerCase().includes('lagna') ? 'BIRTH ASCENDANT' : card.title || card.suit);

  // Data rows matching Image 4
  const dataRows = [
    {
      id: 'sign',
      label: 'SIGN (RASHI)',
      icon: <CircleDot className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: true,
      glyph: zodiacGlyph,
      value: formatSign(),
    },
    {
      id: 'position',
      label: 'POSITION',
      icon: <Crosshair className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: fmtDeg(astro.deg),
    },
    {
      id: 'house',
      label: 'HOUSE',
      icon: <Home className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: formatHouseOrdinal(astro.house),
    },
    {
      id: 'nak',
      label: 'BIRTH STAR',
      icon: <Star className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: astro.nak || '—',
    },
    {
      id: 'pada',
      label: 'PADA',
      icon: <Layers className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: astro.pada != null ? String(astro.pada) : '—',
    },
    {
      id: 'lord',
      label: 'STAR LORD',
      icon: <Globe className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: astro.lord || '—',
    },
    {
      id: 'nadi',
      label: 'NADI',
      icon: <Activity className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: fmtNadi(),
    },
    {
      id: 'd9',
      label: 'NAVAMSHA (D9)',
      icon: <Hexagon className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: true,
      glyph: navamshaGlyph,
      value: formatNavamsha(),
    },
    {
      id: 'houseLord',
      label: 'HOUSE LORD',
      icon: <Shield className="w-3.5 h-3.5 text-[#8C6D3B]" />,
      badge: false,
      value: resolvedHouseLord,
    },
  ];

  return (
    <div
      className="relative w-full max-w-[330px] sm:max-w-[345px] md:max-w-[355px] aspect-[1/1.5] mx-auto select-none"
      style={{
        perspective: '1200px',
      }}
    >
      <div
        className="w-full h-full relative cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
        }}
        onClick={() => {
          if (isCardActuallyUnlocked) {
            setIsFlipped(!isFlipped);
          } else {
            onUnlock?.(card);
          }
        }}
      >
        {/* ========================================================================= */}
        {/*                           FRONT FACE (EXACT IMAGE 3)                      */}
        {/* ========================================================================= */}
        <div
          className={`absolute inset-0 rounded-[26px] sm:rounded-[28px] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 transition-all duration-300 ${
            showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } shadow-[0_16px_36px_rgba(60,40,20,0.18),0_2px_12px_rgba(0,0,0,0.06)]`}
          style={{
            background: 'linear-gradient(170deg, #FDF9F2 0%, #FAF3E5 50%, #F5ECDA 100%)',
            border: '2px solid rgba(197, 160, 89, 0.65)',
            boxShadow: 'inset 0 0 16px rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Inner Golden Hairline Frame */}
          <div className="absolute inset-1.5 sm:inset-2 rounded-[22px] border border-[#C5A059]/40 pointer-events-none z-10" />

          {/* Ornate Corner Accents */}
          <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]/75 rounded-tl-sm pointer-events-none z-10" />
          <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]/75 rounded-tr-sm pointer-events-none z-10" />
          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]/75 rounded-bl-sm pointer-events-none z-10" />
          <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]/75 rounded-br-sm pointer-events-none z-10" />

          {/* Traditional Auspicious Cloud Flourishes (Bottom Corners Matching Image 3) */}
          <svg
            viewBox="0 0 90 60"
            fill="none"
            stroke="#C5A059"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.75"
            className="absolute bottom-2 left-2 w-16 h-11 pointer-events-none z-10 select-none"
          >
            <path d="M4 52 C14 52, 18 42, 28 42 C36 42, 40 48, 50 48 C60 48, 64 38, 76 38 C84 38, 88 44, 88 52" />
            <path d="M10 56 C20 56, 26 48, 36 48 C44 48, 48 54, 58 54 C68 54, 74 44, 84 44" />
            <path d="M22 43 C26 34, 38 34, 44 40 C50 30, 64 30, 70 38" />
            <circle cx="36" cy="34" r="5" strokeWidth="1" />
            <circle cx="56" cy="32" r="4" strokeWidth="1" />
          </svg>
          <svg
            viewBox="0 0 90 60"
            fill="none"
            stroke="#C5A059"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.75"
            className="absolute bottom-2 right-2 w-16 h-11 pointer-events-none z-10 select-none -scale-x-100"
          >
            <path d="M4 52 C14 52, 18 42, 28 42 C36 42, 40 48, 50 48 C60 48, 64 38, 76 38 C84 38, 88 44, 88 52" />
            <path d="M10 56 C20 56, 26 48, 36 48 C44 48, 48 54, 58 54 C68 54, 74 44, 84 44" />
            <path d="M22 43 C26 34, 38 34, 44 40 C50 30, 64 30, 70 38" />
            <circle cx="36" cy="34" r="5" strokeWidth="1" />
            <circle cx="56" cy="32" r="4" strokeWidth="1" />
          </svg>

          {/* Top-Left Corner Index */}
          <div className="absolute top-2.5 left-3 select-none z-20 text-center leading-none">
            <span
              className="text-lg sm:text-xl font-bold font-cinzel block tracking-tight"
              style={{ color: rankColor }}
            >
              {card.rank}
            </span>
            <span
              className="text-base sm:text-lg block font-bold mt-0.5"
              style={{ color: rankColor }}
            >
              {card.suitSymbol}
            </span>
            <span className="text-[8px] text-[#C5A059] block mt-0.5">✦</span>
          </div>

          {/* Top-Right Badge: FREE or PAID */}
          <div className="absolute top-3 right-3 z-20">
            {card.isFree ? (
              <div className="px-2.5 py-0.5 rounded-full bg-[#E5F3EB] text-[#285735] font-sans font-bold text-[8.5px] sm:text-[9px] tracking-wider uppercase border border-[#A8D8B6] shadow-2xs">
                FREE
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-full bg-[#FAF0D9] text-[#8C6D3B] font-sans font-bold text-[8.5px] sm:text-[9px] tracking-wider uppercase border border-[#D5B87D] shadow-2xs">
                ₹{cardPrice} PAID
              </div>
            )}
          </div>

          {/* Top Half-Sunburst & Moon Phase Arch (Exact Art Matching Image 3) */}
          <div className="relative pt-1 sm:pt-2 w-full flex justify-center items-center z-10 select-none">
            <svg
              viewBox="0 0 260 120"
              fill="none"
              className="w-full max-w-[230px] sm:max-w-[250px] h-auto overflow-visible select-none pointer-events-none"
            >
              {/* Apex 4-Point Star */}
              <path
                d="M130 2 L132 12 L142 14 L132 16 L130 26 L128 16 L118 14 L128 12 Z"
                fill="#C5A059"
              />
              <circle cx="130" cy="14" r="1.5" fill="#FAF5EB" />

              {/* Dotted Celestial Orbital Arcs */}
              <path
                d="M30 92 A 108 108 0 0 1 230 92"
                stroke="#C5A059"
                strokeWidth="0.8"
                strokeDasharray="2.5 3"
                strokeOpacity="0.75"
              />
              <path
                d="M48 94 A 86 86 0 0 1 212 94"
                stroke="#C5A059"
                strokeWidth="0.75"
                strokeOpacity="0.45"
              />
              <path
                d="M66 96 A 68 68 0 0 1 194 96"
                stroke="#C5A059"
                strokeWidth="0.6"
                strokeOpacity="0.3"
              />

              {/* Moon Phases Along the Arc */}
              {/* Left Crescent 1 */}
              <path
                d="M62 82 C58 76, 59 66, 68 62 C63 67, 63 77, 68 82 Z"
                fill="#8C6D3B"
                fillOpacity="0.65"
              />
              {/* Left Crescent 2 */}
              <path
                d="M86 64 C82 56, 85 46, 95 44 C90 49, 90 59, 97 64 Z"
                fill="#8C6D3B"
                fillOpacity="0.8"
              />
              {/* Apex Full / Eclipse Moon */}
              <circle cx="130" cy="38" r="8" fill="#F4E8D1" stroke="#8C6D3B" strokeWidth="1.2" />
              <path
                d="M130 30 A 8 8 0 0 1 130 46 A 4 8 0 0 0 130 30"
                fill="#594426"
              />
              {/* Right Crescent 2 */}
              <path
                d="M174 64 C178 56, 175 46, 165 44 C170 49, 170 59, 163 64 Z"
                fill="#8C6D3B"
                fillOpacity="0.8"
              />
              {/* Right Crescent 1 */}
              <path
                d="M198 82 C202 76, 201 66, 192 62 C197 67, 197 77, 192 82 Z"
                fill="#8C6D3B"
                fillOpacity="0.65"
              />

              {/* Radial Sun Rays */}
              <g stroke="#C5A059" strokeWidth="0.85" strokeOpacity="0.8">
                {/* 21 Radial Rays */}
                {Array.from({ length: 21 }).map((_, idx) => {
                  const angle = 180 + idx * 9;
                  const rad = (angle * Math.PI) / 180;
                  const r1 = 36;
                  const r2 = idx % 2 === 0 ? 68 : 55;
                  const x1 = 130 + r1 * Math.cos(rad);
                  const y1 = 98 + r1 * Math.sin(rad);
                  const x2 = 130 + r2 * Math.cos(rad);
                  const y2 = 98 + r2 * Math.sin(rad);
                  return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} />;
                })}
              </g>

              {/* Semi-circular Horizon Sun */}
              <path
                d="M102 98 A 28 28 0 0 1 158 98 Z"
                fill="url(#frontSunGrad)"
                stroke="#C5A059"
                strokeWidth="1.2"
              />
              <line x1="85" y1="98" x2="175" y2="98" stroke="#8C6D3B" strokeWidth="1" />

              {/* Gradient Defs */}
              <defs>
                <linearGradient id="frontSunGrad" x1="102" y1="98" x2="158" y2="70" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F9E2AF" />
                  <stop offset="0.6" stopColor="#D8A952" />
                  <stop offset="1" stopColor="#A87522" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center Card Content */}
          <div className="relative text-center px-2 z-20 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 my-auto">
            {/* Beveled Bronze Ribbon Pill: ✦ SUIT • LABEL ✦ */}
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-sm bg-gradient-to-r from-[#3D2513] via-[#4D2E17] to-[#3D2513] border border-[#D4AF37] shadow-sm">
              <span className="text-[9.5px] sm:text-[10.5px] font-cinzel font-bold tracking-[0.16em] text-[#EADBBA] uppercase flex items-center gap-1.5 leading-none">
                <span>{card.suit}</span>
                <span className="text-[7.5px] text-[#D4AF37]">♦</span>
                <span>{card.label}</span>
              </span>
            </div>

            {/* Main Card Title */}
            <h2 className="font-cinzel text-base sm:text-lg md:text-[19px] font-bold text-[#2A1D15] tracking-tight leading-snug px-1">
              {card.title.toUpperCase()}
            </h2>

            {/* Quote with Laurel Sprigs */}
            {card.line && (
              <div className="flex items-center justify-center gap-1.5 px-2 max-w-[270px]">
                {/* Left Laurel Sprig */}
                <svg viewBox="0 0 32 20" fill="none" stroke="#C5A059" strokeWidth="1.2" className="w-4 h-3.5 shrink-0 opacity-80">
                  <path d="M2 18 C10 16, 20 12, 30 4" />
                  <path d="M10 14 C9 10, 13 8, 15 11" fill="#C5A059" fillOpacity="0.25" />
                  <path d="M18 10 C18 6, 22 5, 24 8" fill="#C5A059" fillOpacity="0.25" />
                </svg>

                <p className="font-cormorant italic text-[11px] sm:text-[12.5px] leading-snug text-[#3B2B20] text-center">
                  "{card.line}"
                </p>

                {/* Right Laurel Sprig */}
                <svg viewBox="0 0 32 20" fill="none" stroke="#C5A059" strokeWidth="1.2" className="w-4 h-3.5 shrink-0 opacity-80 -scale-x-100">
                  <path d="M2 18 C10 16, 20 12, 30 4" />
                  <path d="M10 14 C9 10, 13 8, 15 11" fill="#C5A059" fillOpacity="0.25" />
                  <path d="M18 10 C18 6, 22 5, 24 8" fill="#C5A059" fillOpacity="0.25" />
                </svg>
              </div>
            )}

            {/* Coordinates Pill: ♓ Pisces 9° 27' • Uttara Bhadrapada P2 */}
            {hasAstroData && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-[#FAF2E5] via-[#F3E7D3] to-[#FAF2E5] border border-[#C5A059]/60 shadow-2xs mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-[#6D4C24] leading-none">
                  {zodiacGlyph}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-sans font-medium text-[#221710] tracking-wide whitespace-nowrap">
                  {signShort} {fmtDeg(astro.deg)} • {astro.nak || '—'} {astro.pada ? `P${astro.pada}` : ''}
                </span>
              </div>
            )}

            {/* Primary Glowing Action Button */}
            <div className="w-full pt-1 flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCardActuallyUnlocked) {
                    onOpenDetail?.(card);
                  } else {
                    onUnlock?.(card);
                  }
                }}
                className="w-full max-w-[230px] sm:max-w-[250px] py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-[#44230D] via-[#2F1706] to-[#44230D] border-2 border-[#D4AF37] hover:border-[#F2D794] text-[#FAF4E8] font-cinzel font-bold text-[10px] sm:text-[11px] tracking-wider shadow-[0_4px_14px_rgba(68,35,13,0.35)] hover:shadow-[0_6px_18px_rgba(212,175,55,0.4)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer z-30 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5D88E] transition-transform group-hover:rotate-12 shrink-0" />
                <span className="whitespace-nowrap">DEEP READING (EN / हिंदी)</span>
                <span className="text-amber-200 transition-transform group-hover:translate-x-0.5 leading-none">➔</span>
              </button>
            </div>
          </div>

          {/* Bottom Center Celestial Ornament */}
          <div className="relative z-10 text-center pb-1 select-none flex items-center justify-center gap-2 text-[#C5A059] opacity-90 text-[10px]">
            <span>······</span>
            <span>☾</span>
            <span className="text-[9px]">✦</span>
            <span>☽</span>
            <span>······</span>
          </div>

          {/* Bottom-Right Inverted Corner Index */}
          <div className="absolute bottom-2.5 right-3 select-none z-20 text-center leading-none rotate-180">
            <span
              className="text-lg sm:text-xl font-bold font-cinzel block tracking-tight"
              style={{ color: rankColor }}
            >
              {card.rank}
            </span>
            <span
              className="text-base sm:text-lg block font-bold mt-0.5"
              style={{ color: rankColor }}
            >
              {card.suitSymbol}
            </span>
            <span className="text-[8px] text-[#C5A059] block mt-0.5">✦</span>
          </div>

          {/* Lock Overlay for locked cards */}
          {!isCardActuallyUnlocked && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onUnlock?.(card);
              }}
              className="absolute inset-0 rounded-[26px] bg-[#1A1817]/88 backdrop-blur-xs z-40 flex flex-col items-center justify-center p-5 text-center text-[#FAF7F2] space-y-3"
            >
              <div className="w-11 h-11 rounded-full bg-[#FAF7F2]/10 border border-[#8C6D3B]/70 flex items-center justify-center text-[#D4AF37] shadow-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-[#D4AF37] tracking-wide">
                  Card Wisdom Sealed
                </h3>
                <p className="text-[11px] text-[#D8CCA8] mt-1 max-w-[210px] leading-tight font-serif">
                  Unlock {card.label} or acquire the full 55-card deck pass.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[190px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock?.(card);
                  }}
                  className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#8C6D3B] to-[#73582D] hover:from-[#73582D] hover:to-[#5C4522] text-[#FAF7F2] font-cinzel font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Unlock Card · ₹{cardPrice}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlockPass?.();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#FAF7F2]/10 border border-[#8C6D3B]/40 text-[#D8CCA8] text-[10.5px] font-cinzel hover:bg-[#FAF7F2]/15 transition-all cursor-pointer"
                >
                  Complete Deck Pass · ₹25
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/*                            BACK FACE (EXACT IMAGE 4)                      */}
        {/* ========================================================================= */}
        <div
          className={`absolute inset-0 rounded-[26px] sm:rounded-[28px] overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 transition-all duration-300 ${
            showBack ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } shadow-[0_16px_36px_rgba(60,40,20,0.18)]`}
          style={{
            background: 'linear-gradient(170deg, #FDF9F2 0%, #FAF3E5 50%, #F5ECDA 100%)',
            border: '2px solid rgba(197, 160, 89, 0.65)',
            boxShadow: 'inset 0 0 16px rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Inner Golden Hairline Frame */}
          <div className="absolute inset-1.5 sm:inset-2 rounded-[22px] border border-[#C5A059]/40 pointer-events-none z-10" />

          {/* Ornate Corner Accents */}
          <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]/75 rounded-tl-sm pointer-events-none z-10" />
          <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]/75 rounded-tr-sm pointer-events-none z-10" />
          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]/75 rounded-bl-sm pointer-events-none z-10" />
          <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]/75 rounded-br-sm pointer-events-none z-10" />

          {/* Bottom Cloud Flourishes */}
          <svg
            viewBox="0 0 90 60"
            fill="none"
            stroke="#C5A059"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
            className="absolute bottom-2 left-2 w-14 h-10 pointer-events-none z-10 select-none"
          >
            <path d="M4 52 C14 52, 18 42, 28 42 C36 42, 40 48, 50 48 C60 48, 64 38, 76 38 C84 38, 88 44, 88 52" />
            <path d="M10 56 C20 56, 26 48, 36 48 C44 48, 48 54, 58 54 C68 54, 74 44, 84 44" />
          </svg>
          <svg
            viewBox="0 0 90 60"
            fill="none"
            stroke="#C5A059"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
            className="absolute bottom-2 right-2 w-14 h-10 pointer-events-none z-10 select-none -scale-x-100"
          >
            <path d="M4 52 C14 52, 18 42, 28 42 C36 42, 40 48, 50 48 C60 48, 64 38, 76 38 C84 38, 88 44, 88 52" />
            <path d="M10 56 C20 56, 26 48, 36 48 C44 48, 48 54, 58 54 C68 54, 74 44, 84 44" />
          </svg>

          {/* Top Header Section (Exact Image 4) */}
          <div className="relative text-center pt-1 z-20 flex flex-col items-center">
            {/* Celestial Sun/Moon Radiance Motif */}
            <div className="flex items-center justify-center gap-1.5 text-[#C5A059] opacity-90 select-none">
              <span className="text-[10px]">☾</span>
              <div className="w-5 h-5 rounded-full border border-[#C5A059] flex items-center justify-center">
                <span className="text-[9px] text-[#A67B2C]">☼</span>
              </div>
              <span className="text-[10px]">☽</span>
            </div>

            {/* Entity Main Heading: ✦ JANMA LAGNA ✦ */}
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#2A1D15] tracking-wide mt-0.5 flex items-center justify-center gap-1.5">
              <span className="text-xs text-[#C5A059]">✦</span>
              <span>{card.label.toUpperCase()}</span>
              <span className="text-xs text-[#C5A059]">✦</span>
            </h3>

            {/* Sub-ribbon Pill: ✦ BIRTH ASCENDANT ✦ with Laurel Sprigs */}
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <svg viewBox="0 0 28 16" fill="none" stroke="#C5A059" strokeWidth="1" className="w-3.5 h-3 opacity-75">
                <path d="M2 14 C8 12, 16 8, 26 2" />
                <path d="M8 10 C7 7, 11 6, 12 8" fill="#C5A059" fillOpacity="0.25" />
              </svg>

              <div className="inline-flex items-center px-3 py-0.5 rounded-sm bg-gradient-to-r from-[#3D2513] via-[#4D2E17] to-[#3D2513] border border-[#D4AF37] shadow-2xs">
                <span className="text-[8px] sm:text-[9px] font-cinzel font-bold tracking-[0.16em] text-[#EADBBA] uppercase leading-none">
                  ✦ {backSubtitle} ✦
                </span>
              </div>

              <svg viewBox="0 0 28 16" fill="none" stroke="#C5A059" strokeWidth="1" className="w-3.5 h-3 opacity-75 -scale-x-100">
                <path d="M2 14 C8 12, 16 8, 26 2" />
                <path d="M8 10 C7 7, 11 6, 12 8" fill="#C5A059" fillOpacity="0.25" />
              </svg>
            </div>
          </div>

          {/* Astronomical Placement Rows (Exact Image 4 Style) */}
          <div className="flex-1 my-1 sm:my-1.5 space-y-1 overflow-y-auto no-scrollbar z-20 pr-0.5 py-0.5">
            {dataRows.map((row) => (
              <div
                key={row.id}
                className="bg-[#FAF4E8]/95 hover:bg-[#FAF4E8] border border-[#DECAA7]/75 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center justify-between shadow-2xs transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#F3E7D3] border border-[#C5A059]/40 flex items-center justify-center shrink-0">
                    {row.icon}
                  </div>
                  <span className="font-cinzel text-[8px] sm:text-[8.5px] font-bold text-[#55402C] tracking-wider truncate">
                    {row.label}
                  </span>
                </div>

                <div className="shrink-0 text-right ml-2">
                  {row.badge ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4E6D0] border border-[#D5BA88] font-serif font-bold text-[9px] sm:text-[10px] text-[#221710] shadow-2xs">
                      {row.glyph && <span className="text-xs leading-none">{row.glyph}</span>}
                      <span>{row.value}</span>
                    </span>
                  ) : (
                    <span className="font-serif font-bold text-[9.5px] sm:text-[10.5px] text-[#221710]">
                      {row.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Button & Celestial Motif (Exact Image 4) */}
          <div className="pt-1 z-20 flex flex-col items-center space-y-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(card);
              }}
              className="w-full max-w-[270px] py-1.5 sm:py-2 px-3 rounded-full bg-gradient-to-r from-[#44230D] via-[#2F1706] to-[#44230D] border-2 border-[#D4AF37] hover:border-[#F2D794] text-[#FAF4E8] font-cinzel font-bold text-[9.5px] sm:text-[10.5px] tracking-wider shadow-[0_4px_14px_rgba(68,35,13,0.35)] hover:shadow-[0_6px_18px_rgba(212,175,55,0.4)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5D88E] transition-transform group-hover:rotate-12 shrink-0" />
              <span className="whitespace-nowrap font-bold">DEEP READING & ARCHETYPE LENSES</span>
              <span className="text-amber-200 transition-transform group-hover:translate-x-0.5 leading-none">➔</span>
            </button>

            {/* Bottom Sun/Moon Phases Motif */}
            <div className="relative text-center pb-0.5 select-none flex items-center justify-center gap-2 text-[#C5A059] opacity-90 text-[10px]">
              <span>······</span>
              <span>☾</span>
              <span className="text-[9px]">☼</span>
              <span>☽</span>
              <span>······</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
