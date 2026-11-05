import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export const AligningSkyLoader: React.FC<LoaderProps> = ({
  message = 'Aligning the sky…',
  subMessage = 'Calculating Vedic planetary alignments & houses',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="relative w-24 h-24 rounded-full border-2 border-[#8C6D3B]/40 animate-spin-slow">
        {/* Top orbiting celestial node */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#8C6D3B] shadow-[0_0_12px_rgba(140,109,59,0.5)]" />
        {/* Bottom orbiting starlight node */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#7A1C1C] shadow-[0_0_12px_rgba(122,28,28,0.4)]" />
        {/* Core pulsating jewel */}
        <div className="absolute inset-4 rounded-full bg-[#F2ECE1] border border-[#8C6D3B]/50 flex items-center justify-center shadow-inner">
          <span className="text-[#8C6D3B] text-lg select-none">✦</span>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1A1817] tracking-wider">{message}</h3>
        {subMessage && (
          <p className="text-xs font-mono text-[#8C6D3B] mt-1.5 tracking-widest uppercase">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};
