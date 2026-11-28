import React, { useMemo, useState } from 'react';
import {
  Compass,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { JYOTIRLINGA_SHRINES, JyotirlingaShrine } from '../data/jyotirlingas';
import { useJyotirlingaCompass } from '../hooks/useJyotirlingaCompass';
import { SacredCompassDial } from '../components/SacredCompassDial';
import {
  calculateBearingDegrees,
  calculateDistanceKm,
  formatCoordinatePair,
  formatDistanceLabel,
  getCardinalDirection,
  shortestAngleDelta,
} from '../utils/compassMath';

const ROMAN_NUMERALS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
] as const;

export const JyotirlingaCompassPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(JYOTIRLINGA_SHRINES[0].id);
  const {
    locationStatus,
    locationError,
    coordinates,
    requestLocation,
    sensorStatus,
    sensorMessage,
    deviceHeading,
    liveHeadingRef,
    isUncalibrated,
    requestCompassPermission,
  } = useJyotirlingaCompass();

  const selectedShrine: JyotirlingaShrine = useMemo(
    () => JYOTIRLINGA_SHRINES.find((item) => item.id === selectedId) || JYOTIRLINGA_SHRINES[0],
    [selectedId],
  );

  const metricsByShrineId = useMemo(() => {
    const map = new Map<
      string,
      {
        distanceKm: number;
        bearingDegrees: number;
        cardinal: { short: string; full: string };
      }
    >();
    if (!coordinates) return map;

    for (const shrine of JYOTIRLINGA_SHRINES) {
      const distanceKm = calculateDistanceKm(
        coordinates.latitude,
        coordinates.longitude,
        shrine.latitude,
        shrine.longitude,
      );
      const bearingDegrees = calculateBearingDegrees(
        coordinates.latitude,
        coordinates.longitude,
        shrine.latitude,
        shrine.longitude,
      );
      map.set(shrine.id, {
        distanceKm,
        bearingDegrees,
        cardinal: getCardinalDirection(bearingDegrees),
      });
    }
    return map;
  }, [coordinates]);

  const activeMetrics = metricsByShrineId.get(selectedShrine.id) || null;
  const isLiveCompassActive = sensorStatus === 'active' && deviceHeading !== null;

  const turnGuidance = useMemo(() => {
    if (!isLiveCompassActive || !activeMetrics || deviceHeading === null) {
      return { aligned: false, label: null as string | null };
    }
    const delta = shortestAngleDelta(deviceHeading, activeMetrics.bearingDegrees);
    const absDelta = Math.abs(delta);
    if (absDelta <= 8) {
      return { aligned: true, label: 'Directly ahead' };
    }
    const degreesRounded = Math.round(absDelta);
    return {
      aligned: false,
      label: delta > 0 ? `Turn ${degreesRounded}° right` : `Turn ${degreesRounded}° left`,
    };
  }, [activeMetrics, deviceHeading, isLiveCompassActive]);

  const selectedRoman = ROMAN_NUMERALS[selectedShrine.order - 1] || String(selectedShrine.order);

  return (
    <div className="relative z-[1] flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-7 sm:space-y-9">
        {/* Header */}
        <header className="text-center">
          <div className="flex items-center justify-center gap-2.5 font-cinzel text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C6D3B] sm:text-xs">
            <Compass aria-hidden="true" className="h-4 w-4" />
            <span>Sacred Pilgrimage / Directional Compass</span>
          </div>
          <h1 className="mt-2.5 font-cormorant text-4xl font-bold text-[#2A1D14] sm:text-5xl">
            12 Jyotirlinga Compass
          </h1>
          <p className="mx-auto mt-2 max-w-2xl font-cormorant text-lg italic text-[#6D5F4E] sm:text-xl">
            Geographical true-north bearing and straight-line distance from where you stand to India’s twelve sacred shrines.
          </p>
        </header>

        {/* Primary Interactive Compass Card */}
        <section
          aria-label="Jyotirlinga directional compass"
          className="overflow-hidden rounded-[24px] border border-[#DFCEAF] bg-[#FFFDF9]/95 p-5 shadow-[0_14px_40px_rgba(54,39,22,0.08)] sm:p-7 lg:p-8"
        >
          <div className="grid items-center gap-7 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-10">
            {/* Left: Circular Compass Dial & Sensor Trigger */}
            <div className="flex flex-col items-center">
              <SacredCompassDial
                shrineName={selectedShrine.name}
                trueBearing={activeMetrics?.bearingDegrees ?? null}
                liveHeadingRef={liveHeadingRef}
                isLiveCompassActive={isLiveCompassActive}
                isAligned={turnGuidance.aligned}
              />

              {isLiveCompassActive && deviceHeading !== null && (
                <p className="mt-2 font-cinzel text-[11px] font-semibold tracking-wider tabular-nums text-[#7C5F2C]">
                  Facing {Math.round(deviceHeading)}° {getCardinalDirection(deviceHeading).short}
                </p>
              )}

              {sensorStatus === 'permission-required' && (
                <button
                  type="button"
                  onClick={() => void requestCompassPermission()}
                  className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A57E38] to-[#8D692A] px-5 font-cinzel text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_14px_rgba(141,105,42,0.24)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
                >
                  <Smartphone aria-hidden="true" className="h-4 w-4" />
                  Enable Live Compass
                </button>
              )}

              {isUncalibrated && isLiveCompassActive && (
                <p className="mt-3 max-w-xs text-center text-xs text-[#7D6542]">
                  Compass accuracy is low — move your phone gently in a figure-eight motion to calibrate.
                </p>
              )}
            </div>

            {/* Right: Shrine Selector, Bearing, Distance, GPS & Sensor Status */}
            <div className="min-w-0 space-y-5">
              {/* Quick Shrine Dropdown & Epithet */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5D5B8] bg-[#FAF2E4] px-3 py-1 font-cinzel text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C6D3B]">
                    Jyotirlinga {selectedRoman} of XII
                  </span>
                  <h2 className="mt-2 font-cormorant text-3xl font-bold text-[#2A1D14] sm:text-4xl">
                    {selectedShrine.name}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-[#6B5D4D]">
                    <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#9A783D]" />
                    <span>
                      {selectedShrine.city}, {selectedShrine.state}
                    </span>
                  </p>
                </div>

                <div className="w-full shrink-0 sm:w-56">
                  <label
                    htmlFor="jyotirlinga-selector"
                    className="mb-1 block font-cinzel text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D6D5B]"
                  >
                    Select Shrine
                  </label>
                  <select
                    id="jyotirlinga-selector"
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                    className="min-h-10 w-full rounded-xl border border-[#DFCEAF] bg-[#FAF7F2] px-3 py-2 text-sm font-medium text-[#2A1D14] outline-none transition focus:border-[#9A783D] focus:ring-2 focus:ring-[#9A783D]/20"
                  >
                    {JYOTIRLINGA_SHRINES.map((shrine) => (
                      <option key={shrine.id} value={shrine.id}>
                        {shrine.order}. {shrine.name} ({shrine.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#5E5245]">{selectedShrine.sacredNote}</p>

              {/* Telemetry Metrics (Direction & Distance) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E8DEC9] bg-[#FAF5EB] p-4">
                  <p className="flex items-center gap-1.5 font-cinzel text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C6D3B]">
                    <Navigation aria-hidden="true" className="h-3.5 w-3.5" />
                    True-North Direction
                  </p>
                  {activeMetrics ? (
                    <>
                      <p className="mt-1.5 font-cormorant text-3xl font-bold tabular-nums text-[#2A1D14]">
                        {Math.round(activeMetrics.bearingDegrees)}° {activeMetrics.cardinal.short}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B5D4D]">
                        {activeMetrics.cardinal.full}
                        {turnGuidance.label ? ` · ${turnGuidance.label}` : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 font-cormorant text-2xl font-bold text-[#6E6152]">—°</p>
                      <p className="mt-0.5 text-xs text-[#7D6E5D]">
                        Waiting for your location
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-[#E8DEC9] bg-[#FAF5EB] p-4">
                  <p className="flex items-center gap-1.5 font-cinzel text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C6D3B]">
                    <LocateFixed aria-hidden="true" className="h-3.5 w-3.5" />
                    Straight-Line Distance
                  </p>
                  {activeMetrics ? (
                    <>
                      <p className="mt-1.5 font-cormorant text-3xl font-bold tabular-nums text-[#2A1D14]">
                        {formatDistanceLabel(activeMetrics.distanceKm)}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-[#6B5D4D]">
                        Shrine: {formatCoordinatePair(selectedShrine.latitude, selectedShrine.longitude)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 font-cormorant text-2xl font-bold text-[#6E6152]">— km</p>
                      <p className="mt-0.5 text-xs tabular-nums text-[#7D6E5D]">
                        Shrine: {formatCoordinatePair(selectedShrine.latitude, selectedShrine.longitude)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Location Coordinates & Refresh Controls */}
              <div className="rounded-2xl border border-[#EAE0CF] bg-[#FFFDF9] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-cinzel text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D6D5B]">
                      Your Location
                    </p>
                    {coordinates ? (
                      <p className="mt-0.5 text-xs font-medium tabular-nums text-[#3D3125]">
                        {formatCoordinatePair(coordinates.latitude, coordinates.longitude)}
                        {coordinates.accuracyMeters !== null ? ` (±${coordinates.accuracyMeters} m)` : ''}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-[#6E6152]">
                        {locationStatus === 'requesting'
                          ? 'Requesting GPS coordinates…'
                          : 'Location permission needed to measure bearing & distance.'}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={requestLocation}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#BFA472] bg-[#FAF4EA] px-4 font-cinzel text-[10.5px] font-bold uppercase tracking-wider text-[#6B4F22] transition hover:bg-[#EFE4D3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
                  >
                    <RefreshCw
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`}
                    />
                    {coordinates ? 'Refresh GPS' : 'Use My Location'}
                  </button>
                </div>

                {locationError && (
                  <div
                    role="alert"
                    className="mt-3 flex items-start gap-2 rounded-xl border border-[#E5C9A8] bg-[#FDF6EA] px-3 py-2 text-xs leading-relaxed text-[#6E4720]"
                  >
                    <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6828]" />
                    <span>{locationError}</span>
                  </div>
                )}

                {sensorMessage && (
                  <p className="mt-2.5 text-xs leading-relaxed text-[#6D5F4E]">{sensorMessage}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* All 12 Jyotirlingas Selector Grid */}
        <section aria-labelledby="twelve-jyotirlingas-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-cinzel text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#9A783D]">
                Dwadasha Jyotirlinga
              </p>
              <h2
                id="twelve-jyotirlingas-heading"
                className="mt-0.5 font-cormorant text-3xl font-bold text-[#2A1D14]"
              >
                Choose a Sacred Shrine
              </h2>
            </div>
            <span className="text-xs text-[#7B6E5E]">12 verified coordinates</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {JYOTIRLINGA_SHRINES.map((shrine) => {
              const isSelected = shrine.id === selectedShrine.id;
              const shrineMetrics = metricsByShrineId.get(shrine.id);
              const roman = ROMAN_NUMERALS[shrine.order - 1] || String(shrine.order);

              return (
                <button
                  key={shrine.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(shrine.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B] ${
                    isSelected
                      ? 'border-[#B68B3C] bg-gradient-to-br from-[#FFFDF9] to-[#F7ECDA] shadow-[0_8px_24px_rgba(140,109,59,0.16)]'
                      : 'border-[#E6DCCB] bg-[#FFFDF9]/90 shadow-[0_3px_14px_rgba(54,39,22,0.04)] hover:border-[#C9B084] hover:bg-[#FFFDF9]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A783D]">
                        Shrine {roman}
                      </span>
                      {shrineMetrics && (
                        <span className="rounded-full border border-[#E5D7BF] bg-[#FAF4E8] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#6B4F22]">
                          {Math.round(shrineMetrics.bearingDegrees)}° {shrineMetrics.cardinal.short}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-cormorant text-2xl font-bold text-[#2A1D14]">
                      {shrine.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#6B5D4D]">
                      {shrine.city}, {shrine.state}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#EEE4D4] pt-2.5 text-xs">
                    <span className="tabular-nums text-[#7C6F5E]">
                      {shrine.latitude.toFixed(2)}°N, {shrine.longitude.toFixed(2)}°E
                    </span>
                    <span className="font-semibold tabular-nums text-[#5A4523]">
                      {shrineMetrics ? formatDistanceLabel(shrineMetrics.distanceKm) : 'Tap to select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-[#7E7264]">
          Displays verified geographical straight-line distance and true-north bearing using your device GPS and compass sensors when supported.
        </p>
      </div>
    </div>
  );
};
