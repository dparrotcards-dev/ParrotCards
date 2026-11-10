import React from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-1.5">
        <div className="text-[#8C6D3B] text-xs sm:text-sm select-none">✦</div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.08em] text-[#1A1817] uppercase">
          About Parrot Cards
        </h1>
        <p className="text-[11px] sm:text-xs text-[#8C6D3B] font-medium tracking-wide max-w-xl mx-auto leading-relaxed">
          Sovereign Identity Reclamation System (52 Purushartha Cards + 3 Transcendent Master Keys)
        </p>
      </div>

      {/* Main Philosophy */}
      <div className="bg-[#FFFDF9]/95 backdrop-blur-sm border border-[#8C6D3B]/25 rounded-2xl p-4 sm:p-6 shadow-md space-y-3 text-[#1A1817]/85 leading-relaxed text-xs sm:text-[13px]">
        <p>
          At the exact moment of inception, the subtle human vessel carries a unique structural geometry of stars, grahas, and mathematical intersections. In ancient Indian Vedic tradition, Shuka (the sacred parrot)—son of Sage Vyasa—represents the ultimate ideal of conscious perception: an unblemished mirror reflecting the seeker's authentic cosmic signature with absolute clarity.
        </p>
        <p>
          <strong className="text-[#1A1817]">Parrot Cards</strong> translates this timeless wisdom into an architectural deck of exactly <strong>55 cards</strong> built upon the sacred Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55): 52 actionable Purushartha cards across the four cardinal aims of life, plus the <strong className="text-[#1A1817]">Three Transcendent Master Keys (Tattva-Trimurti)</strong>.
        </p>
      </div>

      {/* The 4 Purusharthas Grid */}
      <div className="space-y-3">
        <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817] text-center">
          The Four Suits &amp; Cardinal Aims of Life
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dharma */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#2B2927]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#2B2927]">♠</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#2B2927]">
                Dharma · Spades
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Soul Purpose, Moral Authority, Right Action, Core Duty. 13 cards mapped to Janma Lagna, Varnada Lagnas, Sphutas, and Sovereign Grahas (Surya, Guru, Mangala).
            </p>
          </div>

          {/* Artha */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#7A1C1C]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#7A1C1C]">♦</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#7A1C1C]">
                Artha · Diamonds
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Sustenance, Physical Form, Material Stewardship, Compounding Enterprise. 13 cards mapped to Indu Lagna (The Vault), Hora Lagna, Sree Lagna, and Sovereign Grahas (Shani, Budha).
            </p>
          </div>

          {/* Kama */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#7A1C1C]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#7A1C1C]">♥</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#7A1C1C]">
                Kama · Hearts
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Desire, Deep Kinship, Aesthetic Refinement, Relational Mirroring. 13 cards mapped to Tithi Sphuta (The Lunar Tide), Kaala, and Sovereign Grahas (Chandra, Shukra, Rahu).
            </p>
          </div>

          {/* Moksha */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#2B2927]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#2B2927]">♣</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#2B2927]">
                Moksha · Clubs
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Karmic Resolution, Ego Dissolution, Shadow Purification, Ultimate Liberation. 13 cards mapped to Sacred Surrender, Gulika, Mandi, and Sovereign Grahas (Ketu, Kunda Sphuta).
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Transcendent Master Keys */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/35 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-[#8C6D3B]">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
          <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817]">
            The Three Transcendent Master Keys (Tattva-Trimurti)
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs text-[#1A1817]/75 leading-relaxed">
          Outside the four standard suits sit three master archetypes representing fundamental structural axes of consciousness:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key 0: Arudha Lagna (AL)
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Mirror of Maya · Field of Perception. Controls how consciousness reflects into the material world and visible reputation.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key I: Bija Sphuta
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Solar Generative Fire · The Masculine Principle of Origin. The creative seed and active generative potency required to initiate form.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key II: Kshetra Sphuta
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Lunar Receptive Soil · The Feminine Matrix of Gestation. Fertile grounding, receptivity, and the essential matrix of embodiment.
            </p>
          </div>
        </div>
      </div>

      {/* Enter Deck Action */}
      <div className="text-center pt-2">
        <Link
          to="/"
          className="inline-block py-2.5 px-7 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
        >
          Enter Your Birth Sky
        </Link>
      </div>
    </div>
  );
};
