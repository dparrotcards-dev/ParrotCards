import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  CompassHeadingExtraction,
  extractHeadingFromQuaternion,
  extractVerifiedCompassHeading,
  getScreenOrientationAngle,
  shortestAngleDelta,
  smoothCompassHeading,
} from '../utils/compassMath';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'
  | 'insecure';

export type CompassSensorStatus =
  | 'checking'
  | 'active'
  | 'permission-required'
  | 'denied'
  | 'desktop'
  | 'unsupported';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
}

interface DeviceOrientationEventWithCompass extends DeviceOrientationEvent {
  readonly webkitCompassHeading?: number;
  readonly webkitCompassAccuracy?: number;
}

interface DeviceOrientationPermissionConstructor {
  requestPermission?: (absolute?: boolean) => Promise<'granted' | 'denied'>;
}

interface AbsoluteOrientationSensorLike extends EventTarget {
  readonly quaternion?: number[] | null;
  start(): void;
  stop(): void;
}

type AbsoluteOrientationSensorConstructor = new (options?: {
  frequency?: number;
  referenceFrame?: 'device' | 'screen';
}) => AbsoluteOrientationSensorLike;

const isLikelyDesktopBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  if (!coarsePointer && maxTouchPoints === 0) return true;
  if (finePointer && !coarsePointer) return true;
  return false;
};

const isAppleTouchDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIPhoneOrIPad = /iPad|iPhone|iPod/.test(ua);
  const isIPadOsDesktopUa = /Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
  return isIPhoneOrIPad || isIPadOsDesktopUa;
};

const getOrientationPermissionRequester = ():
  | ((absolute?: boolean) => Promise<'granted' | 'denied'>)
  | null => {
  if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
    return null;
  }
  const ctor = DeviceOrientationEvent as unknown as DeviceOrientationPermissionConstructor;
  return typeof ctor.requestPermission === 'function' ? ctor.requestPermission.bind(ctor) : null;
};

const getAbsoluteOrientationSensorClass = (): AbsoluteOrientationSensorConstructor | null => {
  if (typeof window === 'undefined') return null;
  const maybeCtor = (window as Window & { AbsoluteOrientationSensor?: AbsoluteOrientationSensorConstructor })
    .AbsoluteOrientationSensor;
  return typeof maybeCtor === 'function' ? maybeCtor : null;
};

export interface UseJyotirlingaCompassResult {
  locationStatus: LocationStatus;
  locationError: string | null;
  coordinates: UserCoordinates | null;
  requestLocation: () => void;
  sensorStatus: CompassSensorStatus;
  sensorSource: CompassHeadingExtraction['source'];
  sensorMessage: string | null;
  deviceHeading: number | null;
  liveHeadingRef: MutableRefObject<number | null>;
  subscribeHeading: (listener: (heading: number) => void) => () => void;
  isUncalibrated: boolean;
  requestCompassPermission: () => Promise<void>;
}

const SENSOR_PROBE_TIMEOUT_MS = 2200;
const DESKTOP_SENSOR_PROBE_TIMEOUT_MS = 650;
const UI_HEADING_SYNC_INTERVAL_MS = 90;

