import React, { useRef, useEffect, useState } from 'react';
import { ICard } from '../types';
import { useDeck } from '../context/DeckContext';
import { SUIT_METADATA } from './SuitTabs';

interface HandFanProps {
  cards: ICard[];
}

export const HandFan: React.FC<HandFanProps> = ({ cards }) => {
  const { selectedCardIndex, setSelectedCardIndex, selectedSuit, revealedCardKeys } = useDeck();
  const suitMeta = SUIT_METADATA[selectedSuit] || SUIT_METADATA.Dharma;
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const n = cards.length;
  if (n === 0) return null;

  const mid = (n - 1) / 2;

  // Responsive geometry: On mobile (< 640px), dynamically calculate spacing
  // so that ALL 13 cards fit 100% within the screen width without horizontal scrolling!
  const isMobile = windowWidth < 640;

  // Card dimensions:
  // On mobile (< 640px), compact card width (33px - 38px)
  // On desktop, standard 58px card
  const cardWidth = isMobile
    ? (n > 8 ? (windowWidth < 350 ? 33 : 37) : 44)
    : 58;

  // Available width for the fan spread (leaving 12px padding for screen safety):
  const maxAvailable = isMobile ? Math.max(280, windowWidth - 12) : 580;

  // Calculate card spacing:
  // For 13 cards on mobile, spacing ensures all 13 cards span the viewport edge-to-edge with zero overflow!
  const cardSpacing = isMobile
    ? n > 1
      ? Math.min(n > 8 ? 26.5 : 46, (maxAvailable - cardWidth) / (n - 1))
      : 0
    : n > 8
    ? 38
    : 56;

  const totalWidth = n > 1 ? (n - 1) * cardSpacing + cardWidth : cardWidth;

  const getCardShortName = (card: ICard) => {
    if (card.key === 'Lagna' || card.label.toLowerCase().includes('lagna')) return 'Lagna';
    const clean = card.label.split(' — ')[0].split(' · ')[0].trim();
    if (clean.toLowerCase().startsWith('varnada')) {
      const num = clean.replace(/\D/g, '');
      return num ? `Varnada ${num}` : 'Varnada';
    }
    return clean;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden sm:overflow-x-auto no-scrollbar py-0.5 sm:py-1 px-1 sm:px-4 flex justify-center items-end select-none"
    >
      <div
        className="relative flex items-end justify-center my-0"
        style={{
          width: `${totalWidth}px`,
          height: isMobile ? '68px' : '78px',
        }}
      >
        {cards.map((card, i) => {
          const diff = i - mid;
          // Rotation angle: gentle fan spread
          const angle = diff * (isMobile ? (n > 8 ? 1.3 : 2.6) : n > 8 ? 1.8 : 3.5);
          // Subtle convex arch: center card is at peak, edge cards curve down gently
          const arcY = Math.pow(Math.abs(diff) / (mid || 1), 2) * (isMobile ? 3 : 4.5);
          const isSelected = i === selectedCardIndex;
          const isRevealed = revealedCardKeys.has(card.key) || isSelected;

          // Lift selected card straight up
          const yOffset = isSelected ? (isMobile ? -6 : -8) : arcY;

          return (
            <div
              key={card.cardId || `${card.suit}_${i}`}
              ref={isSelected ? activeCardRef : null}
              onClick={() => setSelectedCardIndex(i)}
              title={`${card.label} (${card.rank})`}
              style={{
                left: `${i * cardSpacing}px`,
                bottom: '1px',
                width: `${cardWidth}px`,
                height: isMobile ? '56px' : '68px',
                transformOrigin: '50% 150%',
                transform: `translateY(${yOffset}px) rotate(${angle}deg) scale(${isSelected ? 1.05 : 1})`,
                zIndex: isSelected ? 50 : i + 1,
                transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s, border-color 0.25s',
              }}
              className={`absolute rounded-lg sm:rounded-xl cursor-pointer overflow-hidden flex flex-col justify-between p-1 sm:p-1.5 transition-all group ${
                isSelected
                  ? 'border-[1.5px] border-[#8C6D3B] bg-[#FFFDF9] shadow-[0_6px_20px_rgba(140,109,59,0.36)]'
                  : 'border border-[#8C6D3B]/40 bg-[#FAF5EE] shadow-[0_2px_6px_rgba(70,50,20,0.06)] hover:border-[#8C6D3B]/80 hover:shadow-md'
              }`}
            >
              {/* Inner hairline */}
              <div className="absolute inset-0.5 sm:inset-1 rounded-md sm:rounded-lg border border-[#8C6D3B]/20 pointer-events-none" />

              {/* Show Face (if revealed or currently selected) OR Card Back (with engraved compass) */}
              {isRevealed ? (
                <div className="w-full h-full flex flex-col justify-between relative z-10 pointer-events-none select-none">
                  {/* Top-left Index */}
                  <div className="leading-none text-left">
                    <span
                      className="font-cinzel font-bold text-[10px] sm:text-xs block leading-none"
                      style={{ color: suitMeta.red ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#1A1817' }}
                    >
                      {card.rank}
                    </span>
                    <span
                      className="text-[8.5px] sm:text-[10px] font-serif leading-none mt-0.5 block"
                      style={{ color: suitMeta.red ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#1A1817' }}
                    >
                      {suitMeta.symbol}
                    </span>
                  </div>

                  {/* Center Label (e.g. Lagna, Surya, Chandra) */}
                  <div className="my-auto text-center px-0.5">
                    <span className="font-cinzel text-[7px] sm:text-[8.5px] font-bold text-[#1A1817] leading-tight block truncate uppercase tracking-wider">
                      {getCardShortName(card)}
                    </span>
                  </div>

                  {/* Bottom-right Inverted Index */}
                  <div className="leading-none text-right rotate-180">
                    <span
                      className="font-cinzel font-bold text-[10px] sm:text-xs block leading-none"
                      style={{ color: suitMeta.red ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#1A1817' }}
                    >
                      {card.rank}
                    </span>
                    <span
                      className="text-[8.5px] sm:text-[10px] font-serif leading-none mt-0.5 block"
                      style={{ color: suitMeta.red ? '#7A1C1C' : card.suit === 'MasterKey' ? '#8C6D3B' : '#1A1817' }}
                    >
                      {suitMeta.symbol}
                    </span>
                  </div>
                </div>
              ) : (
                /* Card Back: Exact Vintage Celestial Compass Engraving */
                <div className="w-full h-full flex items-center justify-center relative z-10 pointer-events-none select-none">
                  <svg width={isMobile ? "24" : "36"} height={isMobile ? "24" : "36"} viewBox="0 0 100 100" className="text-[#8C6D3B]/45">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="6" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="19" y1="19" x2="81" y2="81" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1="19" y1="81" x2="81" y2="19" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
                    <circle cx="50" cy="50" r="2.5" fill="#8C6D3B" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
