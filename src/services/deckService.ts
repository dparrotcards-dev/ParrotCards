import { api } from './api';
import { ICard, ICardDefinition, IBirthProfile, IPersonalizedDeck, IEntitlementStatus } from '../types';

export const deckService = {
  async submitBirthDetails(data: {
    name: string;
    gender?: string;
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: number;
    ianaTimezone?: string;
  }): Promise<{
    profile: IBirthProfile;
    deck: IPersonalizedDeck;
    cards: ICard[];
    entitlements: IEntitlementStatus;
  }> {
    const res = await api.post('/profiles', data);
    return res.data.data;
  },

  async getDeckCards(deckId: string): Promise<{
    deckId: string;
    sovereignCardKey: string;
    avatarPhrase: string;
    cards: ICard[];
    entitlements: IEntitlementStatus;
  }> {
    const res = await api.get(`/decks/${deckId}/cards`);
    return res.data.data;
  },

  async getCardDetail(cardKey: string): Promise<{
    card: ICardDefinition & { isUnlocked: boolean; isFree: boolean };
    entitlements: IEntitlementStatus;
  }> {
    const res = await api.get(`/cards/${cardKey}`);
    return res.data.data;
  },

  async getCardInterpretation(cardKey: string, deckId?: string, userName?: string): Promise<any> {
    const res = await api.post(`/interpretations/cards/${cardKey}/interpretation`, {
      deckId,
      userName,
    });
    return res.data.data;
  },

  async getSovereignAvatar(deckId: string): Promise<{
    sovereignCardKey: string;
    avatarPhrase: string;
    avatarSummary: string;
  }> {
    const res = await api.get(`/interpretations/decks/${deckId}/avatar`);
    return res.data.data;
  },

  async getCardDefinitions(): Promise<ICardDefinition[]> {
    const res = await api.get('/decks/definitions');
    return res.data.data;
  },

  async getAstronomicalCalculation(profileId: string): Promise<any> {
    const res = await api.get(`/astronomy/${profileId}`);
    return res.data.data.calculation;
  },
};
