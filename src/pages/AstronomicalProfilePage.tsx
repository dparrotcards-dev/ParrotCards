import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Clock,
  Globe,
  Lock,
  MapPin,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { api } from '../services/api';
import { IBirthProfile } from '../types';

const IANA_ABBR_OVERRIDES: Record<string, string> = {
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
};

const formatUtcOffset = (offset: number): string => {
  const totalMinutes = Math.round(Math.abs(offset) * 60);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `UTC ${offset < 0 ? '-' : '+'}${hours}:${minutes}`;
};

const resolveTimezoneAbbr = (ianaTimezone?: string, offset?: number): string | null => {
  if (ianaTimezone && IANA_ABBR_OVERRIDES[ianaTimezone]) {
    return IANA_ABBR_OVERRIDES[ianaTimezone];
  }
  if (ianaTimezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimezone,
        timeZoneName: 'short',
      }).formatToParts(new Date());
      const tzName = parts.find((part) => part.type === 'timeZoneName')?.value;
      if (tzName && !/^GMT[+-]/i.test(tzName)) {
        return tzName;
      }
      return ianaTimezone.split('/').pop()?.replace(/_/g, ' ') || ianaTimezone;
    } catch {
      return ianaTimezone;
    }
  }
  if (offset === 5.5) return 'IST';
  return null;
};

const formatTimezoneDisplay = (ianaTimezone?: string, offset = 0): string => {
  const utcLabel = formatUtcOffset(offset);
  const abbr = resolveTimezoneAbbr(ianaTimezone, offset);
  return abbr ? `${abbr} (${utcLabel})` : utcLabel;
};

const formatBirthDate = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
};

const formatBirthTime = (time: string): string => {
  const [hourValue, minuteValue] = time.split(':').map(Number);
  if (!Number.isInteger(hourValue) || !Number.isInteger(minuteValue)) return time;
  const suffix = hourValue >= 12 ? 'PM' : 'AM';
  const hour12 = String(hourValue % 12 || 12).padStart(2, '0');
  return `${hour12}:${String(minuteValue).padStart(2, '0')} ${suffix}`;
};

const SmallCapsText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(' ').map((word, index) => (
      <React.Fragment key={`${word}-${index}`}>
        {index > 0 && ' '}
        <span>
          <span className="uppercase">{word.charAt(0)}</span>
          <span className="text-[0.8em] uppercase tracking-[0.04em]">{word.slice(1)}</span>
        </span>
      </React.Fragment>
    ))}
  </>
);

const FourPointStar: React.FC<{ className?: string }> = ({ className = 'h-3 w-3 text-[#9A7130]' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 1.5C12.7 7.6 16.4 11.3 22.5 12C16.4 12.7 12.7 16.4 12 22.5C11.3 16.4 7.6 12.7 1.5 12C7.6 11.3 11.3 7.6 12 1.5Z" />
  </svg>
);

const GenderGlyph: React.FC<{ gender?: string; className?: string }> = ({
  gender,
  className = 'h-5 w-5 text-[#9A7437]',
}) => {
  const normalized = (gender || '').trim().toLowerCase();

  if (normalized === 'female') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v7" />
        <path d="M9 18h6" />
      </svg>
    );
  }

  if (normalized === 'male') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <circle cx="10" cy="14" r="5" />
        <path d="M13.5 10.5L19.5 4.5" />
        <path d="M15 4.5h4.5V9" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 7.5V3.5" />
      <path d="M9.5 5.5h5" />
      <path d="M12 16.5v4" />
      <path d="M15.2 8.8l3.5-3.5" />
    </svg>
  );
};

const CardCornerFiligree: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  const transformClass = {
    tl: 'top-[4px] left-[4px]',
    tr: 'top-[4px] right-[4px] -scale-x-100',
    bl: 'bottom-[4px] left-[4px] -scale-y-100',
    br: 'bottom-[4px] right-[4px] scale-x-[-1] scale-y-[-1]',
  }[position];

  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute h-11 w-11 text-[#BC9348] sm:h-12 sm:w-12 ${transformClass}`}
    >
      <path
        d="M5 36C5 20 8 11 16 7.5C19.5 6 24 5 36 5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M8.5 28C8.5 19.5 10.5 15 15 11.5C18.5 8.8 23.5 8.5 29 8.5"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeOpacity="0.82"
        strokeLinecap="round"
      />
      <path
        d="M6.5 14C10 14 13 11 13 7.5C13 5.5 11.2 4 9.5 4.5C7.6 5 7 7.5 8.8 8.8"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
      <path
        d="M18.5 5.2C20 8.5 23.5 9.5 25.5 7.5C27 6 25.8 4 23.5 4.8"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M5.2 19C8.5 20.5 9.5 24 7.5 26C6 27.5 4 26.2 4.8 24"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="11.5" r="1.35" fill="currentColor" />
    </svg>
  );
};

