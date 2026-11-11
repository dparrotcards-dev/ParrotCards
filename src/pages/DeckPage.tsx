import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Crown } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { SuitTabs } from '../components/SuitTabs';
import { Card3D } from '../components/Card3D';
import { HandFan } from '../components/HandFan';
import { CardDetailModal } from '../components/CardDetailModal';
import { UnlockModal } from '../components/UnlockModal';
import { ICard } from '../types';
import { api } from '../services/api';
import { deckService } from '../services/deckService';

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
    setProfileAndDeck,
  } = useDeck();

  const [activeModalCard, setActiveModalCard] = useState<ICard | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [unlockTargetCard, setUnlockTargetCard] = useState<ICard | null>(null);
  const [unlockMode, setUnlockMode] = useState<'CARD' | 'PASS'>('CARD');

  // If no deck generated yet, try to load user's saved deck or guide back to entry
  useEffect(() => {
    if (!profile || cards.length === 0) {
      api
        .get('/account')
        .then(async (res) => {
          const decks = res.data?.data?.decks;
          if (Array.isArray(decks) && decks.length > 0) {
            const latest = decks[0];
            const data = await deckService.getDeckCards(latest._id);
            setProfileAndDeck(latest.profileId, latest, data.cards, data.entitlements);
          } else {
            navigate('/');
          }
        })
        .catch(() => {
          navigate('/');
        });
    }
  }, [profile, cards.length, navigate, setProfileAndDeck]);

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

  // Mobile Touch Swipe Handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger only if horizontal swipe dominates and exceeds threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
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
    <div className="flex-1 w-full flex flex-col justify-between select-none overflow-hidden pb-0.5 min-h-0">
      {/* Top Status & Controls Bar Matching Reference Image */}
      <div className="w-full flex items-center justify-between px-3 sm:px-6 md:px-12 py-1 border-b border-[#8C6D3B]/20 bg-[#FAF7F2]/40 backdrop-blur-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-cinzel text-xs sm:text-base text-[#1A1817] font-bold tracking-[0.14em] uppercase truncate max-w-[130px] xs:max-w-[190px] sm:max-w-none">
            {profile?.name ? profile.name.toUpperCase() : 'VARUN MENARIYA'}
          </span>
        </div>

        <div className="flex items-center text-xs shrink-0">
          <div className="flex items-center gap-1 font-cinzel text-[#1A1817]">
            <span className="font-bold text-[#1A1817]">{selectedCardIndex + 1}</span>
            <span className="text-[#8C6D3B]/70">/</span>
            <span className="font-bold text-[#1A1817]">55</span>
          </div>
        </div>
      </div>

      {/* Suit / Category Navigation Tabs */}
      <div className="pt-1 pb-0.5 shrink-0">
        <SuitTabs />
      </div>

      {/* Stage: Interactive 3D Card with Navigation Controls */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 relative flex items-center justify-center px-2 sm:px-12 py-0.5 sm:py-1 min-h-0 touch-pan-y"
      >
        {/* Left Navigation Chevron Button (Circular pill matching Image) */}
        <button
          onClick={handlePrev}
          aria-label="Previous card"
          className="absolute left-1 sm:left-6 lg:left-24 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-[#FAF5EE]/95 border border-[#8C6D3B]/35 text-[#595147] hover:text-[#1A1817] hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
        </button>

        {/* 3D Card Stage */}
        <div className="w-full h-full flex justify-center items-center min-h-0 py-0.5">
          <Card3D
            key={selectedCard._id || selectedCard.key}
            card={selectedCard}
            onOpenDetail={(c) => setActiveModalCard(c)}
            onUnlock={(c) => handleOpenUnlock(c, 'CARD')}
            onUnlockPass={() => handleOpenUnlock(selectedCard, 'PASS')}
          />
        </div>

        {/* Right Navigation Chevron Button (Circular pill matching Image) */}
        <button
          onClick={handleNext}
          aria-label="Next card"
          className="absolute right-1 sm:right-6 lg:right-24 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-[#FAF5EE]/95 border border-[#8C6D3B]/35 text-[#595147] hover:text-[#1A1817] hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Hand Fan Carousel (Fanned Poker Spread Matching Reference Image) */}
      <div className="shrink-0 pt-0.5 pb-0.5 relative z-20">
        <HandFan cards={currentSuitCards} />
      </div>

      {/* Bottom Celestial Moon Hairline Matching Reference Image */}
      <div className="w-full relative flex items-center justify-center py-0.5 select-none shrink-0">
        <div className="absolute inset-x-8 sm:inset-x-24 top-1/2 h-px bg-gradient-to-r from-transparent via-[#8C6D3B]/30 to-transparent" />
        <span className="relative z-10 px-3 bg-[#FAF6EE] text-[#8C6D3B] text-sm leading-none">☾</span>
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
