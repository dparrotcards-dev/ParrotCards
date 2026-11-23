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
import { getCardHindiInfo } from '../data/cardHindiData';

interface CardDetailModalProps {
  card: ICard | null;
  onClose: () => void;
  onUnlock?: (card: ICard) => void;
}

type LensTabKey = 'superpower' | 'challenges' | 'shadow' | 'purpose' | 'reading';

const HINDI_SIGN_NAMES = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'
];

const ENGLISH_SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_CODE_MAP: Record<string, number> = {
  ARI: 0, TAU: 1, GEM: 2, GE: 2, CAN: 3, CNC: 3, LEO: 4, LE: 4, VIR: 5, VI: 5,
  LIB: 6, LI: 6, SCO: 7, SC: 7, SAG: 8, SGR: 8, CAP: 9, CP: 9, AQU: 10, AQ: 10, PIS: 11, PI: 11
};

const NAKSHATRA_CODE_MAP: Record<string, string> = {
  ASH: 'Ashwini', BHA: 'Bharani', KRI: 'Krittika', ROH: 'Rohini', MRI: 'Mrigashira',
  ARD: 'Ardra', PUN: 'Punarvasu', PUS: 'Pushya', ASL: 'Ashlesha', MAG: 'Magha',
  PPH: 'Purva Phalguni', UPH: 'Uttara Phalguni', HAS: 'Hasta', CHI: 'Chitra', SWA: 'Swati',
  VIS: 'Vishakha', ANU: 'Anuradha', JYE: 'Jyeshtha', MUL: 'Mula', PAS: 'Purva Ashadha',
  UAS: 'Uttara Ashadha', SHR: 'Shravana', DHA: 'Dhanishta', SHA: 'Shatabhisha',
  PBH: 'Purva Bhadrapada', UBH: 'Uttara Bhadrapada', UTT: 'Uttara Bhadrapada', REV: 'Revati'
};

const NAKSHATRA_HINDI_MAP: Record<string, string> = {
  Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
  Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
  Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
  'Uttara Phalguni': 'उत्तराफाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाति',
  Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल',
  'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', Shravana: 'श्रवण',
  Dhanishta: 'धनिष्ठा', Shatabhisha: 'शतभिषा', 'Purva Bhadrapada': 'पूर्वभाद्रपद',
  'Uttara Bhadrapada': 'उत्तरभाद्रपद', Revati: 'रेवती'
};