const TarotTriadEmblem: React.FC = () => {
  const straightRays = Array.from({ length: 12 }, (_, i) => i * 30);
  const bgBeams = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className="h-[196px] w-[196px] select-none sm:h-[214px] sm:w-[214px]"
    >
      <defs>
        <radialGradient id="tarotAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5DBA1" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#E6C37A" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#E6C37A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="darkTarotCard" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B342D" />
          <stop offset="100%" stopColor="#221E1A" />
        </linearGradient>
        <linearGradient id="sunCardParchment" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF5" />
          <stop offset="55%" stopColor="#FBF1DA" />
          <stop offset="100%" stopColor="#F4E2BC" />
        </linearGradient>
        <linearGradient id="goldFoil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E7C983" />
          <stop offset="50%" stopColor="#C49A4B" />
          <stop offset="100%" stopColor="#9A7231" />
        </linearGradient>
        <filter id="cardDrop" x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="6" stdDeviation="4.5" floodColor="#3A2810" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Ambient Celestial Glow */}
      <circle cx="120" cy="120" r="102" fill="url(#tarotAura)" />

      {/* Subtle Radiating Sunburst Beams */}
      <g opacity="0.28" stroke="#C89F52" strokeLinecap="round">
        {bgBeams.map((deg) => (
          <line
            key={deg}
            x1="120"
            y1="26"
            x2="120"
            y2={deg % 30 === 0 ? '40' : '48'}
            strokeWidth={deg % 30 === 0 ? '0.9' : '0.6'}
            transform={`rotate(${deg} 120 120)`}
          />
        ))}
      </g>

      {/* Outer Dotted Orbit & Inner Ring */}
      <circle
        cx="120"
        cy="120"
        r="96"
        stroke="#C59D54"
        strokeOpacity="0.65"
        strokeWidth="1.05"
        strokeDasharray="1.8 4.2"
      />
      <circle cx="120" cy="120" r="85" stroke="#CEAA65" strokeOpacity="0.4" strokeWidth="0.85" />
      <circle
        cx="120"
        cy="120"
        r="74"
        stroke="#CEAA65"
        strokeOpacity="0.24"
        strokeWidth="0.7"
        strokeDasharray="2 3"
      />

      {/* Four Compass Stars on Outer Orbit */}
      {[
        { x: 120, y: 24, s: 1 },
        { x: 120, y: 216, s: 0.9 },
        { x: 24, y: 120, s: 0.9 },
        { x: 216, y: 120, s: 0.9 },
      ].map(({ x, y, s }, idx) => (
        <path
          key={idx}
          d="M0 -8.5C0.8 -2.5 2.5 -0.8 8.5 0C2.5 0.8 0.8 2.5 0 8.5C-0.8 2.5 -2.5 0.8 -8.5 0C-2.5 -0.8 -0.8 -2.5 0 -8.5Z"
          fill="#C59B49"
          transform={`translate(${x} ${y}) scale(${s})`}
        />
      ))}

      {/* Accent Sparkles */}
      <circle cx="55" cy="52" r="1.4" fill="#C9A255" opacity="0.75" />
      <circle cx="187" cy="54" r="1.4" fill="#C9A255" opacity="0.75" />
      <circle cx="49" cy="176" r="1.2" fill="#C9A255" opacity="0.65" />
      <circle cx="192" cy="172" r="1.2" fill="#C9A255" opacity="0.65" />
      <circle cx="40" cy="70" r="1.8" fill="#E3C37A" opacity="0.7" />
      <circle cx="201" cy="74" r="1.6" fill="#E3C37A" opacity="0.7" />

      {/* Left Dark Obsidian Moon Card */}
      <g transform="translate(76 124) rotate(-20)" filter="url(#cardDrop)">
        <rect
          x="-34"
          y="-53"
          width="68"
          height="106"
          rx="8"
          fill="url(#darkTarotCard)"
          stroke="url(#goldFoil)"
          strokeWidth="1.5"
        />
        <rect
          x="-29"
          y="-48"
          width="58"
          height="96"
          rx="5"
          stroke="#D7B56B"
          strokeOpacity="0.65"
          strokeWidth="0.9"
        />
        <circle cx="-22" cy="-40" r="1.1" fill="#DFBE74" />
        <circle cx="-22" cy="40" r="1.1" fill="#DFBE74" />
        <path
          d="M-3 -14C-14 -12 -20 -2 -17 9C-14 18 -3 21 5 15C-2 15 -8 10 -10 2C-12 -5 -8 -11 -3 -14Z"
          fill="url(#goldFoil)"
        />
        <circle cx="-16" cy="-18" r="1" fill="#DFBE74" opacity="0.85" />
        <circle cx="-18" cy="18" r="1" fill="#DFBE74" opacity="0.85" />
      </g>

      {/* Right Dark Obsidian Moon Card */}
      <g transform="translate(164 124) rotate(20)" filter="url(#cardDrop)">
        <rect
          x="-34"
          y="-53"
          width="68"
          height="106"
          rx="8"
          fill="url(#darkTarotCard)"
          stroke="url(#goldFoil)"
          strokeWidth="1.5"
        />
        <rect
          x="-29"
          y="-48"
          width="58"
          height="96"
          rx="5"
          stroke="#D7B56B"
          strokeOpacity="0.65"
          strokeWidth="0.9"
        />
        <circle cx="22" cy="-40" r="1.1" fill="#DFBE74" />
        <circle cx="22" cy="40" r="1.1" fill="#DFBE74" />
        <path
          d="M3 -14C14 -12 20 -2 17 9C14 18 3 21 -5 15C2 15 8 10 10 2C12 -5 8 -11 3 -14Z"
          fill="url(#goldFoil)"
        />
        <circle cx="16" cy="-18" r="1" fill="#DFBE74" opacity="0.85" />
        <circle cx="18" cy="18" r="1" fill="#DFBE74" opacity="0.85" />
      </g>

      {/* Center Ivory Golden Sun Card */}
      <g transform="translate(120 118)" filter="url(#cardDrop)">
        <rect
          x="-39"
          y="-60"
          width="78"
          height="120"
          rx="9"
          fill="url(#sunCardParchment)"
          stroke="url(#goldFoil)"
          strokeWidth="1.7"
        />
        <rect
          x="-34"
          y="-55"
          width="68"
          height="110"
          rx="6"
          stroke="#BE9446"
          strokeOpacity="0.72"
          strokeWidth="0.95"
        />
        {/* Inner Card Corner Dots & Top/Bottom Sparks */}
        <circle cx="-27.5" cy="-48.5" r="1.2" fill="#B58A3E" />
        <circle cx="27.5" cy="-48.5" r="1.2" fill="#B58A3E" />
        <circle cx="-27.5" cy="48.5" r="1.2" fill="#B58A3E" />
        <circle cx="27.5" cy="48.5" r="1.2" fill="#B58A3E" />
        <circle cx="0" cy="-44" r="1.3" fill="#B58A3E" opacity="0.8" />
        <circle cx="-22" cy="-34" r="0.9" fill="#B58A3E" opacity="0.65" />
        <circle cx="22" cy="-34" r="0.9" fill="#B58A3E" opacity="0.65" />
        <circle cx="-22" cy="34" r="0.9" fill="#B58A3E" opacity="0.65" />
        <circle cx="22" cy="34" r="0.9" fill="#B58A3E" opacity="0.65" />
        <circle cx="0" cy="44" r="1.3" fill="#B58A3E" opacity="0.8" />

        {/* Radiant Celestial Sun with Alternating Straight & Wavy Beams */}
        <g transform="translate(0 0)">
          {straightRays.map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <polygon
                points="0,-31 -2.7,-15.5 2.7,-15.5"
                fill="url(#goldFoil)"
                stroke="#8F6726"
                strokeWidth="0.45"
              />
              <path
                d="M0 -15.5C2.5 -19.5 -2 -23 1 -27.5"
                stroke="#B38637"
                strokeWidth="1.25"
                strokeLinecap="round"
                transform="rotate(15)"
              />
            </g>
          ))}
          <circle
            cx="0"
            cy="0"
            r="14.5"
            fill="url(#goldFoil)"
            stroke="#8B6324"
            strokeWidth="0.9"
          />
          <circle cx="0" cy="0" r="12" fill="#F6DF9F" stroke="#AA7E34" strokeWidth="0.6" />
          {/* Serene Sun Face */}
          <path d="M-6.2 -2.3C-4.8 -3.5 -3.1 -3.5 -1.9 -2.3" stroke="#7A561E" strokeWidth="0.95" strokeLinecap="round" />
          <path d="M1.9 -2.3C3.1 -3.5 4.8 -3.5 6.2 -2.3" stroke="#7A561E" strokeWidth="0.95" strokeLinecap="round" />
          <circle cx="-4" cy="-1.2" r="0.8" fill="#7A561E" />
          <circle cx="4" cy="-1.2" r="0.8" fill="#7A561E" />
          <path d="M0 -1.5V2.3C0 2.8 0.9 3 1.2 2.7" stroke="#7A561E" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M-3.1 5.2C-1.2 6.6 1.2 6.6 3.1 5.2" stroke="#7A561E" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};

