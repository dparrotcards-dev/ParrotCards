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

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

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

      {/* Modal: View Single Order Details */}
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
