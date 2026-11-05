import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  RefreshCw,
  Sparkles,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminDecksPage: React.FC = () => {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [aiFilter, setAiFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [deckDetails, setDeckDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDecks({
        page,
        limit: 10,
        search,
        aiFilter,
      });
      setDecks(data.decks);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.total || 0);
    } catch (err: any) {
      console.error('Failed to load decks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [page, aiFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDecks();
  };

  const handleInspectDeck = async (id: string) => {
    setSelectedDeckId(id);
    setLoadingDetails(true);
    try {
      const details = await adminService.getDeckDetails(id);
      setDeckDetails(details);
    } catch (err) {
      console.error('Failed to fetch deck details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Personalized Decks Console
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Monitor 55-card personal decks, Atma Karaka soul alignments, and sovereign avatars
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A7A4C4] font-mono">
            Total Decks: <strong className="text-[#C9A45C]">{totalCount}</strong>
          </span>
          <button
            onClick={fetchDecks}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
            title="Refresh Decks"
          >
            <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A7A4C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by seeker name or sovereign card (e.g. Jupiter, Sun)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C]/50 text-xs text-[#F6F0E6] outline-none placeholder:text-[#A7A4C4]/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={aiFilter}
            onChange={(e) => {
              setAiFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F6F0E6] outline-none"
          >
            <option value="all" className="bg-[#111033]">All Generation Modes</option>
            <option value="ai" className="bg-[#111033]">Gemini AI Avatars</option>
            <option value="deterministic" className="bg-[#111033]">Deterministic Vedic</option>
          </select>

          <button
            onClick={handleSearchSubmit}
            className="py-2 px-4 rounded-xl bg-[#C9A45C] hover:brightness-110 text-[#08071B] font-bold text-xs transition-all flex-shrink-0"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Decks Table */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Seeker</th>
                <th className="py-3.5 px-4">Soul Planet (AK)</th>
                <th className="py-3.5 px-4">Sovereign Avatar Moniker</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Total Cards</th>
                <th className="py-3.5 px-4">Drawn At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A7A4C4]">
                    <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading personalized sky records...</span>
                  </td>
                </tr>
              ) : decks.length > 0 ? (
                decks.map((deck) => (
                  <tr key={deck.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F6F0E6]">
                      <div>{deck.seekerName}</div>
                      {deck.userEmail && (
                        <div className="text-[10px] text-[#A7A4C4] font-mono">{deck.userEmail}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] font-semibold font-mono">
                        {deck.sovereignCardKey}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A7A4C4] italic max-w-xs truncate" title={deck.avatarPhrase}>
                      "{deck.avatarPhrase}"
                    </td>
                    <td className="py-3.5 px-4">
                      {deck.isAvatarAiGenerated ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                          ✦ Gemini AI
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#A7A4C4] font-semibold text-[10px]">
                          Deterministic Vedic
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#F6F0E6]">{deck.totalCards} cards</td>
                    <td className="py-3.5 px-4 text-[#A7A4C4] font-mono text-[11px]">
                      {new Date(deck.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleInspectDeck(deck.id)}
                        className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[#C9A45C] hover:text-amber-300 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A7A4C4] italic">
                    No personalized decks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A7A4C4]">
          <div>
            Showing Page <strong className="text-[#F6F0E6]">{page}</strong> of <strong className="text-[#F6F0E6]">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[#F6F0E6] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[#F6F0E6] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Deck Modal */}
      {selectedDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-[#111033] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">
                    {deckDetails?.deck?.seekerName}'s Personalized 55-Card Deck
                  </h3>
                  <p className="text-xs text-[#C9A45C] italic">"{deckDetails?.deck?.avatarPhrase}"</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDeckId(null);
                  setDeckDetails(null);
                }}
                className="p-2 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-xs text-[#A7A4C4]">
                <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Auditing 55 card astronomical coordinates...</span>
              </div>
            ) : deckDetails ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#A7A4C4] p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                  <span>Soul Planet: <strong className="text-[#C9A45C]">{deckDetails.deck.sovereignCardKey}</strong></span>
                  <span>Total Deck Count: <strong className="text-[#F6F0E6]">{deckDetails.cards.length} Cards</strong></span>
                  <span>Mode: <strong className="text-emerald-400">{deckDetails.deck.isAvatarAiGenerated ? 'Gemini AI' : 'Deterministic Vedic'}</strong></span>
                </div>

                {/* 55 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
                  {deckDetails.cards.map((card: any) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        card.isSovereign
                          ? 'bg-[#C9A45C]/15 border-[#C9A45C]/40 shadow-sm'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F6F0E6] flex items-center gap-1 truncate">
                          <span>{card.suitSymbol}</span>
                          <span className="truncate">{card.title}</span>
                        </span>
                        <span className="font-mono text-[10px] text-[#A7A4C4]">#{card.position}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#A7A4C4] font-mono">
                        <span>{card.placement.signName || 'Cosmic'}</span>
                        <span>House {card.placement.house || '1'}</span>
                        <span>{card.placement.deg != null ? `${card.placement.deg.toFixed(1)}°` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-[#A7A4C4] truncate">Nak: {card.placement.nak || '—'}</span>
                        {card.isFree && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
