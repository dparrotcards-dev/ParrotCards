import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StarrySky } from '../components/StarrySky';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDeck = location.pathname === '/deck';
  const isSupport = location.pathname === '/support';
  const isParchment = isHome || isDeck || isSupport;

  const bgStyle = isParchment
    ? { backgroundImage: "url('/parchment_bg_v2.jpg?v=3')" }
    : undefined;

  return (
    <div
      className={`relative flex flex-col text-[#1A1817] selection:bg-[#8C6D3B]/20 selection:text-[#8C6D3B] ${
        isParchment
          ? 'bg-[#FAF6EE] bg-cover bg-center bg-no-repeat'
          : 'bg-[#FAF7F2] bg-parchment-pattern'
      } ${
        isHome || isSupport
          ? 'min-h-[100dvh] lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden justify-between'
          : isDeck
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden justify-between'
          : 'min-h-[100dvh]'
      }`}
      style={bgStyle}
    >
      {/* Dynamic Celestial Sky Background */}
      {!isParchment && <StarrySky />}

      {/* Main Top Navigation */}
      <Navbar isHome={isHome || isSupport} isDeck={isDeck} />

      {/* Dynamic Route Content */}
      <main className={`relative flex-1 flex flex-col min-h-0 ${isHome || isSupport ? 'justify-center' : ''} pb-20 sm:pb-24 lg:pb-0`}>
        <Outlet />
      </main>

      {/* Footer */}
      {!isDeck && !isSupport && <Footer isHome={isHome} />}

      {/* Mobile-first Bottom Navigation Bar (Permanently Fixed on Mobile Across All Pages) */}
      <MobileBottomNav />
    </div>
  );
};
