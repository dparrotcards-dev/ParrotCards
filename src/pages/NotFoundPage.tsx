import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <section className="flex-1 px-4 py-16 text-center" aria-labelledby="not-found-title">
    <p className="font-cinzel text-sm font-bold uppercase tracking-[0.2em] text-[#8C6D3B]">
      404
    </p>
    <h1 id="not-found-title" className="mt-2 font-cinzel text-2xl font-bold text-[#1A1817]">
      Page not found
    </h1>
    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6B635B]">
      This Parrot Cards page may have moved, or the address may be incorrect.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex rounded-xl bg-[#8C6D3B] px-5 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-white hover:brightness-105"
    >
      Return to Parrot Cards
    </Link>
  </section>
);
