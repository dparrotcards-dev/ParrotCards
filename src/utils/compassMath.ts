const EARTH_RADIUS_KM = 6371.0088;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

export const normalizeDegrees = (degrees: number): number => ((degrees % 360) + 360) % 360;

/**
 * Signed shortest rotation in [-180, 180] from `fromDeg` to `toDeg`,
 * preventing 359° -> 1° needle whip transitions.
 */
export const shortestAngleDelta = (fromDeg: number, toDeg: number): number => {
  const diff = ((toDeg - fromDeg + 540) % 360) - 180;
  return diff === -180 ? 180 : diff;
};

/**
 * Circular exponential smoothing for noisy magnetometer headings.
 */
export const smoothCompassHeading = (
  previousHeading: number | null,
  nextHeading: number,
  alpha = 0.25,
): number => {
  const normalizedNext = normalizeDegrees(nextHeading);
  if (previousHeading === null || !Number.isFinite(previousHeading)) {
    return normalizedNext;
  }
  const delta = shortestAngleDelta(previousHeading, normalizedNext);
  return normalizeDegrees(previousHeading + delta * alpha);
};

/**
 * Computes continuous cumulative CSS angle closest to `previousAngle` so SVG rotations glide cleanly.
 */
export const stepContinuousAngle = (previousAngle: number, targetDegrees: number): number =>
  previousAngle + shortestAngleDelta(previousAngle, targetDegrees);

/**
 * Haversine great-circle distance in kilometers.
 */
export const calculateDistanceKm = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number => {
  const phi1 = toRadians(fromLat);
  const phi2 = toRadians(toLat);
  const dPhi = toRadians(toLat - fromLat);
  const dLambda = toRadians(toLon - fromLon);

  const sinHalfPhi = Math.sin(dPhi / 2);
  const sinHalfLambda = Math.sin(dLambda / 2);
  const a =
    sinHalfPhi * sinHalfPhi +
    Math.cos(phi1) * Math.cos(phi2) * sinHalfLambda * sinHalfLambda;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));

  return EARTH_RADIUS_KM * c;
};

/**
 * Initial true-north bearing clockwise in degrees [0, 360).
 */
export const calculateBearingDegrees = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number => {
  const phi1 = toRadians(fromLat);
  const phi2 = toRadians(toLat);
  const dLambda = toRadians(toLon - fromLon);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
};

const COMPASS_POINTS = [
  { short: 'N', full: 'North' },
  { short: 'NNE', full: 'North-Northeast' },
  { short: 'NE', full: 'Northeast' },
  { short: 'ENE', full: 'East-Northeast' },
  { short: 'E', full: 'East' },
  { short: 'ESE', full: 'East-Southeast' },
  { short: 'SE', full: 'Southeast' },
  { short: 'SSE', full: 'South-Southeast' },
  { short: 'S', full: 'South' },
  { short: 'SSW', full: 'South-Southwest' },
  { short: 'SW', full: 'Southwest' },
  { short: 'WSW', full: 'West-Southwest' },
  { short: 'W', full: 'West' },
  { short: 'WNW', full: 'West-Northwest' },
  { short: 'NW', full: 'Northwest' },
  { short: 'NNW', full: 'North-Northwest' },
] as const;

export const getCardinalDirection = (bearingDegrees: number): { short: string; full: string } => {
  const normalized = normalizeDegrees(bearingDegrees);
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_POINTS[index];
};

export const formatDistanceLabel = (distanceKm: number): string => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return '— km';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm).toLocaleString()} km`;
};

export const formatCoordinatePair = (latitude: number, longitude: number): string => {
  const latHem = latitude >= 0 ? 'N' : 'S';
  const lonHem = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}° ${latHem}, ${Math.abs(longitude).toFixed(4)}° ${lonHem}`;
};

