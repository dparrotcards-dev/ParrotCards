import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Headphones,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { AdminDailyRecording, adminService } from '../../services/adminService';

const MAX_FILE_SIZE = 4_470_000;

const getToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return 'Date unavailable';
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const AdminDailyRecordingsPage: React.FC = () => {
  const [recordings, setRecordings] = useState<AdminDailyRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyRecordingId, setBusyRecordingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [title, setTitle] = useState('');
  const [recordingDate, setRecordingDate] = useState(getToday);
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingRecording, setEditingRecording] = useState<AdminDailyRecording | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRecordingDate, setEditRecordingDate] = useState('');
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaved, setEditSaved] = useState(false);

  const loadRecordings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecordings(await adminService.getDailyRecordings());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load daily recordings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecordings();
  }, [loadRecordings, retryCount]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Enter a title for this recording.');
      return;
    }
    if (!file) {
      setError('Choose an audio file to upload.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Audio files must be 4.47 MB or smaller.');
      return;
    }
    if (
      !file.type.startsWith('audio/') &&
      !/\.(mp3|mpeg|m4a|aac|wav|ogg|webm|flac)$/i.test(file.name)
    ) {
      setError('Choose a supported audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('recordingDate', recordingDate);
    formData.append('isPublished', String(isPublished));
    formData.append('audio', file);

    setSaving(true);
    try {
      await adminService.uploadDailyRecording(formData);
      setSuccess(`“${title.trim()}” was uploaded${isPublished ? ' and published' : ''}.`);
      setTitle('');
      setFile(null);
      const fileInput = document.getElementById('daily-recording-audio') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      await loadRecordings();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The recording could not be uploaded.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (recording: AdminDailyRecording) => {
    setBusyRecordingId(recording.id);
    setError(null);
    setSuccess(null);
    try {
      await adminService.setDailyRecordingPublished(recording.id, !recording.isPublished);
      setSuccess(
        !recording.isPublished
          ? `“${recording.title}” is now published.`
          : `“${recording.title}” is now unpublished.`,
      );
      await loadRecordings();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'The recording status could not be changed.');
    } finally {
      setBusyRecordingId(null);
    }
  };

  const openEditDialog = (recording: AdminDailyRecording) => {
    setEditingRecording(recording);
    setEditTitle(recording.title);
    setEditRecordingDate(recording.recordingDate.slice(0, 10));
    setEditError(null);
    setEditSaved(false);
  };

  const handleMetadataSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingRecording) return;

    setEditError(null);
    setSavingMetadata(true);
    try {
      await adminService.updateDailyRecording(editingRecording.id, {
        title: editTitle.trim(),
        recordingDate: editRecordingDate,
      });
      await loadRecordings();
      setEditSaved(true);
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : 'The recording details could not be saved.');
    } finally {
      setSavingMetadata(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-[#d6b98f]/35 bg-[#fffaf3] p-5 shadow-[0_8px_24px_rgba(80,48,15,.07)] sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2e7d5] text-[#8b5a1b]">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#3a2011]">Upload a daily recording</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#755d46]">
              Add the voice session for a date, then publish it for the Daily Resonance page.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#503824]">Recording title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
              className="w-full rounded-xl border border-[#d8c3a7] bg-white px-3.5 py-3 text-sm text-[#342117] outline-none focus:border-[#9b6a2c] focus:ring-2 focus:ring-[#b78749]/20"
              placeholder="e.g. Shadow Discharge — November 26"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#503824]">Recording date</span>
            <input
              type="date"
              value={recordingDate}
              onChange={(event) => setRecordingDate(event.target.value)}
              required
              className="w-full rounded-xl border border-[#d8c3a7] bg-white px-3.5 py-3 text-sm text-[#342117] outline-none focus:border-[#9b6a2c] focus:ring-2 focus:ring-[#b78749]/20"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-[#503824]">Audio file</span>
            <span className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-dashed border-[#c9aa7d] bg-white px-3.5 py-2.5">
              <Upload className="h-5 w-5 shrink-0 text-[#9b6a2c]" />
              <input
                id="daily-recording-audio"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/flac,.mp3,.mpeg,.m4a,.aac,.wav,.ogg,.webm,.flac"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
                className="min-w-0 flex-1 text-sm text-[#5d4935] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f1e4d1] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#704413] hover:file:bg-[#ead8bd]"
              />
            </span>
            <span className="mt-1.5 block text-xs text-[#806b54]">
              MP3/MPEG, M4A, AAC, WAV, OGG, WebM, or FLAC · maximum 4.47 MB
              {file && ` · ${formatFileSize(file.size)}`}
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1d2bd] bg-white px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#9b6a2c]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#503824]">Publish after upload</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#806b54]">
                Published recordings appear publicly in today&apos;s session or Previous Sessions.
              </span>
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 md:col-span-2" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 md:col-span-2" role="status">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#89571c] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#704413] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {saving ? 'Uploading recording…' : isPublished ? 'Upload and publish' : 'Upload as draft'}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d6b98f]/35 bg-[#fffaf3] shadow-[0_8px_24px_rgba(80,48,15,.07)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8d9c4] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#3a2011]">Daily recordings</h2>
            <p className="mt-0.5 text-xs text-[#806b54]">Edit recording details and manage publication status.</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            disabled={loading}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbb18d] px-3 text-xs font-bold text-[#704413] hover:bg-[#f7eddf] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-[#806b54]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading recordings…
          </div>
        ) : recordings.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#806b54]">
            No recordings have been uploaded yet.
          </p>
        ) : (
          <div className="divide-y divide-[#eee2d1]">
            {recordings.map((recording) => (
              <article
                key={recording.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-[#3a2819]">{recording.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#806b54]">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(recording.recordingDate)}
                    </span>
                    <span>{recording.audioOriginalName} · {formatFileSize(recording.audioSize)}</span>
                    {recording.publishedAt && (
                      <span>Published {new Date(recording.publishedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex w-full shrink-0 gap-2 self-start sm:w-auto sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditDialog(recording)}
                    disabled={busyRecordingId !== null || savingMetadata}
                    className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#cbb18d] px-3 text-xs font-bold text-[#704413] transition hover:bg-[#f7eddf] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePublishToggle(recording)}
                    disabled={busyRecordingId !== null || savingMetadata}
                    className={`inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${
                      recording.isPublished
                        ? 'border border-[#d6b5b0] bg-[#fff5f3] text-[#8c342b] hover:bg-[#f9e7e3]'
                        : 'border border-[#b9d5bd] bg-[#f3faf3] text-[#2d7139] hover:bg-[#e8f5e8]'
                    }`}
                  >
                    {busyRecordingId === recording.id && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                    {recording.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-recording-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-[#d6b98f]/50 bg-[#fffaf3] p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5">
              <h2 id="edit-recording-title" className="font-serif text-xl font-bold text-[#3a2011]">
                Edit recording
              </h2>
              <p className="mt-1 text-sm text-[#755d46]">
                Update the title or date. The uploaded audio file will stay unchanged.
              </p>
            </div>

            <form onSubmit={handleMetadataSave} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#503824]">Recording title</span>
                <input
                  value={editTitle}
                  onChange={(event) => {
                    setEditTitle(event.target.value);
                    setEditSaved(false);
                  }}
                  maxLength={120}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#d8c3a7] bg-white px-3.5 py-3 text-sm text-[#342117] outline-none focus:border-[#9b6a2c] focus:ring-2 focus:ring-[#b78749]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#503824]">Recording date</span>
                <input
                  type="date"
                  value={editRecordingDate}
                  onChange={(event) => {
                    setEditRecordingDate(event.target.value);
                    setEditSaved(false);
                  }}
                  required
                  className="w-full rounded-xl border border-[#d8c3a7] bg-white px-3.5 py-3 text-sm text-[#342117] outline-none focus:border-[#9b6a2c] focus:ring-2 focus:ring-[#b78749]/20"
                />
              </label>

              {editError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              {editSaved && (
                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Recording details updated.</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingRecording(null)}
                  disabled={savingMetadata}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#cbb18d] px-4 text-sm font-bold text-[#704413] hover:bg-[#f7eddf] disabled:opacity-60"
                >
                  {editSaved ? 'Done' : 'Cancel'}
                </button>
                {!editSaved && (
                  <button
                    type="submit"
                    disabled={savingMetadata}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#89571c] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#704413] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingMetadata && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {savingMetadata ? 'Saving…' : 'Save changes'}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
