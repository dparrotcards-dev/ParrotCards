import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeckProvider } from './context/DeckContext';
import { RootLayout } from './layouts/RootLayout';

import { BirthEntryPage } from './pages/BirthEntryPage';
import { DeckPage } from './pages/DeckPage';
import { SovereignAvatarPage } from './pages/SovereignAvatarPage';
import { AstronomicalProfilePage } from './pages/AstronomicalProfilePage';
import { PricingCheckoutPage } from './pages/PricingCheckoutPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SavedDeckPage } from './pages/SavedDeckPage';
import { PurchasedCardsPage } from './pages/PurchasedCardsPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { SupportPage } from './pages/SupportPage';
import { AuthPage } from './pages/AuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Super Admin Suite
import { AdminShell } from './pages/admin/AdminShell';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDecksPage } from './pages/admin/AdminDecksPage';
import { AdminCardsPage } from './pages/admin/AdminCardsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSystemPage } from './pages/admin/AdminSystemPage';
import { AdminChangePasswordPage } from './pages/admin/AdminChangePasswordPage';
import { CosmicStorePage } from './pages/CosmicStorePage';
import { CartPage } from './pages/CartPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeckProvider>
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
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DeckProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
