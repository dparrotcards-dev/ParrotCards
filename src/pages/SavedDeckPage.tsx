import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { api } from '../services/api';
import { deckService } from '../services/deckService';

export const SavedDeckPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setProfileAndDeck } = useDeck();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    api
      .get('/account')
      .then((res) => {
        setDecks(res.data.data.decks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleOpenDeck = async (deckItem: any) => {
    setLoading(true);
    try {
      const data = await deckService.getDeckCards(deckItem._id);
      const profile = deckItem.profileId;
      setProfileAndDeck(profile, deckItem, data.cards, data.entitlements);
      navigate('/deck');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <div>
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] mb-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1A1817]">Saved Birth Sky Decks</h1>
        <p className="text-xs text-[#8C6D3B] mt-1 font-medium">
          Open or review your previously generated personalized 55-card decks.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-serif text-[#8C6D3B]">
          Retrieving saved decks…
        </div>
      ) : decks.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/25 text-center space-y-3 shadow-md">
          <Sparkles className="w-8 h-8 text-[#8C6D3B] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1A1817]">No Saved Decks Yet</h3>
          <p className="text-xs text-[#1A1817]/70">
            Enter your birth details to generate your first 55-card cosmic sky.
          </p>
          <Link
            to="/"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
          >
            Enter Birth Sky
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decks.map((d, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/30 space-y-4 shadow-md hover:border-[#8C6D3B] hover:shadow-lg transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-[#8C6D3B] uppercase font-mono tracking-wider block font-semibold">
                  Generated on {new Date(d.generatedAt || d.createdAt).toLocaleDateString()}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1A1817]">
                  "{d.avatarPhrase}"
                </h3>
              </div>

              <div className="text-xs text-[#1A1817]/70 space-y-1">
                <div>Soul Planet: <strong className="text-[#8C6D3B] font-semibold">{d.sovereignCardKey}</strong></div>
                <div>Total Cards: <strong className="text-[#1A1817] font-semibold">{d.totalCards || 55}</strong></div>
              </div>

              <button
                onClick={() => handleOpenDeck(d)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F2ECE1] hover:bg-[#8C6D3B] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] text-xs font-semibold text-[#1A1817] hover:text-[#FFFDF9] flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open This Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
