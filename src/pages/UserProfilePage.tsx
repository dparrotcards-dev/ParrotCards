import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CircleHelp,
  CreditCard,
  Headphones,
  History,
  LayoutGrid,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { api } from '../services/api';
import { IEntitlementStatus, IBirthProfile } from '../types';

interface AccountData {
  entitlements?: IEntitlementStatus;
  profiles?: IBirthProfile[];
  activeDeckData?: { profile?: IBirthProfile | null };
}

const serviceCards = [
  {
    title: 'Personalized Parrot Cards',
    description: 'Explore your personal 55-card archetype deck and readings.',
    action: 'Open my deck',
    href: '/deck',
    Icon: BookOpen,
  },
  {
    title: '30-Day Deck Pass',
    description: 'Unlock all 55 cards and their readings for 30 days.',
    action: 'Explore access',
    href: '/pricing',
    Icon: Shield,
  },
];

export const UserProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { profile, entitlements, clearSession } = useDeck();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const isProductsServicesPage = location.pathname === '/account/products-services';

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/account' } });
      return;
    }

    let active = true;
    api.get('/account')
      .then((response) => {
        if (active) setAccountData(response.data?.data || null);
      })
      .catch((error: Error) => {
        if (active) setAccountError(error.message || 'Your account details could not be loaded.');
      });

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, navigate]);

  const currentProfile = accountData?.activeDeckData?.profile || accountData?.profiles?.[0] || profile;
  const currentEntitlements = accountData?.entitlements || entitlements;
  const unlockedCardCount = useMemo(() => {
    if (!currentEntitlements) return null;
    if (currentEntitlements.isDeckPassActive) return 55;
    return new Set([
      ...(currentEntitlements.freeCardKeys || []),
      ...(currentEntitlements.unlockedCardKeys || []),
    ]).size;
  }, [currentEntitlements]);

  if (authLoading || !isAuthenticated) {
    return (
      <div role="status" className="flex min-h-[50vh] flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8C6D3B] border-t-transparent" />
      </div>
    );
  }

  const signOut = async () => {
    clearSession();
    await logout();
    navigate('/');
  };

  const sidebarLinks = [
    {
      label: 'Products & Services',
      href: '/account',
      Icon: LayoutGrid,
      active: true,
      selected: isProductsServicesPage,
    },
    { label: currentEntitlements?.isDeckPassActive ? 'Premium Pass Active' : 'Standard Access', href: '/pricing', Icon: Shield },
    { label: 'My Daily Resonance', href: '/my-daily-rituals', Icon: Headphones },
    { label: 'My Orders', href: '/my-orders', Icon: Package },
    { label: 'Transactions', href: '/payments/history', Icon: History },
    {
      label: 'Unlocked Cards',
      href: '/purchased-cards',
      Icon: CreditCard,
      count: unlockedCardCount === null ? undefined : `${unlockedCardCount} / 55`,
    },
    { label: 'Birth Profile', href: '/profile/astronomy', Icon: UserRound },
    { label: 'Contact Us', href: '/support', Icon: CircleHelp },
  ];

  return (
    <div className={`mx-auto w-full max-w-[1380px] flex-1 px-3 py-4 sm:px-5 sm:py-6 ${
      isProductsServicesPage ? 'max-w-[1080px]' : 'grid grid-cols-1 gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-6'
    }`}>
      <aside className={`flex h-fit flex-col rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9]/95 p-4 shadow-[0_6px_20px_rgba(70,50,20,0.07)] sm:p-5 lg:sticky lg:top-24 ${
        isProductsServicesPage ? 'hidden' : ''
      }`}>
        <div className="flex items-center gap-3 border-b border-[#8C6D3B]/15 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#B8934E]/40 bg-[#F5EBDD] font-cinzel text-xl font-bold text-[#8C6D3B]">
            {user?.name?.trim().charAt(0).toUpperCase() || <UserRound className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h1 className="font-cinzel text-sm font-bold uppercase leading-tight tracking-wide text-[#1A1817]">
              {user?.name || 'My Profile'}
            </h1>
            <p className="mt-1 truncate text-[11px] text-[#8C6D3B]">{user?.email}</p>
          </div>
        </div>

        <nav aria-label="Account navigation" className="mt-3 grid gap-1">
          {sidebarLinks.map(({ label, href, Icon, active, count, selected }) => (
            active ? (
              <React.Fragment key={label}>
                <Link
                  to="/account/products-services"
                  aria-current={isProductsServicesPage ? 'page' : undefined}
                  className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors lg:hidden ${
                    isProductsServicesPage
                      ? 'bg-[#76531F] text-white shadow-sm'
                      : 'text-[#514536] hover:bg-[#F3EBDD] hover:text-[#73582D]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isProductsServicesPage ? 'text-[#F7E5C5]' : 'text-[#9A7130]'}`} />
                  <span className="min-w-0 flex-1">{label}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  to={href}
                  aria-current={selected ? 'page' : undefined}
                  className={`hidden min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors lg:flex ${
                    selected
                      ? 'bg-[#76531F] text-white shadow-sm'
                      : 'text-[#514536] hover:bg-[#F3EBDD] hover:text-[#73582D]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${selected ? 'text-[#F7E5C5]' : 'text-[#9A7130]'}`} />
                  <span className="min-w-0 flex-1">{label}</span>
                </Link>
              </React.Fragment>
            ) : (
              <Link
                key={label}
                to={href}
                aria-current={selected ? 'page' : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  selected
                    ? 'bg-[#76531F] text-white shadow-sm'
                    : 'text-[#514536] hover:bg-[#F3EBDD] hover:text-[#73582D]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${selected ? 'text-[#F7E5C5]' : 'text-[#9A7130]'}`} />
                <span className="min-w-0 flex-1">{label}</span>
                {count && (
                  <span className="rounded-full bg-[#F4E4C3] px-2 py-0.5 text-[10px] text-[#76531F]">
                    {count}
                  </span>
                )}
              </Link>
            )
          ))}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#B8934E]/35 bg-[#F8F1E7] px-3 text-xs font-bold text-[#342D24] transition-colors hover:bg-[#EFE2CF]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </aside>

      <main
        id="products-services-content"
        className={`min-w-0 space-y-5 ${isProductsServicesPage ? '' : 'hidden lg:block'}`}
      >
        {isProductsServicesPage && (
          <Link
            to="/account"
            className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#E8DFD1] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#76531F] transition-colors hover:bg-[#F3EBDD]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to Account
          </Link>
        )}
        <section className="relative overflow-hidden rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9]/90 px-5 py-5 shadow-[0_4px_16px_rgba(70,50,20,0.05)] sm:px-8 sm:py-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-14 h-44 w-44 rounded-full border border-[#B8934E]/20 sm:right-6 sm:h-52 sm:w-52">
            <div className="absolute inset-4 rounded-full border border-[#B8934E]/20" />
            <Sparkles className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[#B8934E]/40" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-[#9A7130]">
              <Sparkles className="h-4 w-4" />
              <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.18em]">Your account</span>
            </div>
            <h2 className="mt-2 font-cinzel text-xl font-bold uppercase tracking-wide text-[#1A1817] sm:text-2xl">
              Products &amp; Services
            </h2>
            <p className="mt-1 max-w-xl text-xs text-[#6B635B] sm:text-sm">
              Explore Parrot Cards offerings, your Jyotish tools, and cosmic store products.
            </p>
          </div>
        </section>

        {accountError && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-xs text-red-800">
            {accountError}
          </div>
        )}

        <section aria-labelledby="cosmic-store-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="cosmic-store-heading" className="font-cinzel text-lg font-bold text-[#211B14] sm:text-xl">
              Cosmic Store
            </h2>
          </div>
          <Link
            to="/cosmic-store"
            className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-[#E8DFD1] bg-gradient-to-br from-[#FFFDF9] via-[#FBF5EA] to-[#F2E6D2] p-5 shadow-[0_4px_16px_rgba(70,50,20,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#B8934E]/60 hover:shadow-[0_8px_24px_rgba(70,50,20,0.12)] sm:flex-row sm:items-center sm:justify-between sm:p-7"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#B8934E]/25 bg-[#F7EFE3] text-[#8C6D3B] sm:h-16 sm:w-16">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#211B14] sm:text-lg">Explore the Cosmic Store</h3>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#6B635B] sm:text-sm">
                  Discover the current collection of cosmic and spiritual products, with details and availability in the store.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-full bg-[#76531F] px-4 py-2.5 text-xs font-bold text-white transition-colors group-hover:bg-[#5F4219] sm:self-auto">
              Visit Cosmic Store
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>

        <section aria-labelledby="services-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="services-heading" className="font-cinzel text-lg font-bold text-[#211B14] sm:text-xl">
              Our Services
            </h2>
            <Link to="/pricing" className="text-[11px] font-bold text-[#8C6D3B] hover:underline sm:text-xs">
              Pricing details <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map(({ title, description, action, href, Icon }) => {
              const isPass = title === '30-Day Deck Pass';
              const passIsActive = Boolean(isPass && currentEntitlements?.isDeckPassActive);
              const isPersonalService = title !== '30-Day Deck Pass';
              const serviceHref = isPersonalService && !currentProfile
                ? '/birth-details'
                : passIsActive ? '/deck' : href;
              const serviceAction = isPersonalService && !currentProfile
                ? 'Enter birth details'
                : passIsActive ? 'View my deck' : action;
              return (
                <article key={title} className="flex min-h-[174px] flex-col rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] p-4 shadow-[0_3px_10px_rgba(70,50,20,0.06)] sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7EFE3] text-[#9A7130]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-sm font-bold text-[#211B14]">{title}</h3>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[#6B635B]">
                        {isPersonalService && !currentProfile
                          ? 'Save your birth details to generate your personalized Jyotish chart and Parrot Cards deck.'
                          : description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    {isPass && (
                      <span className="rounded-full bg-[#F7E9C9] px-3 py-1 text-[10px] font-bold text-[#73582D]">
                        {passIsActive
                          ? `Active${currentEntitlements?.deckPassExpiresAt ? ` · until ${new Date(currentEntitlements.deckPassExpiresAt).toLocaleDateString()}` : ''}`
                          : '₹25 · 30 days'}
                      </span>
                    )}
                    <Link to={serviceHref} className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#76531F] px-3.5 py-2 text-[10px] font-bold text-white transition-colors hover:bg-[#5F4219]">
                      {serviceAction}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
