import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  User,
  X,
  ExternalLink,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const formatOrderDate = (dateVal: any) => {
  const d = new Date(dateVal || Date.now());
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatStepTime = (dateVal: any, addMinutes = 0) => {
  const d = new Date(dateVal || Date.now());
  if (addMinutes) {
    d.setMinutes(d.getMinutes() + addMinutes);
  }
  const dateStr = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const timeStr = d
    .toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
  return `${dateStr}, ${timeStr}`;
};

const canCancelOrder = (status: string) => {
  const norm = (status || 'confirmed').toLowerCase();
  return ['pending', 'confirmed', 'processing'].includes(norm);
};

const getOrderKey = (ord: any) => ord?._id || ord?.id;

const formatOrderNumber = (orderId?: string) =>
  orderId?.startsWith('#') ? orderId : `#${orderId || ''}`;

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const handleCancelOrder = async () => {
    const target = cancelTarget;
    const orderKey = getOrderKey(target);
    if (!target || !orderKey) return;

    setIsCancelling(true);
    try {
      const res = await api.patch(`/account/orders/${orderKey}/cancel`);
      const updatedOrder = res.data?.data?.order;

      setOrders((prev) =>
        prev.map((ord) =>
          getOrderKey(ord) === orderKey
            ? { ...ord, ...(updatedOrder || {}), status: 'Cancelled' }
            : ord
        )
      );
      setSelectedOrderModal((prev: any) =>
        prev && getOrderKey(prev) === orderKey
          ? { ...prev, ...(updatedOrder || {}), status: 'Cancelled' }
          : prev
      );
      setCancelTarget(null);
      showFeedback('success', 'Order cancelled successfully');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    Promise.allSettled([
      api.get('/account/orders'),
      api.get('/account'),
    ])
      .then(([ordersRes, accRes]) => {
        let userOrders: any[] = [];
        if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.data?.orders) {
          userOrders = ordersRes.value.data.data.orders;
        } else if (accRes.status === 'fulfilled' && accRes.value.data?.data?.orders) {
          userOrders = accRes.value.data.data.orders;
        }
        setOrders(userOrders);
      })
      .catch((err) => console.error('Failed to load user orders:', err))
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

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
      {/* Back to Account Link */}
      <div>
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] mb-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>
      </div>

      {/* Main Panel Matching Reference Design */}
      <section className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1817]/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center text-[#8C6D3B] shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1817] leading-tight uppercase tracking-wide">
                My Orders
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6A58] mt-0.5">
                Track and manage your physical orders from the Cosmic Store
              </p>
            </div>
          </div>

          <Link
            to="/cosmic-store"
            className="text-xs sm:text-sm text-[#8C6D3B] hover:text-[#2C2016] font-semibold hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>Visit Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Content */}
        {orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#7A6A58] italic">
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

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-[#7A6A58] block leading-tight">Total Amount</span>
                        <span className="font-serif font-bold text-base sm:text-lg text-[#2C2016]">
                          ₹ {ord.totalAmountRupees?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderModal(ord)}
                          className="px-4 py-2 rounded-xl border border-[#B88A4F]/40 bg-[#FFFDF9] hover:bg-[#F2ECE1] text-xs font-bold text-[#5A3810] transition-colors cursor-pointer shadow-2xs"
                        >
                          View Details
                        </button>
                        {canCancelOrder(ord.status) && (
                          <button
                            onClick={() => setCancelTarget(ord)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#B82B33]/30 bg-[#FDEEEF] hover:bg-[#F9DEE0] text-xs font-bold text-[#B82B33] transition-colors cursor-pointer shadow-2xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: View Single Order Details (Matches Design media_1794900852195_d463fada.jpg) */}
      {selectedOrderModal && (() => {
        const normStatus = (selectedOrderModal.status || 'Confirmed').toLowerCase();
        const isCancelled = normStatus === 'cancelled';

        // Step index: 0: Order Placed, 1: Confirmed, 2: Processing, 3: Shipped, 4: Delivered
        let activeStepIndex = 2; // Default to Processing active (in progress) for confirmed orders
        if (normStatus === 'pending') {
          activeStepIndex = 1;
        } else if (normStatus === 'confirmed') {
          activeStepIndex = 2; // Matches reference screenshot: Placed & Confirmed completed, Processing is "In Progress"
        } else if (normStatus === 'processing') {
          activeStepIndex = 2;
        } else if (normStatus === 'shipped') {
          activeStepIndex = 3;
        } else if (normStatus === 'delivered') {
          activeStepIndex = 5; // All completed
        }

        const createdAt = selectedOrderModal.createdAt || Date.now();
        const orderPlacedTime = formatStepTime(createdAt, 0);
        const orderConfirmedTime = formatStepTime(createdAt, 2);

        const trackingSteps = [
          {
            key: 'placed',
            label: 'Order Placed',
            icon: <Check className="w-4 h-4 stroke-[2.5]" />,
            timestamp: orderPlacedTime,
            upcomingLabel: 'Pending',
          },
          {
            key: 'confirmed',
            label: 'Confirmed',
            icon: <Check className="w-4 h-4 stroke-[2.5]" />,
            timestamp: orderConfirmedTime,
            upcomingLabel: 'Pending',
          },
          {
            key: 'processing',
            label: 'Processing',
            icon: <Truck className="w-4 h-4 text-[#B57418]" />,
            timestamp: formatStepTime(selectedOrderModal.updatedAt || createdAt, 15),
            upcomingLabel: 'Yet to process',
          },
          {
            key: 'shipped',
            label: 'Shipped',
            icon: <Truck className="w-4 h-4 text-[#9CA3AF]" />,
            timestamp: formatStepTime(selectedOrderModal.updatedAt || createdAt, 60),
            upcomingLabel: 'Yet to ship',
          },
          {
            key: 'delivered',
            label: 'Delivered',
            icon: <Package className="w-4 h-4 text-[#9CA3AF]" />,
            timestamp: formatStepTime(selectedOrderModal.updatedAt || createdAt, 120),
            upcomingLabel: 'Yet to deliver',
          },
        ];

        const statusBadge = getStatusBadge(selectedOrderModal.status);
        const currentTrackingStatus =
          normStatus === 'confirmed'
            ? 'Processing'
            : selectedOrderModal.status || 'Processing';

        return (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
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
                    <h3 className="font-serif font-bold text-xl text-[#2C2016] leading-tight uppercase tracking-wide">
                      ORDER DETAILS
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-sm text-[#2C2016]">
                        Order ID: {selectedOrderModal.orderId?.startsWith('#') ? selectedOrderModal.orderId : `#${selectedOrderModal.orderId}`}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.pillClass}`}
                      >
                        {selectedOrderModal.status || 'Confirmed'}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6A58] mt-0.5">
                      Placed on {formatOrderDate(selectedOrderModal.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="p-1.5 rounded-xl text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* ═══ 1. ORDER TRACKING CARD ═══ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/80 space-y-4">
                {/* Tracking Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center text-[#8C6D3B] shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2C2016]">
                        ORDER TRACKING
                      </h4>
                      <p className="text-xs text-[#7A6A58]">
                        Track your order from confirmation to delivery.
                      </p>
                    </div>
                  </div>

                  {/* Current Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#DFC9B2] bg-[#FFFDF9] text-xs font-semibold text-[#2C2016] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#B57418]" />
                    <span>
                      Current Status: <span className="font-bold text-[#2C2016] capitalize">{currentTrackingStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Stepper Timeline */}
                {isCancelled ? (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>This order has been cancelled.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto pt-2 pb-1">
                    <div className="min-w-[520px] grid grid-cols-5">
                      {trackingSteps.map((st, idx) => {
                        const isCompleted = idx < activeStepIndex;
                        const isCurrent = idx === activeStepIndex;
                        const isUpcoming = idx > activeStepIndex;

                        return (
                          <div key={st.key} className="relative flex flex-col items-center text-center px-1">
                            {/* Connector line to the next step */}
                            {idx < trackingSteps.length - 1 && (
                              <div
                                className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 ${
                                  idx < activeStepIndex ? 'bg-[#B88A4F]' : 'bg-[#E5D7C6]'
                                }`}
                              />
                            )}

                            {/* Circle Icon */}
                            <div
                              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-[#4A321F] text-white shadow-xs'
                                  : isCurrent
                                  ? 'bg-[#FDF3E3] border-2 border-[#B57418] text-[#B57418] shadow-xs'
                                  : 'bg-[#FAF5EE] border border-[#D5C7B6] text-[#9CA3AF]'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                st.icon
                              )}
                            </div>

                            {/* Step Title */}
                            <span
                              className={`mt-2 font-bold text-xs ${
                                isUpcoming ? 'text-[#7A6A58]' : 'text-[#2C2016]'
                              }`}
                            >
                              {st.label}
                            </span>

                            {/* Sub-badge / Timestamp */}
                            <div className="mt-1">
                              {isCompleted ? (
                                <span className="text-[11px] text-[#7A6A58] block leading-tight">
                                  {st.timestamp}
                                </span>
                              ) : isCurrent ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF3E3] text-[#B57418] border border-[#F5DEBA]">
                                  In Progress
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] text-[#7A6A58] bg-[#FAF5EE] border border-[#E5D7C6]">
                                  {st.upcomingLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══ 2. CUSTOMER DETAILS & DELIVERY ADDRESS ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                    <User className="w-4 h-4 text-[#8C6D3B]" />
                    <span>CUSTOMER DETAILS</span>
                  </div>
                  <p className="font-serif font-bold text-base text-[#2C2016] uppercase pt-1">
                    {selectedOrderModal.customerName || selectedOrderModal.shippingAddress?.fullName || user?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-[#5A4838]">
                    Phone: {selectedOrderModal.customerPhone || selectedOrderModal.shippingAddress?.phone || '—'}
                  </p>
                  <p className="text-xs text-[#5A4838]">
                    Email: {selectedOrderModal.customerEmail || selectedOrderModal.shippingAddress?.email || user?.email || '—'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                    <MapPin className="w-4 h-4 text-[#8C6D3B]" />
                    <span>DELIVERY ADDRESS</span>
                  </div>
                  <p className="font-serif font-bold text-base text-[#2C2016] uppercase pt-1">
                    {selectedOrderModal.shippingAddress?.city
                      ? `${selectedOrderModal.shippingAddress.city.toUpperCase()} , ${(
                          selectedOrderModal.shippingAddress.state || ''
                        ).toUpperCase()}`
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

              {/* ═══ 3. ORDER ITEMS ═══ */}
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                  <Package className="w-4 h-4 text-[#8C6D3B]" />
                  <span>ORDER ITEMS ({selectedOrderModal.products?.length || 0})</span>
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
                          <p className="font-serif font-bold text-sm text-[#2C2016] uppercase">
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

              {/* ═══ 4. PAYMENT DETAILS ═══ */}
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D3B]">
                  <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
                  <span>PAYMENT DETAILS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6A58]">Payment Method</span>
                    <span className="font-medium text-[#2C2016]">
                      {selectedOrderModal.paymentMethod?.includes('Razorpay')
                        ? 'Online (Razorpay)'
                        : selectedOrderModal.paymentMethod || 'Online (Razorpay)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6A58]">Payment Status</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Success
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#7A6A58] font-medium">Amount Paid</span>
                    <span className="font-serif font-bold text-sm text-[#2C2016]">
                      ₹ {selectedOrderModal.totalAmountRupees?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* ═══ 5. TOTAL ORDER AMOUNT ═══ */}
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 flex items-center justify-between">
                <span className="font-serif font-bold text-sm sm:text-base text-[#2C2016] uppercase tracking-wide">
                  TOTAL ORDER AMOUNT
                </span>
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#2C2016]">
                  ₹ {selectedOrderModal.totalAmountRupees?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </section>
          </div>
        );
      })()}

      {/* Confirmation Modal: Cancel Order */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => {
            if (!isCancelling) setCancelTarget(null);
          }}
        >
          <section
            className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FDEEEF] border border-[#FACDCF] flex items-center justify-center text-[#B82B33] shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C2016] uppercase tracking-wide leading-tight">
                  Cancel this order?
                </h3>
                <p className="text-xs text-[#7A6A58] mt-1 leading-relaxed">
                  Order{' '}
                  <span className="font-mono font-bold text-[#2C2016]">
                    {formatOrderNumber(cancelTarget.orderId)}
                  </span>{' '}
                  will be cancelled. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl border border-[#D5C7B6] bg-[#FFFDF9] hover:bg-[#F2ECE1] text-xs font-bold text-[#5A4838] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B82B33] hover:bg-[#9E242B] text-xs font-bold text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCancelling && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            feedback.type === 'success'
              ? 'border-[#8C6D3B]/40 bg-[#1A1817] text-[#FFFDF9]'
              : 'border-[#FACDCF] bg-[#FDEEEF] text-[#B82B33]'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="h-4 w-4 text-[#E5B85F]" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

