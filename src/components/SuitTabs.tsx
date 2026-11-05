import React from 'react';
import { CardSuit } from '../types';
import { useDeck } from '../context/DeckContext';

export const SUIT_METADATA: Record<
  CardSuit,
  { name: string; subtitle: string; symbol: string; color: string; red: boolean }
> = {
  Dharma: { name: 'Dharma', subtitle: 'Purpose ✦', symbol: '♠', color: '#2B2927', red: false },
  Artha: { name: 'Artha', subtitle: 'Power ✦', symbol: '♦', color: '#7A1C1C', red: true },
  Kama: { name: 'Kama', subtitle: 'Feeling ✦', symbol: '♥', color: '#7A1C1C', red: true },
  Moksha: { name: 'Moksha', subtitle: 'Freedom ✦', symbol: '♣', color: '#2B2927', red: false },
  MasterKey: { name: 'Master Keys', subtitle: 'Sovereign ✦', symbol: '✦', color: '#8C6D3B', red: false },
};

export const SuitTabs: React.FC = () => {
  const { selectedSuit, setSelectedSuit, cardsOfSuit, revealedCardKeys } = useDeck();
  const suits: CardSuit[] = ['Dharma', 'Artha', 'Kama', 'Moksha', 'MasterKey'];

  return (
    <div className="flex items-center gap-3 overflow-x-auto px-4 py-2 no-scrollbar max-w-4xl mx-auto justify-start sm:justify-center">
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
                    background: 'linear-gradient(135deg, #2D2722 0%, #1A1715 100%)',
                    borderColor: '#8C6D3B',
                    boxShadow: '0 4px 16px rgba(140, 109, 59, 0.35), inset 0 0 10px rgba(140, 109, 59, 0.2)',
                  }
                : {
                    backgroundColor: 'rgba(250, 245, 238, 0.92)',
                    borderColor: 'rgba(140, 109, 59, 0.3)',
                    boxShadow: '0 2px 8px rgba(80, 60, 30, 0.06)',
                  }
            }
            className="flex-shrink-0 flex items-center gap-3.5 px-4 sm:px-5 py-2.5 rounded-2xl border transition-all text-left group hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span
              style={{ color: isSelected ? '#E6C98F' : meta.color }}
              className="text-xl sm:text-2xl font-serif leading-none transition-transform group-hover:scale-110 font-bold"
            >
              {meta.symbol}
            </span>
            <div className="leading-tight">
              <div
                style={{ color: isSelected ? '#E6C98F' : '#1A1817' }}
                className="text-xs sm:text-[13px] font-cinzel font-bold tracking-wider"
              >
                {meta.name}
              </div>
              <div
                style={{ color: isSelected ? '#C2AA7A' : '#73582D' }}
                className="text-[10px] sm:text-[11px] flex items-center gap-1 font-serif mt-0.5"
              >
                <span>{meta.subtitle}</span>
                <span>·</span>
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
