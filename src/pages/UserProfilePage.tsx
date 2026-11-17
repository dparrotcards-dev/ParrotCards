import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Shield,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  Crown,
  CreditCard,
  History,
  Phone,
  Package,
  Truck,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { api } from '../services/api';

const getStatusBadge = (status: string) => {
  const norm = (status || '').toLowerCase();
  switch (norm) {
    case 'delivered':
      return {
        dotClass: 'bg-[#1D7E33]',
        pillClass: 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]',
      };
    case 'shipped':
      return {
        dotClass: 'bg-[#29689C]',
        pillClass: 'bg-[#EEF5FC] text-[#29689C] border-[#CCE2F7]',
      };
    case 'processing':
      return {
        dotClass: 'bg-[#B57418]',
        pillClass: 'bg-[#FEF5E7] text-[#B57418] border-[#FBE3B7]',
      };
    case 'confirmed':
      return {
        dotClass: 'bg-[#71449B]',
        pillClass: 'bg-[#F3EEF9] text-[#71449B] border-[#E3D5F0]',
      };
    case 'cancelled':
      return {
        dotClass: 'bg-[#B82B33]',
        pillClass: 'bg-[#FDEEEF] text-[#B82B33] border-[#FACDCF]',
      };
    default:
      return {
        dotClass: 'bg-[#6B7280]',
        pillClass: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]',
      };
  }
};

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { profile, entitlements, clearSession } = useDeck();
  const [accountData, setAccountData] = useState<any>(null);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [isMyOrdersModalOpen, setIsMyOrdersModalOpen] = useState<boolean>(false);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setOrdersLoading(true);
    Promise.allSettled([
      api.get('/account'),
      api.get('/account/orders'),
    ])
      .then(([accRes, ordersRes]) => {
        let mergedData: any = {};
        if (accRes.status === 'fulfilled') {
          mergedData = accRes.value.data?.data || {};
        }
        if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.data?.orders) {
          mergedData.orders = ordersRes.value.data.data.orders;
        }
        setAccountData(mergedData);
      })
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const orders: any[] = accountData?.orders || [];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A1817]/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/40 flex items-center justify-center text-[#8C6D3B] font-serif text-xl sm:text-2xl font-bold shadow-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1817] truncate">{user?.name}</h1>
            <p className="text-xs text-[#8C6D3B] font-mono truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            clearSession();
            await logout();
            navigate('/');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F2ECE1] hover:bg-[#7A1C1C]/15 border border-[#8C6D3B]/20 text-[#1A1817] hover:text-[#7A1C1C] text-xs font-semibold transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Pass Status */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 shadow-md space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Entitlement Status
          </span>
          <div className="flex items-center gap-2">
            {entitlements?.isDeckPassActive ? (
              <>
                <Crown className="w-5 h-5 text-emerald-600" />
                <span className="font-serif text-lg font-bold text-emerald-800">30-Day Pass Active</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-[#8C6D3B]" />
                <span className="font-serif text-lg font-bold text-[#1A1817]">Standard Access</span>
              </>
            )}
          </div>
          {entitlements?.deckPassExpiresAt && (
            <p className="text-[11px] font-mono text-[#1A1817]/70">
              Expires: {new Date(entitlements.deckPassExpiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* My Orders Card */}
        <button
          type="button"
          onClick={() => setIsMyOrdersModalOpen(true)}
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group text-left cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Store Orders
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">
              My Orders
            </span>
            <Package className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">Track Delivery & Items →</span>
        </button>

        {/* Unlocked Cards */}
        <Link
          to="/purchased-cards"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Unlocked Cards
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">
              {entitlements?.isDeckPassActive ? '55 / 55' : `${(entitlements?.unlockedCardKeys?.length || 0) + 3} / 55`}
            </span>
            <CreditCard className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">View Unlocked Archetypes →</span>
        </Link>

        {/* Payment History */}
        <Link
          to="/payments/history"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Transactions
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">Invoices</span>
            <History className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">View Payment Receipts →</span>
        </Link>

        {/* Support */}
        <Link
          to="/support"
          className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/30 hover:border-[#8C6D3B] shadow-md hover:shadow-lg space-y-2 transition-all block group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D3B] block">
            Support
          </span>
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-bold text-[#1A1817]">Contact Us</span>
            <Phone className="w-5 h-5 text-[#8C6D3B]/60 group-hover:text-[#8C6D3B] transition-colors" />
          </div>
          <span className="text-[11px] text-[#8C6D3B] font-semibold">Get help from our team →</span>
        </Link>
      </div>

      {/* Active Birth Profile Details */}
      {profile && (
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1817]/10">
            <h2 className="font-serif text-xl font-bold text-[#1A1817]">Active Birth Profile</h2>
            <Link
              to="/deck"
              className="text-xs text-[#8C6D3B] hover:underline font-semibold"
            >
              Go to Deck →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Date</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{profile.dateOfBirth}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Time</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{profile.timeOfBirth}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2ECE1]/60 border border-[#8C6D3B]/20 sm:col-span-2">
              <span className="text-[#8C6D3B] text-[10px] uppercase font-bold tracking-wider block mb-1">Birth Place</span>
              <span className="font-bold text-[#1A1817] flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#7A1C1C] flex-shrink-0" />
                <span className="truncate">{profile.place}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: MY ORDERS POPUP ═══ */}
      {isMyOrdersModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs"
          onClick={() => setIsMyOrdersModalOpen(false)}
        >
          <section
            className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header matching user's screenshot */}
            <header className="flex items-start justify-between gap-4 pb-3 border-b border-[#1A1817]/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center text-[#8C6D3B] shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1817] leading-tight uppercase tracking-wide">
                    My Orders
                  </h2>
                  <p className="text-xs text-[#7A6A58] mt-0.5">
                    Track and manage your physical orders from the Cosmic Store
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/cosmic-store"
                  onClick={() => setIsMyOrdersModalOpen(false)}
                  className="text-xs text-[#8C6D3B] hover:text-[#2C2016] font-semibold hover:underline flex items-center gap-1.5"
                >
                  <span>Visit Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setIsMyOrdersModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Content */}
            {ordersLoading ? (
              <div className="py-12 text-center text-sm font-serif text-[#8C6D3B]">
                <span className="mx-auto mb-2 block h-6 w-6 rounded-full border-2 border-[#8C6D3B] border-t-transparent animate-spin" />
                <span>Loading your orders…</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#7A6A58] italic">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord: any) => {
                  const statusPill = getStatusBadge(ord.status);
                  const formattedDate = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = new Date(ord.createdAt || Date.now()).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div
                      key={ord.id || ord._id || ord.orderId}
                      className="rounded-2xl border border-[#E5D7C6] bg-[#FAF5EE]/60 hover:bg-[#FAF5EE] transition-all p-4 sm:p-5 space-y-4 shadow-2xs"
                    >
                      {/* Order Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5D7C6]/70">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-sm sm:text-base text-[#2C2016]">
                            {ord.orderId?.startsWith('#') ? ord.orderId : `#${ord.orderId}`}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${statusPill.pillClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dotClass}`} />
                            <span>{ord.status || 'Confirmed'}</span>
                          </span>
                        </div>

                        <div className="text-right text-xs text-[#7A6A58]">
                          <span>
                            Placed on {formattedDate} at {formattedTime}
                          </span>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className="space-y-3">
                        {ord.products?.map((prod: any, pIdx: number) => (
                          <div key={pIdx} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover bg-[#EBDCCB] border border-[#DFC9B2] shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-[#EBDCCB] border border-[#DFC9B2] flex items-center justify-center shrink-0 text-[#8C6D3B]">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <p className="font-serif font-bold text-sm text-[#2C2016] capitalize">
                                  {prod.name}
                                </p>
                                <p className="text-xs text-[#7A6A58]">
                                  Qty: {prod.quantity || 1} {prod.category ? `• ${prod.category}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className="font-serif font-bold text-sm text-[#2C2016]">
                              ₹ {prod.priceRupees?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Info & Details */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5D7C6]/70 text-xs">
                        <div className="space-y-0.5 text-[#5A4838]">
                          {ord.shippingAddress?.city && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                              <span>
                                Delivery to: {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.pincode})
                              </span>
                            </p>
                          )}
                          {ord.courierName && ord.trackingNumber && (
                            <p className="flex items-center gap-1.5 text-[#8C6D3B] font-medium">
                              <Truck className="w-3.5 h-3.5 shrink-0" />
                              <span>Via {ord.courierName} ({ord.trackingNumber})</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[11px] text-[#7A6A58] block leading-tight">Total Amount</span>
                            <span className="font-serif font-bold text-base sm:text-lg text-[#2C2016]">
                              ₹ {ord.totalAmountRupees?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedOrderModal(ord)}
                            className="px-4 py-2 rounded-xl border border-[#B88A4F]/40 bg-[#FFFDF9] hover:bg-[#F2ECE1] text-xs font-bold text-[#5A3810] transition-colors cursor-pointer shadow-2xs"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══ MODAL: VIEW SINGLE ORDER DETAILS ═══ */}
      {selectedOrderModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[#2a170b]/55 p-4 backdrop-blur-xs"
          onClick={() => setSelectedOrderModal(null)}
        >
          <section
            className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-start justify-between gap-4 pb-2 border-b border-[#1A1817]/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center shrink-0 text-[#8C6D3B]">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#2C2016] leading-tight">
                    Order Details
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-sm text-[#2C2016]">
                      Order ID: {selectedOrderModal.orderId}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${
                        getStatusBadge(selectedOrderModal.status).pillClass
                      }`}
                    >
                      {selectedOrderModal.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6A58] mt-0.5">
                    Placed on{' '}
                    {new Date(selectedOrderModal.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 rounded-xl text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Customer Details & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                  <User className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Customer Details</span>
                </div>
                <p className="font-serif font-bold text-base text-[#2C2016] uppercase pt-1">
                  {selectedOrderModal.customerName || user?.name}
                </p>
                <p className="text-xs text-[#5A4838]">
                  Phone: {selectedOrderModal.customerPhone || '—'}
                </p>
                <p className="text-xs text-[#5A4838]">
                  Email: {selectedOrderModal.customerEmail || user?.email}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                  <MapPin className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Delivery Address</span>
                </div>
                <p className="font-serif font-bold text-base text-[#2C2016] uppercase pt-1">
                  {selectedOrderModal.shippingAddress?.city
                    ? `${selectedOrderModal.shippingAddress.city.toUpperCase()}, ${selectedOrderModal.shippingAddress.state}`
                    : '—'}
                </p>
                {selectedOrderModal.shippingAddress?.address && (
                  <p className="text-xs text-[#5A4838]">
                    {selectedOrderModal.shippingAddress.address}
                  </p>
                )}
                <p className="text-xs text-[#7A6A58]">
                  Pincode: {selectedOrderModal.shippingAddress?.pincode || '—'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                <Package className="w-4 h-4 text-[#8C6D3B]" />
                <span>Order Items ({selectedOrderModal.products?.length || 0})</span>
              </div>
              <div className="space-y-3">
                {selectedOrderModal.products?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-[#EBDCCB] border border-[#DFC9B2] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#EBDCCB] border border-[#DFC9B2] flex items-center justify-center shrink-0 text-[#8C6D3B]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-serif font-bold text-sm text-[#2C2016] capitalize">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#7A6A58]">
                          Qty: {item.quantity || 1} {item.category ? `• ${item.category}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#2C2016]">
                      ₹ {item.priceRupees?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
                <span>Payment Details</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A6A58]">Payment Method</span>
                  <span className="font-medium text-[#2C2016]">
                    {selectedOrderModal.paymentMethod?.includes('Razorpay')
                      ? 'Online (Razorpay)'
                      : selectedOrderModal.paymentMethod || 'Online'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A6A58]">Payment Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Success
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E5D7C6]/60">
                  <span className="text-[#7A6A58] font-medium">Amount Paid</span>
                  <span className="font-serif font-bold text-sm text-[#2C2016]">
                    ₹ {selectedOrderModal.totalAmountRupees?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 flex items-center justify-between">
              <span className="font-serif font-bold text-base text-[#2C2016]">
                Total Order Amount
              </span>
              <span className="font-serif font-bold text-2xl text-[#2C2016]">
                ₹ {selectedOrderModal.totalAmountRupees?.toLocaleString('en-IN') || 0}
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