const HeroSkyArtwork: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 right-0 w-full overflow-visible select-none"
  >
    {/* Warm Ambient Sun Glow */}
    <div
      className="absolute -right-8 -top-10 h-60 w-[440px] opacity-65 sm:opacity-90"
      style={{
        background:
          'radial-gradient(circle at 84% 38%, rgba(246, 212, 134, 0.42) 0%, rgba(247, 224, 170, 0.16) 44%, transparent 72%)',
      }}
    />

    {/* Golden Sun Orb & Soft Sketched Clouds above Right Mountain Peaks */}
    <svg
      viewBox="0 0 360 150"
      fill="none"
      className="absolute right-0 top-0 h-[120px] w-[260px] opacity-40 sm:h-[160px] sm:w-[370px] sm:opacity-95"
    >
      <defs>
        <radialGradient id="heroSunOrb" cx="42%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#FDF1C7" />
          <stop offset="52%" stopColor="#F2CE82" />
          <stop offset="100%" stopColor="#DBA84C" stopOpacity="0.82" />
        </radialGradient>
        <radialGradient id="heroSunHalo" cx="50%" cy="50%" r="50%">
          <stop offset="45%" stopColor="#F4CE7C" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#F4CE7C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="304" cy="48" r="46" fill="url(#heroSunHalo)" />
      <circle
        cx="304"
        cy="48"
        r="27"
        fill="url(#heroSunOrb)"
        stroke="#C59846"
        strokeOpacity="0.45"
        strokeWidth="0.9"
      />
      {/* Delicate Cloud Lines */}
      <path
        d="M170 46c8-8 22-8 28 0c5-4 14-3 17 2h-54c3-3 6-4 9-2z"
        stroke="#B99457"
        strokeOpacity="0.45"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M238 35c6-5 15-5 19 0c4-3 10-2 12 2h-38c2-2 5-3 7-2z"
        stroke="#B99457"
        strokeOpacity="0.42"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M322 40c5-4 13-4 17 0c4-2 9-1 11 2h-34"
        stroke="#B99457"
        strokeOpacity="0.42"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
    </svg>

    {/* Engraved Sepia Mountain Ridge on Right Horizon */}
    <img
      src="/birth_mountains.png"
      alt=""
      className="absolute bottom-[-8px] right-[-10px] h-[108px] w-auto opacity-30 sm:bottom-[-12px] sm:right-[-6px] sm:h-[146px] sm:opacity-90 md:h-[164px]"
      style={{
        maskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 100%)',
      }}
    />

    {/* Sacred Parrot Perched Inside Celestial Astrolabe Ring */}
    <img
      src="/birth_parrot.png"
      alt=""
      className="absolute right-[44px] top-[-6px] h-[160px] w-auto opacity-25 sm:right-[145px] sm:top-[-10px] sm:h-[198px] sm:opacity-95 md:right-[235px] md:h-[218px] lg:right-[265px]"
      style={{
        maskImage: 'linear-gradient(to bottom, black 78%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent 100%)',
      }}
    />
  </div>
);

