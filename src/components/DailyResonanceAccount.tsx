import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import {
  DailyRecording,
  dailyResonanceService,
  DailyResonanceListeningSession,
} from '../services/dailyResonanceService';
import { ResonancePlayer, ResonancePlayerHandle } from '../pages/DailyResonancePage';

type SessionStatus = 'Completed' | 'Missed' | 'In Progress' | 'No Session';

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSessionDate = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const statusForSession = (session: DailyResonanceListeningSession, today: string): SessionStatus => {
  if (session.completedListens > 0) return 'Completed';
  if (session.isPublished && session.recordingDate < today) return 'Missed';
  if (
    (session.resume?.positionSeconds || 0) > 0 ||
    (session.isPublished && session.recordingDate === today)
  ) {
    return 'In Progress';
  }
  return 'No Session';
};

const statusStyles: Record<SessionStatus, string> = {
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Missed: 'border-red-200 bg-red-50 text-red-800',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-800',
  'No Session': 'border-[#E6E0D6] bg-[#F3F1ED] text-[#746F67]',
};

const statusDots: Record<SessionStatus, string> = {
  Completed: 'bg-emerald-500',
  Missed: 'bg-red-500',
  'In Progress': 'bg-amber-400',
  'No Session': 'bg-[#A8A39B]',
};

