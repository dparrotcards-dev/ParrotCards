import React from 'react';

export interface ResonanceStageInfo {
  percent: number;
  label: string;
  headline: string;
  subtitle: string;
}

export const RESONANCE_MILESTONES = [
  { percent: 0, label: 'Session Start' },
  { percent: 25, label: 'Releasing' },
  { percent: 50, label: 'Dissolving' },
  { percent: 75, label: 'Transforming' },
  { percent: 100, label: 'Released' },
] as const;

export const getResonanceStageInfo = (
  progress: number,
  isPlaying: boolean,
  isComplete: boolean,
): ResonanceStageInfo => {
  const pct = isComplete ? 100 : Math.min(100, Math.max(0, Math.round(progress * 100)));

  if (isComplete || pct >= 100) {
    return {
      percent: 100,
      label: 'Released',
      headline: 'Your shadow is released.',
      subtitle: 'A moment of resonance, complete.',
    };
  }
  if (pct >= 75) {
    return {
      percent: pct,
      label: 'Transforming',
      headline: 'Transforming into golden light.',
      subtitle: 'Warm radiance illuminates the silent core.',
    };
  }
  if (pct >= 50) {
    return {
      percent: pct,
      label: 'Dissolving',
      headline: 'Your shadow gradually dissolves.',
      subtitle: 'Illuminated geometry emerges from within.',
    };
  }
  if (pct >= 25) {
    return {
      percent: pct,
      label: 'Releasing',
      headline: 'Releasing weight into cosmic light.',
      subtitle: 'The violet aura strengthens around you.',
    };
  }
  return {
    percent: pct,
    label: 'Session Start',
    headline: isPlaying ? 'Sitting calmly with the shadow.' : 'Your voice. Your shadow. Your release.',
    subtitle: 'Voice synchronization · Shadow discharge',
  };
};

interface ParticleSpec {
  id: number;
  cx: number;
  cy: number;
  r: number;
  delay: string;
  duration: string;
  kind: 'star' | 'mote';
  threshold: number;
}

const COSMIC_PARTICLES: ParticleSpec[] = [
  { id: 1, cx: 125, cy: 112, r: 1.5, delay: '0s', duration: '3.6s', kind: 'mote', threshold: 0.05 },
  { id: 2, cx: 335, cy: 118, r: 1.5, delay: '0.7s', duration: '4.1s', kind: 'mote', threshold: 0.05 },
  { id: 3, cx: 104, cy: 186, r: 1.3, delay: '1.2s', duration: '3.8s', kind: 'star', threshold: 0.1 },
  { id: 4, cx: 356, cy: 178, r: 1.3, delay: '0.4s', duration: '4.4s', kind: 'star', threshold: 0.1 },
  { id: 5, cx: 152, cy: 76, r: 1.6, delay: '1.6s', duration: '3.9s', kind: 'mote', threshold: 0.15 },
  { id: 6, cx: 308, cy: 74, r: 1.6, delay: '0.9s', duration: '4.2s', kind: 'mote', threshold: 0.15 },
  { id: 7, cx: 144, cy: 238, r: 1.4, delay: '0.2s', duration: '3.5s', kind: 'mote', threshold: 0.25 },
  { id: 8, cx: 318, cy: 240, r: 1.4, delay: '1.1s', duration: '3.9s', kind: 'mote', threshold: 0.25 },
  { id: 9, cx: 168, cy: 158, r: 1.7, delay: '0.5s', duration: '3.4s', kind: 'star', threshold: 0.35 },
  { id: 10, cx: 292, cy: 160, r: 1.7, delay: '1.4s', duration: '3.7s', kind: 'star', threshold: 0.35 },
  { id: 11, cx: 196, cy: 128, r: 1.4, delay: '0.8s', duration: '3.2s', kind: 'mote', threshold: 0.5 },
  { id: 12, cx: 264, cy: 126, r: 1.4, delay: '1.7s', duration: '3.6s', kind: 'mote', threshold: 0.5 },
  { id: 13, cx: 182, cy: 210, r: 1.5, delay: '0.3s', duration: '3.1s', kind: 'mote', threshold: 0.55 },
  { id: 14, cx: 278, cy: 210, r: 1.5, delay: '1.3s', duration: '3.5s', kind: 'mote', threshold: 0.55 },
  { id: 15, cx: 132, cy: 146, r: 1.8, delay: '0.6s', duration: '4.0s', kind: 'star', threshold: 0.65 },
  { id: 16, cx: 328, cy: 146, r: 1.8, delay: '1.9s', duration: '4.3s', kind: 'star', threshold: 0.65 },
  { id: 17, cx: 205, cy: 70, r: 1.6, delay: '0.9s', duration: '3.8s', kind: 'mote', threshold: 0.72 },
  { id: 18, cx: 255, cy: 70, r: 1.6, delay: '0.2s', duration: '3.4s', kind: 'mote', threshold: 0.72 },
  { id: 19, cx: 158, cy: 272, r: 1.6, delay: '1.1s', duration: '3.9s', kind: 'mote', threshold: 0.75 },
  { id: 20, cx: 302, cy: 272, r: 1.6, delay: '0.4s', duration: '3.6s', kind: 'mote', threshold: 0.75 },
  { id: 21, cx: 230, cy: 198, r: 1.3, delay: '1.5s', duration: '2.9s', kind: 'star', threshold: 0.8 },
  { id: 22, cx: 214, cy: 166, r: 1.2, delay: '0.7s', duration: '3.0s', kind: 'mote', threshold: 0.82 },
  { id: 23, cx: 246, cy: 166, r: 1.2, delay: '1.8s', duration: '3.2s', kind: 'mote', threshold: 0.82 },
];

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export interface ResonanceShadowVisualProps {
  progress: number;
  isPlaying: boolean;
  isComplete: boolean;
}