export const AstronomicalProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, setProfileAndDeck } = useDeck();
  const [resolvedProfile, setResolvedProfile] = useState<IBirthProfile | null>(profile);
  const [fetchingProfile, setFetchingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setResolvedProfile(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (authLoading || profile) return;

    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    let active = true;
    setFetchingProfile(true);
    api
      .get('/account')
      .then((response) => {
        if (!active) return;
        const account = response.data?.data;
        const activeDeckData = account?.activeDeckData;
        if (activeDeckData?.profile && activeDeckData?.deck && account?.entitlements) {
          setProfileAndDeck(
            activeDeckData.profile,
            activeDeckData.deck,
            activeDeckData.cards || [],
            account.entitlements,
          );
          setResolvedProfile(activeDeckData.profile);
          return;
        }
        const saved = account?.activeDeckData?.profile || account?.profiles?.[0] || null;
        setResolvedProfile(saved);
      })
      .catch(() => {
        if (active) setResolvedProfile(null);
      })
      .finally(() => {
        if (active) setFetchingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, profile, navigate, setProfileAndDeck]);

  if (authLoading || fetchingProfile) {
    return (
      <div role="status" className="flex min-h-[55vh] flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8C6D3B] border-t-transparent" />
      </div>
    );
  }

  if (!resolvedProfile) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="font-cinzel text-2xl font-bold text-[#171411]">
          <SmallCapsText text="Birth Profile" />
        </h1>
        <p className="mt-2 text-sm text-[#5A5045]">
          Save your permanent birth details first to view your 55-Card Cosmic Blueprint profile.
        </p>
        <Link
          to="/birth-details"
          className="mt-5 inline-flex items-center rounded-full bg-[#8C6D3B] px-5 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#73582D]"
        >
          Enter Birth Details
        </Link>
      </div>
    );
  }

  const details = [
    {
      label: 'Full Name',
      value: resolvedProfile.name,
      renderIcon: () => <UserRound className="h-[20px] w-[20px] shrink-0 text-[#9A7437] stroke-[1.6]" />,
    },
    {
      label: 'Gender',
      value: resolvedProfile.gender || 'Not provided',
      renderIcon: () => <GenderGlyph gender={resolvedProfile.gender} className="h-[20px] w-[20px] shrink-0 text-[#9A7437]" />,
    },
    {
      label: 'Date of Birth',
      value: formatBirthDate(resolvedProfile.dateOfBirth),
      renderIcon: () => <Calendar className="h-[20px] w-[20px] shrink-0 text-[#9A7437] stroke-[1.6]" />,
    },
    {
      label: 'Time of Birth',
      value: formatBirthTime(resolvedProfile.timeOfBirth),
      renderIcon: () => <Clock className="h-[20px] w-[20px] shrink-0 text-[#9A7437] stroke-[1.6]" />,
    },
    {
      label: 'Birthplace',
      value: resolvedProfile.place,
      renderIcon: () => <MapPin className="h-[20px] w-[20px] shrink-0 text-[#9A7437] stroke-[1.6]" />,
    },
    {
      label: 'Timezone',
      value: formatTimezoneDisplay(resolvedProfile.ianaTimezone, resolvedProfile.timezone),
      renderIcon: () => <Globe className="h-[20px] w-[20px] shrink-0 text-[#9A7437] stroke-[1.6]" />,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1060px] flex-1 space-y-5 overflow-x-clip px-4 pb-8 pt-4 sm:space-y-6 sm:px-6 sm:pb-10 sm:pt-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C6D3B] transition-colors hover:text-[#1A1817]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      {/* Top Open Hero Header */}
      <header className="relative flex min-h-[146px] items-center pt-1 sm:min-h-[178px] sm:pt-2">
        <HeroSkyArtwork />

        <div className="relative z-10 max-w-[440px]">
          <p className="flex items-center gap-2.5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7130] sm:text-xs">
            <FourPointStar className="h-3 w-3 shrink-0 text-[#9A7130]" />
            <span>Your Birth Profile</span>
            <FourPointStar className="h-3 w-3 shrink-0 text-[#9A7130]" />
          </p>

          <h1 className="mt-2 font-cinzel text-[32px] font-bold leading-[1.06] tracking-[0.04em] text-[#171411] sm:text-[42px] md:text-[44px]">
            <SmallCapsText text="Birth Profile" />
          </h1>

          <p className="mt-2.5 max-w-[390px] text-[13px] leading-[1.55] text-[#4E453B] sm:text-[14.5px]">
            Your permanent birth details used to generate your unique 55-Card Cosmic Blueprint.
          </p>
        </div>
      </header>

      {/* Main Filigree-Framed Birth Details Card */}
      <section
        aria-labelledby="birth-details-heading"
        className="relative overflow-hidden rounded-[18px] border border-[#D4B475]/85 bg-[#FDFBF6]/95 shadow-[0_12px_34px_-12px_rgba(90,62,22,0.12)]"
      >
        {/* Continuous Subtle Double Inner Border + 4 Corner Scrollwork Flourishes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[9px] rounded-[12px] border border-[#CDA968]/55"
        />
        <CardCornerFiligree position="tl" />
        <CardCornerFiligree position="tr" />
        <CardCornerFiligree position="bl" />
        <CardCornerFiligree position="br" />

        <div className="relative z-10 grid grid-cols-1 p-5 sm:p-7 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-7 lg:py-6">
          {/* Left Column: Celestial Tarot Fan Emblem */}
          <div className="flex items-center justify-center border-b border-[#C9A461]/40 pb-5 lg:my-2 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
            <TarotTriadEmblem />
          </div>

          {/* Right Column: Header + 2x3 Birth Details Grid */}
          <div className="min-w-0 pt-5 lg:pl-7 lg:pt-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2
                id="birth-details-heading"
                className="flex items-center gap-2.5 font-cinzel text-[18px] font-bold tracking-[0.04em] text-[#1A1817] sm:text-[21px]"
              >
                <UserRound className="h-[22px] w-[22px] shrink-0 text-[#9A7234] stroke-[1.6]" />
                <span>
                  <SmallCapsText text="Your Birth Details" />
                </span>
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D29D] bg-[#FAF0D4] px-3.5 py-1.5 text-[12px] font-semibold text-[#4D3A1E] shadow-2xs">
                <Lock className="h-3.5 w-3.5 text-[#7B5A28]" />
                <span>Permanent Profile</span>
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
              {details.map(({ label, value, renderIcon }) => (
                <div
                  key={label}
                  className="flex min-h-[64px] min-w-0 items-center gap-3.5 rounded-[14px] border border-[#E9DEC9] bg-[#F8F3E8]/90 px-4 py-3"
                >
                  {renderIcon()}
                  <div className="min-w-0">
                    <dt className="text-[11.5px] font-medium text-[#5A5045]">{label}</dt>
                    <dd className="mt-0.5 break-words text-[13.5px] font-bold leading-snug text-[#1A1817] sm:text-[14px]">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Bottom Permanent Profile Notice Banner */}
      <aside className="relative flex items-start gap-3.5 overflow-hidden rounded-[16px] border border-[#DFC68E] bg-gradient-to-r from-[#FBF2DB] via-[#FCF6E6] to-[#FAF3DE] px-5 py-4 shadow-[0_4px_16px_rgba(95,68,28,0.06)] sm:items-center sm:gap-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5C57B] bg-[#F7E5B4]/85 text-[#7C5B23] sm:h-11 sm:w-11">
          <AlertCircle className="h-5 w-5 stroke-[1.9]" />
        </div>

        <div className="relative z-10 min-w-0">
          <h2 className="text-[14.5px] font-semibold leading-snug text-[#64451D] sm:text-[16px]">
            Important:{' '}
            <strong className="font-bold text-[#472E0E]">Your Birth Profile</strong> is Permanent
          </h2>
          <p className="mt-1 max-w-[630px] text-[12px] leading-[1.5] text-[#453B30] sm:text-[13px]">
            These details are permanently linked to your account and cannot be changed. If you wish
            to use different birth details, please create a new account.
          </p>
        </div>

        <img
          src="/birth_mountains.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-2 hidden h-[86px] w-auto select-none opacity-45 sm:block"
        />
      </aside>
    </div>
  );
};
