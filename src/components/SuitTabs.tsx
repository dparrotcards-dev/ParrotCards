import React from 'react';
import { CardSuit } from '../types';
import { useDeck } from '../context/DeckContext';

export const SUIT_METADATA: Record<
  CardSuit,
  { name: string; subtitle: string; symbol: string; color: string; red: boolean }
> = {
  Dharma: { name: 'DHARMA', subtitle: 'PURPOSE', symbol: '♠', color: '#2B2927', red: false },
  Artha: { name: 'ARTHA', subtitle: 'POWER', symbol: '♦', color: '#7A1C1C', red: true },
  Kama: { name: 'KAMA', subtitle: 'FEELING', symbol: '♥', color: '#7A1C1C', red: true },
  Moksha: { name: 'MOKSHA', subtitle: 'FREEDOM', symbol: '♣', color: '#2B2927', red: false },
  MasterKey: { name: 'MASTER KEYS', subtitle: 'SOVEREIGN', symbol: '✦', color: '#8C6D3B', red: false },
};

export const SuitTabs: React.FC = () => {
  const { selectedSuit, setSelectedSuit, cardsOfSuit, revealedCardKeys } = useDeck();
  const suits: CardSuit[] = ['Dharma', 'Artha', 'Kama', 'Moksha', 'MasterKey'];

  return (
    <div className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto px-3 sm:px-4 py-1 sm:py-1.5 no-scrollbar max-w-4xl mx-auto justify-start sm:justify-center snap-x snap-mandatory touch-pan-x">
      {suits.map((suit) => {
        const meta = SUIT_METADATA[suit];
        const suitCards = cardsOfSuit(suit);
        const revealedCount = suitCards.filter((c) => revealedCardKeys.has(c.key)).length;
        const isSelected = selectedSuit === suit;

        return (
          <button
            key={suit}
            onClick={() => setSelectedSuit(suit)}
            style={
              isSelected
                ? {
                    background: 'linear-gradient(135deg, #24201D 0%, #161412 100%)',
                    borderColor: '#8C6D3B',
                    boxShadow: '0 4px 16px rgba(140, 109, 59, 0.32), inset 0 0 10px rgba(140, 109, 59, 0.18)',
                  }
                : {
                    backgroundColor: 'rgba(250, 245, 238, 0.95)',
                    borderColor: 'rgba(140, 109, 59, 0.32)',
                    boxShadow: '0 2px 8px rgba(80, 60, 30, 0.06)',
                  }
            }
            className="flex-shrink-0 snap-center flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all text-left group hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span
              style={{ color: isSelected ? '#E6C98F' : meta.color }}
              className="text-lg sm:text-xl font-serif leading-none transition-transform group-hover:scale-110 font-bold"
            >
              {meta.symbol}
            </span>
            <div className="leading-tight">
              <div
                style={{ color: isSelected ? '#E6C98F' : '#1A1817' }}
                className="text-[11px] sm:text-xs font-cinzel font-bold tracking-wider"
              >
                {meta.name}
              </div>
              <div
                style={{ color: isSelected ? '#C2AA7A' : '#6B635B' }}
                className="text-[9px] sm:text-[10px] flex items-center gap-1 font-serif mt-0.5 tracking-tight"
              >
                <span className="font-cinzel tracking-wider">{meta.subtitle}</span>
                <span className="text-[7.5px] text-[#8C6D3B]">✦</span>
                <span className="font-mono font-semibold">
                  {revealedCount}/{suitCards.length}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
