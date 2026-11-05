import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  isHome?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isHome = false }) => {
  return (
    <footer
      className={`w-full px-4 text-center select-none transition-all ${
        isHome
          ? 'py-1 sm:py-1.5 bg-transparent border-t-0'
          : 'py-3.5 bg-[#FAF7F2]/60 backdrop-blur-[2px] border-t border-[#8C6D3B]/25'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 sm:gap-6 text-xs font-serif text-[#595147]">
        {/* Left Celestial Moon & Line */}
        {!isHome && (
          <div className="hidden md:flex items-center gap-2 text-[#8C6D3B]/70 flex-1 justify-end">
            <span className="text-sm">☾</span>
            <span className="text-xs">✦</span>
            <div className="h-[1px] w-20 lg:w-40 bg-gradient-to-r from-transparent via-[#8C6D3B]/40 to-[#8C6D3B]/60" />
            <span className="text-xs">✦</span>
          </div>
        )}

        {/* Links with delicate pipes */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-[#595147]">
          <Link to="/about" className="hover:text-[#8C6D3B] transition-colors">
            About
          </Link>
          <span className="text-[#8C6D3B]/40">|</span>
          <Link to="/pricing" className="hover:text-[#8C6D3B] transition-colors">
            Pricing
          </Link>
          <span className="text-[#8C6D3B]/40">|</span>
          <Link to="/privacy" className="hover:text-[#8C6D3B] transition-colors">
            Privacy Policy
          </Link>
          <span className="text-[#8C6D3B]/40">|</span>
          <Link to="/terms" className="hover:text-[#8C6D3B] transition-colors">
            Terms of Service
          </Link>
          <span className="text-[#8C6D3B]/40">|</span>
          <Link to="/support" className="hover:text-[#8C6D3B] transition-colors">
            Support
          </Link>
        </div>

        {/* Right Celestial Moon & Line */}
        {!isHome && (
          <div className="hidden md:flex items-center gap-2 text-[#8C6D3B]/70 flex-1 justify-start">
            <span className="text-xs">✦</span>
            <div className="h-[1px] w-20 lg:w-40 bg-gradient-to-l from-transparent via-[#8C6D3B]/40 to-[#8C6D3B]/60" />
            <span className="text-xs">✦</span>
            <span className="text-sm">☽</span>
          </div>
        )}
      </div>
    </footer>
  );
};
