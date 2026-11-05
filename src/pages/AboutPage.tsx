import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Crown, Shield } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[#8C6D3B] text-3xl select-none">✦</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1817]">
          About Parrot Cards
        </h1>
        <p className="font-serif italic text-lg text-[#8C6D3B]">
          "Sovereign Identity Reclamation System (52 Purushartha Cards + 3 Transcendent Master Keys)"
        </p>
      </div>

      {/* Main Philosophy */}
      <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-[#1A1817]/80 leading-relaxed text-sm sm:text-base">
        <p>
          At the exact moment of inception, the subtle human vessel carries a unique structural geometry of stars, grahas, and mathematical intersections. In ancient Indian Vedic tradition, Shuka (the sacred parrot)—son of Sage Vyasa—represents the ultimate ideal of conscious perception: an unblemished mirror reflecting the seeker's authentic cosmic signature with absolute clarity.
        </p>
        <p>
          <strong>Parrot Cards</strong> translates this timeless wisdom into an architectural deck of exactly <strong>55 cards</strong> built upon the sacred Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55): 52 actionable Purushartha cards across the four cardinal aims of life, plus the <strong>Three Transcendent Master Keys (Tattva-Trimurti)</strong>.
        </p>
      </div>

      {/* The 4 Purusharthas Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1A1817] text-center">
          The Four Suits & Cardinal Aims of Life
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#2B2927]/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-[#2B2927]">♠</span>
              <h3 className="font-serif text-xl font-bold text-[#2B2927]">Dharma · Spades</h3>
            </div>
            <p className="text-xs text-[#1A1817]/70 leading-relaxed">
              <strong>Core Focus:</strong> Soul Purpose, Moral Authority, Right Action, Core Duty. 13 cards mapped to Janma Lagna, Varnada Lagnas, Sphutas, and Sovereign Grahas (Surya, Guru, Mangala).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#7A1C1C]/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-[#7A1C1C]">♦</span>
              <h3 className="font-serif text-xl font-bold text-[#7A1C1C]">Artha · Diamonds</h3>
            </div>
            <p className="text-xs text-[#1A1817]/70 leading-relaxed">
              <strong>Core Focus:</strong> Sustenance, Physical Form, Material Stewardship, Compounding Enterprise. 13 cards mapped to Indu Lagna (The Vault), Hora Lagna, Sree Lagna, and Sovereign Grahas (Shani, Budha).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#7A1C1C]/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-[#7A1C1C]">♥</span>
              <h3 className="font-serif text-xl font-bold text-[#7A1C1C]">Kama · Hearts</h3>
            </div>
            <p className="text-xs text-[#1A1817]/70 leading-relaxed">
              <strong>Core Focus:</strong> Desire, Deep Kinship, Aesthetic Refinement, Relational Mirroring. 13 cards mapped to Tithi Sphuta (The Lunar Tide), Kaala, and Sovereign Grahas (Chandra, Shukra, Rahu).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#2B2927]/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-[#2B2927]">♣</span>
              <h3 className="font-serif text-xl font-bold text-[#2B2927]">Moksha · Clubs</h3>
            </div>
            <p className="text-xs text-[#1A1817]/70 leading-relaxed">
              <strong>Core Focus:</strong> Karmic Resolution, Ego Dissolution, Shadow Purification, Ultimate Liberation. 13 cards mapped to Sacred Surrender, Gulika, Mandi, and Sovereign Grahas (Ketu, Kunda Sphuta).
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Transcendent Master Keys */}
      <div className="p-8 rounded-3xl bg-[#FFFDF9] border-2 border-[#8C6D3B]/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-[#8C6D3B]">
          <Crown className="w-6 h-6" />
          <h2 className="font-serif text-2xl font-bold text-[#1A1817]">The Three Transcendent Master Keys (Tattva-Trimurti)</h2>
        </div>
        <p className="text-xs text-[#1A1817]/70 leading-relaxed">
          Outside the four standard suits sit three master archetypes representing fundamental structural axes of consciousness:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-serif text-sm">Key 0: Arudha Lagna (AL)</span>
            <p className="text-[#1A1817]/70 text-[11px] leading-relaxed">
              The Mirror of Maya · Field of Perception. Controls how consciousness reflects into the material world and visible reputation.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-serif text-sm">Key I: Bija Sphuta</span>
            <p className="text-[#1A1817]/70 text-[11px] leading-relaxed">
              The Solar Generative Fire · The Masculine Principle of Origin. The creative seed and active generative potency required to initiate form.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-serif text-sm">Key II: Kshetra Sphuta</span>
            <p className="text-[#1A1817]/70 text-[11px] leading-relaxed">
              The Lunar Receptive Soil · The Feminine Matrix of Gestation. Fertile grounding, receptivity, and the essential matrix of embodiment.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-block py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition-all"
        >
          Enter Your Birth Sky
        </Link>
      </div>
    </div>
  );
};
