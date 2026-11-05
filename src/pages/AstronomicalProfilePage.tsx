import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, ArrowLeft, Download } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { deckService } from '../services/deckService';

export const AstronomicalProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, deck } = useDeck();
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }

    deckService
      .getAstronomicalCalculation(profile._id)
      .then((calc) => setCalculation(calc))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [profile, navigate]);

  if (!profile) return null;

  const points = calculation?.parsedPoints || {};

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1817]/10">
        <div>
          <button
            onClick={() => navigate('/deck')}
            className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] mb-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to 55-Card Deck</span>
          </button>
          <h1 className="font-serif text-3xl font-bold text-[#1A1817]">Natal Sky Alignment</h1>
          <p className="text-xs text-[#1A1817]/70 mt-1">
            Astronomical positions for <strong className="text-[#1A1817] font-semibold">{profile.name}</strong> ·{' '}
            {profile.dateOfBirth} at {profile.timeOfBirth} ({profile.place})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2ECE1] border border-[#8C6D3B]/30 text-[#8C6D3B] text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#8C6D3B]" />
            <span>Provider: {calculation?.provider || 'Jagannatha Hora'}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif text-[#8C6D3B]">Loading verified sky calculations…</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lagna & Atma Karaka Hero Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/30 shadow-md space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8C6D3B]">
                1st House · Rising
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1817]">Lagna (Eastern Horizon)</h3>
              <p className="text-xs text-[#1A1817]/70 leading-relaxed">
                Sign: <strong className="text-[#1A1817] font-semibold">{points['Lagna']?.signName || '—'}</strong> · Degree:{' '}
                <strong className="text-[#1A1817] font-mono">{points['Lagna']?.deg?.toFixed(2) || '0.00'}°</strong> · Nakshatra:{' '}
                <strong className="text-[#1A1817] font-semibold">{points['Lagna']?.nak || '—'}</strong>
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/30 shadow-md space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8C6D3B]">
                Soul Significator (AK)
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1817]">
                {calculation?.akPlanet || 'Sun'} (Atma Karaka)
              </h3>
              <p className="text-xs text-[#1A1817]/70 leading-relaxed">
                Crowned planet of highest degree. Governs the seeker's sovereign destiny and primary soul lessons.
              </p>
            </div>
          </div>

          {/* Complete 55-Point Astronomical Grid */}
          <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1817]/10">
              <h2 className="font-serif text-xl font-bold text-[#1A1817]">
                Natal Points & Planetary Coordinates
              </h2>
              <span className="text-xs font-mono text-[#8C6D3B] font-semibold">
                {Object.keys(points).length} calculated points
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1A1817]/10 bg-[#F2ECE1]/70 text-[#1A1817]/70 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl">Point / Body</th>
                    <th className="py-3 px-3">Sign</th>
                    <th className="py-3 px-3">House</th>
                    <th className="py-3 px-3">Degree</th>
                    <th className="py-3 px-3">Nakshatra (Pada)</th>
                    <th className="py-3 px-3">Lord</th>
                    <th className="py-3 px-3 rounded-r-xl">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1817]/5">
                  {Object.entries(points).map(([k, val]: [string, any], idx) => (
                    <tr key={idx} className="hover:bg-[#F2ECE1]/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1A1817] flex items-center gap-1.5">
                        {val.isSovereign && <span className="text-[#8C6D3B]">♛</span>}
                        <span>{k}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#1A1817]/80">{val.signName || '—'}</td>
                      <td className="py-2.5 px-3 text-[#1A1817]/80">{val.house ? `${val.house}th` : '—'}</td>
                      <td className="py-2.5 px-3 text-[#1A1817] font-mono font-medium">
                        {val.deg != null ? `${val.deg.toFixed(2)}°` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#1A1817]/80">
                        {val.nak ? `${val.nak} (${val.pada || 1})` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#1A1817]/80">{val.lord || '—'}</td>
                      <td className="py-2.5 px-3 text-[#8C6D3B] font-semibold">
                        {val.kar ? `${val.kar.code}` : val.isSovereign ? 'Sovereign' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
