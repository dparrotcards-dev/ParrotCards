import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">Terms of Service</h1>
        <p className="text-xs text-[#8C6D3B] font-mono">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-[#1A1817]/80 leading-relaxed shadow-xl">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">1. Nature of the Service</h2>
          <p>
            Parrot Cards is an educational and reflective self-discovery application rooted in authentic Indian Vedic astronomical principles. The insights, reflections, and Sovereign Avatar phrases are provided for self-inquiry, philosophical inspiration, and contemplative exploration. They should not substitute for licensed medical, psychological, legal, or financial counsel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">2. Digital Goods & Entitlements</h2>
          <p>
            The first three cards (Lagna, Sun, Moon) are permanently free to access. Individual card unlocks (₹2) grant lifetime access to that specific card archetype. The 30-Day Complete Deck Pass (₹25) grants all-access to all 55 cards and 3 Master Keys for a 30-day period from the date of verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">3. Fair Use & Intellectual Property</h2>
          <p>
            All custom artwork, card texts, formulas, and deck presentations are the intellectual property of Parrot Cards. Users may not systematically scrape, reproduce, or resell card content commercially without express permission.
          </p>
        </section>
      </div>
    </div>
  );
};
