import React, { useRef } from 'react';
import { ICard } from '../types';
import { useDeck } from '../context/DeckContext';
import { SUIT_METADATA } from './SuitTabs';

interface HandFanProps {
  cards: ICard[];
}

export const HandFan: React.FC<HandFanProps> = ({ cards }) => {
  const { selectedCardIndex, setSelectedCardIndex, selectedSuit, revealedCardKeys } = useDeck();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDown = useRef<boolean>(false);

  const n = cards.length;
  const stepAngle = Math.min(5.6, 70 / Math.max(1, n - 1));
  const suitMeta = SUIT_METADATA[selectedSuit] || SUIT_METADATA.Dharma;

  const handlePointerPick = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const progress = Math.max(0, Math.min(1, relativeX / rect.width));
    const targetIndex = Math.min(n - 1, Math.floor(progress * n));
    if (targetIndex !== selectedCardIndex) {
      setSelectedCardIndex(targetIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        isPointerDown.current = true;
        handlePointerPick(e.clientX);
      }}
      onPointerMove={(e) => {
        if (isPointerDown.current) {
          handlePointerPick(e.clientX);
        }
      }}
      onPointerUp={() => {
        isPointerDown.current = false;
      }}
      onPointerLeave={() => {
        isPointerDown.current = false;
      }}
      className="relative w-full h-28 sm:h-32 overflow-visible touch-none select-none flex items-end justify-center pt-7 pb-2"
    >
      <div className="relative w-full max-w-md sm:max-w-lg h-full flex items-end justify-center overflow-visible">
        {cards.map((card, i) => {
          const angle = (i - (n - 1) / 2) * stepAngle;
          const isSelected = i === selectedCardIndex;
          const isRevealed = revealedCardKeys.has(card.key);

          return (
            <div
              key={card.cardId || `${card.suit}_${i}`}
              onClick={() => setSelectedCardIndex(i)}
              style={{
                transform: `rotate(${angle}deg) ${isSelected ? 'translateY(-26px) scale(1.16)' : 'translateY(0)'}`,
                transformOrigin: '50% 280%',
                borderColor: isSelected ? suitMeta.color : 'rgba(140, 109, 59, 0.3)',
                boxShadow: isSelected ? `0 6px 18px rgba(140, 109, 59, 0.35), 0 0 0 1px ${suitMeta.color}` : 'none',
                zIndex: isSelected ? 40 : i + 1,
                transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s',
              }}
              className={`absolute bottom-1 w-14 h-20 -ml-7 rounded-[10px] border flex flex-col items-center justify-center font-serif text-sm cursor-pointer overflow-hidden ${
                isRevealed
                  ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#F2ECE1] text-[#1A1817] shadow-sm'
                  : 'bg-[repeating-linear-gradient(45deg,#24201D_0_4px,#1A1817_4px_8px)] text-[#8C6D3B]'
              }`}
            >
              {/* Sovereign Mini Crown */}
              {card.isSovereign && (
                <span className="absolute top-1 right-1.5 text-[9px] text-[#8C6D3B] font-bold leading-none">
                  ♛
                </span>
              )}

              {isRevealed ? (
                <>
                  <div className="font-bold leading-none flex items-center gap-0.5 font-cinzel">
                    <span>{card.rank}</span>
                    <span style={{ color: suitMeta.red ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#2B2927' }}>
                      {suitMeta.symbol}
                    </span>
                  </div>
                  <span className="text-[7.5px] font-sans font-medium text-[#6B635B] tracking-tight truncate max-w-[46px] mt-1 text-center">
                    {card.label.split(' — ')[0]}
                  </span>
                </>
              ) : (
                <span className="text-[#8C6D3B] text-base">✦</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
