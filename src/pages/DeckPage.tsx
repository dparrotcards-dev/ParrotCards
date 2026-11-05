import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Plus, Sparkles, Crown } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { SuitTabs } from '../components/SuitTabs';
import { Card3D } from '../components/Card3D';
import { HandFan } from '../components/HandFan';
import { CardDetailModal } from '../components/CardDetailModal';
import { UnlockModal } from '../components/UnlockModal';
import { ICard } from '../types';

export const DeckPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    deck,
    cards,
    selectedSuit,
    selectedCardIndex,
    setSelectedCardIndex,
    selectedCard,
    revealedCardKeys,
    cardsOfSuit,
  } = useDeck();

  const [activeModalCard, setActiveModalCard] = useState<ICard | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [unlockTargetCard, setUnlockTargetCard] = useState<ICard | null>(null);
  const [unlockMode, setUnlockMode] = useState<'CARD' | 'PASS'>('CARD');

  // If no deck generated yet, guide user back to entry
  useEffect(() => {
    if (!profile || cards.length === 0) {
      navigate('/');
    }
  }, [profile, cards, navigate]);

  const currentSuitCards = cardsOfSuit(selectedSuit);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const next = (selectedCardIndex + 1) % currentSuitCards.length;
        setSelectedCardIndex(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = (selectedCardIndex - 1 + currentSuitCards.length) % currentSuitCards.length;
        setSelectedCardIndex(prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCardIndex, currentSuitCards, setSelectedCardIndex]);

  const handleNext = () => {
    const next = (selectedCardIndex + 1) % currentSuitCards.length;
    setSelectedCardIndex(next);
  };

  const handlePrev = () => {
    const prev = (selectedCardIndex - 1 + currentSuitCards.length) % currentSuitCards.length;
    setSelectedCardIndex(prev);
  };

  const handleDownloadRaw = () => {
    if (!deck) return;
    const blob = new Blob([JSON.stringify({ profile, deck, cards }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parrot-cards-deck-${profile?.name.replace(/\s+/g, '_') || 'sky'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenUnlock = (card: ICard, mode: 'CARD' | 'PASS' = 'CARD') => {
    setUnlockTargetCard(card);
    setUnlockMode(mode);
    setUnlockModalOpen(true);
  };

  if (!selectedCard) {
    return null;
  }

  return (
    <div className="h-screen w-full flex flex-col justify-between select-none overflow-hidden pb-4">
      {/* Top Status & Controls Bar Matching Reference Image */}
      <div className="w-full flex items-center justify-between px-6 sm:px-12 py-3.5 border-b border-[#8C6D3B]/20 bg-[#FAF7F2]/40 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-lg sm:text-xl text-[#1A1817] font-bold tracking-wide">
            {profile?.name || 'Seeker'}
          </span>
          {deck?.avatarPhrase && (
            <Link
              to="/avatar"
              className="flex items-center gap-1 text-xs sm:text-sm text-[#73582D] hover:text-[#1A1817] italic font-cormorant font-medium transition-colors"
            >
              <span>· {deck.avatarPhrase}</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm">
          <div className="flex items-center gap-1 font-cinzel text-[#1A1817]">
            <span className="text-[#595147] font-medium">Revealed</span>
            <span className="font-bold text-[#1A1817] ml-1">{revealedCardKeys.size}</span>
            <span className="text-[#8C6D3B]/70">/</span>
            <span className="font-bold text-[#1A1817]">55</span>
          </div>
          <button
            onClick={handleDownloadRaw}
            className="flex items-center gap-1 text-[#73582D] hover:text-[#1A1817] text-xs sm:text-sm font-cormorant font-semibold transition-colors cursor-pointer"
            title="Download Raw Astrological Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span>raw</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-1 text-[#73582D] hover:text-[#1A1817] text-xs sm:text-sm font-cormorant font-semibold transition-colors"
            title="New Reading"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>new</span>
          </Link>
        </div>
      </div>

      {/* Suit / Category Navigation Tabs */}
      <div className="pt-2 pb-1">
        <SuitTabs />
      </div>

      {/* Stage: Interactive 3D Card with Navigation Controls */}
      <div className="flex-1 relative flex items-center justify-center px-4 sm:px-8 py-2 min-h-0">
        {/* Left Navigation Chevron Button (Pill style matching Image 1 & 2) */}
        <button
          onClick={handlePrev}
          aria-label="Previous card"
          className="absolute left-4 sm:left-12 lg:left-24 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FAF5EE]/90 border border-[#8C6D3B]/40 text-[#8C6D3B] hover:border-[#8C6D3B] hover:bg-[#FAF5EE] hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>

        {/* 3D Card Stage */}
        <div className="w-full flex justify-center items-center py-2">
          <Card3D
            key={selectedCard._id || selectedCard.key}
            card={selectedCard}
            onOpenDetail={(c) => setActiveModalCard(c)}
            onUnlock={(c) => handleOpenUnlock(c, 'CARD')}
            onUnlockPass={() => handleOpenUnlock(selectedCard, 'PASS')}
          />
        </div>

        {/* Right Navigation Chevron Button (Pill style matching Image 1 & 2) */}
        <button
          onClick={handleNext}
          aria-label="Next card"
          className="absolute right-4 sm:right-12 lg:right-24 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FAF5EE]/90 border border-[#8C6D3B]/40 text-[#8C6D3B] hover:border-[#8C6D3B] hover:bg-[#FAF5EE] hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" strokeWidth={1.75} />
        </button>
      </div>

      {/* Deep Reading Modal */}
      {activeModalCard && (
        <CardDetailModal
          card={activeModalCard}
          onClose={() => setActiveModalCard(null)}
          onUnlock={(c) => handleOpenUnlock(c, 'CARD')}
        />
      )}

      {/* Unlock & Checkout Modal */}
      {unlockModalOpen && (
        <UnlockModal
          card={unlockTargetCard}
          mode={unlockMode}
          onClose={() => setUnlockModalOpen(false)}
        />
      )}
    </div>
  );
};