export const useJyotirlingaCompass = (): UseJyotirlingaCompassResult => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<UserCoordinates | null>(null);

  const [sensorStatus, setSensorStatus] = useState<CompassSensorStatus>('checking');
  const [sensorSource, setSensorSource] = useState<CompassHeadingExtraction['source']>(null);
  const [sensorMessage, setSensorMessage] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [isUncalibrated, setIsUncalibrated] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const liveHeadingRef = useRef<number | null>(null);
  const lastUiSyncHeadingRef = useRef<number | null>(null);
  const lastUiSyncAtRef = useRef(0);
  const sensorStatusRef = useRef<CompassSensorStatus>('checking');
  const receivedAbsoluteStreamRef = useRef(false);
  const activeQuaternionSensorRef = useRef(false);
  const stopCompassListenersRef = useRef<(() => void) | null>(null);
  const headingListenersRef = useRef<Set<(heading: number) => void>>(new Set());

  const subscribeHeading = useCallback((listener: (heading: number) => void) => {
    headingListenersRef.current.add(listener);
    return () => {
      headingListenersRef.current.delete(listener);
    };
  }, []);

  const setSensorStatusSynced = useCallback((next: CompassSensorStatus) => {
    sensorStatusRef.current = next;
    setSensorStatus(next);
  }, []);

  const clearLocationWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    if (!window.isSecureContext) {
      setLocationStatus('insecure');
      setLocationError(
        'Location requires a secure HTTPS connection on mobile and modern browsers.',
      );
      return;
    }

    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      setLocationError('This browser does not support geographical location access.');
      return;
    }

    clearLocationWatch();
    setLocationStatus('requesting');
    setLocationError(null);

    const onPositionSuccess = (pos: GeolocationPosition) => {
      setCoordinates({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null,
      });
      setLocationStatus('granted');
      setLocationError(null);
    };

    const onPositionError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setLocationStatus('denied');
        setLocationError(
          'Location permission was denied. Allow location access in your browser settings to calculate your bearing and distance.',
        );
        return;
      }
      if (err.code === err.TIMEOUT) {
        setLocationStatus('timeout');
        setLocationError(
          'GPS took too long to respond. Step near an open window or tap Refresh GPS to try again.',
        );
        return;
      }
      setLocationStatus('unavailable');
      setLocationError(
        'Current location is currently unavailable from your device GPS. Please try again shortly.',
      );
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 15_000,
      timeout: 12_000,
    };

    navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError, geoOptions);
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPositionSuccess,
      (watchErr) => {
        if (watchErr.code === watchErr.PERMISSION_DENIED) {
          onPositionError(watchErr);
        }
      },
      geoOptions,
    );
  }, [clearLocationWatch]);

  const startCompassListening = useCallback(
    (requirePermissionAfterMs?: number) => {
      stopCompassListenersRef.current?.();

      const hasOrientationEvents = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
      const SensorCtor = getAbsoluteOrientationSensorClass();

      if (typeof window === 'undefined' || (!hasOrientationEvents && !SensorCtor)) {
        const desktop = isLikelyDesktopBrowser();
        setSensorStatusSynced(desktop ? 'desktop' : 'unsupported');
        setSensorMessage(
          desktop
            ? 'Desktop browsers do not provide a physical compass sensor. Showing true-north direction on a fixed North-up dial.'
            : 'Compass orientation sensor is not available on this device.',
        );
        return;
      }

      let settled = false;
      receivedAbsoluteStreamRef.current = false;
      activeQuaternionSensorRef.current = false;
      liveHeadingRef.current = null;
      lastUiSyncHeadingRef.current = null;
      lastUiSyncAtRef.current = 0;
      setSensorStatusSynced('checking');
      setSensorMessage(null);

      const publishHeading = (
        rawHeading: number,
        source: NonNullable<CompassHeadingExtraction['source']>,
      ) => {
        settled = true;
        setIsUncalibrated(false);

        const smoothed = smoothCompassHeading(liveHeadingRef.current, rawHeading, 0.35);
        liveHeadingRef.current = smoothed;
        headingListenersRef.current.forEach((listener) => listener(smoothed));

        if (sensorStatusRef.current !== 'active') {
          setSensorStatusSynced('active');
          setSensorSource(source);
          setSensorMessage(null);
          lastUiSyncHeadingRef.current = smoothed;
          lastUiSyncAtRef.current = performance.now();
          setDeviceHeading(smoothed);
          return;
        }

        const now = performance.now();
        const uiDelta =
          lastUiSyncHeadingRef.current === null
            ? 999
            : Math.abs(shortestAngleDelta(lastUiSyncHeadingRef.current, smoothed));

        // Update React text telemetry cleanly at ~11Hz while liveHeadingRef runs at native 60Hz for the dial
        if (now - lastUiSyncAtRef.current >= UI_HEADING_SYNC_INTERVAL_MS && uiDelta >= 0.4) {
          lastUiSyncHeadingRef.current = smoothed;
          lastUiSyncAtRef.current = now;
          setDeviceHeading(smoothed);
        }
      };

      const handleAbsoluteEvent = (rawEvent: Event) => {
        if (activeQuaternionSensorRef.current) return;
        const event = rawEvent as DeviceOrientationEventWithCompass;
        const extraction = extractVerifiedCompassHeading(
          {
            alpha: typeof event.alpha === 'number' ? event.alpha : null,
            beta: typeof event.beta === 'number' ? event.beta : null,
            gamma: typeof event.gamma === 'number' ? event.gamma : null,
            absolute: true,
            webkitCompassHeading: event.webkitCompassHeading,
            webkitCompassAccuracy: event.webkitCompassAccuracy,
          },
          getScreenOrientationAngle(),
        );

        if (extraction.uncalibrated) {
          setIsUncalibrated(true);
          return;
        }
        if (extraction.heading === null || !extraction.source) return;
        receivedAbsoluteStreamRef.current = true;
        publishHeading(extraction.heading, extraction.source);
      };

      const handleStandardEvent = (rawEvent: DeviceOrientationEvent) => {
        if (activeQuaternionSensorRef.current || receivedAbsoluteStreamRef.current) return;
        const event = rawEvent as DeviceOrientationEventWithCompass;
        const extraction = extractVerifiedCompassHeading(
          {
            alpha: typeof event.alpha === 'number' ? event.alpha : null,
            beta: typeof event.beta === 'number' ? event.beta : null,
            gamma: typeof event.gamma === 'number' ? event.gamma : null,
            absolute: event.absolute,
            webkitCompassHeading: event.webkitCompassHeading,
            webkitCompassAccuracy: event.webkitCompassAccuracy,
          },
          getScreenOrientationAngle(),
        );

        if (extraction.uncalibrated) {
          setIsUncalibrated(true);
          return;
        }
        if (extraction.heading === null || !extraction.source) return;
        publishHeading(extraction.heading, extraction.source);
      };

      let genericSensor: AbsoluteOrientationSensorLike | null = null;
      const startGenericSensor = () => {
        if (!SensorCtor) return;
        try {
          const sensor = new SensorCtor({ frequency: 60, referenceFrame: 'device' });
          sensor.addEventListener('reading', () => {
            if (!sensor.quaternion) return;
            const heading = extractHeadingFromQuaternion(
              sensor.quaternion,
              getScreenOrientationAngle(),
            );
            if (heading === null) return;
            activeQuaternionSensorRef.current = true;
            publishHeading(heading, 'sensor-quaternion');
          });
          sensor.addEventListener('error', () => {
            activeQuaternionSensorRef.current = false;
            try {
              sensor.stop();
            } catch {
              // ignore
            }
          });
          sensor.start();
          genericSensor = sensor;
        } catch {
          activeQuaternionSensorRef.current = false;
        }
      };

      if (hasOrientationEvents) {
        window.addEventListener('deviceorientationabsolute', handleAbsoluteEvent, true);
        window.addEventListener('deviceorientation', handleStandardEvent, true);
      }

      // Skip starting Generic Sensor API prematurely on iOS WebKit; Chromium Android uses it cleanly
      if (SensorCtor && !isAppleTouchDevice()) {
        startGenericSensor();
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && genericSensor && !activeQuaternionSensorRef.current) {
          try {
            genericSensor.start();
          } catch {
            // fallback listeners remain active
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const probeDelay =
        requirePermissionAfterMs ??
        (isLikelyDesktopBrowser() ? DESKTOP_SENSOR_PROBE_TIMEOUT_MS : SENSOR_PROBE_TIMEOUT_MS);
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        if (requirePermissionAfterMs !== undefined) {
          setSensorStatusSynced('permission-required');
          setSensorMessage(
            'Tap "Enable Live Compass" below to allow compass access so the needle rotates as you turn your phone.',
          );
          return;
        }
        const desktop = isLikelyDesktopBrowser();
        setSensorStatusSynced(desktop ? 'desktop' : 'unsupported');
        liveHeadingRef.current = null;
        setDeviceHeading(null);
        setSensorSource(null);
        setSensorMessage(
          desktop
            ? 'No compass magnetometer sensor detected on this PC/laptop. Devices with a compass sensor rotate automatically when turned; showing true-north reference here.'
            : 'True-north magnetometer readings are unavailable in this browser. Showing verified static true-north direction.',
        );
      }, probeDelay);

      stopCompassListenersRef.current = () => {
        window.clearTimeout(timeoutId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (genericSensor) {
          try {
            genericSensor.stop();
          } catch {
            // ignore
          }
          genericSensor = null;
        }
        if (hasOrientationEvents) {
          window.removeEventListener('deviceorientationabsolute', handleAbsoluteEvent, true);
          window.removeEventListener('deviceorientation', handleStandardEvent, true);
        }
      };
    },
    [setSensorStatusSynced],
  );

  const requestCompassPermission = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!window.isSecureContext) {
      setSensorStatusSynced('unsupported');
      setSensorMessage('Compass sensor access requires an HTTPS connection on iOS and Android.');
      return;
    }

    const requestPermission = getOrientationPermissionRequester();
    if (!requestPermission) {
      startCompassListening();
      return;
    }

    try {
      let outcome: 'granted' | 'denied';
      try {
        outcome = await requestPermission(true);
      } catch (err) {
        if (err instanceof TypeError) {
          outcome = await requestPermission();
        } else {
          throw err;
        }
      }

      if (outcome === 'granted') {
        startCompassListening();
      } else {
        setSensorStatusSynced('denied');
        setSensorMessage(
          'Compass access was denied on Safari. Re-open this tab or enable Motion & Orientation Access to use the live needle.',
        );
      }
    } catch {
      setSensorStatusSynced('unsupported');
      setSensorMessage(
        'Could not activate the iOS compass sensor in this browser context. Showing static true-north bearing instead.',
      );
    }
  }, [setSensorStatusSynced, startCompassListening]);

  useEffect(() => {
    requestLocation();

    if (typeof window !== 'undefined') {
      const permissionRequester = getOrientationPermissionRequester();
      if (!window.isSecureContext) {
        setSensorStatusSynced(isLikelyDesktopBrowser() ? 'desktop' : 'unsupported');
        setSensorMessage(
          'Compass sensors require HTTPS. Showing static true-north directional information.',
        );
      } else if (permissionRequester && isAppleTouchDevice()) {
        // iOS Safari strictly requires a user gesture tap before calling DeviceOrientationEvent.requestPermission(true)
        setSensorStatusSynced('permission-required');
        setSensorMessage(
          'Tap "Enable Live Compass" below to allow Safari compass access so the needle rotates as you turn.',
        );
      } else {
        // Probe hardware sensors immediately on Android, Windows 2-in-1s, laptops, and desktops
        startCompassListening();
      }
    }

    return () => {
      clearLocationWatch();
      stopCompassListenersRef.current?.();
    };
  }, [clearLocationWatch, requestLocation, setSensorStatusSynced, startCompassListening]);

  return {
    locationStatus,
    locationError,
    coordinates,
    requestLocation,
    sensorStatus,
    sensorSource,
    sensorMessage,
    deviceHeading,
    liveHeadingRef,
    subscribeHeading,
    isUncalibrated,
    requestCompassPermission,
  };
};
