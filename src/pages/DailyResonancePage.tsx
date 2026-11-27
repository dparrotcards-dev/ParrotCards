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
} from '../services/dailyResonanceService';
import {
  getResonanceStageInfo,
  RESONANCE_MILESTONES,
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
  togglePlayPause: () => Promise<void>;
  pause: () => void;
  replay: () => Promise<void>;
}

export interface ResonancePlayerProps {
  recording: DailyRecording;
  isToday: boolean;
  autoPlayOnMount?: boolean;
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
  ) => Promise<void>;
}

export const ResonancePlayer = React.forwardRef<ResonancePlayerHandle, ResonancePlayerProps>(
  (
    {
      recording,
      isToday,
      autoPlayOnMount = false,
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
    const playRequestPendingRef = useRef(false);
    const listenedSecondsRef = useRef(resumePoint?.listenedSeconds || 0);
    const lastSavedListenedSecondsRef = useRef(resumePoint?.listenedSeconds || 0);
    const lastAudioTimeRef = useRef<number | null>(null);
    const lastSaveAtRef = useRef(0);
    const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    const progress = isComplete
      ? 1
      : duration > 0
        ? Math.min(0.99, Math.max(0, currentTime / duration))
        : 0;
    const progressPercent = isComplete ? 100 : Math.round(progress * 100);
    const shadowIntensity = Math.max(0, 100 - progressPercent);
    const displayDuration = duration || recording.durationSeconds || 0;
    const stageInfo = getResonanceStageInfo(progress, isPlaying, isComplete);

    const persistListeningProgress = useCallback(
      (audio: HTMLAudioElement, force = false, completed = false) => {
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
        const request = saveQueueRef.current.then(() =>
          onListeningProgress(recording.id, update),
        );
        saveQueueRef.current = request.then(
          () => {
            lastSavedListenedSecondsRef.current = Math.max(
              lastSavedListenedSecondsRef.current,
              listenedSeconds,
            );
            setTrackingError(null);
          },
          (error: unknown) => {
            setTrackingError(
              error instanceof Error ? error.message : 'Listening progress could not be saved.',
            );
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
        if (
          previousTime !== null &&
          !audio.seeking &&
          (!audio.paused || includeFinalDelta) &&
          nextTime > previousTime
        ) {
          listenedSecondsRef.current += nextTime - previousTime;
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
        if (document.visibilityState !== 'hidden') return;
        const audio = audioRef.current;
        if (!audio) return;
        syncAudioTime(audio);
        void persistListeningProgress(audio, true);
      };

      document.addEventListener('visibilitychange', flushProgress);
      window.addEventListener('pagehide', flushProgress);
      return () => {
        document.removeEventListener('visibilitychange', flushProgress);
        window.removeEventListener('pagehide', flushProgress);
      };
    }, [onListeningProgress, persistListeningProgress, syncAudioTime]);

    useEffect(() => {
      onPlaybackChange?.(recording.id, isPlaying);
    }, [isPlaying, onPlaybackChange, recording.id]);

    const applyResumePoint = useCallback((audio: HTMLAudioElement) => {
      const point = resumePointRef.current;
      if (resumeAppliedRef.current || !point || audio.readyState < 1) return;

      resumeAppliedRef.current = true;
      playbackIdRef.current = point.playbackId;
      listenedSecondsRef.current = point.listenedSeconds;
      lastSavedListenedSecondsRef.current = point.listenedSeconds;
      if (point.positionSeconds <= 0 || !Number.isFinite(audio.duration)) return;

      const resumeTime = Math.min(point.positionSeconds, audio.duration);
      audio.currentTime = resumeTime;
      lastAudioTimeRef.current = resumeTime;
      setCurrentTime(resumeTime);
    }, []);

    useEffect(() => {
      resumePointRef.current = resumePoint;
      resumeAppliedRef.current = !resumePoint;
      if (!resumePoint) return;

      playbackIdRef.current = resumePoint.playbackId;
      listenedSecondsRef.current = resumePoint.listenedSeconds;
      lastSavedListenedSecondsRef.current = resumePoint.listenedSeconds;
      const audio = audioRef.current;
      if (audio && !playRequestPendingRef.current) {
        applyResumePoint(audio);
      }
    }, [applyResumePoint, recording.id, resumePoint]);

    const playAudio = useCallback(async (fromAutoMount = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      setPlaybackError(null);
      if (isComplete || (duration > 0 && audio.currentTime >= duration - 0.05)) {
        audio.currentTime = 0;
        setCurrentTime(0);
        setIsComplete(false);
        playbackIdRef.current = createPlaybackId();
        listenedSecondsRef.current = 0;
        lastSavedListenedSecondsRef.current = 0;
        lastAudioTimeRef.current = 0;
      }

      try {
        playRequestPendingRef.current = true;
        await audio.play();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError' && audio.paused) {
          return;
        }
        const isAutoplayBlocked =
          fromAutoMount && error instanceof DOMException && error.name === 'NotAllowedError';
        if (!isAutoplayBlocked) {
          const message = error instanceof Error ? error.message : 'Playback could not start.';
          setPlaybackError(`Audio playback failed: ${message}`);
        }
      } finally {
        playRequestPendingRef.current = false;
        if (!audio.paused) {
          applyResumePoint(audio);
        }
      }
    }, [applyResumePoint, duration, isComplete]);

    const pauseAudio = useCallback(() => {
      audioRef.current?.pause();
    }, []);

    const handleTogglePlayPause = useCallback(async () => {
      if (isPlaying) {
        pauseAudio();
      } else {
        await playAudio(false);
      }
    }, [isPlaying, pauseAudio, playAudio]);

    const handleReplay = useCallback(async () => {
      const audio = audioRef.current;
      if (!audio) return;

      setPlaybackError(null);
      setCurrentTime(0);
      setIsComplete(false);
      audio.currentTime = 0;
      playbackIdRef.current = createPlaybackId();
      listenedSecondsRef.current = 0;
      lastSavedListenedSecondsRef.current = 0;
      lastAudioTimeRef.current = 0;

      try {
        await audio.play();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError' && audio.paused) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Playback could not start.';
        setPlaybackError(`Audio playback failed: ${message}`);
      }
    }, []);

    const handleTimelineSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio || !(duration > 0)) return;

      const nextTime = Math.min(duration, Math.max(0, Number(event.target.value)));
      if (nextTime >= audio.currentTime) {
        event.currentTarget.value = String(audio.currentTime);
        return;
      }

      audio.currentTime = nextTime;
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
      void playAudio(true);
      // Only trigger once when session opens from user click on a previous recording
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlayOnMount, recording.id]);

    const statusBadgeText = isComplete
      ? 'Released'
      : isPlaying
        ? 'Playing'
        : currentTime > 0
          ? 'Paused'
          : 'Ready';

    const statusBadgeClass = isComplete
      ? 'border-[#D9B664]/45 bg-[#D9B664]/15 text-[#F6DE9D]'
      : isPlaying
        ? 'border-[#64C48B]/40 bg-[#175B35]/40 text-[#8AE8AF]'
        : 'border-white/15 bg-white/5 text-[#CDC7BD]';

    return (
      <section
        className="overflow-hidden rounded-[26px] border border-[#E6DCCB] bg-[#FFFDF9] shadow-[0_12px_42px_rgba(54,39,22,0.09)]"
        aria-label={isToday ? "Today's resonance session" : `Previous resonance session: ${recording.title}`}
      >
        {/* Cosmic Charcoal Shadow Form Visual Stage */}
        <div className="px-3.5 pt-3.5 sm:px-6 sm:pt-6">
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0B0911] px-4 pb-4 pt-4 text-white shadow-inner sm:min-h-[455px] sm:px-7 sm:pb-6 sm:pt-6">
            {/* Ambient Stage Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                background:
                  progress >= 0.72
                    ? 'radial-gradient(ellipse at 50% 48%, rgba(232,184,86,0.22), rgba(92,58,150,0.10) 45%, transparent 72%)'
                    : 'radial-gradient(ellipse at 50% 48%, rgba(132,96,216,0.24), transparent 64%)',
              }}
            />

            {/* Top Stage Bar */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-cinzel text-[10px] font-bold tracking-[0.16em] text-[#F2E9D7] sm:text-xs">
                  RESONANCE / DAILY SESSION
                </p>
                <p className="mt-1 text-[11px] text-[#C7BFAF] sm:text-xs">
                  {formatRecordingDate(recording.recordingDate)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-wider sm:text-[10px] ${statusBadgeClass}`}
                >
                  {statusBadgeText}
                </span>
                {onClose && (
                  <button
                    type="button"
                    onClick={() => {
                      pauseAudio();
                      onClose();
                    }}
                    aria-label="Close previous session player"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#D8D1C7] transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9B664]"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Centered Meditative Shadow Form Silhouette */}
            <div className="relative z-10 mx-auto my-1 h-[225px] w-full max-w-[330px] sm:my-2 sm:h-[330px] sm:max-w-[460px] md:h-[360px]">
              <ResonanceShadowVisual
                progress={progress}
                isPlaying={isPlaying}
                isComplete={isComplete}
              />
            </div>

            {/* Stage Narrative + 5-Stage Audio Sync Journey Strip */}
            <div className="relative z-10 text-center">
              <p className="font-cormorant text-xl font-semibold leading-snug text-[#F5EDD9] sm:text-2xl">
                {stageInfo.headline}
              </p>
              <p className="mt-0.5 text-[11px] text-[#ABA399] sm:text-xs">
                {stageInfo.subtitle}
              </p>

              {/* Minimal Stage Checkpoint Indicator (Single figure above transitions through these checkpoints) */}
              <div
                aria-hidden="true"
                className="mx-auto mt-3.5 grid max-w-lg grid-cols-5 gap-1.5 border-t border-white/10 pt-3 sm:gap-2"
              >
                {RESONANCE_MILESTONES.map((milestone) => {
                  const isReached = progressPercent >= milestone.percent;
                  const isGoldStage = milestone.percent >= 75 && isReached;
                  return (
                    <div key={milestone.percent} className="flex flex-col items-center text-center">
                      <span
                        className={`text-[9.5px] font-semibold tabular-nums transition-colors sm:text-[10.5px] ${
                          isGoldStage
                            ? 'text-[#F5D688]'
                            : isReached
                              ? 'text-[#D6C6FF]'
                              : 'text-white/40'
                        }`}
                      >
                        {milestone.percent}%
                      </span>
                      <span
                        className={`mt-0.5 hidden truncate text-[9px] sm:block ${
                          isReached ? 'text-white/80' : 'text-white/35'
                        }`}
                      >
                        {milestone.label}
                      </span>
                      <span
                        className={`mt-1 h-1 w-full rounded-full transition-colors duration-200 ${
                          isGoldStage
                            ? 'bg-gradient-to-r from-[#D9A74A] to-[#F7DE95]'
                            : isReached
                              ? 'bg-[#9E84F3]'
                              : 'bg-white/15'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Cream & Gold Interactive Audio Player Controls */}
        <div className="px-4 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-cinzel text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8C6D3B]">
                {isToday ? "Today's recording" : 'Previous session'}
              </p>
              <h2 className="mt-1 break-words font-cormorant text-2xl font-bold leading-tight text-[#2A2118] sm:text-3xl">
                {recording.title}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#726656]">
                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
                <span>{formatRecordingDate(recording.recordingDate)}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#E6DCCB] bg-[#FBF6EE] px-3 py-1.5 text-xs font-medium text-[#6C5E4E] sm:self-center">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
              <span className="tabular-nums">{formatTime(displayDuration)}</span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={recording.audioUrl}
            preload="auto"
            onLoadedMetadata={(event) => {
              const actualDuration = event.currentTarget.duration;
              if (Number.isFinite(actualDuration) && actualDuration > 0) {
                setDuration(actualDuration);
                if (!playRequestPendingRef.current) {
                  applyResumePoint(event.currentTarget);
                }
              }
            }}
            onDurationChange={(event) => {
              const actualDuration = event.currentTarget.duration;
              if (Number.isFinite(actualDuration) && actualDuration > 0) {
                setDuration(actualDuration);
              }
            }}
            onTimeUpdate={(event) => syncAudioTime(event.currentTarget)}
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
              setIsPlaying(false);
              syncAudioTime(event.currentTarget, true);
              void persistListeningProgress(event.currentTarget, true);
            }}
            onEnded={(event) => {
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
              setIsPlaying(false);
              setPlaybackError('This recording could not be loaded. Please try again later.');
            }}
            className="hidden"
          />
          {trackingError && (
            <p className="mt-3 text-center text-sm text-[#9B342C]" role="alert">
              Listening progress could not be saved: {trackingError}
            </p>
          )}

          {/* Progress, Interactive Audio Timeline & Shadow Intensity */}
          <div className="mt-5 rounded-2xl border border-[#EDE4D4] bg-[#FBF7EF]/75 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#6B6155]">
                Daily Resonance Progress
              </span>
              <span className="inline-flex items-center gap-2 font-cinzel text-xs font-bold tabular-nums text-[#332820]">
                <span className="rounded-full bg-[#EFE4CF] px-2 py-0.5 text-[9.5px] tracking-wider text-[#725729]">
                  {stageInfo.label}
                </span>
                <span>{progressPercent}%</span>
              </span>
            </div>

            {/* Backward-only timeline slider */}
            <div className="relative mt-3 flex h-6 items-center">
              <div className="pointer-events-none absolute inset-x-0 h-2 overflow-hidden rounded-full bg-[#E8E0D5]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    background:
                      progressPercent >= 75
                        ? 'linear-gradient(90deg, #8A6CE0 0%, #C79942 60%, #E7BE61 100%)'
                        : 'linear-gradient(90deg, #7A5ED9 0%, #AE97F7 100%)',
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

            {/* Current Time & Total Duration */}
            <div className="mt-1 flex items-center justify-between font-mono text-[11px] tabular-nums text-[#72685C]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>

            {/* Shadow Intensity Indicator */}
            <div className="mt-3.5 border-t border-[#E8DFCE] pt-3">
              <div className="flex items-center justify-between gap-3 text-[11px] text-[#72675A]">
                <span className="font-medium">Shadow Intensity</span>
                <span className="font-cinzel font-bold tabular-nums text-[#524334]">
                  {shadowIntensity}% remaining
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EAE2D6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2D2246] via-[#6B4DB8] to-[#A48AE8] transition-[width] duration-150"
                  style={{ width: `${shadowIntensity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Play / Pause / Replay Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {isComplete ? (
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B89145] to-[#9A7431] px-7 font-cinzel text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(151,112,42,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:w-auto"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Replay Session
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void handleTogglePlayPause()}
                  aria-label={isPlaying ? 'Pause recording' : currentTime > 0 ? 'Resume recording' : 'Play recording'}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B89145] to-[#9A7431] px-8 font-cinzel text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(151,112,42,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:w-auto"
                >
                  {isPlaying ? (
                    <Pause aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Play aria-hidden="true" className="h-4 w-4" />
                  )}
                  {isPlaying ? 'Pause' : currentTime > 0 ? 'Resume' : 'Play Session'}
                </button>

                {currentTime > 0 && (
                  <button
                    type="button"
                    onClick={handleReplay}
                    aria-label="Replay recording from start"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#C6AB77] bg-[#FBF7EF] px-5 font-cinzel text-xs font-bold uppercase tracking-[0.1em] text-[#725729] transition hover:bg-[#F3EADB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] sm:w-auto"
                  >
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    Replay
                  </button>
                )}
              </>
            )}
          </div>

          {isComplete && (
            <div className="mt-5 flex flex-col items-center gap-1 text-center" role="status">
              <p className="inline-flex items-center gap-2 font-cormorant text-xl font-semibold text-[#725729]">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                Your shadow is released.
              </p>
              <p className="font-cinzel text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C6D3B]">
                {isToday ? "Today's Resonance Completed." : 'Session completed.'}
              </p>
            </div>
          )}

          {playbackError && (
            <p className="mt-4 text-center text-sm text-[#9B342C]" role="alert">
              {playbackError}
            </p>
          )}
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
    ) => {
      if (isAuthenticated) {
        await dailyResonanceService.saveListeningProgress(recordingId, progress);
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

  const handleSelectPreviousSession = (recordingId: string) => {
    if (selectedPreviousId === recordingId) {
      void previousPlayerRef.current?.togglePlayPause();
      return;
    }

    activeAudioRef.current?.pause();
    flushSync(() => setSelectedPreviousId(recordingId));
    void previousPlayerRef.current?.togglePlayPause();
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
            Your voice. Your shadow. Your release.
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
              <section className="rounded-[26px] border border-[#E6DCCB] bg-[#FFFDF9] px-5 py-10 text-center shadow-[0_12px_42px_rgba(54,39,22,0.06)] sm:py-14">
                <CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-[#9A783D]" />
                <h2 className="mt-4 font-cormorant text-2xl font-bold text-[#332820]">
                  No recording published for today yet
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#746B60]">
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
                          className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 shadow-[0_4px_18px_rgba(70,50,20,0.04)] transition sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                            isSelected ? 'border-[#B99A5E] bg-[#FFFDF9]' : 'border-[#E6DCCB] bg-[#FFFDF9]/75'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs text-[#81776B]">
                              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#9A783D]" />
                              {formatRecordingDate(recording.recordingDate)}
                            </p>
                            <h3 className="mt-1 break-words font-cormorant text-xl font-semibold text-[#332820]">
                              {recording.title}
                            </h3>
                            {recording.durationSeconds !== undefined && (
                              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#81776B]">
                                <Clock3 aria-hidden="true" className="h-3 w-3" />
                                {formatTime(recording.durationSeconds)}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleSelectPreviousSession(recording.id)}
                              aria-label={isThisPlaying ? `Pause ${recording.title}` : `Play ${recording.title}`}
                              aria-expanded={isSelected}
                              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-cinzel text-[10.5px] font-bold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] ${
                                isThisPlaying
                                  ? 'bg-[#8C6D3B] text-white shadow-sm hover:bg-[#755A2F]'
                                  : 'border border-[#BDA777] bg-[#FFFDF9] text-[#725729] hover:bg-[#F6EFE3]'
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
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DCCB] bg-[#FAF4EA] text-[#726656] transition hover:bg-[#EFE4D3] hover:text-[#332820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
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
