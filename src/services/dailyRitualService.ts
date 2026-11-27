import { api } from './api';

export interface DailyRecording {
  id: string;
  title: string;
  recordingDate: string;
  audioUrl: string;
  status: 'published';
  publishedAt: string;
  durationSeconds?: number;
}

export interface DailyRitualResumePoint {
  playbackId: string;
  positionSeconds: number;
  listenedSeconds: number;
  durationSeconds: number;
}

export interface DailyRitualListeningSession {
  id: string;
  title: string;
  recordingDate: string;
  isPublished: boolean;
  audioUrl: string | null;
  totalPlays: number;
  completedListens: number;
  lastListenedAt: string | null;
  resume: DailyRitualResumePoint | null;
}

interface DailyRecordingApiItem {
  id: string;
  title: string;
  recordingDate: string;
  audioUrl: string;
  status: string;
  publishedAt: string;
  durationSeconds?: number;
}

interface DailyRecordingApiResponse {
  success: boolean;
  message?: string;
  data?: {
    recordings?: unknown;
  };
}

interface DailyRitualListeningResponse {
  success: boolean;
  message?: string;
  data?: {
    sessions?: unknown;
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseRecording = (value: unknown): DailyRecordingApiItem => {
  if (
    !isObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.recordingDate !== 'string' ||
    typeof value.audioUrl !== 'string' ||
    typeof value.status !== 'string' ||
    typeof value.publishedAt !== 'string'
  ) {
    throw new Error('The daily recordings API returned a recording with missing required fields.');
  }

  if (
    value.durationSeconds !== undefined &&
    (typeof value.durationSeconds !== 'number' ||
      !Number.isFinite(value.durationSeconds) ||
      value.durationSeconds < 0)
  ) {
    throw new Error('The daily recordings API returned an invalid audio duration.');
  }

  if (Number.isNaN(new Date(value.recordingDate).getTime())) {
    throw new Error('The daily recordings API returned an invalid recording date.');
  }

  if (Number.isNaN(new Date(value.publishedAt).getTime())) {
    throw new Error('The daily recordings API returned an invalid publication date.');
  }

  if (!value.id.trim() || !value.title.trim() || !value.audioUrl.trim()) {
    throw new Error('The daily recordings API returned an empty id, title, or audio URL.');
  }

  return {
    id: value.id,
    title: value.title,
    recordingDate: value.recordingDate,
    audioUrl: api.getUri({ url: value.audioUrl }),
    status: value.status,
    publishedAt: value.publishedAt,
    durationSeconds: value.durationSeconds,
  };
};

const parseListeningSession = (value: unknown): DailyRitualListeningSession => {
  if (
    !isObject(value) ||
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.recordingDate !== 'string' ||
    typeof value.isPublished !== 'boolean' ||
    (value.audioUrl !== null && typeof value.audioUrl !== 'string') ||
    typeof value.totalPlays !== 'number' ||
    typeof value.completedListens !== 'number' ||
    (value.lastListenedAt !== null && typeof value.lastListenedAt !== 'string') ||
    (value.resume !== null && !isObject(value.resume))
  ) {
    throw new Error('The daily ritual listening API returned an invalid session.');
  }

  let resume: DailyRitualResumePoint | null = null;
  if (value.resume !== null) {
    const point = value.resume as Record<string, unknown>;
    if (
      typeof point.playbackId !== 'string' ||
      typeof point.positionSeconds !== 'number' ||
      typeof point.listenedSeconds !== 'number' ||
      typeof point.durationSeconds !== 'number'
    ) {
      throw new Error('The daily ritual listening API returned an invalid resume point.');
    }

    resume = {
      playbackId: point.playbackId,
      positionSeconds: point.positionSeconds,
      listenedSeconds: point.listenedSeconds,
      durationSeconds: point.durationSeconds,
    };
  }

  return {
    id: value.id,
    title: value.title,
    recordingDate: value.recordingDate,
    isPublished: value.isPublished,
    audioUrl: value.audioUrl === null ? null : api.getUri({ url: value.audioUrl }),
    totalPlays: value.totalPlays,
    completedListens: value.completedListens,
    lastListenedAt: value.lastListenedAt,
    resume,
  };
};

export const dailyRitualService = {
  async getPublishedRecordings(signal?: AbortSignal): Promise<DailyRecording[]> {
    const response = await api.get<DailyRecordingApiResponse>('/daily-rituals/recordings', { signal });
    const payload = response.data;

    if (!payload?.success) {
      throw new Error(payload?.message || 'The daily recordings service could not provide sessions.');
    }

    if (!Array.isArray(payload.data?.recordings)) {
      throw new Error('The daily recordings API response did not include a recordings list.');
    }

    return payload.data.recordings
      .map(parseRecording)
      .filter((recording): recording is DailyRecording => recording.status === 'published');
  },

  async getListeningHistory(signal?: AbortSignal): Promise<DailyRitualListeningSession[]> {
    const response = await api.get<DailyRitualListeningResponse>('/daily-rituals/listening', { signal });
    const payload = response.data;

    if (!payload?.success) {
      throw new Error(payload?.message || 'Your daily ritual history could not be loaded.');
    }
    if (!Array.isArray(payload.data?.sessions)) {
      throw new Error('The daily ritual listening API response did not include sessions.');
    }

    return payload.data.sessions.map(parseListeningSession);
  },

  async saveListeningProgress(
    recordingId: string,
    progress: {
      playbackId: string;
      positionSeconds: number;
      durationSeconds: number;
      listenedSeconds: number;
      completed?: boolean;
    },
  ): Promise<void> {
    await api.put(`/daily-rituals/recordings/${recordingId}/listening`, progress);
  },
};
