import React, { MutableRefObject, useEffect, useRef } from 'react';
import { normalizeDegrees, shortestAngleDelta } from '../utils/compassMath';

interface SacredCompassDialProps {
  shrineName: string;
  trueBearing: number | null;
  liveHeadingRef: MutableRefObject<number | null>;
  isLiveCompassActive: boolean;
  isAligned: boolean;
}

const MAJOR_TICKS = Array.from({ length: 12 }, (_, idx) => idx * 30);
const MINOR_TICKS = Array.from({ length: 72 }, (_, idx) => idx * 5).filter((deg) => deg % 30 !== 0);
const INTERCARDINALS = [
  { label: 'NE', angle: 45 },
  { label: 'SE', angle: 135 },
  { label: 'SW', angle: 225 },
  { label: 'NW', angle: 315 },
];

export const SacredCompassDial: React.FC<SacredCompassDialProps> = ({
  shrineName,
  trueBearing,
  liveHeadingRef,
  isLiveCompassActive,
  isAligned,
}) => {
  const dialLayerRef = useRef<SVGSVGElement>(null);
  const needleLayerRef = useRef<SVGSVGElement>(null);
  const dialAngleRef = useRef(0);
  const needleAngleRef = useRef(trueBearing !== null ? normalizeDegrees(trueBearing) : 0);

  // Drive SVG rotation directly on GPU-composited layers at 60fps without CSS transition restart stutter
  useEffect(() => {
    let rafId = 0;

    const applyTransform = (el: SVGSVGElement | null, angle: number) => {
      if (!el) return;
      el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    };

    const tick = () => {
      const liveHeading = isLiveCompassActive ? liveHeadingRef.current : null;
      const targetDial = liveHeading !== null ? normalizeDegrees(-liveHeading) : 0;
      const targetNeedle =
        trueBearing !== null
          ? liveHeading !== null
            ? normalizeDegrees(trueBearing - liveHeading)
            : normalizeDegrees(trueBearing)
          : 0;

      const dialDelta = shortestAngleDelta(dialAngleRef.current, targetDial);
      const needleDelta = shortestAngleDelta(needleAngleRef.current, targetNeedle);

      // Snap tiny residuals cleanly, glide smoothly across larger turns
      dialAngleRef.current =
        Math.abs(dialDelta) < 0.05 ? dialAngleRef.current + dialDelta : dialAngleRef.current + dialDelta * 0.28;
      needleAngleRef.current =
        Math.abs(needleDelta) < 0.05
          ? needleAngleRef.current + needleDelta
          : needleAngleRef.current + needleDelta * 0.28;

      applyTransform(dialLayerRef.current, dialAngleRef.current);
      applyTransform(needleLayerRef.current, needleAngleRef.current);

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isLiveCompassActive, liveHeadingRef, trueBearing]);

  const hasBearing = trueBearing !== null;

  return (
    <div className="relative mx-auto flex w-full max-w-[300px] flex-col items-center sm:max-w-[340px]">
      <div
        role="img"
        aria-label={
          hasBearing
            ? `Compass pointing toward ${shrineName} at ${Math.round(trueBearing)} degrees true north`
            : 'Jyotirlinga compass dial ready for location access'
        }
        className={`relative aspect-square w-full rounded-full p-2 transition-shadow duration-500 select-none ${
          isAligned && isLiveCompassActive && hasBearing
            ? 'shadow-[0_0_42px_rgba(201,148,54,0.38)]'
            : 'shadow-[0_14px_34px_rgba(54,39,22,0.12)]'
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {/* Layer 1: Stationary Ivory Bezel & Fixed Top Lubber Pointer */}
          <svg viewBox="0 0 360 360" aria-hidden="true" className="h-full w-full block">
            <defs>
              <radialGradient id="compassIvoryFace" cx="50%" cy="46%" r="54%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="72%" stopColor="#F9F2E5" />
                <stop offset="100%" stopColor="#EFE3CE" />
              </radialGradient>
              <linearGradient id="compassGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D7B26A" />
                <stop offset="50%" stopColor="#9A7432" />
                <stop offset="100%" stopColor="#C9A25B" />
              </linearGradient>
            </defs>

            <circle
              cx="180"
              cy="180"
              r="171"
              fill="url(#compassIvoryFace)"
              stroke="url(#compassGoldRing)"
              strokeWidth="3.5"
            />
            <circle cx="180" cy="180" r="162" fill="none" stroke="#DFCEAF" strokeWidth="1" />

            {isAligned && isLiveCompassActive && hasBearing && (
              <circle
                cx="180"
                cy="180"
                r="146"
                fill="none"
                stroke="#C99436"
                strokeWidth="2.5"
                strokeOpacity="0.45"
              />
            )}
          </svg>

          {/* Layer 2: GPU-Composited Rotating Compass Rose Dial */}
          <svg
            ref={dialLayerRef}
            viewBox="0 0 360 360"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
          >
            <circle cx="180" cy="180" r="142" fill="none" stroke="#E2D3B8" strokeWidth="1" />
            <circle
              cx="180"
              cy="180"
              r="102"
              fill="none"
              stroke="#D8C39E"
              strokeWidth="0.9"
              strokeDasharray="2 5"
            />
            <circle cx="180" cy="180" r="66" fill="none" stroke="#E8DEC9" strokeWidth="0.9" />

            <line x1="180" y1="68" x2="180" y2="292" stroke="#E7DCC7" strokeWidth="1" />
            <line x1="68" y1="180" x2="292" y2="180" stroke="#E7DCC7" strokeWidth="1" />

            {MINOR_TICKS.map((deg) => (
              <line
                key={`minor-${deg}`}
                x1="180"
                y1="21"
                x2="180"
                y2={deg % 15 === 0 ? '28' : '25'}
                stroke={deg % 15 === 0 ? '#A88E65' : '#D2C1A3'}
                strokeWidth={deg % 15 === 0 ? '1.3' : '0.9'}
                transform={`rotate(${deg} 180 180)`}
              />
            ))}

            {MAJOR_TICKS.map((deg) => (
              <line
                key={`major-${deg}`}
                x1="180"
                y1="19"
                x2="180"
                y2="32"
                stroke={deg % 90 === 0 ? '#7A5925' : '#9C7E4D'}
                strokeWidth={deg % 90 === 0 ? '2.2' : '1.4'}
                transform={`rotate(${deg} 180 180)`}
              />
            ))}

            {INTERCARDINALS.map(({ label, angle }) => (
              <text
                key={label}
                x="180"
                y="62"
                textAnchor="middle"
                fill="#8C7759"
                fontSize="10"
                fontWeight="600"
                letterSpacing="1.2"
                className="font-cinzel"
                transform={`rotate(${angle} 180 180)`}
              >
                {label}
              </text>
            ))}

            <text
              x="180"
              y="55"
              textAnchor="middle"
              fill="#8E2D24"
              fontSize="18"
              fontWeight="800"
              className="font-cinzel"
            >
              N
            </text>
            <text
              x="312"
              y="186"
              textAnchor="middle"
              fill="#3A2A1A"
              fontSize="16"
              fontWeight="700"
              className="font-cinzel"
            >
              E
            </text>
            <text
              x="180"
              y="320"
              textAnchor="middle"
              fill="#3A2A1A"
              fontSize="16"
              fontWeight="700"
              className="font-cinzel"
            >
              S
            </text>
            <text
              x="48"
              y="186"
              textAnchor="middle"
              fill="#3A2A1A"
              fontSize="16"
              fontWeight="700"
              className="font-cinzel"
            >
              W
            </text>
          </svg>

          {/* Layer 3: GPU-Composited Rotating Jyotirlinga Needle */}
          <svg
            ref={needleLayerRef}
            viewBox="0 0 360 360"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
            style={{ opacity: hasBearing ? 1 : 0.35 }}
          >
            <defs>
              <linearGradient id="needleGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E4BD69" />
                <stop offset="55%" stopColor="#B88937" />
                <stop offset="100%" stopColor="#7C5A21" />
              </linearGradient>
            </defs>

            {hasBearing && (
              <path
                d="M 180 56 L 195 178 L 180 184 L 165 178 Z"
                fill="#C99436"
                fillOpacity={isAligned ? '0.26' : '0.12'}
              />
            )}

            {/* Single Golden Directional Arrow pointing strictly to the selected Jyotirlinga */}
            <polygon points="180,58 193,104 184,99 184,180 180,180" fill="url(#needleGold)" />
            <polygon points="180,58 167,104 176,99 176,180 180,180" fill="#8E6725" />

            {/* Sacred Jewel Pivot */}
            <circle cx="180" cy="180" r="14" fill="#FFFDF9" stroke="#8C6D3B" strokeWidth="2.5" />
            <circle cx="180" cy="180" r="6.5" fill="#B58634" />
            <circle cx="180" cy="180" r="2.2" fill="#FFFDF9" />
          </svg>
        </div>
      </div>

      {/* Mode Indicator Caption */}
      <p
        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-medium tracking-wide ${
          isAligned && isLiveCompassActive && hasBearing
            ? 'border-[#C99436]/55 bg-[#FBF1DA] text-[#6D4C17]'
            : 'border-[#E6DCCB] bg-[#FAF4EA] text-[#5F5243]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${
            isLiveCompassActive
              ? isAligned && hasBearing
                ? 'bg-[#C99436]'
                : 'bg-[#4E8C5C]'
              : 'bg-[#9A783D]'
          }`}
        />
        {isLiveCompassActive
          ? !hasBearing
            ? 'Live compass active — allow location to aim target needle'
            : isAligned
              ? `Exact direction matched — ${shrineName} is straight ahead`
              : 'Live compass active — rotate phone in real time'
          : !hasBearing
            ? 'Waiting for geographical location'
            : 'True-North reference (Top of dial = North)'}
      </p>
    </div>
  );
};

