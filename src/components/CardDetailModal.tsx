import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Compass,
  Lightbulb,
  Target,
  BookOpen,
  Lock,
  Zap,
  ShieldAlert,
  Moon,
  Crown,
  Layers,
  Globe,
} from 'lucide-react';
import { ICard, ICardInterpretationData } from '../types';
import { deckService } from '../services/deckService';
import { useDeck } from '../context/DeckContext';
import { SUIT_METADATA } from './SuitTabs';

interface CardDetailModalProps {
  card: ICard | null;
  onClose: () => void;
  onUnlock?: (card: ICard) => void;
}

type LensTabKey = 'superpower' | 'challenges' | 'shadow' | 'purpose' | 'reading';

function buildDefaultInterpretation(card: ICard): ICardInterpretationData {
  const astro = card.astronomicalPlacement || {};
  const keyLower = card.key.toLowerCase();

  let title = `${card.title} Archetype`;
  let titleHindi = 'संप्रभु ऊर्जा-प्रतीक';
  let bija = 'AUM';
  let powerColor = 'Solar Gold & Obsidian';

  if (keyLower.includes('sun')) {
    title = 'The Solar Sovereign';
    titleHindi = 'सूर्य प्रभुत्व';
    bija = 'HRAAM';
    powerColor = 'Solar Gold & Crimson';
  } else if (keyLower.includes('moon')) {
    title = 'The Cosmic Oracle';
    titleHindi = 'चंद्र अंतर्दृष्टि';
    bija = 'SHRAAM';
    powerColor = 'Silver & Pearl White';
  } else if (keyLower.includes('mars')) {
    title = 'The Royal Sentinel';
    titleHindi = 'दुर्ग-रक्षक / सेनापति';
    bija = 'KRAAM';
    powerColor = 'Crimson & Copper';
  } else if (keyLower.includes('mercury')) {
    title = 'The Kinetic Architect';
    titleHindi = 'गतिमान निर्माता';
    bija = 'BRAAM';
    powerColor = 'Emerald & Mercury Green';
  } else if (keyLower.includes('jupiter')) {
    title = 'The Master Tactician';
    titleHindi = 'दिव्य रणनीतिकार';
    bija = 'GRAAM';
    powerColor = 'Golden Topaz & Amber';
  } else if (keyLower.includes('venus')) {
    title = 'The Sovereign Crucible';
    titleHindi = 'परम रस-साधक';
    bija = 'DRAAM';
    powerColor = 'Rose Quartz & Diamond White';
  } else if (keyLower.includes('saturn')) {
    title = 'The Timeless Commander';
    titleHindi = 'काल-विजेता';
    bija = 'PRAAM';
    powerColor = 'Obsidian & Midnight Blue';
  } else if (keyLower.includes('rahu')) {
    title = 'The Eclipse Catalyst';
    titleHindi = 'माया-भंजक';
    bija = 'BHRAAM';
    powerColor = 'Smoky Quartz & Violet';
  } else if (keyLower.includes('ketu')) {
    title = 'The Void Alchemist';
    titleHindi = 'मोक्ष-संकेतक';
    bija = 'SRAAM';
    powerColor = 'Sacred Ash & Indigo';
  } else if (keyLower.includes('lagna')) {
    title = 'The Inception Vanguard';
    titleHindi = 'चेतना-उद्भव';
    bija = 'AUM';
    powerColor = 'Prismatic White & Gold';
  } else if (keyLower.includes('yogi') && !keyLower.includes('avayogi')) {
    title = 'The Catalyst of Fortune';
    titleHindi = 'सौभाग्य उत्प्रेरक';
    bija = 'SHREEM';
    powerColor = 'Radiant Gold & Saffron';
  } else if (keyLower.includes('avayogi')) {
    title = 'The Crucible of Trial';
    titleHindi = 'कठोर परीक्षा केंद्र';
    bija = 'HUM';
    powerColor = 'Iron Grey & Obsidian';
  } else if (keyLower.includes('sphuta')) {
    title = 'The Fatal Point Vector';
    titleHindi = 'सूक्ष्म बिंदु संकेतक';
    bija = 'AUM';
    powerColor = 'Celestial Indigo & Silver';
  }

  const sign = astro.signName || 'Cosmic Sign';
  const house = astro.house ? `${astro.house}th House` : 'Ascendant';
  const cosmicVector = `${astro.signName ? astro.signName.slice(0, 3).toUpperCase() : 'VEC'}-${astro.deg != null ? astro.deg.toFixed(2) : '10'}° // ${astro.nak ? astro.nak.slice(0, 3).toUpperCase() : 'NAK'}-${astro.pada || 1}`;

  return {
    sovereignAvatarPhrase: `The Awakened Flame of ${sign}`,
    deeperExplanation: card.detailedInterpretation || `In your natal chart, ${card.title} is anchored in ${sign} in ${house}. This placement guides your capacity to align with higher purpose.`,
    reflectionPrompt: card.reflectionQuestion || 'How can you honor both your natural impulse and the higher sovereign duty calling you forward?',
    dharmaConnection: 'Directly anchors your Purushartha alignment by transmuting personal experience into enduring, honorable contribution.',
    practicalAction: 'Take five minutes today to align your actions with your innermost conviction.',
    superpower: `Magnifies your instinctive authority and capacity to establish equilibrium even amidst chaotic external tides.`,
    challenges: `Guarding against fatigue from absorbing ungrounded friction, and maintaining strict discernment over what merits your sacred attention.`,
    shadowSelf: `Suppression of authentic vulnerability, masking internal unease behind rigid composure or intellectual detachment.`,
    soulPurpose: `To anchor sovereign balance in this world, proving that true power arises not from domination, but from absolute spiritual alignment.`,
    energyCode: {
      title,
      titleHindi,
      cosmicVector,
      bijaTrigger: bija,
      affirmation: 'I stand centered in my sovereign truth, turning every circumstance into an altar of conscious elevation.',
      affirmationHindi: 'मैं अपने आत्म-सत्य में सुदृढ़ खड़ा हूँ और प्रत्येक परिस्थिति को आत्म-विकास का माध्यम बनाता हूँ।',
      powerColor,
    },
    synergy: `Harmonizes with your ${astro.houseLord || 'ruler'} and directs evolutionary prana through your Navamsha (${astro.navamshaSignName || 'D9'}).`,
    hindiInterpretation: {
      title: titleHindi,
      superpower: 'अडिग आत्मविश्वास और विषम से विषम परिस्थिति में भी संतुलन व दिशा स्थापित करने की स्वाभाविक योग्यता।',
      challenges: 'दूसरों की नकारात्मक ऊर्जा से स्वयं को सुरक्षित रखना और सही समय पर सीमाएं निर्धारित करना।',
      shadowSelf: 'कठिनाइयों में अपनी कोमलता को छिपा लेना और अत्यधिक कठोरता का मुखौटा ओढ़ना।',
      soulPurpose: 'यह सिद्ध करना कि सच्ची संप्रभुता बाहरी नियंत्रण में नहीं, बल्कि आंतरिक अनुशासन और आत्म-समर्पण में निहित है।',
      deeperExplanation: card.detailedInterpretation || `आपकी जन्म कुंडली में ${card.title} (${sign}) उच्च चेतना और संप्रभु जीवन उद्देश्य का मुख्य आधार है।`,
      reflectionPrompt: card.reflectionQuestion || 'आप अपनी आंतरिक शक्ति और जीवन के उच्च उद्देश्य में कैसे सामंजस्य स्थापित कर सकते हैं?',
      dharmaConnection: 'आपके पुरुषार्थ और कर्म-पथ को शुद्ध चेतना के साथ जोड़ता है।',
      practicalAction: 'आज के दिन कुछ समय शांत बैठकर अपने आत्म-सत्य का स्मरण करें और सजग निर्णय लें।',
    },
    isAiGenerated: false,
    demographicLens: 'Adult (Integrated)',
  };
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUnlock }) => {
  const { profile, deck } = useDeck();
  const [loading, setLoading] = useState<boolean>(true);
  const [interpretation, setInterpretation] = useState<ICardInterpretationData | null>(null);
  const [selectedLang, setSelectedLang] = useState<'EN' | 'HI'>('EN');
  const [activeLens, setActiveLens] = useState<LensTabKey>('superpower');
  const cardPrice = 2;

  useEffect(() => {
    if (!card) return;

    if (!card.isUnlocked) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    deckService
      .getCardInterpretation(card.key, deck?._id, profile?.name || 'Seeker')
      .then((data) => {
        if (isMounted) {
          setInterpretation(data.interpretation);
        }
      })
      .catch((err) => {
        console.warn('Using client-side fallback interpretation:', err?.message);
        if (isMounted) {
          setInterpretation(buildDefaultInterpretation(card));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [card, deck, profile]);

  if (!card) return null;

  const defaultInterp = buildDefaultInterpretation(card);
  const activeInterp: ICardInterpretationData = {
    ...defaultInterp,
    ...(interpretation || {}),
    energyCode: interpretation?.energyCode || defaultInterp.energyCode,
    hindiInterpretation: interpretation?.hindiInterpretation || defaultInterp.hindiInterpretation,
    superpower: interpretation?.superpower || defaultInterp.superpower,
    challenges: interpretation?.challenges || defaultInterp.challenges,
    shadowSelf: interpretation?.shadowSelf || defaultInterp.shadowSelf,
    soulPurpose: interpretation?.soulPurpose || defaultInterp.soulPurpose,
  };

  const suitMeta = SUIT_METADATA[card.suit] || SUIT_METADATA.Dharma;
  const astro = card.astronomicalPlacement || {};
  const isHindi = selectedLang === 'HI';
  const energy = activeInterp.energyCode;
  const hindi = activeInterp.hindiInterpretation;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-[#1A1817]/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF7F2] border-2 border-[#8C6D3B]/40 rounded-3xl p-5 sm:p-8 shadow-2xl text-[#1A1817] space-y-5 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Control Bar: Language Switch & Close Button */}
        <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex items-center gap-2 z-20">
          {/* Segmented Language Switcher */}
          <div className="flex items-center rounded-full bg-[#F2ECE1] p-0.5 border border-[#8C6D3B]/35 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedLang('EN')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-cinzel font-bold transition-all cursor-pointer ${
                !isHindi
                  ? 'bg-[#8C6D3B] text-white shadow-xs'
                  : 'text-[#6B635B] hover:text-[#1A1817]'
              }`}
              title="Read in English"
            >
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('HI')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-cinzel font-bold transition-all cursor-pointer ${
                isHindi
                  ? 'bg-[#8C6D3B] text-white shadow-xs'
                  : 'text-[#6B635B] hover:text-[#1A1817]'
              }`}
              title="हिंदी में पढ़ें"
            >
              <span>हिंदी</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-full bg-[#F2ECE1] hover:bg-[#EAE1D2] text-[#6B635B] hover:text-[#1A1817] border border-[#8C6D3B]/25 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="flex items-start sm:items-center gap-3 pr-24">
          <span
            style={{ color: suitMeta.color }}
            className="w-12 h-12 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 flex items-center justify-center font-serif text-2xl font-bold shadow-xs shrink-0"
          >
            {suitMeta.symbol}
          </span>
          <div>
            <div className="text-[11px] sm:text-xs uppercase tracking-widest font-bold font-cinzel" style={{ color: suitMeta.color }}>
              {card.suit} · {card.label} ({card.rank})
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#8C6D3B] leading-tight">
              {card.title}
            </h2>
          </div>
        </div>

        {/* Card Line Quote */}
        {card.line && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F2ECE1] border-l-4 border-[#8C6D3B] font-serif italic text-sm sm:text-base text-[#1A1817]">
            "{card.line}"
          </div>
        )}

        {/* Locked State Prompt */}
        {!card.isUnlocked ? (
          <div className="p-6 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/40 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#8C6D3B]/15 text-[#8C6D3B] flex items-center justify-center mx-auto border border-[#8C6D3B]/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-xl font-bold text-[#8C6D3B]">Card Deep Wisdom is Sealed</h3>
              <p className="text-xs text-[#6B635B] mt-1 max-w-md mx-auto font-serif">
                Unlock this specific card for ₹{cardPrice}, or unlock all 55 cards with a 30-day all-access deck pass for ₹25.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onUnlock?.(card);
              }}
              className="py-2.5 px-6 rounded-xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Unlock Now · ₹{cardPrice}
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-cinzel text-[#8C6D3B] font-semibold">Consulting the Gemini cosmic oracle…</p>
          </div>
        ) : (
          /* Interpretation Sections */
          <div className="space-y-5 sm:space-y-6 text-sm">
            {/* ═══ 1. ENERGY CODE HERO BANNER ═══ */}
            {energy && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE1] border border-[#8C6D3B]/35 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6D3B] via-[#D4AF37] to-[#8C6D3B]" />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3B] font-cinzel block">
                      ✦ {isHindi ? 'ऊर्जा कोड' : 'Energy Code Archetype'}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1817]">
                      {isHindi && energy.titleHindi ? energy.titleHindi : energy.title}
                    </h3>
                  </div>

                  {/* Cosmic Vector Badge */}
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#8C6D3B]/10 border border-[#8C6D3B]/25 text-[#735520]">
                    {energy.cosmicVector}
                  </span>
                </div>

                {/* Badges: Bija Trigger & Power Colors */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C6D3B] text-white font-cinzel text-[11px] font-bold tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>BIJA: {energy.bijaTrigger}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-[#8C6D3B]/30 text-[#6B5A40] text-[11px] font-serif font-semibold">
                    <span>Power: {energy.powerColor}</span>
                  </span>
                </div>

                {/* Affirmation Box */}
                {(energy.affirmation || energy.affirmationHindi) && (
                  <div className="pt-2 border-t border-[#8C6D3B]/15 text-xs sm:text-sm font-serif italic text-[#3A3228] leading-relaxed">
                    "{isHindi && energy.affirmationHindi ? energy.affirmationHindi : energy.affirmation}"
                  </div>
                )}
              </div>
            )}

            {/* ═══ 2. INTERACTIVE LENS TABS ═══ */}
            <div className="border-b border-[#8C6D3B]/25 pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLens('superpower')}
                  className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[10.5px] sm:text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    activeLens === 'superpower'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isHindi ? 'अलौकिक शक्ति' : 'Superpower'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('challenges')}
                  className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[10.5px] sm:text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    activeLens === 'challenges'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isHindi ? 'चुनौतियाँ' : 'Challenges'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('shadow')}
                  className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[10.5px] sm:text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    activeLens === 'shadow'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isHindi ? 'छाया स्वरूप' : 'Shadow Self'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('purpose')}
                  className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[10.5px] sm:text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    activeLens === 'purpose'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isHindi ? 'आत्म-ध्येय' : 'Soul Purpose'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('reading')}
                  className={`w-full col-span-2 sm:col-span-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl text-[10.5px] sm:text-xs font-cinzel font-bold transition-all cursor-pointer ${
                    activeLens === 'reading'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isHindi ? 'गहन शोध' : 'Deep Research'}</span>
                </button>
              </div>
            </div>

            {/* ═══ 3. ACTIVE LENS CONTENT ═══ */}
            <div className="space-y-4 min-h-[140px] animate-in fade-in duration-200">
              {/* LENS: SUPERPOWER */}
              {activeLens === 'superpower' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                    <Zap className="w-4 h-4 text-[#8C6D3B]" />
                    <span>{isHindi ? 'अलौकिक सामर्थ्य व दिव्य प्रतिभा' : 'The Innate Soul Superpower'}</span>
                  </div>
                  <p className="text-[#2C241D] leading-relaxed text-sm sm:text-base font-serif">
                    {isHindi && hindi?.superpower ? hindi.superpower : activeInterp.superpower}
                  </p>
                </div>
              )}

              {/* LENS: CHALLENGES */}
              {activeLens === 'challenges' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#A34335] font-cinzel">
                    <ShieldAlert className="w-4 h-4 text-[#A34335]" />
                    <span>{isHindi ? 'कर्म बंधन व जीवन की मुख्य चुनौतियाँ' : 'Karmic Challenges & Friction Points'}</span>
                  </div>
                  <p className="text-[#2C241D] leading-relaxed text-sm sm:text-base font-serif">
                    {isHindi && hindi?.challenges ? hindi.challenges : activeInterp.challenges}
                  </p>
                </div>
              )}

              {/* LENS: SHADOW SELF */}
              {activeLens === 'shadow' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#5B3E75] font-cinzel">
                    <Moon className="w-4 h-4 text-[#5B3E75]" />
                    <span>{isHindi ? 'छाया स्वरूप व गुप्त आदतें (Blindspots)' : 'Shadow Self & Subconscious Blindspots'}</span>
                  </div>
                  <p className="text-[#2C241D] leading-relaxed text-sm sm:text-base font-serif">
                    {isHindi && hindi?.shadowSelf ? hindi.shadowSelf : activeInterp.shadowSelf}
                  </p>
                </div>
              )}

              {/* LENS: SOUL PURPOSE */}
              {activeLens === 'purpose' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#B07624] font-cinzel">
                    <Crown className="w-4 h-4 text-[#B07624]" />
                    <span>{isHindi ? 'आत्मा का परम ध्येय व आध्यात्मिक मिशन' : 'The Soul Purpose & Divine Mission'}</span>
                  </div>
                  <p className="text-[#2C241D] leading-relaxed text-sm sm:text-base font-serif">
                    {isHindi && hindi?.soulPurpose ? hindi.soulPurpose : activeInterp.soulPurpose}
                  </p>
                </div>
              )}

              {/* LENS: DEEP RESEARCH & DHARMA */}
              {activeLens === 'reading' && (
                <div className="space-y-4">
                  {/* Deeper Explanation / Deep Research */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                      <BookOpen className="w-4 h-4 text-[#8C6D3B]" />
                      <span>{isHindi ? 'कॉस्मिक सामंजस्य व गहन शोध' : 'Cosmic Alignment & Deep Research'}</span>
                    </div>
                    <p className="text-[#2C241D] leading-relaxed whitespace-pre-line text-sm sm:text-base font-serif">
                      {isHindi && hindi?.deeperExplanation
                        ? hindi.deeperExplanation
                        : (activeInterp.deeperExplanation || card.detailedInterpretation || card.shortSummary)}
                    </p>
                  </div>

                  {/* Reflection Prompt / Soul Inquiry */}
                  {(activeInterp.reflectionPrompt || card.reflectionQuestion) && (
                    <div className="p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                        <Lightbulb className="w-4 h-4 text-[#8C6D3B]" />
                        <span>{isHindi ? 'आत्म-मंथन व चिंतन' : 'Soul Reflection Inquiry'}</span>
                      </div>
                      <p className="font-serif italic text-sm sm:text-base text-[#1A1817] leading-relaxed">
                        "{isHindi && hindi?.reflectionPrompt ? hindi.reflectionPrompt : (activeInterp.reflectionPrompt || card.reflectionQuestion)}"
                      </p>
                    </div>
                  )}

                  {/* Purushartha Dharma Connection */}
                  {activeInterp.dharmaConnection && (
                    <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#2E5A36] font-cinzel">
                        <Compass className="w-4 h-4" />
                        <span>{isHindi ? 'पुरुषार्थ व कर्म दिशा' : 'Purushartha & Evolutionary Vector'}</span>
                      </div>
                      <p className="text-[#3D3833] text-xs sm:text-sm leading-relaxed font-serif">
                        {isHindi && hindi?.dharmaConnection ? hindi.dharmaConnection : activeInterp.dharmaConnection}
                      </p>
                    </div>
                  )}

                  {/* Practical Action */}
                  {activeInterp.practicalAction && (
                    <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#8C6D3B]/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                        <Target className="w-4 h-4" />
                        <span>{isHindi ? 'आज का व्यावहारिक कर्म' : 'Grounded Daily Action'}</span>
                      </div>
                      <p className="text-[#3D3833] text-xs sm:text-sm leading-relaxed font-serif">
                        {isHindi && hindi?.practicalAction ? hindi.practicalAction : activeInterp.practicalAction}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═══ 4. CARD SYNERGIES / FUSION INSIGHT ═══ */}
            {activeInterp.synergy && (
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#8C6D3B]/30 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#8C6D3B] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D3B] font-cinzel block">
                    ✦ {isHindi ? 'कार्ड सह-संबंध / कॉम्बिनेशन' : 'Card Synergy & Resonance'}
                  </span>
                  <p className="text-xs text-[#4A4035] font-serif leading-relaxed mt-0.5">
                    {activeInterp.synergy}
                  </p>
                </div>
              </div>
            )}

            {/* ═══ 5. ASTRONOMICAL PLACEMENT TABLE ═══ */}
            <div className="pt-4 border-t border-[#8C6D3B]/20 space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-[#6B635B] font-cinzel flex items-center justify-between">
                <span>{isHindi ? 'प्रमाणित खगोलीय निर्देशांक' : 'Verified Astronomical Data'}</span>
                <span className="text-[10px] font-mono font-normal text-[#8C6D3B]">Swiss Ephemeris Telemetry</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Sign</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.signName || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Degree</span>
                  <span className="font-bold text-[#1A1817] font-mono">
                    {astro.deg != null ? `${astro.deg.toFixed(2)}°` : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">House</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.house ? `${astro.house}th House` : '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">House Lord</span>
                  <span className="font-bold text-[#1A1817] font-serif">{astro.houseLord || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Navamsha (D9)</span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {astro.navamshaSignName || (astro.navamshaSign != null ? `Sign ${astro.navamshaSign + 1}` : '—')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">Nakshatra</span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {astro.nak ? `${astro.nak} (Pada ${astro.pada ?? 1})` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
