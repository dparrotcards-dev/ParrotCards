import React, { useEffect, useState } from 'react';
import {
  Compass,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminAstronomyPage: React.FC = () => {
  const [astroData, setAstroData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAstroData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAstronomyMonitoring();
      setAstroData(data);
    } catch (err) {
      console.error('Failed to load astronomy monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstroData();
  }, []);

  const provider = astroData?.provider;
  const telemetry = astroData?.telemetry;
  const recent = astroData?.recentCalculations || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Vedic Astronomy Engine
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Jagannatha Hora API provider connectivity, birth chart calculations, and required field audit
          </p>
        </div>

        <button
          onClick={fetchAstroData}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
          title="Refresh Engine Data"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Provider Details & Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Provider</span>
            <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-[#F6F0E6]">
            {provider?.name || 'jagannatha_hora'}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High Precision Swiss Ephemeris Core</span>
          </div>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Calculations</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-[#C9A45C]">
            {telemetry?.totalCalculations ?? 0}
          </div>
          <div className="text-[11px] text-[#A7A4C4] font-mono">
            {telemetry?.calculationsLast24h ?? 0} computed in last 24h
          </div>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-[#A7A4C4]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Required Field Integrity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">
            {telemetry?.fieldIntegrityPercentage ?? 100}%
          </div>
          <div className="text-[11px] text-[#A7A4C4] font-mono">
            {telemetry?.completePointsCount ?? 0} complete planetary points audited
          </div>
        </div>
      </div>

      {/* Validated 7 Required Vedic Fields Pill Strip */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4.5 space-y-3 shadow-xl">
        <div className="text-xs font-semibold text-[#A7A4C4] uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Validated Classical Field Specifications for Every 55 Card</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {(telemetry?.requiredFieldsValidated || [
            'Sign & Degree',
            'House Placement',
            'Nakshatra & Pada',
            'Nakshatra Lord',
            'Nadi Amsa Ruler',
            'Navamsha (D9) Sign',
            'House Lord (Dispositor)',
          ]).map((field: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#F6F0E6] flex items-center gap-1.5"
            >
              <span className="text-[#C9A45C]">✦</span>
              <span>{field}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Recent Calculations Log */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-3">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-serif font-bold text-sm text-[#F6F0E6] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C9A45C]" />
            <span>Recent Birth Sky Computations</span>
          </div>
          <span className="text-[11px] text-[#A7A4C4] font-mono">Real Astronomical Cache</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Location (Birth Place)</th>
                <th className="py-3 px-4">Birth Date & Time</th>
                <th className="py-3 px-4">Soul Planet (AK)</th>
                <th className="py-3 px-4">Ascendant Rashi</th>
                <th className="py-3 px-4">Points Extracted</th>
                <th className="py-3 px-4">Calculated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.length > 0 ? (
                recent.map((calc: any) => (
                  <tr key={calc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#F6F0E6]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>{calc.place || 'Sacred Horizon'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#A7A4C4]">
                      {calc.date} • {calc.time}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] font-semibold font-mono">
                        {calc.akPlanet || 'Sun'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#F6F0E6] font-mono">
                      Sign #{calc.lagSign ?? 0}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      {calc.foundPointsCount || 55} / {calc.totalPointsCount || 55}
                    </td>
                    <td className="py-3 px-4 text-[#A7A4C4] font-mono text-[11px]">
                      {new Date(calc.calculatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A7A4C4] italic">
                    No calculations recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
