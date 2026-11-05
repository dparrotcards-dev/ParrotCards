import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICard, IBirthProfile, IPersonalizedDeck, IEntitlementStatus, CardSuit } from '../types';
import { deckService } from '../services/deckService';
import { paymentService } from '../services/paymentService';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface DeckContextType {
  profile: IBirthProfile | null;
  deck: IPersonalizedDeck | null;
  cards: ICard[];
  selectedSuit: CardSuit;
  selectedCardIndex: number;
  selectedCard: ICard | null;
  entitlements: IEntitlementStatus | null;
  revealedCardKeys: Set<string>;
  loading: boolean;
  setProfileAndDeck: (profile: IBirthProfile, deck: IPersonalizedDeck, cards: ICard[], entitlements: IEntitlementStatus) => void;
  setSelectedSuit: (suit: CardSuit) => void;
  setSelectedCardIndex: (index: number) => void;
  markRevealed: (key: string) => void;
  refreshDeck: () => Promise<void>;
  cardsOfSuit: (suit: CardSuit) => ICard[];
  clearSession: () => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<IBirthProfile | null>(() => {
    const saved = localStorage.getItem('pc_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [deck, setDeck] = useState<IPersonalizedDeck | null>(() => {
    const saved = localStorage.getItem('pc_deck');
    return saved ? JSON.parse(saved) : null;
  });

  const [cards, setCards] = useState<ICard[]>(() => {
    const saved = localStorage.getItem('pc_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [entitlements, setEntitlements] = useState<IEntitlementStatus | null>(() => {
    const saved = localStorage.getItem('pc_entitlements');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedSuit, setSelectedSuitState] = useState<CardSuit>('Dharma');
  const [selectedCardIndex, setSelectedCardIndexState] = useState<number>(0);
  const [revealedCardKeys, setRevealedCardKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const cardsOfSuit = (suit: CardSuit): ICard[] => {
    return cards.filter((c) => c.suit === suit);
  };

  const currentSuitCards = cardsOfSuit(selectedSuit);
  const selectedCard = currentSuitCards[selectedCardIndex] || currentSuitCards[0] || null;

  const setSelectedSuit = (suit: CardSuit) => {
    setSelectedSuitState(suit);
    setSelectedCardIndexState(0);
  };

  const setSelectedCardIndex = (index: number) => {
    setSelectedCardIndexState(index);
    const card = cardsOfSuit(selectedSuit)[index];
    if (card) {
      markRevealed(card.key);
    }
  };

  const markRevealed = (key: string) => {
    setRevealedCardKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const setProfileAndDeck = (
    newProfile: IBirthProfile,
    newDeck: IPersonalizedDeck,
    newCards: ICard[],
    newEntitlements: IEntitlementStatus
  ) => {
    setProfile(newProfile);
    setDeck(newDeck);
    setCards(newCards);
    setEntitlements(newEntitlements);
    setSelectedSuitState('Dharma');
    setSelectedCardIndexState(0);

    localStorage.setItem('pc_profile', JSON.stringify(newProfile));
    localStorage.setItem('pc_deck', JSON.stringify(newDeck));
    localStorage.setItem('pc_cards', JSON.stringify(newCards));
    localStorage.setItem('pc_entitlements', JSON.stringify(newEntitlements));

    if (newCards.length > 0) {
      markRevealed(newCards[0].key);
    }
  };

  const refreshDeck = async () => {
    if (!deck) return;
    setLoading(true);
    try {
      const data = await deckService.getDeckCards(deck._id);
      setCards(data.cards);
      setEntitlements(data.entitlements);
      localStorage.setItem('pc_cards', JSON.stringify(data.cards));
      localStorage.setItem('pc_entitlements', JSON.stringify(data.entitlements));
    } catch (err) {
      console.error('Failed to refresh deck:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync latest enriched cards and entitlements from server on mount and window focus
  useEffect(() => {
    if (!deck?._id) return;

    const syncDeck = () => {
      deckService
        .getDeckCards(deck._id)
        .then((data) => {
          if (data?.cards && data.cards.length > 0) {
            setCards(data.cards);
            setEntitlements(data.entitlements);
            localStorage.setItem('pc_cards', JSON.stringify(data.cards));
            localStorage.setItem('pc_entitlements', JSON.stringify(data.entitlements));
          }
        })
        .catch((err) => {
          console.warn('Silent deck re-sync bypassed:', err.message);
        });
    };

    syncDeck();

    const handleFocus = () => syncDeck();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncDeck();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [deck?._id]);

  const clearSession = () => {
    setProfile(null);
    setDeck(null);
    setCards([]);
    setEntitlements(null);
    localStorage.removeItem('pc_profile');
    localStorage.removeItem('pc_deck');
    localStorage.removeItem('pc_cards');
    localStorage.removeItem('pc_entitlements');
  };

  // Synchronize entitlements and active deck whenever auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setEntitlements((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isDeckPassActive: false,
          deckPassExpiresAt: null,
          unlockedCardKeys: [],
        };
      });
      // Lock cards that are not marked free
      setCards((prev) => prev.map((c) => (c.isFree ? c : { ...c, isUnlocked: false })));
      return;
    }

    // Seeker is authenticated! Fetch latest account data (profiles, decks, active pass)
    api
      .get('/account')
      .then((res) => {
        const { entitlements: latestEntitlements, activeDeckData } = res.data?.data || {};
        if (latestEntitlements) {
          setEntitlements(latestEntitlements);
          localStorage.setItem('pc_entitlements', JSON.stringify(latestEntitlements));
        }
        if (activeDeckData?.deck && activeDeckData?.profile) {
          setDeck(activeDeckData.deck);
          setProfile(activeDeckData.profile);
          setCards(activeDeckData.cards || []);
          localStorage.setItem('pc_deck', JSON.stringify(activeDeckData.deck));
          localStorage.setItem('pc_profile', JSON.stringify(activeDeckData.profile));
          localStorage.setItem('pc_cards', JSON.stringify(activeDeckData.cards || []));
        }
      })
      .catch((err) => {
        console.warn('Failed to load user account context on login:', err?.message);
      });
  }, [isAuthenticated]);

  // Listen for global logout event
  useEffect(() => {
    const handleLogout = () => {
      clearSession();
    };
    window.addEventListener('pc_auth_logout', handleLogout);
    return () => window.removeEventListener('pc_auth_logout', handleLogout);
  }, []);

  // Auto mark the first card as revealed if not yet
  useEffect(() => {
    if (selectedCard) {
      markRevealed(selectedCard.key);
    }
  }, [selectedCard]);

  return (
    <DeckContext.Provider
      value={{
        profile,
        deck,
        cards,
        selectedSuit,
        selectedCardIndex,
        selectedCard,
        entitlements,
        revealedCardKeys,
        loading,
        setProfileAndDeck,
        setSelectedSuit,
        setSelectedCardIndex,
        markRevealed,
        refreshDeck,
        cardsOfSuit,
        clearSession,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};
