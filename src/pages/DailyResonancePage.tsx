import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  dailyResonanceService,
  DailyRecording,
  DailyResonanceListeningSession,
  DailyResonanceResumePoint,
  getCachedAudioSrc,
  getVersionedAudioUrl,
  prefetchRecordingAudio,
} from '../services/dailyResonanceService';
import {
  getResonanceStageInfo,
  ResonanceShadowVisual,
} from '../components/ResonanceShadowVisual';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const recordingDateKey = (value: string): string | null => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsedDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : value;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : dateKey(parsedDate);
};

const formatRecordingDate = (value: string): string => {
  const day = recordingDateKey(value);
  if (!day) return 'Date unavailable';

  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

const createPlaybackId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });

const sortNewestFirst = (first: DailyRecording, second: DailyRecording): number => {
  const firstTime = new Date(first.publishedAt || first.recordingDate).getTime();
  const secondTime = new Date(second.publishedAt || second.recordingDate).getTime();
  return secondTime - firstTime;
};

export interface ResonancePlayerHandle {
  togglePlayPause: () => void;
  pause: () => void;
  replay: () => void;
}

export interface ResonancePlayerProps {
  recording: DailyRecording;
  isToday: boolean;
  autoPlayOnMount?: boolean;
  showCloseButton?: boolean;
  onAudioPlay: (audio: HTMLAudioElement) => void;
  onPlaybackChange?: (recordingId: string, playing: boolean) => void;
  onClose?: () => void;
  resumePoint?: DailyResonanceResumePoint | null;
  onListeningProgress?: (
    recordingId: string,
    progress: {
      playbackId: string;
      positionSeconds: number;
      durationSeconds: number;
      listenedSeconds: number;
      completed?: boolean;
    },
    options?: { keepalive?: boolean },
  ) => Promise<void>;
}

const isTransientTrackingError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('cannot advance beyond audio actually played') ||
    normalized.includes('does not show a completed playback') ||
    normalized === 'network error' ||
    normalized.includes('failed to fetch') ||
    normalized.includes('load failed') ||
    normalized.includes('networkerror') ||
    normalized.includes('too many') ||
    normalized.includes('timeout') ||
    normalized.includes('aborted')
  );
};

