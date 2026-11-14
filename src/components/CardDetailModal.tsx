import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Compass, Lightbulb, Target, BookOpen, Lock } from 'lucide-react';
import { ICard } from '../types';
import { deckService } from '../services/deckService';
import { useDeck } from '../context/DeckContext';
import { SUIT_METADATA } from './SuitTabs';

interface CardDetailModalProps {
  card: ICard | null;
  onClose: () => void;
  onUnlock?: (card: ICard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUnlock }) => {
  const { profile, deck } = useDeck();
  const [loading, setLoading] = useState<boolean>(true);
  const [interpretation, setInterpretation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const cardPrice = 2;

  useEffect(() => {
    if (!card) return;

    if (!card.isUnlocked) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    deckService
      .getCardInterpretation(card.key, deck?._id, profile?.name || 'Seeker')
      .then((data) => {
        if (isMounted) {
          setInterpretation(data.interpretation);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [card, deck, profile]);

  if (!card) return null;

  const suitMeta = SUIT_METADATA[card.suit] || SUIT_METADATA.Dharma;
  const astro = card.astronomicalPlacement || {};

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-[#1A1817]/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF7F2] border-2 border-[#8C6D3B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1A1817] space-y-6 my-auto max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-[#F2ECE1] hover:bg-[#EAE1D2] text-[#6B635B] hover:text-[#1A1817] border border-[#8C6D3B]/25 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <span
            style={{ color: suitMeta.color }}
            className="w-12 h-12 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 flex items-center justify-center font-serif text-2xl font-bold shadow-xs"
          >
            {suitMeta.symbol}
          </span>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold font-cinzel" style={{ color: suitMeta.color }}>
              {card.suit} · {card.label} ({card.rank})
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#8C6D3B]">{card.title}</h2>
          </div>
        </div>

        {/* Card Line Quote */}
        {card.line && (
          <div className="p-4 rounded-2xl bg-[#F2ECE1] border-l-4 border-[#8C6D3B] font-serif italic text-base sm:text-lg text-[#1A1817]">
            "{card.line}"
          </div>
        )}

        {/* Locked State Prompt */}
        {!card.isUnlocked ? (
          <div className="p-6 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/40 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#8C6D3B]/15 text-[#8C6D3B] flex items-center justify-center mx-auto border border-[#8C6D3B]/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-xl font-bold text-[#8C6D3B]">Card Deep Wisdom is Sealed</h3>
              <p className="text-xs text-[#6B635B] mt-1 max-w-md mx-auto font-serif">
                Unlock this specific card for ₹{cardPrice}, or unlock all 55 cards with a 30-day all-access deck pass for ₹25.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onUnlock?.(card);
              }}
              className="py-2.5 px-6 rounded-xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Unlock Now · ₹{cardPrice}
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-cinzel text-[#8C6D3B] font-semibold">Consulting the Gemini cosmic oracle…</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800">
            Could not fetch detailed interpretation: {error}
          </div>
        ) : (
          /* Interpretation Sections */
          <div className="space-y-6 text-sm">
            {/* Sovereign Avatar Phrase */}
            {interpretation?.sovereignAvatarPhrase && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C6D3B]/10 border border-[#8C6D3B]/30">
                <Sparkles className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span className="font-cinzel text-base text-[#8C6D3B] font-bold">
                  {interpretation.sovereignAvatarPhrase}
                </span>
              </div>
            )}

            {/* Deeper Explanation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                <BookOpen className="w-4 h-4" />
                <span>Cosmic Alignment & Deep Reading</span>
              </div>
              <p className="text-[#3D3833] leading-relaxed whitespace-pre-line text-sm font-serif">
                {interpretation?.deeperExplanation || card.shortSummary}
              </p>
            </div>

            {/* Reflection Prompt */}
            {interpretation?.reflectionPrompt && (
              <div className="p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                  <Lightbulb className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Soul Reflection Inquiry</span>
                </div>
                <p className="font-cormorant italic text-base sm:text-lg text-[#1A1817]">
                  "{interpretation.reflectionPrompt}"
                </p>
              </div>
            )}

            {/* Purushartha Dharma Connection */}
            {interpretation?.dharmaConnection && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#2E5A36] font-cinzel">
                  <Compass className="w-4 h-4" />
                  <span>Dharma & Evolutionary Vector</span>
                </div>
                <p className="text-[#5C5650] text-xs sm:text-sm leading-relaxed font-serif">
                  {interpretation.dharmaConnection}
                </p>
              </div>
            )}

            {/* Practical Action */}
            {interpretation?.practicalAction && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                  <Target className="w-4 h-4" />
                  <span>Grounded Action for Today</span>
                </div>
                <p className="text-[#5C5650] text-xs sm:text-sm leading-relaxed font-serif">
                  {interpretation.practicalAction}
                </p>
              </div>
            )}

            {/* Astronomical Placement Table */}
            <div className="pt-4 border-t border-[#8C6D3B]/20 space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-[#6B635B] font-cinzel">
                Verified Astronomical Data
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Sign</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.signName || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Degree</span>
                  <span className="font-bold text-[#1A1817] font-mono">
                    {astro.deg != null ? `${astro.deg.toFixed(2)}°` : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">House</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.house ? `${astro.house}th House` : '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">House Lord</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.houseLord || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Navamsha (D9)</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.navamshaSignName || (astro.navamshaSign != null ? `Sign ${astro.navamshaSign + 1}` : '—')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Nakshatra</span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {astro.nak ? `${astro.nak} (Pada ${astro.pada ?? 1})` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
