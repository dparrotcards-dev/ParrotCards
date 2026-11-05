import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Compass,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  HelpCircle,
  Check,
  Lock,
  Unlock,
  Tag,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface CardItem {
  id: string;
  position: number;
  cardId: string;
  key: string;
  title: string;
  suit: string;
  suitSymbol: string;
  suitTheme: string;
  rank: string;
  label: string;
  line?: string;
  shortSummary: string;
  detailedInterpretation?: string;
  reflectionQuestion?: string;
  isFreeByDefault: boolean;
  category: string;
}

export const AdminCardsPage: React.FC = () => {
  const [catalog, setCatalog] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'Dharma' | 'Artha' | 'Kama' | 'Moksha' | 'MasterKey'>('ALL');
  
  // Modals state
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardItem | null>(null);
  const [accessModalCard, setAccessModalCard] = useState<CardItem | null>(null);
  const [targetAccessState, setTargetAccessState] = useState<boolean | null>(null);
  
  // Action state
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    rank: '',
    label: '',
    suitTheme: '',
    line: '',
    shortSummary: '',
    detailedInterpretation: '',
    reflectionQuestion: '',
    isFreeByDefault: false,
    position: 1,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const openAccessModal = (card: CardItem, targetState: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAccessModalCard(card);
    setTargetAccessState(targetState);
    setActionError(null);
  };

  const handleToggleAccessConfirm = async () => {
    if (!accessModalCard || targetAccessState === null) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await adminService.toggleCardAccess(accessModalCard.id, targetAccessState);
      showToast(
        `Card "${accessModalCard.title}" access tier changed to ${targetAccessState ? 'FREE' : 'PAID'} successfully!`
      );

      // Instantly reflect state in local catalog state
      setCatalog((prev: any) => {
        if (!prev) return prev;
        const updateCardInList = (c: CardItem) =>
          c.id === accessModalCard.id ? { ...c, isFreeByDefault: targetAccessState } : c;
        return {
          ...prev,
          allCards: prev.allCards?.map(updateCardInList),
          suits: Object.fromEntries(
            Object.entries(prev.suits || {}).map(([suitKey, list]: [string, any]) => [
              suitKey,
              list.map(updateCardInList),
            ])
          ),
        };
      });

      if (selectedCard && selectedCard.id === accessModalCard.id) {
        setSelectedCard({ ...selectedCard, isFreeByDefault: targetAccessState });
      }

      setAccessModalCard(null);
      setTargetAccessState(null);
      await fetchCatalog();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update card access tier');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCardsCatalog();
      setCatalog(data);
    } catch (err) {
      console.error('Failed to load cards catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const suitIcons: Record<string, string> = {
    Dharma: '♠',
    Artha: '♦',
    Kama: '♥',
    Moksha: '♣',
    MasterKey: '✦',
  };

  const getFilteredCards = (): CardItem[] => {
    if (!catalog) return [];
    let list: CardItem[] = [];
    if (activeTab === 'ALL') {
      list = [
        ...(catalog.suits?.Dharma || []),
        ...(catalog.suits?.Artha || []),
        ...(catalog.suits?.Kama || []),
        ...(catalog.suits?.Moksha || []),
        ...(catalog.suits?.MasterKey || []),
      ];
    } else {
      list = catalog.suits?.[activeTab] || [];
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q) ||
        c.rank.toLowerCase().includes(q) ||
        c.shortSummary.toLowerCase().includes(q)
    );
  };

  const displayedCards = getFilteredCards();

  const openEditModal = (card: CardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCard(card);
    setEditForm({
      title: card.title || '',
      rank: card.rank || '',
      label: card.label || '',
      suitTheme: card.suitTheme || '',
      line: card.line || '',
      shortSummary: card.shortSummary || '',
      detailedInterpretation: card.detailedInterpretation || '',
      reflectionQuestion: card.reflectionQuestion || '',
      isFreeByDefault: !!card.isFreeByDefault,
      position: card.position || 1,
    });
    setActionError(null);
  };

  const openDeleteModal = (card: CardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingCard(card);
    setActionError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await adminService.updateCard(editingCard.id, editForm);
      showToast(`Card "${editForm.title}" updated successfully!`);
      setEditingCard(null);
      if (selectedCard && selectedCard.id === editingCard.id) {
        setSelectedCard({ ...selectedCard, ...editForm });
      }
      await fetchCatalog();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update card definition');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCard) return;
    setActionLoading(true);
    setActionError(null);

    try {
      await adminService.deleteCard(deletingCard.id);
      showToast(`Card "${deletingCard.title}" (#${deletingCard.position}) deleted from catalog.`);
      setDeletingCard(null);
      if (selectedCard && selectedCard.id === deletingCard.id) {
        setSelectedCard(null);
      }
      await fetchCatalog();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete card');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-medium text-xs shadow-2xl border border-emerald-400/30 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            55-Card Canonical Catalog
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Manage, edit, and audit authoritative Vedic Purushartha card definitions & Master Keys
          </p>
        </div>

        <button
          onClick={fetchCatalog}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors flex items-center gap-2 text-xs"
          title="Refresh Catalog"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Catalog</span>
        </button>
      </div>

      {/* Catalog Integrity Audit Banner */}
      {catalog && (
        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
            catalog.isCatalogValid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {catalog.isCatalogValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-semibold text-xs">
                {catalog.isCatalogValid
                  ? 'Canonical 55-Card Catalog Verified'
                  : 'Catalog Integrity Notice: Custom Deck Count'}
              </div>
              <p className="text-[11px] text-[#A7A4C4] font-mono">
                {catalog.totalCards} / 55 Cards Total • {catalog.integrityCheck?.missingPositions?.length || 0} Missing Positions • {catalog.integrityCheck?.duplicateKeys?.length || 0} Collisions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-[#C9A45C]">
              ♠ Dharma: {catalog.suitCounts?.Dharma ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-emerald-300">
              ♦ Artha: {catalog.suitCounts?.Artha ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-rose-300">
              ♥ Kama: {catalog.suitCounts?.Kama ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-blue-300">
              ♣ Moksha: {catalog.suitCounts?.Moksha ?? 0}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-amber-300">
              ✦ Master: {catalog.suitCounts?.MasterKey ?? 0}
            </span>
          </div>
        </div>
      )}

      {/* Suit Tabs & Search */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {(['ALL', 'Dharma', 'Artha', 'Kama', 'Moksha', 'MasterKey'] as const).map((suit) => (
            <button
              key={suit}
              onClick={() => setActiveTab(suit)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === suit
                  ? 'bg-[#C9A45C] text-[#08071B] font-bold shadow-md'
                  : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
              }`}
            >
              <span>{suit === 'ALL' ? '✦ All Cards' : `${suitIcons[suit]} ${suit}`}</span>
              {catalog && suit !== 'ALL' && (
                <span className="text-[10px] opacity-75 font-mono">
                  ({catalog.suitCounts?.[suit] || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A7A4C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, key, or rank..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C]/50 text-xs text-[#F6F0E6] outline-none placeholder:text-[#A7A4C4]/50"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#A7A4C4]">
            <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Auditing approved 55-card definitions...</span>
          </div>
        ) : displayedCards.length > 0 ? (
          displayedCards.map((card) => (
            <div
              key={card.id || card.key}
              onClick={() => setSelectedCard(card)}
              className="bg-[#111033] border border-white/10 hover:border-[#C9A45C]/50 rounded-2xl p-4 space-y-2.5 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group relative flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] font-mono text-xs font-bold">
                    {card.suitSymbol} {card.rank}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-[#A7A4C4]">#{card.position}</span>
                    {card.isFreeByDefault ? (
                      <button
                        type="button"
                        onClick={(e) => openAccessModal(card, false, e)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                        title="Click to toggle to ₹2 PAID"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        FREE
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => openAccessModal(card, true, e)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/40 hover:bg-[#C9A45C]/30 font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                        title="Click to toggle to FREE"
                      >
                        ₹2 PAID
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-[#F6F0E6] group-hover:text-[#C9A45C] transition-colors truncate">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-[#A7A4C4] font-mono">Key: {card.key}</p>
                </div>

                <p className="text-xs text-[#A7A4C4] line-clamp-2 leading-relaxed">
                  {card.shortSummary}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
                <span className="text-[10px] text-[#A7A4C4] uppercase font-semibold">{card.suit} Suit</span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Dynamic Free / Paid Access Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => openAccessModal(card, !card.isFreeByDefault, e)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 shadow-sm ${
                      card.isFreeByDefault
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    }`}
                    title={card.isFreeByDefault ? 'Switch to Paid (₹2)' : 'Switch to Free (₹0)'}
                  >
                    {card.isFreeByDefault ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{card.isFreeByDefault ? 'Make Paid' : 'Make Free'}</span>
                  </button>

                  <button
                    onClick={(e) => openEditModal(card, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A45C]/20 border border-white/10 hover:border-[#C9A45C]/40 text-[#A7A4C4] hover:text-[#C9A45C] transition-all"
                    title="Edit Card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => openDeleteModal(card, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-[#A7A4C4] hover:text-rose-400 transition-all"
                    title="Delete Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-[#A7A4C4] italic">
            No cards found matching the criteria.
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && !editingCard && !deletingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#111033] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xl text-[#C9A45C]">{selectedCard.suitSymbol}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">{selectedCard.title}</h3>
                  <p className="text-xs text-[#A7A4C4] font-mono">Position #{selectedCard.position} • Key: {selectedCard.key}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Suit Theme & Meaning</span>
                <p className="text-[#F6F0E6] leading-relaxed">{selectedCard.suitTheme || 'Vedic Archetype realization'}</p>
              </div>

              {selectedCard.line && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 italic text-[#C9A45C]">
                  "{selectedCard.line}"
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Short Summary</span>
                <p className="text-[#F6F0E6] leading-relaxed">{selectedCard.shortSummary}</p>
              </div>

              {selectedCard.detailedInterpretation && (
                <div className="space-y-1">
                  <span className="text-[10px] text-[#A7A4C4] uppercase font-semibold">Detailed Interpretation</span>
                  <p className="text-[#F6F0E6] leading-relaxed whitespace-pre-line">{selectedCard.detailedInterpretation}</p>
                </div>
              )}

              {selectedCard.reflectionQuestion && (
                <div className="p-3 rounded-2xl bg-[#C9A45C]/10 border border-[#C9A45C]/20 space-y-1">
                  <span className="text-[10px] text-[#C9A45C] uppercase font-semibold">Reflection Question</span>
                  <p className="text-[#F6F0E6] italic">{selectedCard.reflectionQuestion}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-[#A7A4C4] block uppercase">Suit</span>
                  <span className="text-[#C9A45C] font-bold">{selectedCard.suit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A7A4C4] block uppercase">Rank</span>
                  <span className="text-[#F6F0E6] font-bold">{selectedCard.rank}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A7A4C4] block uppercase">Access Policy</span>
                  <button
                    type="button"
                    onClick={() => openAccessModal(selectedCard, !selectedCard.isFreeByDefault)}
                    className="hover:underline text-left flex items-center gap-1 mt-0.5"
                    title="Click to toggle access policy"
                  >
                    <span className={selectedCard.isFreeByDefault ? 'text-emerald-400 font-bold' : 'text-[#C9A45C] font-bold'}>
                      {selectedCard.isFreeByDefault ? 'FREE (₹0)' : 'PAID (₹2)'} ✎
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => openAccessModal(selectedCard, !selectedCard.isFreeByDefault)}
                className={`py-2 px-3.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  selectedCard.isFreeByDefault
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {selectedCard.isFreeByDefault ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{selectedCard.isFreeByDefault ? 'Switch to Paid (₹2)' : 'Switch to Free (₹0)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => openDeleteModal(selectedCard, e)}
                  className="py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Card</span>
                </button>
                <button
                  onClick={(e) => openEditModal(selectedCard, e)}
                  className="py-2 px-4 rounded-xl bg-[#C9A45C] hover:bg-[#d6b068] text-[#08071B] font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Definition Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#111033] border border-white/20 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">Edit Card Definition</h3>
                  <p className="text-xs text-[#A7A4C4] font-mono">
                    {editingCard.suit} Suit • Key: {editingCard.key} (Position #{editForm.position})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                    Rank (e.g. K, Q, 1, 10) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.rank}
                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                    Position (1 - 55) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={55}
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={editForm.isFreeByDefault}
                      onChange={(e) => setEditForm({ ...editForm, isFreeByDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C9A45C] accent-[#C9A45C]"
                    />
                    <span className="text-xs font-semibold text-[#F6F0E6]">Free by Default</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                  Suit Theme & Vedic Archetype
                </label>
                <input
                  type="text"
                  value={editForm.suitTheme}
                  onChange={(e) => setEditForm({ ...editForm, suitTheme: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                  Card Line (Poetic / Archetypal Phrase)
                </label>
                <input
                  type="text"
                  value={editForm.line}
                  onChange={(e) => setEditForm({ ...editForm, line: e.target.value })}
                  placeholder="e.g. The sovereign horizon of Dharma..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                  Short Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editForm.shortSummary}
                  onChange={(e) => setEditForm({ ...editForm, shortSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                  Detailed Interpretation
                </label>
                <textarea
                  rows={4}
                  value={editForm.detailedInterpretation}
                  onChange={(e) => setEditForm({ ...editForm, detailedInterpretation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors resize-y leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A7A4C4] uppercase mb-1">
                  Reflection Question
                </label>
                <input
                  type="text"
                  value={editForm.reflectionQuestion}
                  onChange={(e) => setEditForm({ ...editForm, reflectionQuestion: e.target.value })}
                  placeholder="e.g. How do you honor your sovereign duty today?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C] text-[#F6F0E6] outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 px-5 rounded-xl bg-[#C9A45C] hover:bg-[#d6b068] text-[#08071B] font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#08071B]" />
                  ) : (
                    <Save className="w-4 h-4 text-[#08071B]" />
                  )}
                  <span>{actionLoading ? 'Saving Changes...' : 'Save Card Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation Modal */}
      {deletingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111033] border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">Delete Card Definition</h3>
                <p className="text-xs text-rose-300 font-mono">Irreversible Catalog Mutation</p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <p className="text-[#F6F0E6] leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-[#C9A45C]">"{deletingCard.title}"</span> (#{deletingCard.position}) from the <span className="font-bold text-[#F6F0E6]">{deletingCard.suit}</span> suit?
              </p>
              <p className="text-[#A7A4C4] text-[11px] italic">
                This will remove the definition from the canonical 55-card catalog. The action will be logged in the administrative audit trail.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCard(null)}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                )}
                <span>{actionLoading ? 'Deleting Card...' : 'Yes, Delete Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free / Paid Access Tier Toggle Confirmation Modal */}
      {accessModalCard && targetAccessState !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111033] border border-white/20 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Top Atmospheric Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
              targetAccessState ? 'bg-emerald-400' : 'bg-[#C9A45C]'
            }`} />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  targetAccessState
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-[#C9A45C]/15 border-[#C9A45C]/30 text-[#C9A45C]'
                }`}>
                  {targetAccessState ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">
                    Confirm Access Tier Change
                  </h3>
                  <p className="text-xs text-[#A7A4C4] font-mono">
                    Super Admin Purushartha Catalog Policy
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!actionLoading) {
                    setAccessModalCard(null);
                    setTargetAccessState(null);
                  }
                }}
                disabled={actionLoading}
                className="p-1.5 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 relative z-10">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs relative z-10">
              {/* Card Meta Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#C9A45C] font-mono">{accessModalCard.suitSymbol}</span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#F6F0E6]">{accessModalCard.title}</h4>
                    <p className="text-[11px] text-[#A7A4C4] font-mono">
                      #{accessModalCard.position} • {accessModalCard.suit} Suit ({accessModalCard.rank}) • Key: {accessModalCard.key}
                    </p>
                  </div>
                </div>
              </div>

              {/* State Transition Visual Banner */}
              <div className="p-4 rounded-2xl bg-[#08071B]/90 border border-white/10 flex items-center justify-around gap-4 text-center">
                <div>
                  <span className="text-[10px] text-[#A7A4C4] uppercase block mb-1">Current Tier</span>
                  {accessModalCard.isFreeByDefault ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider inline-block">
                      FREE (₹0)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/40 uppercase tracking-wider inline-block">
                      PAID (₹2)
                    </span>
                  )}
                </div>

                <div className="text-xl text-[#A7A4C4]">➔</div>

                <div>
                  <span className="text-[10px] text-[#A7A4C4] uppercase block mb-1">New Policy Tier</span>
                  {targetAccessState ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400 uppercase tracking-wider inline-block shadow-lg shadow-emerald-500/20">
                      FREE (₹0)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A45C]/25 text-[#E6C687] border border-[#C9A45C] uppercase tracking-wider inline-block shadow-lg shadow-[#C9A45C]/20">
                      PAID (₹2)
                    </span>
                  )}
                </div>
              </div>

              {/* Policy Explanation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-[#A7A4C4] leading-relaxed">
                {targetAccessState ? (
                  <p>
                    <strong className="text-emerald-300">Granting Free Access:</strong> This card will immediately be available to all registered users and guests for free. Seeker natal chart coordinates will be unmasked without requiring a ₹2 unlock or Premium Pass.
                  </p>
                ) : (
                  <p>
                    <strong className="text-[#C9A45C]">Enforcing ₹2 Paid Tier:</strong> Seekers will be required to unlock this card for ₹2 or hold an active 30-day Premium Pass. Users who previously accessed it for free but did not purchase it will now find it locked.
                  </p>
                )}
                <p className="text-[11px] text-[#A7A4C4]/80 italic pt-1 border-t border-white/5">
                  ✦ This change is securely saved to MongoDB, enforced server-side on all unlock/payment APIs, and immutably recorded in the Audit Log.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setAccessModalCard(null);
                  setTargetAccessState(null);
                }}
                disabled={actionLoading}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleAccessConfirm}
                disabled={actionLoading}
                className={`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 ${
                  targetAccessState
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-[#08071B] shadow-emerald-500/25'
                    : 'bg-[#C9A45C] hover:bg-[#d6b068] text-[#08071B] shadow-[#C9A45C]/25'
                }`}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Access Tier...</span>
                  </>
                ) : (
                  <>
                    {targetAccessState ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Confirm Change to {targetAccessState ? 'FREE' : 'PAID'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