/**
 * Single meditative Shadow Form visualization synchronized strictly with audio progress (0..1).
 * 0%: Dark shadow with subtle purple aura
 * 25%: Purple cosmic aura strengthens, silhouette begins turning translucent
 * 50%: Shadow gradually dissolves, illuminating inner geometry & energy streams
 * 75%: Strong golden-violet glow with golden stardust particles
 * 100%: Shadow disappears completely into an illuminated golden silhouette
 */
export const ResonanceShadowVisual: React.FC<ResonanceShadowVisualProps> = React.memo(
  ({ progress, isPlaying, isComplete }) => {
    const uid = React.useId().replace(/:/g, '');
    const p = isComplete ? 1 : clamp01(progress);

    // Stage-accurate visual curve weights
    const shadowOpacity = p >= 0.995 ? 0 : Math.pow(1 - p, 1.15);
    const purpleAura =
      p < 0.5
        ? 0.45 + (p / 0.5) * 0.5
        : Math.max(0.1, 0.95 - ((p - 0.5) / 0.5) * 0.85);
    const dissolveMist = p < 0.5 ? (p / 0.5) * 0.85 : Math.max(0.2, 0.85 - ((p - 0.5) / 0.5) * 0.65);
    const goldAura = Math.pow(clamp01((p - 0.25) / 0.75), 1.3);
    const goldenReveal = Math.pow(clamp01((p - 0.22) / 0.78), 1.15);
    const innerContours = clamp01(0.18 + p * 0.82);
    const ribbonFlowOpacity =
      p < 0.15
        ? 0
        : p < 0.65
          ? ((p - 0.15) / 0.5) * 0.85
          : 0.85 - ((p - 0.65) / 0.35) * 0.25;
    const smokePlumesOpacity = p < 0.15 ? 0.85 : Math.max(0, 0.85 * Math.pow(1 - p, 1.45));
    const heartBurstOpacity = Math.pow(clamp01((p - 0.62) / 0.38), 1.25);

    const motionState: React.CSSProperties = {
      animationPlayState: isPlaying || isComplete ? 'running' : 'paused',
    };

    // Continuous color interpolation checkpoints for sacred geometry strokes
    const geometryColor = p >= 0.72 ? '#F3CE7B' : p >= 0.4 ? '#D1B8FF' : '#9E82E6';
    const lotusEdgeColor = p >= 0.7 ? '#F8DC93' : p >= 0.35 ? '#CDB6FF' : '#8567CC';

    // Centered anatomical Padmasana (seated meditative lotus) silhouette path
    const bodyPath =
      'M 230 82 ' +
      'C 240.5 82, 246.5 90, 246.5 102 ' +
      'C 246.5 111.5, 241.5 119, 236.5 122.5 ' +
      'C 236 128, 238 132, 246 135.5 ' +
      'C 258 140, 268 144.5, 272 155 ' +
      'C 276 168, 280 183, 284 195 ' +
      'C 289 207, 304 214, 306 225 ' +
      'C 308 235, 298 242, 282 245 ' +
      'C 262 248, 246 250, 230 250 ' +
      'C 214 250, 198 248, 178 245 ' +
      'C 162 242, 152 235, 154 225 ' +
      'C 156 214, 171 207, 176 195 ' +
      'C 180 183, 184 168, 188 155 ' +
      'C 192 144.5, 202 140, 214 135.5 ' +
      'C 222 132, 224 128, 223.5 122.5 ' +
      'C 218.5 119, 213.5 111.5, 213.5 102 ' +
      'C 213.5 90, 219.5 82, 230 82 Z';

    // 5 crescent lunar phases forming the sacred crown arc above the head halo
    const moonCrownAngles = [
      { angle: -42, scale: 0.54, flip: false },
      { angle: -21, scale: 0.68, flip: false },
      { angle: 0, scale: 1.0, flip: false },
      { angle: 21, scale: 0.68, flip: true },
      { angle: 42, scale: 0.54, flip: true },
    ];

    return (
      <svg
        viewBox="0 0 460 322"
        className="h-full w-full select-none"
        role="img"
        aria-label={
          isComplete
            ? 'Illuminated golden meditative silhouette — shadow completely released'
            : `Meditative silhouette at ${Math.round(p * 100)}% resonance`
        }
      >
        <defs>
          {/* Ambient Purple Cosmic Aura */}
          <radialGradient id={`purpleAura-${uid}`} cx="50%" cy="49%" r="50%">
            <stop offset="0%" stopColor="#9D7AF2" stopOpacity="0.88" />
            <stop offset="38%" stopColor="#7248CA" stopOpacity="0.48" />
            <stop offset="72%" stopColor="#3B1E75" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#140D24" stopOpacity="0" />
          </radialGradient>

          {/* Radiant Golden Light Aura */}
          <radialGradient id={`goldAura-${uid}`} cx="50%" cy="49%" r="50%">
            <stop offset="0%" stopColor="#FFF7DC" stopOpacity="0.96" />
            <stop offset="30%" stopColor="#F5CE74" stopOpacity="0.62" />
            <stop offset="65%" stopColor="#C98D32" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#634010" stopOpacity="0" />
          </radialGradient>

          {/* Dark Obsidian Shadow Body Gradient */}
          <linearGradient id={`shadowBody-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B132B" />
            <stop offset="45%" stopColor="#100B1B" />
            <stop offset="100%" stopColor="#08060D" />
          </linearGradient>

          {/* Dissolving Cosmic Lavender Body Gradient */}
          <radialGradient id={`violetBody-${uid}`} cx="50%" cy="46%" r="55%">
            <stop offset="0%" stopColor="#E6DCFF" stopOpacity="0.82" />
            <stop offset="52%" stopColor="#9D82E9" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#4F3790" stopOpacity="0.52" />
          </radialGradient>

          {/* Fully Illuminated Golden Body Gradient */}
          <radialGradient id={`goldenBody-${uid}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFFF4" />
            <stop offset="42%" stopColor="#FCE79C" />
            <stop offset="82%" stopColor="#E8B856" />
            <stop offset="100%" stopColor="#BF8328" />
          </radialGradient>

          {/* Flowing Cosmic Energy Stream Gradient */}
          <linearGradient id={`energyStream-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={p >= 0.55 ? '#F6D178' : '#9B7CF2'} stopOpacity="0" />
            <stop offset="48%" stopColor={p >= 0.55 ? '#FFF3C4' : '#DECFFF'} stopOpacity="0.95" />
            <stop offset="100%" stopColor={p >= 0.55 ? '#D8A24A' : '#8562DD'} stopOpacity="0" />
          </linearGradient>

          {/* Lotus Petal Gradient */}
          <linearGradient id={`lotusPetal-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={p >= 0.72 ? '#FFF6D8' : '#D5C2FF'}
              stopOpacity={0.32 + p * 0.55}
            />
            <stop
              offset="100%"
              stopColor={p >= 0.72 ? '#B57D29' : '#3C2769'}
              stopOpacity={0.22 + p * 0.35}
            />
          </linearGradient>

          {/* Chest Heart Star Glow */}
          <radialGradient id={`heartCore-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFF0B8" stopOpacity="0.95" />
            <stop offset="68%" stopColor="#F0B954" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F0B954" stopOpacity="0" />
          </radialGradient>

          {/* Smoke & Glow Blur Filters */}
          <filter id={`smokeBlur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={`auraBloom-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <filter id={`crispGlow-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Silhouette Clip for Inner Stardust Details Revealed During Dissolution */}
          <clipPath id={`silhouetteClip-${uid}`}>
            <path d={bodyPath} />
          </clipPath>
        </defs>

        {/* 1. Deep Cosmic Backlight Auras */}
        <ellipse
          cx="230"
          cy="176"
          rx="168"
          ry="142"
          fill={`url(#purpleAura-${uid})`}
          opacity={purpleAura}
        />
        <ellipse
          cx="230"
          cy="172"
          rx="165"
          ry="145"
          fill={`url(#goldAura-${uid})`}
          opacity={goldAura}
        />

        {/* 2. Swirling Shadow Smoke Plumes (fade away cleanly as shadow releases) */}
        <g
          opacity={smokePlumesOpacity}
          filter={`url(#smokeBlur-${uid})`}
          className="resonance-smoke-drift"
          style={motionState}
        >
          <path
            d="M174 176 C140 164, 128 134, 152 116 C168 104, 178 124, 166 138 C154 152, 168 164, 184 166 Z"
            fill="#5D3EA8"
            opacity="0.55"
          />
          <path
            d="M286 176 C320 164, 332 134, 308 116 C292 104, 282 124, 294 138 C306 152, 292 164, 276 166 Z"
            fill="#5D3EA8"
            opacity="0.55"
          />
          <path
            d="M162 228 C122 222, 114 190, 144 178 C158 172, 168 192, 154 205 Z"
            fill="#3B2372"
            opacity="0.65"
          />
          <path
            d="M298 228 C338 222, 346 190, 316 178 C302 172, 292 192, 306 205 Z"
            fill="#3B2372"
            opacity="0.65"
          />
        </g>

        {/* 3. Sacred Geometry Halo & Five-Moon Lunar Crown */}
        <g
          stroke={geometryColor}
          fill="none"
          opacity={0.34 + p * 0.56}
          style={{ transition: 'opacity 180ms linear' }}
        >
          {/* Outer Dotted Orbit Ring */}
          <circle cx="230" cy="142" r="96" strokeWidth="0.9" strokeDasharray="1.8 4.4" opacity="0.65" />
          {/* Main Astrolabe Ring */}
          <circle cx="230" cy="142" r="81" strokeWidth="1.05" opacity="0.85" />
          {/* Inner Mandala Rings */}
          <circle cx="230" cy="142" r="64" strokeWidth="0.8" opacity="0.55" />
          <circle cx="230" cy="142" r="46" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.45" />

          {/* Eight Cardinal & Diagonal Geometry Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="230"
              y1="52"
              x2="230"
              y2="92"
              strokeWidth={deg % 90 === 0 ? '0.9' : '0.6'}
              opacity={deg % 90 === 0 ? '0.6' : '0.35'}
              transform={`rotate(${deg} 230 142)`}
            />
          ))}

          {/* Sacred Diamond Star Polygon */}
          <polygon
            points="230,68 294,142 230,216 166,142"
            strokeWidth="0.75"
            opacity="0.34"
          />
          <rect
            x="185"
            y="97"
            width="90"
            height="90"
            strokeWidth="0.7"
            opacity="0.28"
          />

          {/* Subtle Constellation Vertex Dots on Ring */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={`dot-${deg}`}
              cx="230"
              cy="61"
              r="1.6"
              fill={geometryColor}
              transform={`rotate(${deg} 230 142)`}
            />
          ))}
        </g>

        {/* Five Crescent Moon Phases Crowning the Halo */}
        <g
          fill={geometryColor}
          opacity={0.42 + p * 0.56}
          filter={p >= 0.6 ? `url(#crispGlow-${uid})` : undefined}
        >
          {moonCrownAngles.map(({ angle, scale, flip }, index) => (
            <g key={index} transform={`rotate(${angle} 230 142)`}>
              <g transform={`translate(230 43) scale(${flip ? -scale : scale} ${scale})`}>
                {index === 2 ? (
                  <path d="M-8 -2 C-6 5, 6 5, 8 -2 C5 2.5, -5 2.5, -8 -2 Z" />
                ) : (
                  <path d="M-2 -7 C4 -5, 6 2, 1 7 C-1 4, -1 -2, -2 -7 Z" />
                )}
              </g>
            </g>
          ))}
        </g>

        {/* 4. Sculpted Lotus Flower Throne Base (Padmasana Pedestal) */}
        <g stroke={lotusEdgeColor} strokeWidth="1" opacity={0.42 + p * 0.56}>
          {/* Outer Low Petals */}
          <path
            d="M230 252 C192 252, 152 256, 134 252 C154 268, 192 276, 230 276 C268 276, 306 268, 326 252 C308 256, 268 252, 230 252 Z"
            fill={`url(#lotusPetal-${uid})`}
          />
          {/* Mid-Left & Mid-Right Petals */}
          <path
            d="M214 250 C184 246, 160 252, 150 264 C168 276, 196 278, 224 274 Z"
            fill={`url(#lotusPetal-${uid})`}
          />
          <path
            d="M246 250 C276 246, 300 252, 310 264 C292 276, 264 278, 236 274 Z"
            fill={`url(#lotusPetal-${uid})`}
          />
          {/* Inner Flanking Petals */}
          <path
            d="M222 246 C204 244, 186 252, 178 268 C194 279, 212 281, 228 278 Z"
            fill={`url(#lotusPetal-${uid})`}
          />
          <path
            d="M238 246 C256 244, 274 252, 282 268 C266 279, 248 281, 232 278 Z"
            fill={`url(#lotusPetal-${uid})`}
          />
          {/* Center Front Lotus Petal */}
          <path
            d="M230 243 C244 252, 247 271, 230 286 C213 271, 216 252, 230 243 Z"
            fill={`url(#lotusPetal-${uid})`}
            strokeWidth="1.25"
          />
        </g>

        {/* 5. Flowing Cosmic Particles & Golden Light Dust */}
        <g className="resonance-particles-layer" style={motionState}>
          {COSMIC_PARTICLES.map((particle) => {
            const visible = clamp01((p - particle.threshold + 0.25) / 0.35);
            const isGoldPhase = p >= 0.55 || particle.threshold >= 0.5;
            const fillColor = isGoldPhase ? '#FFE499' : '#D5C3FF';
            const particleOpacity = (0.16 + visible * 0.78) * (isPlaying || isComplete ? 1 : 0.65);

            return particle.kind === 'star' ? (
              <path
                key={particle.id}
                d="M0 -4.2C0.5 -1.1 1.1 -0.5 4.2 0C1.1 0.5 0.5 1.1 0 4.2C-0.5 1.1 -1.1 0.5 -4.2 0C-1.1 -0.5 -0.5 -1.1 0 -4.2Z"
                fill={fillColor}
                opacity={particleOpacity}
                transform={`translate(${particle.cx} ${particle.cy}) scale(${particle.r * 0.65})`}
                className="resonance-particle-twinkle"
                style={{
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  animationPlayState: isPlaying || isComplete ? 'running' : 'paused',
                }}
              />
            ) : (
              <circle
                key={particle.id}
                cx={particle.cx}
                cy={particle.cy}
                r={particle.r}
                fill={fillColor}
                opacity={particleOpacity}
                className="resonance-particle-twinkle"
                style={{
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  animationPlayState: isPlaying || isComplete ? 'running' : 'paused',
                }}
              />
            );
          })}
        </g>

        {/* 6. ONE Consistent Meditative Shadow Form Character (Continuously Morphing 0% -> 100%) */}
        <g>
          {/* Outer Luminous Halo Silhouette Bloom (grows stronger as shadow dissolves into light) */}
          <path
            d={bodyPath}
            fill={p >= 0.62 ? '#F6CF75' : '#9B7BF0'}
            opacity={0.18 + dissolveMist * 0.3 + goldenReveal * 0.52}
            filter={`url(#auraBloom-${uid})`}
          />

          {/* Layer A: Cosmic Lavender Dissolving Form (25%..75% transitional cosmic body) */}
          <path
            d={bodyPath}
            fill={`url(#violetBody-${uid})`}
            opacity={dissolveMist}
            stroke="#CBB7FF"
            strokeWidth="1.2"
            strokeOpacity={0.3 + dissolveMist * 0.5}
          />

          {/* Layer B: Dark Obsidian Shadow Form (100% at start -> 0% completely gone at completion) */}
          <path
            d={bodyPath}
            fill={`url(#shadowBody-${uid})`}
            opacity={shadowOpacity}
            stroke="#7F5CE0"
            strokeWidth="1.15"
            strokeOpacity={shadowOpacity * 0.72}
          />

          {/* Inner Illuminated Cosmic Starry Details Revealed Inside Silhouette (25%..85%) */}
          <g clipPath={`url(#silhouetteClip-${uid})`} opacity={clamp01(p * 1.4) * (1 - goldenReveal * 0.45)}>
            {/* Subtle Spinal Meridian Chakra Points */}
            {[110, 142, 166, 192, 218].map((cy, idx) => (
              <circle
                key={idx}
                cx="230"
                cy={cy}
                r={idx === 2 ? 4.2 : 2.3}
                fill={p >= 0.65 ? '#FFEAA8' : '#E3D4FF'}
                opacity={0.35 + p * 0.5}
                filter={`url(#crispGlow-${uid})`}
              />
            ))}
            {/* Fine Stardust Flecks Inside Dissolving Form */}
            <circle cx="216" cy="156" r="1" fill="#F2E7FF" opacity="0.7" />
            <circle cx="244" cy="158" r="1" fill="#F2E7FF" opacity="0.7" />
            <circle cx="222" cy="184" r="1.2" fill="#FFE6A3" opacity="0.6" />
            <circle cx="238" cy="182" r="1.2" fill="#FFE6A3" opacity="0.6" />
            <circle cx="206" cy="202" r="1" fill="#F2E7FF" opacity="0.55" />
            <circle cx="254" cy="202" r="1" fill="#F2E7FF" opacity="0.55" />
          </g>

          {/* Layer C: Illuminated Golden Silhouette (emerges subtly from 25%, peaks brilliantly at 100%) */}
          <path
            d={bodyPath}
            fill={`url(#goldenBody-${uid})`}
            opacity={goldenReveal}
            stroke="#FFF4CC"
            strokeWidth="1.5"
            strokeOpacity={goldenReveal * 0.92}
            filter={goldenReveal > 0.4 ? `url(#crispGlow-${uid})` : undefined}
          />

          {/* Anatomical Inner Contour Highlights (arms, collarbones, lotus legs, palms on knees) */}
          <g
            fill="none"
            stroke={p >= 0.65 ? '#FFF9E2' : '#D5C4FF'}
            strokeLinecap="round"
            opacity={innerContours * 0.58}
          >
            {/* Subtle Jaw & Collarbone Shadow/Light Contour */}
            <path d="M217 137 Q230 144 243 137" strokeWidth="1" />
            {/* Inner Upper Arm & Torso Waist Framing */}
            <path d="M196 164 C199 182, 198 198, 191 213" strokeWidth="1.15" />
            <path d="M264 164 C261 182, 262 198, 269 213" strokeWidth="1.15" />
            {/* Crossed Meditative Legs Fold & Resting Forearms */}
            <path d="M174 224 C194 218, 214 228, 230 237 C246 228, 266 218, 286 224" strokeWidth="1.15" />
            <path d="M161 232 C178 242, 206 244, 230 241 C254 244, 282 242, 299 232" strokeWidth="0.95" />
          </g>

          {/* 7. Flowing Sinuous Cosmic Energy Streams (Rising across body during 20%..95%) */}
          <g fill="none" opacity={ribbonFlowOpacity} filter={`url(#crispGlow-${uid})`}>
            <path
              d="M178 248 C210 226, 258 214, 268 182 C276 156, 216 144, 208 118"
              stroke={`url(#energyStream-${uid})`}
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <path
              d="M282 248 C250 226, 202 214, 192 182 C184 156, 244 144, 252 118"
              stroke={`url(#energyStream-${uid})`}
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* 8. Golden Heart Chakra Burst at Chest Center (75%..100%) */}
          <g transform="translate(230 166)" opacity={heartBurstOpacity}>
            <g className="resonance-heart-pulse" style={motionState}>
              <circle cx="0" cy="0" r="24" fill={`url(#heartCore-${uid})`} />
              {/* Radiant 8-Point Golden Star Rays */}
              <path
                d="M0 -19 L2.2 -3.2 L19 0 L2.2 3.2 L0 19 L-2.2 3.2 L-19 0 L-2.2 -3.2 Z"
                fill="#FFFDF0"
              />
              <path
                d="M0 -12 L1.6 -1.6 L12 0 L1.6 1.6 L0 12 L-1.6 1.6 L-12 0 L-1.6 -1.6 Z"
                fill="#FFE38E"
                transform="rotate(45)"
              />
              <circle cx="0" cy="0" r="4.2" fill="#FFFFFF" />
            </g>
          </g>
        </g>
      </svg>
    );
  },
);

ResonanceShadowVisual.displayName = 'ResonanceShadowVisual';