const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`} />
    {status}
  </span>
);

export const DailyResonanceAccount: React.FC = () => {
  const today = toDateKey(new Date());
  const [sessions, setSessions] = useState<DailyResonanceListeningSession[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [replaySessionId, setReplaySessionId] = useState<string | null>(null);
  const replayPlayerRef = useRef<ResonancePlayerHandle | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    dailyResonanceService
      .getListeningHistory(controller.signal)
      .then(setSessions)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : 'Your listening history could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  const sessionByDate = useMemo(() => {
    const grouped = new Map<string, DailyResonanceListeningSession[]>();
    for (const session of sessions) {
      const current = grouped.get(session.recordingDate) || [];
      current.push(session);
      grouped.set(session.recordingDate, current);
    }
    return grouped;
  }, [sessions]);

  const completedSessions = sessions.filter((session) => session.completedListens > 0).length;
  const missedSessions = sessions.filter(
    (session) =>
      session.isPublished &&
      session.recordingDate < today &&
      session.completedListens === 0,
  ).length;
  const totalPlays = sessions.reduce((total, session) => total + session.totalPlays, 0);

  const saveListeningProgress = useCallback(
    async (
      recordingId: string,
      progress: {
        playbackId: string;
        positionSeconds: number;
        durationSeconds: number;
        listenedSeconds: number;
        completed?: boolean;
      },
    ) => dailyResonanceService.saveListeningProgress(recordingId, progress),
    [],
  );

  const playSession = (recordingId: string) => {
    if (replaySessionId === recordingId) {
      void replayPlayerRef.current?.replay();
      return;
    }

    activeAudioRef.current?.pause();
    setReplaySessionId(recordingId);
  };

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const monthLength = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: monthLength }, (_, index) => index + 1),
    ];
    const trailingDays = (7 - (days.length % 7)) % 7;
    return [...days, ...Array.from({ length: trailingDays }, () => null)];
  }, [visibleMonth]);

  const selectedDaySessions = sessionByDate.get(selectedDate) || [];
  const navigateMonth = (amount: number) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1,
    );
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  };
  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const getDateStatus = (dateKey: string): SessionStatus => {
    const daySessions = sessionByDate.get(dateKey) || [];
    if (daySessions.some((session) => session.completedListens > 0)) return 'Completed';
    if (daySessions.some((session) => session.isPublished) && dateKey < today) return 'Missed';
    if (
      daySessions.some((session) => (session.resume?.positionSeconds || 0) > 0) ||
      daySessions.some((session) => session.isPublished && dateKey === today)
    ) {
      return 'In Progress';
    }
    return 'No Session';
  };

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] px-5 py-5 shadow-[0_4px_16px_rgba(70,50,20,0.05)] sm:px-7">
        <div className="flex items-center gap-2 text-[#9A7130]">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.18em]">Your listening history</span>
        </div>
        <h2 className="mt-2 font-cinzel text-xl font-bold uppercase tracking-wide text-[#211B14] sm:text-2xl">
          My Daily Resonance
        </h2>
        <p className="mt-1 text-xs text-[#6B635B] sm:text-sm">
          Review your Daily Resonance sessions and listening progress.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <p>Listening history could not be loaded: {error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] px-5 py-10 text-center text-sm text-[#746B60]" role="status">
          Loading your listening history…
        </div>
      ) : (
        <>
          <section aria-label="Listening summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Completed Sessions', value: completedSessions, Icon: Headphones },
              { label: 'Missed Sessions', value: missedSessions, Icon: CalendarDays },
              { label: 'Total Plays', value: totalPlays, Icon: CirclePlay },
            ].map(({ label, value, Icon }) => (
              <article key={label} className="flex items-center gap-3.5 rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] px-4 py-3 shadow-[0_3px_10px_rgba(70,50,20,0.04)] sm:px-5 sm:py-4">
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#B8934E]/15 bg-[#F8F0E3] text-[#9A7130]">
                  <Icon className="h-6 w-6 stroke-[1.7]" />
                </span>
                <div>
                  <p className="text-xs font-medium text-[#6B635B]">{label}</p>
                  <p className="mt-0.5 font-cinzel text-2xl font-bold leading-none tabular-nums text-[#76531F]">{value}</p>
                </div>
              </article>
            ))}
          </section>

          <section aria-labelledby="resonance-calendar-heading" className="rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] p-4 shadow-[0_4px_16px_rgba(70,50,20,0.05)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="resonance-calendar-heading" className="flex items-center gap-3 font-cinzel text-base font-bold text-[#211B14] sm:text-lg">
                <CalendarDays aria-hidden="true" className="h-6 w-6 shrink-0 text-[#9A7130]" />
                Listening Calendar
              </h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => navigateMonth(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E4D0] bg-[#FFF8E9] text-[#76531F] transition-colors hover:bg-[#F3EBDD]"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <p className="flex min-h-9 min-w-[150px] items-center justify-center gap-2 rounded-full border border-[#F0E4D0] bg-[#FBF4E6] px-3 text-center text-xs font-semibold text-[#514536] sm:min-w-[180px] sm:text-sm" aria-live="polite">
                  <CalendarDays aria-hidden="true" className="h-4 w-4 text-[#9A7130]" />
                  {monthLabel}
                </p>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => navigateMonth(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E4D0] bg-[#FFF8E9] text-[#76531F] transition-colors hover:bg-[#F3EBDD]"
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-t-xl border border-[#F0E8DC] bg-[#F0E8DC] text-center text-[10px] font-bold uppercase tracking-wide text-[#76531F] sm:text-[11px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day} className="bg-[#F8F0E3] py-2">{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-xl border-x border-b border-[#F0E8DC] bg-[#F0E8DC]">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <span key={`blank-${index}`} aria-hidden="true" className="min-h-[48px] bg-[#FFFEFC] sm:min-h-[58px]" />;
                }
                const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
                const dateKey = toDateKey(date);
                const status = getDateStatus(dateKey);
                const isSelected = selectedDate === dateKey;
                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-label={`${formatSessionDate(dateKey)}: ${status}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`flex min-h-[48px] flex-col items-center justify-center gap-1 border text-xs font-semibold transition-colors sm:min-h-[58px] ${
                      isSelected
                        ? 'border-[#C8871D] bg-[#FFF6E5] text-[#4E3818] shadow-[inset_0_0_0_1px_rgba(200,135,29,0.12)]'
                        : 'border-transparent bg-[#FFFEFC] text-[#332820] hover:bg-[#FBF4E8]'
                    }`}
                  >
                    <span>{day}</span>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`} />
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#EEE6DA] pt-3">
              {(['Completed', 'Missed', 'In Progress', 'No Session'] as SessionStatus[]).map((status) => (
                <span key={status} className="inline-flex items-center gap-1.5 text-[11px] text-[#514536]">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${statusDots[status]}`} />
                  {status}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#F1E5D2] bg-[#FBF4E6] px-3.5 py-3 sm:px-4">
              <CalendarDays aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#9A7130]" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#3D3022]">{formatSessionDate(selectedDate)}</h4>
              {selectedDaySessions.length === 0 ? (
                <p className="mt-1 text-xs text-[#746B60]">No recording was published for this date.</p>
              ) : (
                <div className="mt-2 space-y-3">
                  {selectedDaySessions.map((session) => (
                    <div key={session.id} className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#332820]">{session.title}</p>
                      <StatusBadge status={statusForSession(session, today)} />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </section>

          <section aria-labelledby="resonance-history-heading">
            <h3 id="resonance-history-heading" className="mb-3 font-cinzel text-lg font-bold text-[#211B14] sm:text-xl">
              Recording History
            </h3>
            {sessions.length === 0 ? (
              <p className="rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] px-4 py-5 text-sm text-[#746B60] shadow-[0_3px_10px_rgba(70,50,20,0.04)]">
                Published sessions will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const status = statusForSession(session, today);
                  const recordingForPlayer: DailyRecording | null =
                    session.isPublished && session.audioUrl
                      ? {
                          id: session.id,
                          title: session.title,
                          recordingDate: session.recordingDate,
                          audioUrl: session.audioUrl,
                          status: 'published',
                          publishedAt: session.lastListenedAt || session.recordingDate,
                          durationSeconds: session.resume?.durationSeconds,
                        }
                      : null;
                  return (
                    <div key={session.id} className="space-y-3">
                      <article className="flex flex-col gap-3 rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] p-3.5 shadow-[0_3px_10px_rgba(70,50,20,0.04)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                        <div className="flex min-w-0 items-center gap-3.5">
                          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#B8934E]/15 bg-[#F8F0E3] text-[#9A7130]">
                            <CirclePlay className="h-6 w-6 stroke-[1.7]" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="break-words font-cinzel text-sm font-bold uppercase leading-snug text-[#211B14] sm:text-base">
                              {session.title}
                            </h4>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B6155] sm:text-xs">
                              <span>Date: {formatSessionDate(session.recordingDate)}</span>
                              <span className="hidden text-[#C8B99F] sm:inline" aria-hidden="true">|</span>
                              <span>Played: {session.totalPlays} {session.totalPlays === 1 ? 'time' : 'times'}</span>
                              <span className="hidden text-[#C8B99F] sm:inline" aria-hidden="true">|</span>
                              <span>Completed: {session.completedListens} {session.completedListens === 1 ? 'time' : 'times'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 pl-[62px] sm:justify-end sm:pl-0">
                          <StatusBadge status={status} />
                          {recordingForPlayer && (
                            <button
                              type="button"
                              onClick={() => playSession(session.id)}
                              aria-expanded={replaySessionId === session.id}
                              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#76531F] px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#5F4219]"
                            >
                              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                              Replay
                            </button>
                          )}
                        </div>
                      </article>
                      {replaySessionId === session.id && recordingForPlayer && (
                        <ResonancePlayer
                          key={session.id}
                          ref={replayPlayerRef}
                          recording={recordingForPlayer}
                          isToday={session.recordingDate === today}
                          autoPlayOnMount
                          resumePoint={null}
                          onAudioPlay={(audio) => {
                            if (activeAudioRef.current && activeAudioRef.current !== audio) {
                              activeAudioRef.current.pause();
                            }
                            activeAudioRef.current = audio;
                          }}
                          onListeningProgress={saveListeningProgress}
                          onClose={() => setReplaySessionId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
