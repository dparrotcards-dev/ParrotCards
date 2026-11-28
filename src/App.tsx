import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeckProvider } from './context/DeckContext';
import { useAuth } from './context/AuthContext';
import { useDeck } from './context/DeckContext';
import { RootLayout } from './layouts/RootLayout';
import { api } from './services/api';
import { deckService } from './services/deckService';
import { IBirthProfile } from './types';

import { SeoManager } from './components/SeoManager';

const BirthEntryPage = lazy(() => import('./pages/BirthEntryPage').then((m) => ({ default: m.BirthEntryPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const DeckPage = lazy(() => import('./pages/DeckPage').then((m) => ({ default: m.DeckPage })));
const SovereignAvatarPage = lazy(() => import('./pages/SovereignAvatarPage').then((m) => ({ default: m.SovereignAvatarPage })));
const AstronomicalProfilePage = lazy(() => import('./pages/AstronomicalProfilePage').then((m) => ({ default: m.AstronomicalProfilePage })));
const PricingCheckoutPage = lazy(() => import('./pages/PricingCheckoutPage').then((m) => ({ default: m.PricingCheckoutPage })));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage').then((m) => ({ default: m.PaymentResultPage })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then((m) => ({ default: m.UserProfilePage })));
const MyDailyResonancePage = lazy(() =>
  import('./pages/MyDailyResonancePage').then((m) => ({ default: m.MyDailyResonancePage })),
);
const SavedDeckPage = lazy(() => import('./pages/SavedDeckPage').then((m) => ({ default: m.SavedDeckPage })));
const PurchasedCardsPage = lazy(() => import('./pages/PurchasedCardsPage').then((m) => ({ default: m.PurchasedCardsPage })));
const PaymentHistoryPage = lazy(() => import('./pages/PaymentHistoryPage').then((m) => ({ default: m.PaymentHistoryPage })));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const DailyResonancePage = lazy(() =>
  import('./pages/DailyResonancePage').then((m) => ({ default: m.DailyResonancePage })),
);
const JyotirlingaCompassPage = lazy(() =>
  import('./pages/JyotirlingaCompassPage').then((m) => ({ default: m.JyotirlingaCompassPage })),
);
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then((m) => ({ default: m.SupportPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const AdminShell = lazy(() => import('./pages/admin/AdminShell').then((m) => ({ default: m.AdminShell })));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminDecksPage = lazy(() => import('./pages/admin/AdminDecksPage').then((m) => ({ default: m.AdminDecksPage })));
const AdminCardsPage = lazy(() => import('./pages/admin/AdminCardsPage').then((m) => ({ default: m.AdminCardsPage })));
const AdminDailyRecordingsPage = lazy(() =>
  import('./pages/admin/AdminDailyRecordingsPage').then((m) => ({ default: m.AdminDailyRecordingsPage })),
);
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })));
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage').then((m) => ({ default: m.AdminSystemPage })));
const AdminChangePasswordPage = lazy(() => import('./pages/admin/AdminChangePasswordPage').then((m) => ({ default: m.AdminChangePasswordPage })));
const CosmicStorePage = lazy(() => import('./pages/CosmicStorePage').then((m) => ({ default: m.CosmicStorePage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const AdminAddProductPage = lazy(() => import('./pages/admin/AdminAddProductPage').then((m) => ({ default: m.AdminAddProductPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { profile, deck, cards } = useDeck();

  if (isAuthenticated && profile && deck && cards.length > 0) {
    return <DeckPage />;
  }

  return <LandingPage />;
};

const LegacyDailyResonanceRedirect: React.FC<{ to: string }> = ({ to }) => {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: to, search: location.search, hash: location.hash }}
      replace
    />
  );
};

const AuthenticatedBirthEntryPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = React.useState(true);
  const [savedProfile, setSavedProfile] = React.useState<IBirthProfile | null>(null);
  const [checkError, setCheckError] = React.useState<string | null>(null);
  const [retryCheck, setRetryCheck] = React.useState(0);
  const [recoveringDeck, setRecoveringDeck] = React.useState(false);
  const [recoveryError, setRecoveryError] = React.useState<string | null>(null);
  const { setProfileAndDeck } = useDeck();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading || !isAuthenticated) return;

    let active = true;
    setCheckingProfile(true);
    setCheckError(null);

    api.get('/account')
      .then((response) => {
        if (!active) return;
        const account = response.data?.data;
        const profiles = account?.profiles;
        if (Array.isArray(profiles) && profiles.length > 0) {
          const activeDeckData = account.activeDeckData;
          if (activeDeckData?.deck && activeDeckData.profile && account.entitlements) {
            setProfileAndDeck(
              activeDeckData.profile,
              activeDeckData.deck,
              activeDeckData.cards || [],
              account.entitlements
            );
            navigate('/', { replace: true });
            return;
          }
          setSavedProfile(profiles[0]);
        }
        setCheckingProfile(false);
      })
      .catch((error: Error) => {
        if (!active) return;
        setCheckError(error.message || 'Could not verify your saved birth details.');
        setCheckingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, loading, navigate, retryCheck]);

  const recoverSavedDeck = async () => {
    if (!savedProfile) return;

    setRecoveringDeck(true);
    setRecoveryError(null);
    try {
      const result = await deckService.submitBirthDetails({
        name: savedProfile.name,
        gender: savedProfile.gender,
        date: savedProfile.dateOfBirth,
        time: savedProfile.timeOfBirth,
        place: savedProfile.place,
        latitude: savedProfile.latitude,
        longitude: savedProfile.longitude,
        timezone: savedProfile.timezone,
        ianaTimezone: savedProfile.ianaTimezone,
      });
      setProfileAndDeck(result.profile, result.deck, result.cards, result.entitlements);
      navigate('/', { replace: true });
    } catch (error) {
      setRecoveryError(error instanceof Error ? error.message : 'Could not generate your saved birth chart.');
    } finally {
      setRecoveringDeck(false);
    }
  };

  if (loading) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-[#6B635B]">
        Checking your sign-in…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (checkingProfile) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-[#6B635B]">
        Checking your saved birth details…
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
        <p role="alert" className="text-sm text-[#7A1C1C]">{checkError}</p>
        <button
          type="button"
          onClick={() => setRetryCheck((retry) => retry + 1)}
          className="rounded-xl bg-[#8C6D3B] px-5 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (savedProfile) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-cinzel text-xl font-bold text-[#1A1817]">Your birth details are saved</h1>
        <p className="text-sm leading-relaxed text-[#6B635B]">
          These details are permanent and cannot be changed. We can retry the Jyotish calculation using your saved details.
        </p>
        {recoveryError && <p role="alert" className="text-sm text-[#7A1C1C]">{recoveryError}</p>}
        <button
          type="button"
          disabled={recoveringDeck}
          onClick={recoverSavedDeck}
          className="rounded-xl bg-[#8C6D3B] px-5 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
        >
          {recoveringDeck ? 'Calculating your birth sky…' : 'Continue with saved details'}
        </button>
      </div>
    );
  }

  return <BirthEntryPage />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SeoManager />
      <AuthProvider>
        <DeckProvider>
          <React.Suspense
            fallback={
              <div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-[#6B635B]">
                Loading Parrot Cards…
              </div>
            }
          >
          <Routes>
            {/* Super Admin Dashboard Suite (Rendered in dedicated executive AdminShell) */}
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="decks" element={<AdminDecksPage />} />
              <Route path="cards" element={<AdminCardsPage />} />
              <Route path="daily-recordings" element={<AdminDailyRecordingsPage />} />
              <Route path="store" element={<AdminProductsPage />} />
              <Route path="store/products" element={<Navigate to="/admin/store" replace />} />
              <Route path="store/add-product" element={<AdminAddProductPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="payments" element={<AdminOrdersPage />} />
              <Route path="transactions" element={<AdminPaymentsPage />} />
              <Route path="contact-messages" element={<AdminMessagesPage />} />
              <Route path="messages" element={<Navigate to="/admin/contact-messages" replace />} />
              <Route path="ai-monitoring" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="astronomy" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="system" element={<AdminSystemPage />} />
              <Route path="admins" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="audit-logs" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="change-password" element={<AdminChangePasswordPage />} />
            </Route>

            {/* Consumer Seeker Experience & Public Pages */}
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="birth-details" element={<AuthenticatedBirthEntryPage />} />
              <Route path="deck" element={<DeckPage />} />
              <Route path="avatar" element={<SovereignAvatarPage />} />
              <Route path="profile/astronomy" element={<AstronomicalProfilePage />} />
              <Route path="pricing" element={<PricingCheckoutPage />} />
              <Route path="services" element={<Navigate to="/" replace />} />
              <Route path="cosmic-store" element={<CosmicStorePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="payment/result" element={<PaymentResultPage />} />
              <Route path="account" element={<UserProfilePage />} />
              <Route path="account/products-services" element={<UserProfilePage />} />
              <Route path="account/daily-rituals" element={<LegacyDailyResonanceRedirect to="/my-daily-resonance" />} />
              <Route path="account/daily-resonance" element={<Navigate to="/my-daily-resonance" replace />} />
              <Route path="my-daily-resonance" element={<MyDailyResonancePage />} />
              <Route path="my-daily-rituals" element={<LegacyDailyResonanceRedirect to="/my-daily-resonance" />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="saved-deck" element={<SavedDeckPage />} />
              <Route path="purchased-cards" element={<PurchasedCardsPage />} />
              <Route path="payments/history" element={<PaymentHistoryPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="daily-resonance" element={<DailyResonancePage />} />
              <Route path="daily-rituals" element={<LegacyDailyResonanceRedirect to="/daily-resonance" />} />
              <Route path="jyotirlinga-compass" element={<JyotirlingaCompassPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="login" element={<AuthPage />} />
              <Route path="register" element={<AuthPage />} />
              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin/reset-password" element={<ResetPasswordPage isAdminFlow />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </React.Suspense>
        </DeckProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
