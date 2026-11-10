import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Eye,
  KeyRound,
  Layers,
  Moon,
  Sparkles,
} from 'lucide-react';

const dimensions = [
  { name: 'DHARMA', symbol: '♠', color: 'service-suit-dharma', meaning: 'Purpose, Duty & Right Action' },
  { name: 'ARTHA', symbol: '♦', color: 'service-suit-artha', meaning: 'Wealth, Resources & Material Growth' },
  { name: 'KAMA', symbol: '♥', color: 'service-suit-kama', meaning: 'Relationships, Desires & Creative Fulfilment' },
  { name: 'MOKSHA', symbol: '♣', color: 'service-suit-moksha', meaning: 'Liberation, Wisdom & Inner Freedom' },
];

const interpretations = [
  'Rashi Placement (Zodiac Sign)',
  'Exact Degrees (° ′ ″)',
  'Nakshatra & Pada',
  'Nadi Amsha Ruler (Micro-Frequency)',
  'Personalized Avatar Phrase',
];

const masterKeys = [
  { number: '0', title: 'Arudha Lagna', description: 'The Mirror of Maya · Your projected identity & world interface.' },
  { number: 'I', title: 'Bija Sphuta', description: 'The Solar Generative Fire · The seed code of your unique creation.' },
  { number: 'II', title: 'Kshetra Sphuta', description: 'The Lunar Receptive Soil · The field of manifestation & life experience.' },
];

const ActionLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="service-action">
    {children}
    <ArrowRight aria-hidden="true" className="h-4 w-4" />
  </Link>
);

export const ServicesPage: React.FC = () => (
  <div className="services-page relative z-[1] flex-1 px-3 pb-5 pt-4 sm:px-5 lg:px-8">
    <section className="mx-auto max-w-[1160px]">
      <header className="services-heading mx-auto mb-4 max-w-[670px] text-center">
        <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.48em] text-[#79531F]">
          <span aria-hidden="true">✦</span>
          <span>Services</span>
          <span aria-hidden="true">✦</span>
        </div>
        <h1 className="mt-1.5 font-cormorant text-[36px] font-bold leading-[0.96] text-[#2A1D14] sm:text-[44px] lg:text-[50px]">
          Explore Your
          <br />
          Cosmic Architecture
        </h1>
        <p className="mx-auto mt-1.5 max-w-[510px] font-cormorant text-[17px] italic leading-tight text-[#47382D] sm:text-[19px]">
          Discover the deeper dimensions of your identity through
          <br className="hidden sm:block" /> 55 personalized cosmic coordinates.
        </p>
        <div aria-hidden="true" className="services-divider mx-auto mt-2.5 flex max-w-[320px] items-center gap-2 text-[#9A702D]">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#A77C39]" />
          <span className="text-sm">✦</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#A77C39]" />
        </div>
      </header>

      <section aria-label="Our services" className="grid gap-3 lg:grid-cols-2">
        <article className="service-panel service-feature-panel service-cards-panel min-h-[204px]">
          <div className="service-card-stack" aria-hidden="true">
            <div className="service-playing-card service-playing-card-back">✦</div>
            <div className="service-playing-card service-playing-card-middle">♧</div>
            <div className="service-playing-card service-playing-card-front">
              <Sparkles className="h-8 w-8" />
              <span>PARROT<br />CARDS</span>
            </div>
          </div>
          <div className="service-panel-content">
            <div className="service-panel-title">
              <Layers aria-hidden="true" className="h-6 w-6 shrink-0 text-[#9B6C23]" />
              <h2>The 55 Cosmic Cards</h2>
            </div>
            <p className="service-intro">A complete identity mapping system built on sacred mathematical harmony.</p>
            <ul className="service-check-list mt-3">
              <li><CheckCircle2 />52 Purushartha Cards (4 Suits × 13 Ranks)</li>
              <li><CheckCircle2 />3 Transcendent Master Keys</li>
              <li><CheckCircle2 /><span>Personalized cosmic placements<br className="hidden sm:block" /> for all 55 cards</span></li>
            </ul>
            <ActionLink to="/about">Learn More</ActionLink>
          </div>
        </article>

        <article className="service-panel service-dimensions-panel min-h-[204px]">
          <div className="service-panel-content w-full">
            <div className="service-panel-title justify-center">
              <Layers aria-hidden="true" className="h-7 w-7 shrink-0 text-[#9B6C23]" />
              <div>
                <h2>The Four Cosmic Dimensions</h2>
                <p className="service-intro">A holistic map of life through the four Purusharthas.</p>
              </div>
            </div>
            <div className="service-dimension-grid mt-3">
              {dimensions.map((dimension) => (
                <div key={dimension.name} className={`service-suit-card ${dimension.color}`}>
                  <span aria-hidden="true" className="service-suit-symbol">{dimension.symbol}</span>
                  <h3>{dimension.name}</h3>
                  <p>{dimension.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="service-panel service-interpretation-panel min-h-[222px]">
          <div className="service-zodiac-art" aria-hidden="true">
            <img src="/card_motif_moon.png" alt="" />
          </div>
          <div className="service-panel-content">
            <div className="service-panel-title">
              <Moon aria-hidden="true" className="h-6 w-6 shrink-0 text-[#B38332]" />
              <h2>Personalized<br className="hidden sm:block" /> Card Interpretations</h2>
            </div>
            <p className="service-intro">High-resolution insights for each of your 55 cards.</p>
            <ul className="service-check-list mt-2">
              {interpretations.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}
            </ul>
            <ActionLink to="/about">See Sample</ActionLink>
          </div>
        </article>

        <article className="service-panel service-keys-panel min-h-[222px]">
          <div className="service-panel-content w-full">
            <div className="service-panel-title">
              <KeyRound aria-hidden="true" className="h-8 w-8 shrink-0 text-[#9B6C23]" />
              <div>
                <h2>The Three Master Keys</h2>
                <p className="service-intro">The Tattva-Trimurti that govern your higher identity.</p>
              </div>
            </div>
            <div className="service-key-list mt-2">
              {masterKeys.map((key) => (
                <div key={key.number} className="service-key-row">
                  <span className="service-key-number">{key.number}</span>
                  <p><strong>{key.title}</strong> — {key.description}</p>
                </div>
              ))}
            </div>
            <ActionLink to="/about">Know the Master Keys</ActionLink>
          </div>
        </article>

        <article className="service-panel service-ai-panel min-h-[222px]">
          <div className="service-ai-art" aria-hidden="true">
            <div className="service-ai-orbit" />
            <BrainCircuit className="h-14 w-14" />
            <Sparkles className="service-ai-star h-4 w-4" />
          </div>
          <div className="service-panel-content">
            <div className="service-panel-title">
              <Eye aria-hidden="true" className="h-6 w-6 shrink-0 text-[#9B6C23]" />
              <h2>AI Self-Discovery</h2>
            </div>
            <p className="service-intro">Gemini-powered interpretations designed for real self-inquiry.</p>
            <ul className="service-check-list mt-3">
              <li><CheckCircle2 />Personalized AI interpretations</li>
              <li><CheckCircle2 />Deep self-discovery questions</li>
              <li><CheckCircle2 />Reflective action prompts</li>
              <li><CheckCircle2 />Contextual guidance for life phases</li>
            </ul>
            <ActionLink to="/">Experience Now</ActionLink>
          </div>
        </article>
      </section>
    </section>
  </div>
);
