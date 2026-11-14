import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit3,
  Layers,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

type CardSuit = 'Dharma' | 'Artha' | 'Kama' | 'Moksha' | 'MasterKey';
type CardTab = 'ALL' | CardSuit;

interface CardItem {
  id: string;
  position: number;
  cardId: string;
  key: string;
  title: string;
  suit: CardSuit;
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
  price?: number;
}

const SUIT_META: Record<CardSuit, { label: string; symbol: string; icon: string }> = {
  Dharma: { label: 'Dharma', symbol: '♠', icon: '♠' },
  Artha: { label: 'Artha', symbol: '♦', icon: '♦' },
  Kama: { label: 'Kama', symbol: '♥', icon: '♥' },
  Moksha: { label: 'Moksha', symbol: '♣', icon: '♣' },
  MasterKey: { label: 'Master Keys', symbol: '☆', icon: '☆' },
};

const CARD_PAGE_SIZE = 10;

/**
 * Maps suit + rank to clean card identifier shown in screenshot (e.g. DH-A, DH-2, DH-3, DH-J)
 */
const getCardIdentifier = (card: CardItem): string => {
  const suitPrefix: Record<string, string> = {
    Dharma: 'DH',
    Artha: 'AR',
    Kama: 'KM',
    Moksha: 'MK',
    MasterKey: 'MK',
  };
  const prefix = suitPrefix[card.suit] || 'CD';
  const cleanRank = (card.rank || '').toUpperCase().trim();
  return `${prefix}-${cleanRank || card.position}`;
};

/**
 * Returns formatted Card Type label and styled badge classes
 */
