import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  Compass,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';

const SUITS = [
  {
    name: 'Dharma',
    symbol: '♠',
    title: 'Purpose & right action',
    description: 'Explore the values and direction that shape the way you move through life.',
    tone: 'text-[#393631] border-[#393631]/20',
  },
  {
    name: 'Artha',
    symbol: '♦',
    title: 'Growth & stewardship',
    description: 'Reflect on how you build, sustain and care for what matters.',
    tone: 'text-[#8A3B32] border-[#8A3B32]/20',
  },
  {
    name: 'Kama',
    symbol: '♥',
    title: 'Connection & desire',
    description: 'Consider the relationships, creativity and experiences that call to you.',
    tone: 'text-[#8A3B32] border-[#8A3B32]/20',
  },
  {
    name: 'Moksha',
    symbol: '♣',
    title: 'Release & reflection',
    description: 'Make room for perspective, inner clarity and meaningful change.',
    tone: 'text-[#393631] border-[#393631]/20',
  },
];

const STEPS = [
  {
    number: '01',
    icon: Compass,
    title: 'Share your birth details',
    description: 'Enter your birth date, time and place to begin your personal chart.',
  },
  {
    number: '02',
    icon: Sun,
    title: 'Map your birth sky',
    description: 'Your chart is used to shape a deck of Vedic-inspired card archetypes.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Explore at your pace',
    description: 'Move through the cards as a prompt for personal reflection.',
  },
];

export const LandingPage: React.FC = () => (
  <div className="flex-1 w-full px-4 pb-10 pt-4 sm:px-6 sm:pt-8 lg:px-8">
    <div className="mx-auto w-full max-w-6xl space-y-12 sm:space-y-16">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-[#8C6D3B]/30 bg-[#F8F1E5] shadow-[0_16px_50px_rgba(80,60,30,0.12)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[url('/deck_bg.jpg')] bg-cover bg-center opacity-70"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FAF6EE]/95 via-[#FAF6EE]/85 to-[#FAF6EE]/45" />

        <div className="grid min-h-[440px] items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8C6D3B]/30 bg-[#FFFDF9]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#73582D] sm:text-xs">
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-[#B8934E]/30" />
              A personal journey through your birth sky
            </div>
            <h1 className="max-w-xl font-cinzel text-3xl font-semibold leading-tight tracking-wide text-[#211B14] sm:text-4xl lg:text-5xl">
              Meet the patterns written in your sky.
            </h1>
            <p className="mt-5 max-w-xl font-cormorant text-lg leading-relaxed text-[#554A3B] sm:text-xl">
              Parrot Cards turns your birth-chart details into a 55-card collection of Vedic-inspired archetypes—made for curiosity, reflection and self-discovery.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/birth-details"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#73582D] px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] sm:text-sm"
              >
                Create my deck
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#8C6D3B]/35 bg-[#FFFDF9]/75 px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.1em] text-[#55452D] transition hover:bg-white sm:text-sm"
              >
                How it works
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#6B635B]">
              A reflective experience, not a substitute for professional advice or a guarantee of outcomes.
            </p>
          </div>

          <div aria-label="Illustration of the Parrot Cards deck" className="relative mx-auto flex h-64 w-full max-w-[390px] items-center justify-center sm:h-72 lg:h-[330px]">
            <div aria-hidden="true" className="absolute h-56 w-56 rounded-full border border-[#9A7130]/25 sm:h-64 sm:w-64" />
            <div aria-hidden="true" className="absolute h-64 w-64 rounded-full border border-[#9A7130]/15 sm:h-72 sm:w-72" />
            <div className="absolute left-[13%] top-[20%] flex h-[68%] w-[43%] -rotate-[13deg] flex-col items-center justify-between rounded-[1.2rem] border border-[#8C6D3B]/45 bg-[#FBF6ED] p-3 text-center shadow-[0_18px_40px_rgba(45,34,19,0.2)] sm:p-4">
              <span className="self-start font-cinzel text-lg font-bold text-[#73582D]">A</span>
              <span className="font-serif text-5xl text-[#8C6D3B]">♠</span>
              <span className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.18em] text-[#73582D]">Purpose</span>
            </div>
            <div className="absolute right-[13%] top-[14%] flex h-[68%] w-[43%] rotate-[13deg] flex-col items-center justify-between rounded-[1.2rem] border border-[#8C6D3B]/55 bg-[#F2E7D5] p-3 text-center shadow-[0_18px_40px_rgba(45,34,19,0.17)] sm:p-4">
              <span className="self-start font-cinzel text-lg font-bold text-[#8A3B32]">K</span>
              <div className="flex flex-col items-center gap-1">
                <Sparkles aria-hidden="true" className="h-8 w-8 text-[#9A7130]" strokeWidth={1.2} />
                <span className="font-serif text-4xl text-[#8A3B32]">♥</span>
              </div>
              <span className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.18em] text-[#73582D]">Connection</span>
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-[#8C6D3B]/25 bg-[#FFFDF9]/90 px-4 py-1.5 font-cinzel text-[9px] font-bold uppercase tracking-[0.18em] text-[#73582D] shadow-sm sm:text-[10px]">
              55 cards · one personal sky
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Parrot Cards deck highlights" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ['55', 'cards in the complete archetype deck'],
          ['4', 'suits inspired by the Purusharthas'],
          ['3', 'transcendent Master Keys'],
        ].map(([value, label]) => (
          <div key={value} className="flex items-center gap-4 rounded-2xl border border-[#8C6D3B]/20 bg-[#FFFDF9]/85 px-5 py-4 shadow-sm sm:justify-center sm:px-4">
            <span className="font-cinzel text-3xl font-bold text-[#8C6D3B]">{value}</span>
            <span className="max-w-[190px] text-xs leading-relaxed text-[#5C5142]">{label}</span>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D3B]">Four paths of reflection</span>
          <h2 className="font-cinzel text-2xl font-semibold text-[#211B14] sm:text-3xl">A deck shaped around life’s big questions.</h2>
          <p className="text-sm leading-relaxed text-[#6B635B]">Each suit offers a different lens. Explore the complete philosophy on the About page.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUITS.map((suit) => (
            <article key={suit.name} className={`rounded-2xl border bg-[#FFFDF9]/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${suit.tone}`}>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="font-serif text-3xl">{suit.symbol}</span>
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-[0.12em]">{suit.name}</h3>
              </div>
              <p className="mt-4 font-serif text-lg font-semibold text-[#211B14]">{suit.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#6B635B]">{suit.description}</p>
            </article>
          ))}
        </div>
        <div className="text-center">
          <Link to="/about" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73582D] underline decoration-[#8C6D3B]/40 underline-offset-4 transition hover:text-[#1A1817]">
            Explore the Parrot Cards philosophy <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 rounded-[1.75rem] border border-[#8C6D3B]/20 bg-[#F2ECE1]/80 px-5 py-8 sm:px-9 sm:py-10">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D3B]">Your journey</span>
          <h2 className="font-cinzel text-2xl font-semibold text-[#211B14] sm:text-3xl">Begin with the sky you were born under.</h2>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="rounded-2xl border border-[#8C6D3B]/15 bg-[#FFFDF9]/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs font-bold tracking-widest text-[#9A7130]">{step.number}</span>
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#8C6D3B]" strokeWidth={1.6} />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-[#211B14]">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6B635B]">{step.description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-7 text-center">
          <Link
            to="/birth-details"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#8C6D3B] px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:bg-[#73582D] active:scale-[0.99] sm:text-sm"
          >
            Start your birth sky reading
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  </div>
);
