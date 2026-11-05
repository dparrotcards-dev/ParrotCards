import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StarrySky } from '../components/StarrySky';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDeck = location.pathname === '/deck';

  const bgStyle = isHome
    ? { backgroundImage: "url('/parchment_bg_v2.jpg')" }
    : isDeck
    ? { backgroundImage: "url('/deck_bg.jpg')" }
    : undefined;

  return (
    <div
      className={`relative min-h-screen flex flex-col text-[#1A1817] selection:bg-[#8C6D3B]/20 selection:text-[#8C6D3B] ${
        isHome || isDeck
          ? 'bg-[#FAF6EE] bg-cover bg-center bg-no-repeat'
          : 'bg-[#FAF7F2] bg-parchment-pattern'
      }`}
      style={bgStyle}
    >
      {/* Dynamic Celestial Sky Background */}
      {!isHome && !isDeck && <StarrySky />}

      {/* Main Top Navigation */}
      {!isDeck && <Navbar isHome={isHome} />}

      {/* Dynamic Route Content */}
      <main className="relative flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      {/* Footer */}
      {!isDeck && <Footer isHome={isHome} />}
    </div>
  );
};