export interface CompassOrientationSample {
  alpha: number | null;
  beta?: number | null;
  gamma?: number | null;
  absolute?: boolean;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

export interface CompassHeadingExtraction {
  heading: number | null;
  source: 'ios-webkit' | 'absolute-orientation' | 'sensor-quaternion' | null;
  uncalibrated?: boolean;
}

export const getScreenOrientationAngle = (): number => {
  if (typeof window === 'undefined') return 0;
  if (typeof window.screen?.orientation?.angle === 'number') {
    return window.screen.orientation.angle;
  }
  const legacyOrientation = (window as Window & { orientation?: unknown }).orientation;
  return typeof legacyOrientation === 'number' && Number.isFinite(legacyOrientation)
    ? legacyOrientation
    : 0;
};

/**
 * Extracts tilt-compensated true-north heading [0, 360) from an ENU unit quaternion [x, y, z, w].
 */
export const extractHeadingFromQuaternion = (
  quaternion: readonly number[],
  screenAngle = 0,
): number | null => {
  if (quaternion.length < 4) return null;
  const [qx, qy, qz, qw] = quaternion;
  if (
    !Number.isFinite(qx) ||
    !Number.isFinite(qy) ||
    !Number.isFinite(qz) ||
    !Number.isFinite(qw)
  ) {
    return null;
  }

  const rotateByQuat = (vx: number, vy: number, vz: number) => {
    const cx1 = qy * vz - qz * vy;
    const cy1 = qz * vx - qx * vz;
    const cz1 = qx * vy - qy * vx;

    const tx = 2 * (cx1 + qw * vx);
    const ty = 2 * (cy1 + qw * vy);
    const tz = 2 * (cz1 + qw * vz);

    return {
      x: vx + qy * tz - qz * ty,
      y: vy + qz * tx - qx * tz,
      z: vz + qx * ty - qy * tx,
    };
  };

  const screenRad = toRadians(screenAngle);
  const topInWorld = rotateByQuat(Math.sin(screenRad), Math.cos(screenRad), 0);
  const horizontalMag = Math.hypot(topInWorld.x, topInWorld.y);

  // When held nearly vertical (> ~70 deg), follow camera/back (-Z) vector so azimuth never flips 180°
  const dir = horizontalMag >= 0.35 ? topInWorld : rotateByQuat(0, 0, -1);
  if (Math.hypot(dir.x, dir.y) < 1e-4) return null;

  return normalizeDegrees(toDegrees(Math.atan2(dir.x, dir.y)));
};

/**
 * Computes W3C intrinsic Z(alpha)-X'(beta)-Y''(gamma) tilt-compensated azimuth.
 */
const extractHeadingFromAbsoluteEuler = (
  alphaDeg: number,
  betaDeg: number | null | undefined,
  gammaDeg: number | null | undefined,
  screenAngle = 0,
): number => {
  if (
    typeof betaDeg !== 'number' ||
    !Number.isFinite(betaDeg) ||
    typeof gammaDeg !== 'number' ||
    !Number.isFinite(gammaDeg)
  ) {
    return normalizeDegrees(360 - alphaDeg + screenAngle);
  }

  const a = toRadians(alphaDeg);
  const b = toRadians(betaDeg);
  const g = toRadians(gammaDeg);

  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const cg = Math.cos(g);
  const sg = Math.sin(g);

  // Rotation matrix mapping device frame to ENU (W3C DeviceOrientation Spec Section 4.3)
  const m11 = cg * ca - sg * sb * sa;
  const m12 = -cb * sa;
  const m13 = ca * sg + cg * sb * sa;
  const m21 = cg * sa + sg * sb * ca;
  const m22 = cb * ca;
  const m23 = sa * sg - cg * sb * ca;

  const screenRad = toRadians(screenAngle);
  const vx = Math.sin(screenRad);
  const vy = Math.cos(screenRad);

  const topEast = m11 * vx + m12 * vy;
  const topNorth = m21 * vx + m22 * vy;

  if (Math.hypot(topEast, topNorth) >= 0.35) {
    return normalizeDegrees(toDegrees(Math.atan2(topEast, topNorth)));
  }

  // Camera back (-Z): -column 3
  return normalizeDegrees(toDegrees(Math.atan2(-m13, -m23)));
};

/**
 * Extracts a verified true/magnetic north heading ONLY when the browser provides a true compass source.
 * Never treats arbitrary relative `alpha` (where `absolute !== true`) as true north.
 */
export const extractVerifiedCompassHeading = (
  sample: CompassOrientationSample,
  screenAngle = 0,
): CompassHeadingExtraction => {
  if (
    typeof sample.webkitCompassHeading === 'number' &&
    Number.isFinite(sample.webkitCompassHeading) &&
    sample.webkitCompassHeading >= 0
  ) {
    if (
      typeof sample.webkitCompassAccuracy === 'number' &&
      sample.webkitCompassAccuracy < 0
    ) {
      return { heading: null, source: null, uncalibrated: true };
    }
    return {
      heading: normalizeDegrees(sample.webkitCompassHeading),
      source: 'ios-webkit',
    };
  }

  if (
    sample.absolute === true &&
    typeof sample.alpha === 'number' &&
    Number.isFinite(sample.alpha)
  ) {
    return {
      heading: extractHeadingFromAbsoluteEuler(
        sample.alpha,
        sample.beta,
        sample.gamma,
        screenAngle,
      ),
      source: 'absolute-orientation',
    };
  }

  return { heading: null, source: null };
};