export const ResonancePlayer = React.forwardRef<ResonancePlayerHandle, ResonancePlayerProps>(
  (
    {
      recording,
      isToday,
      autoPlayOnMount = false,
      showCloseButton = true,
      onAudioPlay,
      onPlaybackChange,
      onClose,
      resumePoint,
      onListeningProgress,
    },
    ref,
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const playbackIdRef = useRef<string | null>(resumePoint?.playbackId || null);
    const resumePointRef = useRef(resumePoint);
    const resumeAppliedRef = useRef(!resumePoint);
    const playRequestIdRef = useRef(0);
    const pendingSeekOnSrcSwapRef = useRef<number | null>(null);
    const pendingPlayOnSrcSwapRef = useRef(false);
    const suppressPauseDuringSwapRef = useRef(false);
    const listenedSecondsRef = useRef(resumePoint?.listenedSeconds || 0);
    const lastSavedListenedSecondsRef = useRef(resumePoint?.listenedSeconds || 0);
    const lastAudioTimeRef = useRef<number | null>(null);
    const lastSaveAtRef = useRef(0);
    const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
    const streamUrl = useMemo(
      () => getVersionedAudioUrl(recording.audioUrl, recording.publishedAt || recording.recordingDate),
      [recording.audioUrl, recording.publishedAt, recording.recordingDate],
    );
    const [audioSrc, setAudioSrc] = useState<string>(() => getCachedAudioSrc(streamUrl));
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      const cached = getCachedAudioSrc(streamUrl);
      pendingSeekOnSrcSwapRef.current = null;
      pendingPlayOnSrcSwapRef.current = false;
      setAudioSrc(cached);

      if (cached === streamUrl) {
        void prefetchRecordingAudio(streamUrl).then((blobUrl) => {
          if (cancelled || !blobUrl) return;
          const audio = audioRef.current;
          if (!audio) return;

          if (audio.paused) {
            if (audio.currentTime > 0) {
              pendingSeekOnSrcSwapRef.current = audio.currentTime;
            }
            setAudioSrc(blobUrl);
            return;
          }

          // Replace an unbuffered/stalled network stream immediately once in-memory blob is ready
          if (audio.readyState < 2 && audio.currentTime === 0) {
            suppressPauseDuringSwapRef.current = true;
            pendingPlayOnSrcSwapRef.current = true;
            setAudioSrc(blobUrl);
          }
        });
      }

      return () => {
        cancelled = true;
      };
    }, [streamUrl]);

    useEffect(() => {
      if (!pendingPlayOnSrcSwapRef.current) return;
      pendingPlayOnSrcSwapRef.current = false;
      const audio = audioRef.current;
      if (!audio) {
        suppressPauseDuringSwapRef.current = false;
        return;
      }

      audio.load();
      suppressPauseDuringSwapRef.current = false;
      const requestId = ++playRequestIdRef.current;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((error: unknown) => {
          if (requestId !== playRequestIdRef.current) return;
          if (error instanceof Error && error.name === 'AbortError') return;
          setIsPlaying(false);
          if (!(error instanceof DOMException && error.name === 'NotAllowedError')) {
            const message = error instanceof Error ? error.message : 'Playback could not start.';
            setPlaybackError(`Audio playback failed: ${message}`);
          }
        });
      }
    }, [audioSrc]);

    const progress = isComplete
      ? 1
      : duration > 0
        ? Math.min(0.99, Math.max(0, currentTime / duration))
        : 0;
    const progressPercent = isComplete ? 100 : Math.round(progress * 100);
    const shadowIntensity = Math.max(0, 100 - progressPercent);
    const displayDuration =
      duration || recording.durationSeconds || resumePoint?.durationSeconds || 0;
    const stageInfo = getResonanceStageInfo(progress, isPlaying, isComplete);

    const persistListeningProgress = useCallback(
      (audio: HTMLAudioElement, force = false, completed = false, keepalive = false) => {
        if (!onListeningProgress || !Number.isFinite(audio.duration) || audio.duration <= 0) {
          return Promise.resolve();
        }

        const now = performance.now();
        if (
          !force &&
          (listenedSecondsRef.current - lastSavedListenedSecondsRef.current < 5 ||
            now - lastSaveAtRef.current < 4000)
        ) {
          return Promise.resolve();
        }

        const playbackId = playbackIdRef.current || createPlaybackId();
        playbackIdRef.current = playbackId;
        lastSaveAtRef.current = now;
        const listenedSeconds = listenedSecondsRef.current;
        const update = {
          playbackId,
          positionSeconds: Math.min(audio.currentTime, audio.duration),
          durationSeconds: audio.duration,
          listenedSeconds,
          completed,
        };
        if (keepalive) {
          return onListeningProgress(recording.id, update, { keepalive: true }).catch(() => {
            // Keepalive flush runs during tab backgrounding or navigation unload
          });
        }

        const request = saveQueueRef.current.then(() =>
          onListeningProgress(recording.id, update),
        );
        saveQueueRef.current = request.then(
          () => {
            if (playbackIdRef.current === playbackId) {
              lastSavedListenedSecondsRef.current = Math.max(
                lastSavedListenedSecondsRef.current,
                listenedSeconds,
              );
            }
            setTrackingError(null);
          },
          (error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Listening progress could not be saved.';
            // Transient network/offline blips & anti-skip checks recover on the next sync without banner noise
            if (isTransientTrackingError(message)) {
              return;
            }
            setTrackingError(message);
          },
        );
        return saveQueueRef.current;
      },
      [onListeningProgress, recording.id],
    );

    const syncAudioTime = useCallback(
      (audio: HTMLAudioElement, includeFinalDelta = false) => {
        const nextTime = audio.currentTime;
        const previousTime = lastAudioTimeRef.current;
        if (previousTime !== null && nextTime > previousTime) {
          const delta = nextTime - previousTime;
          if ((!audio.paused || includeFinalDelta) && (!audio.seeking || delta <= 2.5)) {
            listenedSecondsRef.current += delta;
          }
        }
        lastAudioTimeRef.current = nextTime;
        setCurrentTime(nextTime);

        if (
          onListeningProgress &&
          listenedSecondsRef.current - lastSavedListenedSecondsRef.current >= 5
        ) {
          void persistListeningProgress(audio);
        }
      },
      [onListeningProgress, persistListeningProgress],
    );

    // 60fps HTML5 audio-synchronized progress update strictly while actively playing
    useEffect(() => {
      if (!isPlaying) return;

      let frameId = 0;
      const syncAudioFrame = () => {
        const audio = audioRef.current;
        if (audio) {
          syncAudioTime(audio);
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration);
          }
        }
        frameId = window.requestAnimationFrame(syncAudioFrame);
      };

      frameId = window.requestAnimationFrame(syncAudioFrame);
      return () => window.cancelAnimationFrame(frameId);
    }, [isPlaying, syncAudioTime]);

    useEffect(() => {
      if (!onListeningProgress) return;

      const flushProgress = () => {
        const audio = audioRef.current;
        if (!audio) return;
        syncAudioTime(audio);
        void persistListeningProgress(audio, true, false, true);
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          flushProgress();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', flushProgress);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', flushProgress);
      };
    }, [onListeningProgress, persistListeningProgress, syncAudioTime]);

    useEffect(() => {
      onPlaybackChange?.(recording.id, isPlaying);
    }, [isPlaying, onPlaybackChange, recording.id]);

    const applyResumePoint = useCallback((audio: HTMLAudioElement) => {
      const point = resumePointRef.current;
      if (resumeAppliedRef.current || !point) return;

      if (point.positionSeconds <= 0) {
        resumeAppliedRef.current = true;
        playbackIdRef.current = point.playbackId;
        listenedSecondsRef.current = point.listenedSeconds;
        lastSavedListenedSecondsRef.current = point.listenedSeconds;
        return;
      }

      if (audio.readyState < 1 || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

      resumeAppliedRef.current = true;
      playbackIdRef.current = point.playbackId;
      listenedSecondsRef.current = point.listenedSeconds;
      lastSavedListenedSecondsRef.current = point.listenedSeconds;

      const resumeTime = Math.min(point.positionSeconds, audio.duration);
      try {
        audio.currentTime = resumeTime;
        lastAudioTimeRef.current = resumeTime;
        setCurrentTime(resumeTime);
      } catch {
        // Ignore seek error while metadata is settling; next seek/load will honor timing
      }
    }, []);

    useEffect(() => {
      resumePointRef.current = resumePoint;
      resumeAppliedRef.current = !resumePoint;
      if (!resumePoint) return;

      playbackIdRef.current = resumePoint.playbackId;
      listenedSecondsRef.current = resumePoint.listenedSeconds;
      lastSavedListenedSecondsRef.current = resumePoint.listenedSeconds;
      const audio = audioRef.current;
      if (audio && audio.paused) {
        applyResumePoint(audio);
      }
    }, [applyResumePoint, recording.id, resumePoint]);

    const playAudio = useCallback((fromAutoMount = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      setPlaybackError(null);

      const readySrc = getCachedAudioSrc(streamUrl);
      const shouldUseCachedBlob = !fromAutoMount && audio.currentTime === 0 && readySrc !== audioSrc && readySrc.startsWith('blob:');
      if (shouldUseCachedBlob || audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        if (!fromAutoMount && readySrc !== audioSrc) {
          flushSync(() => setAudioSrc(readySrc));
        } else if (audio.src !== readySrc) {
          audio.src = readySrc;
          setAudioSrc(readySrc);
        }
        audio.load();
      }

      if (isComplete || (duration > 0 && audio.currentTime >= duration - 0.05)) {
        if (audio.readyState >= 1) {
          try {
            audio.currentTime = 0;
          } catch {
            // Safe fallback if element resets cleanly on load
          }
        }
        setCurrentTime(0);
        setIsComplete(false);
        playbackIdRef.current = createPlaybackId();
        listenedSecondsRef.current = 0;
        lastSavedListenedSecondsRef.current = 0;
        lastAudioTimeRef.current = 0;
      } else {
        applyResumePoint(audio);
      }

      const requestId = ++playRequestIdRef.current;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((error: unknown) => {
          if (requestId !== playRequestIdRef.current) return;
          if (error instanceof Error && error.name === 'AbortError') return;
          setIsPlaying(false);
          const isAutoplayBlocked =
            fromAutoMount && error instanceof DOMException && error.name === 'NotAllowedError';
          if (!isAutoplayBlocked) {
            const message = error instanceof Error ? error.message : 'Playback could not start.';
            setPlaybackError(`Audio playback failed: ${message}`);
          }
        });
      }
    }, [applyResumePoint, audioSrc, duration, isComplete, streamUrl]);

    const pauseAudio = useCallback(() => {
      playRequestIdRef.current += 1;
      pendingPlayOnSrcSwapRef.current = false;
      audioRef.current?.pause();
    }, []);

    const handleTogglePlayPause = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.paused) {
        pauseAudio();
        return;
      }
      playAudio(false);
    }, [pauseAudio, playAudio]);

    const handleReplay = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;

      setPlaybackError(null);
      pendingSeekOnSrcSwapRef.current = null;
      pendingPlayOnSrcSwapRef.current = false;
      resumeAppliedRef.current = true;
      setCurrentTime(0);
      setIsComplete(false);
      playbackIdRef.current = createPlaybackId();
      listenedSecondsRef.current = 0;
      lastSavedListenedSecondsRef.current = 0;
      lastAudioTimeRef.current = 0;

      const readySrc = getCachedAudioSrc(streamUrl);
      if (audio.error || (readySrc !== audioSrc && readySrc.startsWith('blob:'))) {
        flushSync(() => setAudioSrc(readySrc));
        audio.load();
      } else if (audio.readyState >= 1) {
        try {
          audio.currentTime = 0;
        } catch {
          audio.load();
        }
      } else {
        audio.load();
      }

      const requestId = ++playRequestIdRef.current;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((error: unknown) => {
          if (requestId !== playRequestIdRef.current) return;
          if (error instanceof Error && error.name === 'AbortError') return;
          setIsPlaying(false);
          const message = error instanceof Error ? error.message : 'Playback could not start.';
          setPlaybackError(`Audio playback failed: ${message}`);
        });
      }
    }, [audioSrc, streamUrl]);

    const handleTimelineSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio || !(duration > 0)) return;

      const nextTime = Math.min(duration, Math.max(0, Number(event.target.value)));
      if (nextTime >= audio.currentTime) {
        event.currentTarget.value = String(audio.currentTime);
        return;
      }

      try {
        audio.currentTime = nextTime;
      } catch {
        return;
      }
      setCurrentTime(nextTime);
      setIsComplete(false);
      setPlaybackError(null);
    };

    useImperativeHandle(
      ref,
      () => ({
        togglePlayPause: handleTogglePlayPause,
        pause: pauseAudio,
        replay: handleReplay,
      }),
      [handleReplay, handleTogglePlayPause, pauseAudio],
    );

    useEffect(() => {
      if (!autoPlayOnMount) return;
      playAudio(true);
      // Only trigger once when session opens from user click on a previous recording
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayOnMount, recording.id]);

    const remainingTime =
      displayDuration > 0 ? Math.max(0, displayDuration - currentTime) : 0;
    const rightTimeLabel =
      displayDuration > 0
        ? currentTime > 0 && !isComplete
          ? `-${formatTime(remainingTime)}`
          : isComplete
            ? '0:00'
            : formatTime(displayDuration)
        : '—:—';

    return (
      <section
        className="overflow-hidden rounded-[22px] border border-[#DFCEAF] bg-[#FFFDF9] p-4 shadow-[0_12px_38px_rgba(54,39,22,0.08)] sm:p-6"
        aria-label={isToday ? "Today's resonance session" : `Previous resonance session: ${recording.title}`}
      >
        <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_auto_295px] md:items-center md:gap-0 lg:grid-cols-[minmax(0,1fr)_auto_330px]">
          {/* Left Column (Desktop) / Bottom (Mobile): Controls & Progress */}
          <div className="order-2 min-w-0 md:order-1 md:pr-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-cinzel text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#9A783D]">
                  Resonance / Daily Session
                </p>
                <h2 className="mt-1 break-words font-cormorant text-[22px] font-bold leading-snug text-[#2A2118] sm:text-[26px]">
                  {recording.title}
                </h2>
              </div>

              {onClose && showCloseButton && (
                <button
                  type="button"
                  onClick={() => {
                    pauseAudio();
                    onClose();
                  }}
                  aria-label="Close session player"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6DCCB] bg-[#FAF4EA] text-[#726656] transition hover:bg-[#EFE4D3] hover:text-[#332820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6E6356]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
                <span>{formatRecordingDate(recording.recordingDate)}</span>
              </span>
              <span aria-hidden="true" className="text-[#CFC3B0]">|</span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
                <span>{displayDuration > 0 ? formatTime(displayDuration) : '—:—'}</span>
              </span>
            </div>

            <audio
              ref={audioRef}
              src={audioSrc}
              preload="auto"
              playsInline
              aria-hidden={playbackError ? undefined : true}
              tabIndex={playbackError ? 0 : -1}
              controls={Boolean(playbackError)}
              onLoadedMetadata={(event) => {
                const actualDuration = event.currentTarget.duration;
                if (Number.isFinite(actualDuration) && actualDuration > 0) {
                  setDuration(actualDuration);
                  if (pendingSeekOnSrcSwapRef.current !== null) {
                    const seekTo = Math.min(pendingSeekOnSrcSwapRef.current, actualDuration);
                    pendingSeekOnSrcSwapRef.current = null;
                    try {
                      event.currentTarget.currentTime = seekTo;
                      lastAudioTimeRef.current = seekTo;
                      setCurrentTime(seekTo);
                    } catch {
                      // Safe fallback
                    }
                  } else {
                    applyResumePoint(event.currentTarget);
                  }
                }
              }}
              onCanPlay={(event) => {
                applyResumePoint(event.currentTarget);
              }}
              onDurationChange={(event) => {
                const actualDuration = event.currentTarget.duration;
                if (Number.isFinite(actualDuration) && actualDuration > 0) {
                  setDuration(actualDuration);
                }
              }}
              onTimeUpdate={(event) => syncAudioTime(event.currentTarget)}
              onPlaying={() => {
                playRequestIdRef.current += 1;
              }}
              onSeeking={(event) => {
                lastAudioTimeRef.current = event.currentTarget.currentTime;
              }}
              onSeeked={(event) => {
                lastAudioTimeRef.current = event.currentTarget.currentTime;
                setCurrentTime(event.currentTarget.currentTime);
              }}
              onPlay={(event) => {
                if (audioRef.current) onAudioPlay(audioRef.current);
                playbackIdRef.current ||= createPlaybackId();
                lastAudioTimeRef.current = event.currentTarget.currentTime;
                setIsPlaying(true);
                setIsComplete(false);
              }}
              onPause={(event) => {
                if (suppressPauseDuringSwapRef.current) {
                  suppressPauseDuringSwapRef.current = false;
                  return;
                }
                playRequestIdRef.current += 1;
                setIsPlaying(false);
                syncAudioTime(event.currentTarget, true);
                void persistListeningProgress(event.currentTarget, true);
              }}
              onEnded={(event) => {
                playRequestIdRef.current += 1;
                const finalDuration = event.currentTarget.duration;
                syncAudioTime(event.currentTarget, true);
                if (Number.isFinite(finalDuration) && finalDuration > 0) {
                  setDuration(finalDuration);
                  setCurrentTime(finalDuration);
                }
                setIsPlaying(false);
                setIsComplete(true);
                void persistListeningProgress(event.currentTarget, true, true);
              }}
              onError={() => {
                const cached = getCachedAudioSrc(streamUrl);
                if (cached !== audioSrc && cached.startsWith('blob:')) {
                  pendingPlayOnSrcSwapRef.current = isPlaying;
                  setAudioSrc(cached);
                  return;
                }
                playRequestIdRef.current += 1;
                setIsPlaying(false);
                setPlaybackError('This recording could not be loaded. Please try again later.');
              }}
              className={
                playbackError
                  ? 'mt-4 w-full rounded-lg'
                  : 'pointer-events-none absolute h-px w-px overflow-hidden opacity-0'
              }
            />
            {trackingError && (
              <p className="mt-3 text-xs text-[#9B342C]" role="alert">
                Listening progress could not be saved: {trackingError}
              </p>
            )}

            {/* Seekable Timeline Slider */}
            <div className="mt-4">
              <div className="relative flex h-6 items-center">
                <div className="pointer-events-none absolute inset-x-0 h-[7px] overflow-hidden rounded-full bg-[#E8E0D5]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPercent}%`,
                      background:
                        progressPercent >= 75
                          ? 'linear-gradient(90deg, #8466DC 0%, #C79942 60%, #E7BE61 100%)'
                          : 'linear-gradient(90deg, #7B5FDA 0%, #A98FF7 100%)',
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={displayDuration > 0 ? displayDuration : 100}
                  step={0.1}
                  value={duration > 0 ? Math.min(currentTime, duration) : 0}
                  disabled={!(duration > 0)}
                  onChange={handleTimelineSeek}
                  aria-label="Audio timeline (backward seek only)"
                  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(displayDuration)}`}
                  className="resonance-timeline-range relative z-10 w-full"
                />
              </div>

              {/* Elapsed & Remaining Timestamps */}
              <div className="mt-1 flex items-center justify-between font-mono text-[11px] tabular-nums text-[#6F665B]">
                <span>{formatTime(currentTime)}</span>
                <span>{rightTimeLabel}</span>
              </div>
            </div>

            {/* Shadow Intensity Meter */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-[#5A5045]">Shadow Intensity</span>
                <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider tabular-nums text-[#2F261C]">
                  {shadowIntensity}% {stageInfo.label}
                </span>
              </div>
              <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-[#EAE2D6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4E359B] via-[#7A5CE0] to-[#A68AF5] transition-[width] duration-150"
                  style={{ width: `${shadowIntensity}%` }}
                />
              </div>
            </div>

            {/* Play / Pause / Replay Pill Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {isComplete ? (
                <button
                  type="button"
                  onClick={handleReplay}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A57E38] to-[#8D692A] px-7 font-cinzel text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_14px_rgba(141,105,42,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:w-auto"
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                  Replay Session
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    aria-label={
                      isPlaying
                        ? 'Pause recording'
                        : currentTime > 0
                          ? 'Resume recording'
                          : 'Play recording'
                    }
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A57E38] to-[#8D692A] px-7 font-cinzel text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_14px_rgba(141,105,42,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:flex-initial"
                  >
                    {isPlaying ? (
                      <Pause aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <Play aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    {isPlaying ? 'Pause' : currentTime > 0 ? 'Resume' : 'Play Session'}
                  </button>

                  {(currentTime > 0 || isPlaying) && (
                    <button
                      type="button"
                      onClick={handleReplay}
                      aria-label="Replay recording from start"
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-[#BFA472] bg-[#FFFDF9] px-6 font-cinzel text-[11px] font-bold uppercase tracking-[0.1em] text-[#5C4523] transition hover:bg-[#F5ECE0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:flex-initial"
                    >
                      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                      Replay
                    </button>
                  )}
                </>
              )}
            </div>

            {isComplete && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[#725729]" role="status">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>
                  Your shadow is released. {isToday ? "Today's Resonance completed." : 'Session completed.'}
                </span>
              </div>
            )}

            {playbackError && (
              <p className="mt-3 text-center text-xs text-[#9B342C]" role="alert">
                {playbackError}
              </p>
            )}
          </div>

          {/* Center Hairline Divider (Desktop) */}
          <div aria-hidden="true" className="hidden self-stretch bg-[#E8DFCE] md:order-2 md:block md:w-px" />

          {/* Right Column (Desktop) / Top (Mobile): Cosmic Shadow Form Visual Box */}
          <div className="order-1 md:order-3 md:pl-6">
            <div className="relative flex h-[225px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#0B0911] shadow-[0_8px_24px_rgba(15,10,28,0.18)] sm:h-[255px] md:h-[246px] lg:h-[264px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    progress >= 0.72
                      ? 'radial-gradient(ellipse at 50% 50%, rgba(232,184,86,0.22), rgba(92,58,150,0.10) 48%, transparent 74%)'
                      : 'radial-gradient(ellipse at 50% 50%, rgba(132,96,216,0.25), transparent 68%)',
                }}
              />
              <div className="relative z-10 h-full w-full p-2">
                <ResonanceShadowVisual
                  progress={progress}
                  isPlaying={isPlaying}
                  isComplete={isComplete}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

ResonancePlayer.displayName = 'ResonancePlayer';

export const DailyResonancePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRecordingId = searchParams.get('recordingId');
  const [recordings, setRecordings] = useState<DailyRecording[]>([]);
  const [listeningSessions, setListeningSessions] = useState<DailyResonanceListeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPreviousId, setSelectedPreviousId] = useState<string | null>(null);
  const [playingPreviousId, setPlayingPreviousId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousPlayerRef = useRef<ResonancePlayerHandle | null>(null);
  const todayKey = dateKey(new Date());

  const handleAudioPlay = useCallback((audio: HTMLAudioElement) => {
    if (activeAudioRef.current && activeAudioRef.current !== audio) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = audio;
  }, []);

  const handleListeningProgress = useCallback(
    async (
      recordingId: string,
      progress: {
        playbackId: string;
        positionSeconds: number;
        durationSeconds: number;
        listenedSeconds: number;
        completed?: boolean;
      },
      options?: { keepalive?: boolean },
    ) => {
      if (isAuthenticated) {
        await dailyResonanceService.saveListeningProgress(recordingId, progress, options);
      }
    },
    [isAuthenticated],
  );

  const handlePreviousPlaybackChange = useCallback((recordingId: string, playing: boolean) => {
    setPlayingPreviousId((current) => {
      if (playing) return recordingId;
      return current === recordingId ? null : current;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    dailyResonanceService
      .getPublishedRecordings(controller.signal)
      .then(setRecordings)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unable to load daily recordings.';
        setLoadError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setListeningSessions([]);
      setHistoryLoadError(null);
      setHistoryLoading(false);
      return;
    }

    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryLoadError(null);
    dailyResonanceService
      .getListeningHistory(controller.signal)
      .then(setListeningSessions)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setHistoryLoadError(
          error instanceof Error ? error.message : 'Your listening history could not be loaded.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });

    return () => controller.abort();
  }, [isAuthenticated]);

  // Silently re-sync published recordings when user switches back to tab so newly published admin sessions appear automatically
  useEffect(() => {
    let activeController: AbortController | null = null;

    const refreshSilently = () => {
      if (document.visibilityState === 'hidden') return;
      activeController?.abort();
      activeController = new AbortController();
      dailyResonanceService
        .getPublishedRecordings(activeController.signal)
        .then((latest) => {
          if (!activeController?.signal.aborted) {
            setRecordings(latest);
          }
        })
        .catch(() => {
          // Keep current view state intact during silent background refresh
        });
    };

    window.addEventListener('focus', refreshSilently);
    document.addEventListener('visibilitychange', refreshSilently);

    return () => {
      activeController?.abort();
      window.removeEventListener('focus', refreshSilently);
      document.removeEventListener('visibilitychange', refreshSilently);
    };
  }, []);

  const { featuredRecording, previousRecordings } = useMemo(() => {
    const datedRecordings = recordings.filter((recording) => recordingDateKey(recording.recordingDate));
    const todayRecordings = datedRecordings
      .filter((recording) => recordingDateKey(recording.recordingDate) === todayKey)
      .sort(sortNewestFirst);
    const previous = datedRecordings
      .filter((recording) => {
        const day = recordingDateKey(recording.recordingDate);
        return (
          day !== null &&
          day <= todayKey &&
          recording.id !== todayRecordings[0]?.id
        );
      })
      .sort((first, second) => {
        const dayDifference = (recordingDateKey(second.recordingDate) || '').localeCompare(
          recordingDateKey(first.recordingDate) || '',
        );
        return dayDifference || sortNewestFirst(first, second);
      });

    return { featuredRecording: todayRecordings[0] || null, previousRecordings: previous };
  }, [recordings, todayKey]);

  // Preload today's and recent sessions cleanly into memory for instant 0ms play/replay on iOS & Android
  useEffect(() => {
    if (recordings.length === 0) return;

    let cancelled = false;
    const targets = [featuredRecording, ...previousRecordings.slice(0, 4)].filter(
      (rec): rec is DailyRecording => Boolean(rec),
    );

    const prefetchSequentially = async () => {
      for (const rec of targets) {
        if (cancelled) break;
        const versionedUrl = getVersionedAudioUrl(
          rec.audioUrl,
          rec.publishedAt || rec.recordingDate,
        );
        await prefetchRecordingAudio(versionedUrl);
      }
    };

    void prefetchSequentially();
    return () => {
      cancelled = true;
    };
  }, [featuredRecording, previousRecordings, recordings.length]);

  const handleSelectPreviousSession = (recordingId: string) => {
    if (selectedPreviousId === recordingId) {
      previousPlayerRef.current?.togglePlayPause();
      return;
    }

    activeAudioRef.current?.pause();
    flushSync(() => setSelectedPreviousId(recordingId));
    previousPlayerRef.current?.togglePlayPause();
  };

  useEffect(() => {
    if (!requestedRecordingId || loading) return;
    const requestedRecording = recordings.find((recording) => recording.id === requestedRecordingId);
    if (!requestedRecording || recordingDateKey(requestedRecording.recordingDate) === todayKey) {
      return;
    }

    activeAudioRef.current?.pause();
    setSelectedPreviousId(requestedRecordingId);
  }, [loading, recordings, requestedRecordingId, todayKey]);

  return (
    <div className="relative z-[1] flex-1 px-4 pb-10 pt-7 sm:px-6 sm:pt-11 lg:px-8">
      <main className="mx-auto w-full max-w-4xl">
        <header className="mb-7 text-center sm:mb-9">
          <div className="flex items-center justify-center gap-3 font-cinzel text-[10px] font-bold uppercase tracking-[0.32em] text-[#8C6D3B] sm:text-xs">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            <span>Resonance / Daily Session</span>
            <Sparkles aria-hidden="true" className="h-4 w-4" />
          </div>
          <h1 className="mt-3 font-cormorant text-4xl font-bold text-[#2A1D14] sm:text-5xl">
            Shadow Discharge
          </h1>
          <p className="mt-2 font-cormorant text-lg italic text-[#716553] sm:text-xl">
            Your voice. Your shadows. Your release.
          </p>
        </header>

        {loading || (isAuthenticated && historyLoading) ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[26px] border border-[#E6DCCB] bg-[#FFFDF9]/90 text-center shadow-[0_12px_42px_rgba(54,39,22,0.06)]">
            <LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin text-[#9A783D]" />
            <p className="mt-4 font-cinzel text-xs font-semibold uppercase tracking-wider text-[#665A4D]">
              Finding today&apos;s resonance
            </p>
          </div>
        ) : loadError ? (
          <div className="rounded-[26px] border border-[#E7D7C5] bg-[#FFFDF9] px-5 py-12 text-center shadow-[0_12px_42px_rgba(54,39,22,0.06)]">
            <Headphones aria-hidden="true" className="mx-auto h-9 w-9 text-[#9A783D]" />
            <h2 className="mt-4 font-cormorant text-2xl font-bold text-[#332820]">
              Recordings are unavailable right now
            </h2>
            <p className="mx-auto mt-2 max-w-xl break-words text-sm leading-relaxed text-[#746B60]" role="alert">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#BDA777] px-5 font-cinzel text-[11px] font-bold uppercase tracking-wider text-[#725729] transition hover:bg-[#F6EFE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : (
          <>
            {historyLoadError && (
              <p className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                Listening history could not be loaded: {historyLoadError}
              </p>
            )}
            {featuredRecording ? (
              <ResonancePlayer
                key={featuredRecording.id}
                recording={featuredRecording}
                isToday
                autoPlayOnMount={requestedRecordingId === featuredRecording.id}
                onAudioPlay={handleAudioPlay}
                onListeningProgress={isAuthenticated ? handleListeningProgress : undefined}
                resumePoint={listeningSessions.find((session) => session.id === featuredRecording.id)?.resume}
              />
            ) : (
              <section className="rounded-[22px] border border-[#DFCEAF] bg-[#FFFDF9] px-5 py-8 text-center shadow-[0_10px_34px_rgba(54,39,22,0.06)] sm:py-9">
                <CalendarDays aria-hidden="true" className="mx-auto h-7 w-7 text-[#9A783D]" />
                <h2 className="mt-3 font-cormorant text-2xl font-bold text-[#332820]">
                  No recording published for today yet
                </h2>
                <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-[#746B60]">
                  Today&apos;s Resonance will appear here when a session is published.
                </p>
              </section>
            )}

            <section className="mt-8 sm:mt-10" aria-labelledby="previous-sessions-heading">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-cinzel text-[9px] font-bold uppercase tracking-[0.18em] text-[#9A783D]">
                    Revisit a moment
                  </p>
                  <h2 id="previous-sessions-heading" className="mt-1 font-cormorant text-3xl font-bold text-[#2A1D14]">
                    Previous Sessions
                  </h2>
                </div>
                {previousRecordings.length > 0 && (
                  <span className="pb-1 text-xs text-[#81776B]">
                    {previousRecordings.length} {previousRecordings.length === 1 ? 'session' : 'sessions'}
                  </span>
                )}
              </div>

              {previousRecordings.length === 0 ? (
                <p className="rounded-2xl border border-[#E6DCCB] bg-[#FFFDF9]/75 px-5 py-6 text-sm text-[#746B60]">
                  Previous published sessions will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {previousRecordings.map((recording) => {
                    const isSelected = selectedPreviousId === recording.id;
                    const isThisPlaying = isSelected && playingPreviousId === recording.id;

                    return (
                      <div key={recording.id} className="space-y-3">
                        <article
                          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_4px_18px_rgba(70,50,20,0.05)] transition sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                            isSelected ? 'border-[#C6AB77] bg-[#FFFDF9]' : 'border-[#E6DCCB] bg-[#FFFDF9]/85'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs text-[#81776B]">
                              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
                              {formatRecordingDate(recording.recordingDate)}
                            </p>
                            <h3 className="mt-0.5 break-words font-cormorant text-xl font-bold text-[#2A1D14]">
                              {recording.title}
                            </h3>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleSelectPreviousSession(recording.id)}
                              aria-label={isThisPlaying ? `Pause ${recording.title}` : `Play ${recording.title}`}
                              aria-expanded={isSelected}
                              className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-cinzel text-[10.5px] font-bold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] ${
                                isThisPlaying
                                  ? 'bg-gradient-to-r from-[#A57E38] to-[#8D692A] text-white shadow-sm hover:brightness-105'
                                  : 'border border-[#BFA472] bg-[#FFFDF9] text-[#6B4F22] hover:bg-[#F5ECE0]'
                              }`}
                            >
                              {isThisPlaying ? (
                                <Pause aria-hidden="true" className="h-3.5 w-3.5" />
                              ) : (
                                <Play aria-hidden="true" className="h-3.5 w-3.5" />
                              )}
                              {isThisPlaying ? 'Pause' : 'Play'}
                            </button>

                            {isSelected && (
                              <button
                                type="button"
                                onClick={() => {
                                  previousPlayerRef.current?.pause();
                                  setSelectedPreviousId(null);
                                }}
                                aria-label={`Close ${recording.title}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DFCEAF] bg-[#FAF4EA] text-[#726656] transition hover:bg-[#EFE4D3] hover:text-[#332820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
                              >
                                <X aria-hidden="true" className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </article>

                        {isSelected && (
                          <ResonancePlayer
                            key={recording.id}
                            ref={previousPlayerRef}
                            recording={recording}
                            isToday={false}
                            showCloseButton={false}
                            onAudioPlay={handleAudioPlay}
                            onListeningProgress={isAuthenticated ? handleListeningProgress : undefined}
                            resumePoint={listeningSessions.find((session) => session.id === recording.id)?.resume}
                            onPlaybackChange={handlePreviousPlaybackChange}
                            onClose={() => {
                              setSelectedPreviousId(null);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-[#81776B]">
              A reflective listening experience. The animation responds to playback progress; it does not measure or remove psychological shadows.
            </p>
          </>
        )}
      </main>
    </div>
  );
};