function formatUserFriendlyPlacement(astro: any, rawVector: string | undefined, isHindi: boolean): string {
  let signIdx = astro?.sign;
  let deg = astro?.deg;
  let nak = astro?.nak;
  let pada = astro?.pada;
  let navIdx = astro?.navamshaSign;

  // If astro missing details, parse rawVector (e.g. TAU-18.54° // ROH-3 // GE-D9)
  if (rawVector && (signIdx == null || deg == null || !nak || navIdx == null)) {
    const parts = rawVector.split(/\/\/|\//).map((s) => s.trim());
    if (parts.length >= 1) {
      const p0 = parts[0].match(/([A-Z]+)[-_]?([0-9.]+)/i);
      if (p0) {
        if (signIdx == null) signIdx = SIGN_CODE_MAP[p0[1].toUpperCase()];
        if (deg == null) deg = parseFloat(p0[2]);
      }
    }
    if (parts.length >= 2) {
      const p1 = parts[1].match(/([A-Z]+)[-_]?([1-4])/i);
      if (p1) {
        if (!nak) nak = NAKSHATRA_CODE_MAP[p1[1].toUpperCase()] || p1[1];
        if (pada == null) pada = parseInt(p1[2]);
      }
    }
    if (parts.length >= 3) {
      const p2 = parts[2].match(/([A-Z]+)[-_]?(?:D9)?/i);
      if (p2) {
        if (navIdx == null) navIdx = SIGN_CODE_MAP[p2[1].toUpperCase()];
      }
    }
  }

  // Fallback sign resolution from signName
  if ((signIdx == null || signIdx < 0 || signIdx > 11) && astro?.signName) {
    const idx = ENGLISH_SIGN_NAMES.findIndex((s) => astro.signName.toLowerCase().includes(s.toLowerCase()));
    if (idx !== -1) signIdx = idx;
    else {
      const hIdx = HINDI_SIGN_NAMES.findIndex((s) => astro.signName.includes(s));
      if (hIdx !== -1) signIdx = hIdx;
    }
  }

  const signStr =
    signIdx != null && signIdx >= 0 && signIdx < 12
      ? isHindi
        ? HINDI_SIGN_NAMES[signIdx]
        : ENGLISH_SIGN_NAMES[signIdx]
      : astro?.signName?.split(' • ')[0] || '';

  const degStr = deg != null ? `${deg.toFixed(2)}°` : '';

  let nakStr = '';
  if (nak) {
    const nakName = isHindi ? NAKSHATRA_HINDI_MAP[nak] || nak : nak;
    const padaStr = pada ? (isHindi ? `पाद ${pada}` : `Pada ${pada}`) : '';
    nakStr = padaStr ? `${nakName} ${padaStr}` : nakName;
  }

  // Navamsha resolution
  if ((navIdx == null || navIdx < 0 || navIdx > 11) && astro?.navamshaSignName) {
    const idx = ENGLISH_SIGN_NAMES.findIndex((s) => astro.navamshaSignName.toLowerCase().includes(s.toLowerCase()));
    if (idx !== -1) navIdx = idx;
  }
  let navStr = '';
  if (navIdx != null && navIdx >= 0 && navIdx < 12) {
    navStr = isHindi ? `${HINDI_SIGN_NAMES[navIdx]} नवांश` : `${ENGLISH_SIGN_NAMES[navIdx]} Navamsha`;
  } else if (astro?.navamshaSignName) {
    navStr = isHindi ? `${astro.navamshaSignName} नवांश` : `${astro.navamshaSignName} Navamsha`;
  }

  const resultParts = [];
  if (signStr && degStr) resultParts.push(`${signStr} ${degStr}`);
  else if (signStr) resultParts.push(signStr);
  else if (degStr) resultParts.push(degStr);

  if (nakStr) resultParts.push(nakStr);
  if (navStr) resultParts.push(navStr);

  return resultParts.join(' · ') || rawVector || '';
}

const HINDI_HOUSE_NAMES: Record<number, string> = {
  1: 'प्रथम भाव',
  2: 'द्वितीय भाव',
  3: 'तृतीय भाव',
  4: 'चतुर्थ भाव',
  5: 'पंचम भाव',
  6: 'षष्ठ भाव',
  7: 'सप्तम भाव',
  8: 'अष्टम भाव',
  9: 'नवम भाव',
  10: 'दशम भाव',
  11: 'एकादश भाव',
  12: 'द्वादश भाव',
};

const PLANET_HINDI_MAP: Record<string, string> = {
  sun: 'सूर्य',
  moon: 'चंद्र',
  mars: 'मंगल',
  mercury: 'बुध',
  jupiter: 'गुरु',
  venus: 'शुक्र',
  saturn: 'शनि',
  rahu: 'राहु',
  ketu: 'केतु',
  ascendant: 'लग्न',
  lagna: 'लग्न',
};

function getOrdinalHouse(houseNum: number | null | undefined): string {
  if (!houseNum) return '—';
  const j = houseNum % 10,
    k = houseNum % 100;
  if (j === 1 && k !== 11) return `${houseNum}st House`;
  if (j === 2 && k !== 12) return `${houseNum}nd House`;
  if (j === 3 && k !== 13) return `${houseNum}rd House`;
  return `${houseNum}th House`;
}

function formatHouse(houseNum: number | null | undefined, isHindi: boolean): string {
  if (!houseNum) return '—';
  if (isHindi) {
    return HINDI_HOUSE_NAMES[houseNum] || `${houseNum}वां भाव`;
  }
  return getOrdinalHouse(houseNum);
}

function formatPlanet(planetName: string | null | undefined, isHindi: boolean): string {
  if (!planetName) return '—';
  if (!isHindi) return planetName;
  const clean = planetName.trim();
  const lower = clean.toLowerCase();
  for (const [key, val] of Object.entries(PLANET_HINDI_MAP)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return clean;
}

function formatSignName(signIdx: number | null | undefined, signName: string | null | undefined, isHindi: boolean): string {
  if (signIdx != null && signIdx >= 0 && signIdx < 12) {
    return isHindi ? HINDI_SIGN_NAMES[signIdx] : ENGLISH_SIGN_NAMES[signIdx];
  }
  if (!signName) return '—';
  const clean = signName.split(' • ')[0].trim();
  const foundIdx = ENGLISH_SIGN_NAMES.findIndex((s) => clean.toLowerCase().includes(s.toLowerCase()));
  if (foundIdx !== -1) {
    return isHindi ? HINDI_SIGN_NAMES[foundIdx] : ENGLISH_SIGN_NAMES[foundIdx];
  }
  return clean;
}

function formatNavamshaName(navIdx: number | null | undefined, navName: string | null | undefined, isHindi: boolean): string {
  if (navIdx != null && navIdx >= 0 && navIdx < 12) {
    return isHindi ? HINDI_SIGN_NAMES[navIdx] : ENGLISH_SIGN_NAMES[navIdx];
  }
  if (!navName) return '—';
  const clean = navName.replace(/Navamsha/i, '').replace(/Sign/i, '').trim();
  const foundIdx = ENGLISH_SIGN_NAMES.findIndex((s) => clean.toLowerCase().includes(s.toLowerCase()));
  if (foundIdx !== -1) {
    return isHindi ? HINDI_SIGN_NAMES[foundIdx] : ENGLISH_SIGN_NAMES[foundIdx];
  }
  return clean || navName;
}

function formatNakshatraDisplay(nak: string | null | undefined, pada: number | null | undefined, isHindi: boolean): string {
  if (!nak) return '—';
  const nakName = isHindi ? NAKSHATRA_HINDI_MAP[nak] || nak : nak;
  const padaNum = pada ?? 1;
  const padaText = isHindi ? `पाद ${padaNum}` : `Pada ${padaNum}`;
  return `${nakName} (${padaText})`;
}

function getHindiSynergy(card: ICard, astro: any, synergyEn?: string, name: string = 'जातक'): string {
  const signHindi = formatSignName(astro?.sign, astro?.signName, true);
  const nakHindi = astro?.nak ? NAKSHATRA_HINDI_MAP[astro.nak] || astro.nak : '';
  const padaStr = astro?.pada ? `पाद ${astro.pada}` : '';
  const navHindi = formatNavamshaName(astro?.navamshaSign, astro?.navamshaSignName, true);
  const houseStr = astro?.house ? HINDI_HOUSE_NAMES[astro.house] || `${astro.house}वां भाव` : 'लग्न भाव';
  const lordHindi = formatPlanet(astro?.houseLord, true);

  const keyLower = (card.key || card.title || '').toLowerCase();

  if (keyLower.includes('lagna')) {
    return `${signHindi} लग्न ${nakHindi ? `${nakHindi} नक्षत्र (${padaStr || 'पाद 1'})` : ''} और ${navHindi} नवांश के साथ मिलकर ${name} के प्रारंभिक जीवन में सहज स्थिरता, सौम्य आकर्षण और बौद्धिक अनुकूलनशीलता के बीच एक सुंदर संतुलन स्थापित करता है। यह योग मानसिक शांति और निरंतर आंतरिक विकास को गति प्रदान करता है।`;
  }

  if (keyLower.includes('sun')) {
    return `${signHindi} राशि और ${houseStr} में सूर्य की यह स्थिति ${lordHindi !== '—' ? `${lordHindi} के प्रभाव और ` : ''}${navHindi} नवांश के साथ मिलकर ${name} के भीतर स्वाभाविक आत्म-तेज, नेतृत्व क्षमता और अटल आत्म-विश्वास को जाग्रत करती है।`;
  }

  if (keyLower.includes('moon')) {
    return `${signHindi} राशि में चंद्र की यह स्थिति ${nakHindi ? `${nakHindi} नक्षत्र` : ''} और ${navHindi} नवांश के साथ मिलकर ${name} के मन, अंतर्ज्ञान और भावनात्मक संतुलन को गहन सुरक्षा और संवेदनशीलता प्रदान करती है।`;
  }

  if (keyLower.includes('mars')) {
    return `${signHindi} राशि में मंगल का प्रभाव ${houseStr} और ${navHindi} नवांश के साथ सामंजस्य बनाकर ${name} की ऊर्जा, साहस और कर्म-संकल्प को सही दिशा और रणनीतिक दृढ़ता देता है।`;
  }

  if (keyLower.includes('mercury')) {
    return `${signHindi} राशि में बुध का प्रभाव ${nakHindi ? `${nakHindi} नक्षत्र` : ''} और ${navHindi} नवांश के समन्वय से ${name} की बौद्धिक तीक्ष्णता, तर्कशक्ति और अभिव्यक्ति को निखारता है।`;
  }

  if (keyLower.includes('jupiter')) {
    return `${signHindi} राशि और ${houseStr} में गुरु की स्थिति ${navHindi} नवांश के साथ मिलकर ${name} के भीतर उच्च विवेक, मार्गदर्शक क्षमता और आध्यात्मिक ज्ञान का विस्तार करती है।`;
  }

  if (keyLower.includes('venus')) {
    return `${signHindi} राशि में शुक्र का संयोजन ${nakHindi ? `${nakHindi} नक्षत्र` : ''} और ${navHindi} नवांश के साथ ${name} के जीवन में सौंदर्य-बोध, सामंजस्य और पारस्परिक संबंधों में सौहार्द लाता है।`;
  }

  if (keyLower.includes('saturn')) {
    return `${signHindi} राशि और ${houseStr} में शनि की स्थिति ${navHindi} नवांश के साथ मिलकर ${name} के भीतर गहन धैर्य, अनुशासन और दीर्घकालिक कर्म-सिद्धि की नींव रखती है।`;
  }

  if (keyLower.includes('rahu') || keyLower.includes('ketu')) {
    return `${signHindi} राशि और ${houseStr} में यह छाया ग्रह बिंदु ${navHindi} नवांश के सूक्ष्म प्रभाव से ${name} को पारंपरिक सीमाओं से परे जाकर गूढ़ चिंतन और आत्म-शोधन की दिशा में प्रेरित करता है।`;
  }

  if (keyLower.includes('yogi')) {
    return `${signHindi} राशि और ${houseStr} में यह शुभ योगी बिंदु ${navHindi} नवांश के साथ मिलकर ${name} के जीवन में अप्रत्याशित सौभाग्य, आध्यात्मिक शुचिता और कल्याणकारी अवसरों का द्वार खोलता है।`;
  }

  const lead = [
    signHindi !== '—' ? `${signHindi} राशि` : '',
    nakHindi ? `${nakHindi} नक्षत्र` : '',
    navHindi !== '—' ? `${navHindi} नवांश` : '',
  ]
    .filter(Boolean)
    .join(' व ');

  return `${lead ? `${lead} का यह खगोलीय संयोजन ` : ''}${lordHindi !== '—' ? `भावेश ${lordHindi} के संरक्षण में ` : ''}${name} के व्यक्तित्व में सहज संतुलन, संप्रभु आत्म-ज्ञान और कर्म-दक्षता का विस्तार करता है।`;
}

function getHindiDeeperExplanation(card: ICard, astro: any, name: string): string {
  const sign = astro.signName || 'इस राशि';
  const house = astro.house ? `${astro.house}वें भाव` : 'लग्न भाव';
  const nak = astro.nak ? `नक्षत्र ${astro.nak}` : '';
  const pada = astro.pada ? `(चरण ${astro.pada})` : '';

  return `${name} की जन्म कुंडली में ${card.title} (${card.label}) का यह स्थान ${sign} और ${house} में स्थित है। ${nak ? `यह ${nak} ${pada} के प्रभाव क्षेत्र में संचालित होता है। ` : ''}यह खगोलीय स्थिति आपके भीतर स्वाभाविक अंतर्दृष्टि, संप्रभु आत्म-विश्वास और सामूहिक सामंजस्य का संचार करती है। यह बिंदु आपको बाहरी दबावों से अप्रभावित रहकर अपने उच्चतम जीवन उद्देश्य और धर्म के मार्ग पर अडिग रहने का सामर्थ्य प्रदान करता है।`;
}

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
  const cosmicVector = formatUserFriendlyPlacement(astro, undefined, false);

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
      synergy: getHindiSynergy(card, astro, undefined, 'जातक'),
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
  const cardHindi = getCardHindiInfo(card);
  const energy = activeInterp.energyCode;
  const hindi = activeInterp.hindiInterpretation;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-[#1A1817]/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#FAF7F2] border-2 border-[#8C6D3B]/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-[#1A1817] space-y-5 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Control Bar: Language Switch & Close Button */}
        <div className="flex items-center justify-end gap-2 pb-1 sm:pb-0 sm:absolute sm:top-5 sm:right-5 z-20">
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
        <div className="flex items-start sm:items-center gap-3 sm:pr-48">
          <span
            style={{ color: suitMeta.color }}
            className="w-12 h-12 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 flex items-center justify-center font-serif text-2xl font-bold shadow-xs shrink-0"
          >
            {suitMeta.symbol}
          </span>
          <div>
            <div className="text-[11px] sm:text-xs uppercase tracking-widest font-bold font-cinzel" style={{ color: suitMeta.color }}>
              {isHindi ? cardHindi.suit : card.suit} · {isHindi ? cardHindi.label : card.label} ({card.rank})
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#8C6D3B] leading-tight">
              {isHindi ? cardHindi.title : card.title}
            </h2>
          </div>
        </div>

        {/* Card Line Quote */}
        {card.line && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F2ECE1] border-l-4 border-[#8C6D3B] font-serif italic text-sm sm:text-base text-[#1A1817]">
            "{isHindi ? cardHindi.line : card.line}"
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
            <p className="text-sm font-cinzel text-[#8C6D3B] font-semibold tracking-wide">
              {isHindi ? 'आपकी कॉस्मिक रीडिंग तैयार की जा रही है...' : 'Preparing Your Cosmic Reading...'}
            </p>
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

                  {/* User-Friendly Astronomical Placement Badge */}
                  <span className="font-serif text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-lg bg-[#8C6D3B]/10 border border-[#8C6D3B]/30 text-[#735520] tracking-wide shadow-2xs">
                    {formatUserFriendlyPlacement(astro, energy.cosmicVector, isHindi)}
                  </span>
                </div>

                {/* Badges: Bija Trigger & Power Colors (Non-clickable informative badges) */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-[#8C6D3B]/30 text-[#6B5A40] text-[11px] font-serif font-semibold uppercase tracking-wider cursor-default select-none pointer-events-none">
                    <span>{isHindi ? 'बीज' : 'BIJA'}: {energy.bijaTrigger}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 border border-[#8C6D3B]/30 text-[#6B5A40] text-[11px] font-serif font-semibold uppercase tracking-wider cursor-default select-none pointer-events-none">
                    <span>{isHindi ? 'शक्ति रंग' : 'POWER'}: {energy.powerColor}</span>
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
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 justify-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => setActiveLens('superpower')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeLens === 'superpower'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? 'अलौकिक शक्ति' : 'Superpower'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('challenges')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeLens === 'challenges'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? 'चुनौतियाँ' : 'Challenges'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('shadow')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeLens === 'shadow'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? 'छाया स्वरूप' : 'Shadow Self'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('purpose')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeLens === 'purpose'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? 'आत्मा का ध्येय' : 'Soul Purpose'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLens('reading')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeLens === 'reading'
                      ? 'bg-[#8C6D3B] text-white shadow-xs'
                      : 'bg-[#F2ECE1] text-[#6B635B] hover:text-[#1A1817] hover:bg-[#EAE1D2]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? 'गहन शोध' : 'Deep Research'}</span>
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
                      {isHindi
                        ? (hindi?.deeperExplanation || getHindiDeeperExplanation(card, astro, profile?.name || 'जातक'))
                        : (activeInterp.deeperExplanation || card.detailedInterpretation || card.shortSummary)}
                    </p>
                  </div>

                  {/* Reflection Prompt / Soul Inquiry */}
                  {(activeInterp.reflectionPrompt || card.reflectionQuestion || isHindi) && (
                    <div className="p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                        <Lightbulb className="w-4 h-4 text-[#8C6D3B]" />
                        <span>{isHindi ? 'आत्म-मंथन व चिंतन' : 'Soul Reflection Inquiry'}</span>
                      </div>
                      <p className="font-serif italic text-sm sm:text-base text-[#1A1817] leading-relaxed">
                        "{isHindi
                          ? (hindi?.reflectionPrompt || 'आप अपने आंतरिक सत्य और बाह्य जिम्मेदारियों के मध्य किस प्रकार पूर्ण संतुलन स्थापित कर सकते हैं?')
                          : (activeInterp.reflectionPrompt || card.reflectionQuestion)}"
                      </p>
                    </div>
                  )}

                  {/* Purushartha Dharma Connection */}
                  {(activeInterp.dharmaConnection || isHindi) && (
                    <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#2E5A36] font-cinzel">
                        <Compass className="w-4 h-4" />
                        <span>{isHindi ? 'पुरुषार्थ व कर्म दिशा' : 'Purushartha & Evolutionary Vector'}</span>
                      </div>
                      <p className="text-[#3D3833] text-xs sm:text-sm leading-relaxed font-serif">
                        {isHindi
                          ? (hindi?.dharmaConnection || 'यह खगोलीय स्थिति आपके पुरुषार्थ और कर्म-पथ को उच्च आध्यात्मिक चेतना और नैतिक कर्तव्य के साथ जोड़ती है।')
                          : activeInterp.dharmaConnection}
                      </p>
                    </div>
                  )}

                  {/* Practical Action */}
                  {(activeInterp.practicalAction || isHindi) && (
                    <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#8C6D3B]/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C6D3B] font-cinzel">
                        <Target className="w-4 h-4" />
                        <span>{isHindi ? 'आज का व्यावहारिक कर्म' : 'Grounded Daily Action'}</span>
                      </div>
                      <p className="text-[#3D3833] text-xs sm:text-sm leading-relaxed font-serif">
                        {isHindi
                          ? (hindi?.practicalAction || 'आज के दिन कुछ समय शांत बैठकर अपने आत्म-ध्येय का स्मरण करें और एक सजग व कल्याणकारी निर्णय लें।')
                          : activeInterp.practicalAction}
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
                    {isHindi
                      ? (hindi?.synergy || getHindiSynergy(card, astro, activeInterp.synergy, profile?.name || 'जातक'))
                      : activeInterp.synergy}
                  </p>
                </div>
              </div>
            )}

            {/* ═══ 5. ASTRONOMICAL PLACEMENT TABLE ═══ */}
            <div className="pt-4 border-t border-[#8C6D3B]/20 space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-[#6B635B] font-cinzel">
                <span>{isHindi ? 'प्रमाणित खगोलीय निर्देशांक' : 'Verified Astronomical Data'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'राशि' : 'Sign'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {formatSignName(astro.sign, astro.signName, isHindi)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'अंश' : 'Degree'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-mono">
                    {astro.deg != null ? `${astro.deg.toFixed(2)}°` : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'भाव' : 'House'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {formatHouse(astro.house, isHindi)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'भाव स्वामी' : 'House Lord'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {formatPlanet(astro.houseLord, isHindi)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'नवांश (D9)' : 'Navamsha (D9)'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {formatNavamshaName(astro.navamshaSign, astro.navamshaSignName, isHindi)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/20">
                  <span className="text-[10px] text-[#6B635B] block uppercase font-cinzel">
                    {isHindi ? 'नक्षत्र' : 'Nakshatra'}
                  </span>
                  <span className="font-bold text-[#1A1817] font-serif">
                    {formatNakshatraDisplay(astro.nak, astro.pada, isHindi)}
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
