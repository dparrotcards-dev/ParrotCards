export type CardSuit = 'Dharma' | 'Artha' | 'Kama' | 'Moksha' | 'MasterKey';

export interface IAstronomicalPlacement {
  sign: number | null;
  signName?: string;
  deg: number | null;
  house: number | null;
  nak: string | null;
  pada: number | null;
  lord: string | null;
  nadi: string | null;
  ruler: string | null;
  kar: {
    code: string;
    name: string;
  } | null;
  state: string | null;
  isSovereign?: boolean;
  navamshaSign?: number | null;
  navamshaSignName?: string | null;
  houseLord?: string | null;
}

export interface ICard {
  _id: string;
  cardId: string;
  suit: CardSuit;
  suitSymbol: string;
  rank: string;
  label: string;
  key: string;
  title: string;
  line: string;
  shortSummary: string;
  detailedInterpretation?: string;
  reflectionQuestion?: string;
  position: number;
  astronomicalPlacement: IAstronomicalPlacement;
  isSovereign: boolean;
  isFree: boolean;
  isUnlocked: boolean;
}

export interface ICardDefinition {
  cardId: string;
  suit: CardSuit;
  suitSymbol: string;
  suitName: string;
  suitTheme: string;
  rank: string;
  label: string;
  key: string;
  title: string;
  line: string;
  shortSummary: string;
  detailedInterpretation: string;
  reflectionQuestion: string;
  position: number;
  isFreeByDefault: boolean;
  category: string;
}

export interface IBirthProfile {
  _id: string;
  name: string;
  gender?: string;
  dateOfBirth: string;
  timeOfBirth: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ianaTimezone?: string;
  utcDateTime: string;
  createdAt: string;
}

export interface IPersonalizedDeck {
  _id: string;
  profileId: string | IBirthProfile;
  sovereignCardKey: string;
  avatarPhrase: string;
  avatarSummary: string;
  totalCards: number;
  generatedAt: string;
}

export interface IEntitlementStatus {
  isDeckPassActive: boolean;
  deckPassExpiresAt: string | null;
  unlockedCardKeys: string[];
  freeCardKeys: string[];
}

export type UserRole = 'user' | 'admin' | 'superadmin' | 'analytics_manager' | 'content_manager' | 'support_admin';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface ILocationResult {
  label: string;
  lat: number;
  lon: number;
  timezone: number;
  ianaTimezone?: string;
}
