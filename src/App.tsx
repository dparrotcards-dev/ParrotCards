import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeckProvider } from './context/DeckContext';
import { RootLayout } from './layouts/RootLayout';

import { SeoManager } from './components/SeoManager';

const BirthEntryPage = lazy(() => import('./pages/BirthEntryPage').then((m) => ({ default: m.BirthEntryPage })));
const DeckPage = lazy(() => import('./pages/DeckPage').then((m) => ({ default: m.DeckPage })));
const SovereignAvatarPage = lazy(() => import('./pages/SovereignAvatarPage').then((m) => ({ default: m.SovereignAvatarPage })));
const AstronomicalProfilePage = lazy(() => import('./pages/AstronomicalProfilePage').then((m) => ({ default: m.AstronomicalProfilePage })));
const PricingCheckoutPage = lazy(() => import('./pages/PricingCheckoutPage').then((m) => ({ default: m.PricingCheckoutPage })));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage').then((m) => ({ default: m.PaymentResultPage })));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then((m) => ({ default: m.UserProfilePage })));
const SavedDeckPage = lazy(() => import('./pages/SavedDeckPage').then((m) => ({ default: m.SavedDeckPage })));
const PurchasedCardsPage = lazy(() => import('./pages/PurchasedCardsPage').then((m) => ({ default: m.PurchasedCardsPage })));
const PaymentHistoryPage = lazy(() => import('./pages/PaymentHistoryPage').then((m) => ({ default: m.PaymentHistoryPage })));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
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
              <Route index element={<BirthEntryPage />} />
              <Route path="deck" element={<DeckPage />} />
              <Route path="avatar" element={<SovereignAvatarPage />} />
              <Route path="profile/astronomy" element={<AstronomicalProfilePage />} />
              <Route path="pricing" element={<PricingCheckoutPage />} />
              <Route path="services" element={<Navigate to="/" replace />} />
              <Route path="cosmic-store" element={<CosmicStorePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="payment/result" element={<PaymentResultPage />} />
              <Route path="account" element={<UserProfilePage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="saved-deck" element={<SavedDeckPage />} />
              <Route path="purchased-cards" element={<PurchasedCardsPage />} />
              <Route path="payments/history" element={<PaymentHistoryPage />} />
              <Route path="about" element={<AboutPage />} />
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