const getCardTypeBadge = (card: CardItem) => {
  const r = (card.rank || '').toUpperCase().trim();
  if (r === 'A' || /ace/i.test(r)) {
    return {
      label: 'Ace / Portal',
      classes: 'bg-[#FEF3E6] text-[#B25E1A] border-[#FADCC0]',
    };
  }
  if (['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(r) || /^\d+$/.test(r)) {
    return {
      label: 'Pip (2–10)',
      classes: 'bg-[#F2EDF8] text-[#6E4E98] border-[#E0D4EC]',
    };
  }
  if (r === 'J' || /jack/i.test(r)) {
    return {
      label: 'Jack (J)',
      classes: 'bg-[#FDF0F5] text-[#A63F72] border-[#F6D2E2]',
    };
  }
  if (r === 'Q' || /queen/i.test(r)) {
    return {
      label: 'Queen (Q)',
      classes: 'bg-[#EEF5FC] text-[#29689C] border-[#CCE2F7]',
    };
  }
  if (r === 'K' || /king/i.test(r)) {
    return {
      label: 'King (K)',
      classes: 'bg-[#FEF7E6] text-[#A66E16] border-[#F9E5B8]',
    };
  }
  if (card.suit === 'MasterKey' || /master/i.test(card.category || '')) {
    return {
      label: 'Master Key',
      classes: 'bg-[#FFF9E6] text-[#9A640F] border-[#F6DC98]',
    };
  }
  return {
    label: card.label || r || 'Standard',
    classes: 'bg-[#F4ECE2] text-[#634833] border-[#E6D8C7]',
  };
};

/**
 * Canonical mystic SVG thumbnail representing the card suit archetype
 * Dharma uses the canonical spade archetype thumbnail across all Dharma cards.
 */
const CardArtThumbnail: React.FC<{ card: CardItem }> = ({ card }) => {
  const suitGradients: Record<string, string> = {
    Dharma: 'from-[#825621] via-[#563410] to-[#2B1705]',
    Artha: 'from-[#825920] via-[#583710] to-[#2B1804]',
    Kama: 'from-[#8A3B22] via-[#5B2211] to-[#2E0F07]',
    Moksha: 'from-[#765424] via-[#4E3411] to-[#261706]',
    MasterKey: 'from-[#8C6228] via-[#5D3F15] to-[#2E1D08]',
  };
  const suit = card.suit || 'Dharma';
  const grad = suitGradients[suit] || suitGradients.Dharma;
  const symbol = SUIT_META[suit]?.symbol || '♠';

  return (
    <div className={`w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b ${grad} relative`}>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <circle cx="24" cy="24" r="14" stroke="#FDE8A8" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.5" />
        <circle cx="24" cy="24" r="9" fill="#FCE59F" fillOpacity="0.2" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold text-[#FFF2C6] drop-shadow-sm select-none">
        {symbol}
      </span>
    </div>
  );
};

export const AdminCardsPage: React.FC = () => {
  const [catalog, setCatalog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CardTab>('ALL');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardItem | null>(null);
  const [accessModalCard, setAccessModalCard] = useState<CardItem | null>(null);
  const [targetAccessState, setTargetAccessState] = useState<boolean | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      setCatalog(await adminService.getCardsCatalog());
    } catch (error) {
      console.error('Failed to load card catalog:', error);
      showToast('Card catalog could not be loaded. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const allCards = useMemo<CardItem[]>(() => {
    if (!catalog?.suits) return [];
    return (Object.keys(SUIT_META) as CardSuit[]).flatMap((suit) => catalog.suits[suit] || []);
  }, [catalog]);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allCards.filter((card) => {
      const matchesSuit = activeTab === 'ALL' || card.suit === activeTab;
      const matchesAccess =
        accessFilter === 'all' || (accessFilter === 'free' ? card.isFreeByDefault : !card.isFreeByDefault);
      const matchesSearch =
        !query ||
        [card.title, card.key, card.cardId, card.rank, card.label, card.shortSummary].some((value) =>
          String(value || '').toLowerCase().includes(query)
        );
      return matchesSuit && matchesAccess && matchesSearch;
    });
  }, [activeTab, accessFilter, allCards, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / CARD_PAGE_SIZE));
  const displayedCards = filteredCards.slice((page - 1) * CARD_PAGE_SIZE, page * CARD_PAGE_SIZE);
  const firstCardNumber = filteredCards.length ? (page - 1) * CARD_PAGE_SIZE + 1 : 0;
  const lastCardNumber = filteredCards.length ? Math.min(page * CARD_PAGE_SIZE, filteredCards.length) : 0;

  const resetToFirstPage = () => setPage(1);

  const openEditModal = (card: CardItem) => {
    setSelectedCard(null);
    setEditingCard(card);
    setActionError(null);
    setEditForm({
      title: card.title || '',
      rank: card.rank || '',
      label: card.label || '',
      suitTheme: card.suitTheme || '',
      line: card.line || '',
      shortSummary: card.shortSummary || '',
      detailedInterpretation: card.detailedInterpretation || '',
      reflectionQuestion: card.reflectionQuestion || '',
      isFreeByDefault: Boolean(card.isFreeByDefault),
      position: card.position || 1,
    });
  };

  const openAccessModal = (card: CardItem, targetState: boolean) => {
    setSelectedCard(null);
    setAccessModalCard(card);
    setTargetAccessState(targetState);
    setActionError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCard) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.updateCard(editingCard.id, editForm);
      showToast(`${editForm.title} was updated successfully.`);
      setEditingCard(null);
      await fetchCatalog();
    } catch (error: any) {
      setActionError(error.response?.data?.message || error.message || 'Failed to update card definition.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAccessConfirm = async () => {
    if (!accessModalCard || targetAccessState === null) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.toggleCardAccess(accessModalCard.id, targetAccessState);
      showToast(`${accessModalCard.title} is now ${targetAccessState ? 'free' : 'paid'}.`);
      setAccessModalCard(null);
      setTargetAccessState(null);
      await fetchCatalog();
    } catch (error: any) {
      setActionError(error.response?.data?.message || error.message || 'Failed to update the access setting.');
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
      showToast(`${deletingCard.title} was removed from the catalog.`);
      setDeletingCard(null);
      await fetchCatalog();
    } catch (error: any) {
      setActionError(error.response?.data?.message || error.message || 'Failed to delete card.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 top-6 z-[70] flex max-w-sm items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* 1. Metric Stat Cards Strip Matching Reference Image */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Cards */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Layers className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Total Cards</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.totalCards || 55}
            </div>
          </div>
        </div>

        {/* Dharma ♠ */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B] font-serif text-xl font-bold">
            ♠
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Dharma ♠</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.suitCounts?.Dharma || 13}
            </div>
          </div>
        </div>

        {/* Artha ♦ */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B] font-serif text-xl font-bold">
            ♦
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Artha ♦</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.suitCounts?.Artha || 13}
            </div>
          </div>
        </div>

        {/* Kama ♥ */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#C2291E] font-serif text-xl font-bold">
            ♥
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Kama ♥</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.suitCounts?.Kama || 13}
            </div>
          </div>
        </div>

        {/* Moksha ♣ */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B] font-serif text-xl font-bold">
            ♣
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Moksha ♣</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.suitCounts?.Moksha || 13}
            </div>
          </div>
        </div>

        {/* Master Keys */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Star className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Master Keys</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {catalog?.suitCounts?.MasterKey || 3}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Tabs (Suit Navigation Pills) */}
      <section className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setActiveTab('ALL');
            resetToFirstPage();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
              : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Cards ({catalog?.totalCards || 55})</span>
        </button>

        {(Object.keys(SUIT_META) as CardSuit[]).map((suit) => {
          const meta = SUIT_META[suit];
          const count = catalog?.suitCounts?.[suit] ?? (suit === 'MasterKey' ? 3 : 13);
          const isActive = activeTab === suit;
          const isKama = suit === 'Kama';

          return (
            <button
              key={suit}
              onClick={() => {
                setActiveTab(suit);
                resetToFirstPage();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
                  : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
              }`}
            >
              <span className={`text-base leading-none ${isKama ? 'text-[#C2291E]' : ''}`}>
                {meta.symbol}
              </span>
              <span>
                {meta.label} ({count})
              </span>
            </button>
          );
        })}
      </section>

      {/* 3. Search and Action Controls Bar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search card by name or identifier..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder:text-[#8C7A68] focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Access Filter Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={accessFilter}
              onChange={(e) => {
                setAccessFilter(e.target.value as any);
                resetToFirstPage();
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Access: All</option>
              <option value="free">Access: Free</option>
              <option value="paid">Access: Paid</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                resetToFirstPage();
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="active">Status: Active</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
          </div>
        </div>

        {/* Add Card Button */}
        <button
          onClick={() =>
            showToast('New card creation is not available in the current catalog API. You can edit any existing card.')
          }
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-[#FFFDF9] font-serif font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Card</span>
        </button>
      </section>

      {/* 4. Table Matching the Exact UI Screenshot */}
      <section className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(44,32,22,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EADCCE] bg-[#FAF6F0]/80">
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider w-12 text-center">
                  #
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Card
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Identifier
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Suit
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Card Type
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Access
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Price (₹)
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5D8]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-[#735e49]">
                    <span className="mx-auto mb-3 block h-8 w-8 rounded-full border-2 border-[#8C6D3B] border-t-transparent animate-spin" />
                    <span className="font-serif text-sm">Loading 55-card catalog…</span>
                  </td>
                </tr>
              ) : displayedCards.length ? (
                displayedCards.map((card, index) => {
                  const meta = SUIT_META[card.suit] || SUIT_META.Dharma;
                  const typeBadge = getCardTypeBadge(card);
                  const identifier = getCardIdentifier(card);
                  const isKama = card.suit === 'Kama';

                  return (
                    <tr
                      key={card.id || card.cardId}
                      className="hover:bg-[#FAF6F0]/60 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-sm font-semibold text-[#5A4838] text-center">
                        {firstCardNumber + index}
                      </td>

                      {/* Card Thumbnail + Titles */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedCard(card)}
                          className="flex items-center gap-3.5 text-left group-hover:opacity-95 transition-opacity"
                        >
                          <CardArtThumbnail card={card} />
                          <div className="space-y-0.5">
                            <strong className="block font-serif text-[15px] font-bold text-[#2C2016] group-hover:text-[#8C6D3B] transition-colors leading-tight">
                              {card.title}
                            </strong>
                            <span className="block text-xs text-[#7A6A58] max-w-[220px] truncate">
                              {card.line || card.shortSummary}
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* Identifier Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5ECE0] border border-[#E3D4C2] text-[#4A3828] text-xs font-mono font-bold tracking-wide">
                          {identifier}
                        </span>
                      </td>

                      {/* Suit */}
                      <td className="py-3.5 px-4">
                        <span className="font-serif text-sm font-bold text-[#2C2016] flex items-center gap-1">
                          <span>{meta.label}</span>
                          <span className={isKama ? 'text-[#C2291E]' : ''}>{meta.symbol}</span>
                        </span>
                      </td>

                      {/* Card Type Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeBadge.classes}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Access Setting */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openAccessModal(card, !card.isFreeByDefault)}
                          title="Click to toggle Free / Paid access"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            card.isFreeByDefault
                              ? 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]'
                              : 'bg-[#FEF6E6] text-[#B77A1F] border-[#FCE1B6]'
                          }`}
                        >
                          {card.isFreeByDefault ? (
                            <>
                              <Crown className="w-3.5 h-3.5 text-[#1D7E33]" />
                              <span>Free</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-[#B77A1F]" />
                              <span>Paid</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Price (₹) */}
                      <td className="py-3.5 px-4 text-center font-semibold text-sm text-[#2C2016]">
                        {card.isFreeByDefault ? '—' : card.price || 299}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EAF7EE] text-[#1D7E33] border border-[#C6EED0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1D7E33]" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(card)}
                            className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                            title="Edit Card"
                            aria-label={`Edit ${card.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCard(card)}
                            className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                            title="Card Options & Details"
                            aria-label={`Options for ${card.title}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center italic text-[#806A57]">
                    No cards match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar Matching Reference Image */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#EADCCE] bg-[#FAF6F0]/40">
          <p className="font-serif text-sm text-[#665444]">
            Showing {firstCardNumber} – {lastCardNumber} of {filteredCards.length} cards
          </p>

          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Show first, last, and window around current
              if (
                p === 1 ||
                p === totalPages ||
                (p >= page - 1 && p <= page + 1)
              ) {
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#382618] text-[#FFFDF9] shadow-xs'
                        : 'text-[#524032] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === page - 2 || p === page + 2) {
                return (
                  <span key={p} className="px-1 text-xs text-[#8C7A68]">
                    …
                  </span>
                );
              }
              return null;
            })}

            {/* Next Button */}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal: Card Details Preview */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 shadow-2xl space-y-4">
            <header className="flex items-start justify-between gap-4 border-b border-[#B9884A]/20 pb-4">
              <div className="flex items-center gap-3">
                <CardArtThumbnail card={selectedCard} />
                <div>
                  <span className="font-serif text-xs font-semibold text-[#8C6D3B] uppercase tracking-wider">
                    {selectedCard.suitSymbol} {selectedCard.suit} · Position #{selectedCard.position}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#2C2016] mt-0.5">
                    {selectedCard.title}
                  </h2>
                  <p className="text-xs text-[#7A6A58]">{selectedCard.key}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="space-y-3.5 text-sm text-[#4D3524] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/60">
                <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">
                  Suit Theme
                </span>
                <span className="text-sm font-medium">{selectedCard.suitTheme || 'Vedic Archetype'}</span>
              </div>

              {selectedCard.line && (
                <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#EBDCCB] font-serif text-base italic text-[#2C2016]">
                  “{selectedCard.line}”
                </div>
              )}

              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">
                  Short Summary
                </span>
                <p className="mt-1 text-sm">{selectedCard.shortSummary}</p>
              </div>

              {selectedCard.detailedInterpretation && (
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">
                    Detailed Interpretation
                  </span>
                  <p className="mt-1 text-sm">{selectedCard.detailedInterpretation}</p>
                </div>
              )}

              {selectedCard.reflectionQuestion && (
                <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/60">
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">
                    Reflection Question
                  </span>
                  <span className="text-sm font-medium">{selectedCard.reflectionQuestion}</span>
                </div>
              )}
            </div>

            <footer className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#B9884A]/20 pt-4">
              <button
                onClick={() => openAccessModal(selectedCard, !selectedCard.isFreeByDefault)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] hover:bg-[#F3EBE0] text-sm font-bold text-[#5A3810] transition-colors"
              >
                {selectedCard.isFreeByDefault ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{selectedCard.isFreeByDefault ? 'Make Paid' : 'Make Free'}</span>
              </button>
              <button
                onClick={() => openEditModal(selectedCard)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-colors shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Card</span>
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Modal: Edit Card */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7 shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#B9884A]/20 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2016]">Edit Card</h2>
                <p className="text-xs text-[#7A6A58] mt-0.5">
                  {editingCard.suit} · {editingCard.key} · Position #{editingCard.position}
                </p>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {actionError && (
              <div className="mt-4 flex gap-2 rounded-xl border border-[#dd9c91] bg-[#fce9e5] p-3 text-sm text-[#8d2d25]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Card Title
                  <input
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Label
                  <input
                    required
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Rank
                  <input
                    required
                    value={editForm.rank}
                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Position
                  <input
                    required
                    min="1"
                    max="55"
                    type="number"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: Number(e.target.value) || 1 })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-xl border border-[#E5D7C6] bg-[#FAF5EE] px-3.5 py-2.5 text-xs font-bold text-[#2C2016]">
                  <input
                    type="checkbox"
                    checked={editForm.isFreeByDefault}
                    onChange={(e) => setEditForm({ ...editForm, isFreeByDefault: e.target.checked })}
                    className="accent-[#8C6D3B] w-4 h-4"
                  />
                  <span>Free by default</span>
                </label>
              </div>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Suit Theme
                <input
                  value={editForm.suitTheme}
                  onChange={(e) => setEditForm({ ...editForm, suitTheme: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Card Line (Archetypal Quote)
                <input
                  value={editForm.line}
                  onChange={(e) => setEditForm({ ...editForm, line: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Short Summary
                <textarea
                  required
                  rows={2}
                  value={editForm.shortSummary}
                  onChange={(e) => setEditForm({ ...editForm, shortSummary: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B] resize-y"
                />
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Detailed Interpretation
                <textarea
                  rows={4}
                  value={editForm.detailedInterpretation}
                  onChange={(e) => setEditForm({ ...editForm, detailedInterpretation: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B] resize-y"
                />
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Reflection Question
                <input
                  value={editForm.reflectionQuestion}
                  onChange={(e) => setEditForm({ ...editForm, reflectionQuestion: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <footer className="flex justify-end gap-3 border-t border-[#B9884A]/20 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Modal: Toggle Free / Paid Access */}
      {accessModalCard && targetAccessState !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2a170b]/50 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <header className="flex items-start justify-between gap-3 border-b border-[#B9884A]/20 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2016]">Change Card Access</h2>
                <p className="text-xs text-[#7A6A58] mt-0.5">
                  {accessModalCard.title} · {accessModalCard.key}
                </p>
              </div>
              <button
                onClick={() => {
                  setAccessModalCard(null);
                  setTargetAccessState(null);
                }}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {actionError && (
              <div className="flex gap-2 rounded-xl border border-[#dd9c91] bg-[#fce9e5] p-3 text-sm text-[#8d2d25]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-[#B9884A]/20 bg-[#FAF5EE] p-4 text-center">
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">Current</span>
                <b className="font-serif text-lg text-[#2C2016]">
                  {accessModalCard.isFreeByDefault ? 'Free' : 'Paid'}
                </b>
              </div>
              <span className="text-xl text-[#8C6D3B]">→</span>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-[#8C6D3B]">New Access</span>
                <b className="font-serif text-lg text-[#2C2016]">
                  {targetAccessState ? 'Free' : 'Paid'}
                </b>
              </div>
            </div>

            <p className="text-sm text-[#5E4634] leading-relaxed">
              {targetAccessState
                ? 'All seekers will be able to unlock and view this card without requiring payment or passes.'
                : 'Seekers will need to purchase this individual card or unlock the full 55-card deck pass.'}
            </p>

            <div className="flex justify-end gap-3 border-t border-[#B9884A]/20 pt-4">
              <button
                onClick={() => {
                  setAccessModalCard(null);
                  setTargetAccessState(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleAccessConfirm}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Confirm Change</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
