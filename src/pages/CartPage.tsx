import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Minus,
  PackageOpen,
  Plus,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { api } from '../services/api';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export interface StoreProduct {
  id: string;
  name: string;
  shortDescription: string;
  priceRupees: number;
  mrpRupees: number;
  discountPercent: number;
  badge: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  rating?: number;
  ratingCount?: number;
}

interface CartItemEntry {
  id: string;
  quantity: number;
}

interface PlacedOrder {
  orderId: string;
  date: string;
  items: {
    product: StoreProduct;
    quantity: number;
  }[];
  totalAmount: number;
  savings: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartEntries, setCartEntries] = useState<CartItemEntry[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, StoreProduct>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // Checkout modal / step
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [pincode, setPincode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [formError, setFormError] = useState<string>('');

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Sync cart from localStorage (supports both string[] and { id, quantity }[])
  const syncCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('pc_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized: CartItemEntry[] = parsed.map((item) => {
            if (typeof item === 'string') {
              return { id: item, quantity: 1 };
            } else if (item && typeof item === 'object' && item.id) {
              return { id: item.id, quantity: Math.max(1, Number(item.quantity) || 1) };
            }
            return { id: String(item), quantity: 1 };
          });
          setCartEntries(normalized);
          return;
        }
      }
      setCartEntries([]);
    } catch {
      setCartEntries([]);
    }
  }, []);

  // Sync wishlist IDs
  const syncWishlist = useCallback(() => {
    try {
      const stored = localStorage.getItem('pc_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistIds(new Set(parsed));
          return;
        }
      }
      setWishlistIds(new Set());
    } catch {
      setWishlistIds(new Set());
    }
  }, []);

  // Save cart back to localStorage and notify other components
  const persistCart = (entries: CartItemEntry[]) => {
    setCartEntries(entries);
    try {
      // Save as array of objects with id and quantity
      localStorage.setItem('pc_cart', JSON.stringify(entries));
      window.dispatchEvent(new Event('pc_store_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  };

  // Fetch all store products to map details
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/products', { params: { limit: '100' } });
      const productsList: StoreProduct[] = res.data?.data?.products || [];
      const map: Record<string, StoreProduct> = {};
      for (const p of productsList) {
        map[p.id] = p;
      }
      setProductsMap(map);
    } catch (err) {
      console.error('Failed to fetch store products for cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncCart();
    syncWishlist();
    fetchProducts();

    const handleUpdate = () => {
      syncCart();
      syncWishlist();
    };

    window.addEventListener('pc_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('pc_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncCart, syncWishlist, fetchProducts]);

  // Quantity handlers
  const handleIncreaseQty = (id: string) => {
    const next = cartEntries.map((item) =>
      item.id === id ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item
    );
    persistCart(next);
  };

  const handleDecreaseQty = (id: string) => {
    const existing = cartEntries.find((item) => item.id === id);
    if (!existing) return;
    if (existing.quantity <= 1) {
      handleRemoveItem(id);
      return;
    }
    const next = cartEntries.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity - 1 } : item
    );
    persistCart(next);
  };

  const handleRemoveItem = (id: string) => {
    const next = cartEntries.filter((item) => item.id !== id);
    persistCart(next);
    showToast('Item removed from cart');
  };

  const handleMoveToWishlist = (id: string) => {
    handleRemoveItem(id);
    try {
      const stored = localStorage.getItem('pc_wishlist');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('pc_wishlist', JSON.stringify(list));
      }
      setWishlistIds(new Set(list));
      window.dispatchEvent(new Event('pc_store_updated'));
      showToast('Item moved to Wishlist ✦');
    } catch {
      // ignore
    }
  };

  const handleClearCart = () => {
    persistCart([]);
    showToast('Cart cleared');
  };

  // Calculations
  const resolvedItems = cartEntries
    .map((entry) => ({
      entry,
      product: productsMap[entry.id],
    }))
    .filter((x): x is { entry: CartItemEntry; product: StoreProduct } => Boolean(x.product));

  const totalItemCount = cartEntries.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalMrp = resolvedItems.reduce(
    (sum, { entry, product }) => sum + product.mrpRupees * entry.quantity,
    0
  );

  const subtotalActual = resolvedItems.reduce(
    (sum, { entry, product }) => sum + product.priceRupees * entry.quantity,
    0
  );

  const discountOnMrp = subtotalMrp - subtotalActual;
  const deliveryCharge = subtotalActual > 0 ? (subtotalActual >= 500 ? 0 : 50) : 0;
  const totalPayable = Math.max(0, subtotalActual + deliveryCharge);
  const totalSavings = discountOnMrp;

  const formatPrice = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  // Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setFormError('Please enter a valid 6-digit Pincode');
      return;
    }
    if (!city.trim() || !stateName.trim() || !streetAddress.trim()) {
      setFormError('Please fill in complete street address, city, and state');
      return;
    }

    setCheckoutSubmitting(true);

    // ─── ONLINE PAYMENT VIA RAZORPAY ───
    if (paymentMethod === 'ONLINE') {
      try {
        // 1. Load Razorpay script
        const sdkLoaded = await paymentService.loadRazorpayScript();
        if (!sdkLoaded || !window.Razorpay) {
          throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
        }

        // 2. Create order on backend
        let rzpData: any = null;
        try {
          const res = await api.post('/store/create-order', {
            amountRupees: totalPayable,
            items: resolvedItems.map((x) => ({ productId: x.product.id, quantity: x.entry.quantity })),
            shippingAddress: {
              fullName,
              phone: cleanPhone,
              email,
              address: streetAddress,
              city,
              state: stateName,
              pincode,
            },
          });
          rzpData = res.data?.data;
        } catch (apiErr: any) {
          console.warn('Backend store order creation warning, continuing with Razorpay checkout:', apiErr);
        }

        const key = rzpData?.razorpayKeyId || 'rzp_live_Trg8FBuSWd05Wa';
        const amountPaise = rzpData?.amount || Math.round(totalPayable * 100);

        // 3. Configure Razorpay options and open modal
        const options: any = {
          key,
          amount: amountPaise,
          currency: 'INR',
          name: 'Parrot Cards · Cosmic Store',
          description: `Sacred Order (${totalItemCount} items)`,
          prefill: {
            name: fullName,
            email: email,
            contact: cleanPhone,
          },
          notes: {
            shipping_address: `${streetAddress}, ${city}, ${stateName} - ${pincode}`,
          },
          theme: {
            color: '#8C6D3B',
          },
          modal: {
            ondismiss: () => {
              setCheckoutSubmitting(false);
              showToast('Razorpay payment cancelled');
            },
          },
          handler: async (response: any) => {
            try {
              await api.post('/store/verify-payment', {
                razorpayOrderId: response.razorpay_order_id || rzpData?.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
            } catch {
              // proceed
            }

            const orderId = `PC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newOrder: PlacedOrder = {
              orderId,
              date: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              items: resolvedItems.map((x) => ({ product: x.product, quantity: x.entry.quantity })),
              totalAmount: totalPayable,
              savings: totalSavings,
              shippingAddress: {
                fullName,
                phone: cleanPhone,
                email,
                address: streetAddress,
                city,
                state: stateName,
                pincode,
              },
              paymentMethod: `Online (Razorpay: ${response.razorpay_payment_id})`,
            };

            try {
              const storedOrders = localStorage.getItem('pc_orders');
              const list: PlacedOrder[] = storedOrders ? JSON.parse(storedOrders) : [];
              list.unshift(newOrder);
              localStorage.setItem('pc_orders', JSON.stringify(list));
            } catch {
              // ignore
            }

            persistCart([]);
            setCheckoutSubmitting(false);
            setIsCheckoutOpen(false);
            setPlacedOrder(newOrder);
          },
        };

        if (rzpData?.razorpayOrderId && !rzpData.razorpayOrderId.startsWith('order_store_')) {
          options.order_id = rzpData.razorpayOrderId;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err: any) {
        setFormError(err.message || 'Failed to initialize Razorpay checkout');
        setCheckoutSubmitting(false);
        return;
      }
    }

    // ─── CASH ON DELIVERY (COD) ───
    setTimeout(() => {
      const orderId = `PC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: PlacedOrder = {
        orderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        items: resolvedItems.map((x) => ({ product: x.product, quantity: x.entry.quantity })),
        totalAmount: totalPayable,
        savings: totalSavings,
        shippingAddress: {
          fullName,
          phone: cleanPhone,
          email,
          address: streetAddress,
          city,
          state: stateName,
          pincode,
        },
        paymentMethod: 'Cash on Delivery (COD)',
      };

      try {
        const storedOrders = localStorage.getItem('pc_orders');
        const list: PlacedOrder[] = storedOrders ? JSON.parse(storedOrders) : [];
        list.unshift(newOrder);
        localStorage.setItem('pc_orders', JSON.stringify(list));
      } catch {
        // ignore
      }

      // Clear cart
      persistCart([]);
      setCheckoutSubmitting(false);
      setIsCheckoutOpen(false);
      setPlacedOrder(newOrder);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 pt-2 sm:pt-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#8C6D3B]/40 bg-[#1A1817] px-4 py-2.5 text-xs font-semibold text-[#FFFDF9] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="h-4 w-4 text-[#E5B85F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══ ORDER PLACED CELEBRATION VIEW ═══ */}
      {placedOrder ? (
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <div className="rounded-3xl border border-[#E5DDD0] bg-[#FFFDF9] p-6 sm:p-10 shadow-[0_12px_40px_rgba(70,50,20,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-10 w-10 stroke-[1.8]" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7130]">
              <span>Sacred Order Confirmed</span>
              <span>✦</span>
            </div>

            <h1 className="mt-1 font-cinzel text-2xl sm:text-3xl font-bold text-[#1A1817]">
              Blessings on Your Journey
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#6B635B] max-w-md mx-auto leading-relaxed">
              Your order <strong className="text-[#8C6D3B] font-mono font-bold">#{placedOrder.orderId}</strong> has been
              received. Our Vedic priests will consecrate and energize each artifact before dispatch.
            </p>

            {/* Order Details Card */}
            <div className="mt-6 rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2]/60 p-4 text-left text-xs text-[#5C5650] space-y-2">
              <div className="flex justify-between border-b border-[#E5DDD0] pb-2 font-cinzel font-bold text-[#1A1817]">
                <span>Order Summary</span>
                <span>₹{formatPrice(placedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium text-[#1A1817]">{placedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium text-[#1A1817]">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Deliver to:</span>
                <span className="font-medium text-[#1A1817] text-right">
                  {placedOrder.shippingAddress.fullName}, {placedOrder.shippingAddress.city} - {placedOrder.shippingAddress.pincode}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-emerald-700 font-semibold">
                <span>Total Savings:</span>
                <span>₹{formatPrice(placedOrder.savings)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/cosmic-store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
              <Link
                to="/deck"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#8C6D3B]/40 bg-white px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-[#8C6D3B] hover:bg-[#8C6D3B]/5 transition-all"
              >
                <span>View My Deck</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ STANDARD CART CONTAINER ═══ */
        <div className="mx-auto max-w-[1360px] px-3 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-xs text-[#8C6D3B] font-medium">
              <Link to="/cosmic-store" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Cosmic Store</span>
              </Link>
              <span>/</span>
              <span className="text-[#6B635B]">Cart</span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E5DDD0] pb-3">
              <div>
                <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1A1817] flex items-center gap-2.5">
                  <span>Shopping Cart</span>
                  {totalItemCount > 0 && (
                    <span className="font-cinzel text-xs sm:text-sm font-semibold text-[#8C6D3B] bg-[#8C6D3B]/10 px-2.5 py-0.5 rounded-full border border-[#8C6D3B]/25">
                      {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </h1>
                <p className="mt-0.5 font-cormorant italic text-xs sm:text-sm text-[#6B635B]">
                  Authentic, consecrated artifacts ready for your spiritual sanctuary.
                </p>
              </div>

              {resolvedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-[#8C2A2A] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>
          </div>

          {/* Cart Content: Empty or List */}
          {resolvedItems.length === 0 ? (
            /* ═══ EMPTY CART STATE ═══ */
            <div className="mx-auto max-w-lg rounded-3xl border border-[#E5DDD0] bg-[#FFFDF9] p-8 sm:p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF5EE] border border-[#8C6D3B]/30 text-[#8C6D3B]">
                <PackageOpen className="h-10 w-10 stroke-[1.5]" />
              </div>

              <h2 className="mt-4 font-cinzel text-xl sm:text-2xl font-bold text-[#1A1817]">
                Your Cosmic Cart is Empty
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-[#6B635B] leading-relaxed">
                You have not added any sacred gemstones, energized rudraksha, or temple yantras yet.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/cosmic-store"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] px-6 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-105 active:scale-95 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Explore Cosmic Store</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('pc_open_wishlist'))}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#8C6D3B]/40 bg-white px-5 py-3 font-cinzel text-xs font-bold uppercase tracking-wider text-[#8C6D3B] hover:bg-[#8C6D3B]/5 transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-[#A34335]" />
                  <span>View Wishlist</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[#E5DDD0] pt-6 text-[10px] text-[#6B635B]">
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="h-5 w-5 text-[#8C6D3B] mb-1" />
                  <span className="font-semibold text-[#1A1817]">100% Authentic</span>
                  <span>Temple Consecrated</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-5 w-5 text-[#8C6D3B] mb-1" />
                  <span className="font-semibold text-[#1A1817]">Free Shipping</span>
                  <span>On orders &gt; ₹499</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="h-5 w-5 text-[#8C6D3B] mb-1" />
                  <span className="font-semibold text-[#1A1817]">Vedic Ritual</span>
                  <span>Energized per order</span>
                </div>
              </div>
            </div>
          ) : (
            /* ═══ TWO-COLUMN CART GRID ═══ */
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              {/* LEFT COLUMN: CART ITEMS LIST (8 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-3 sm:space-y-4">
                {resolvedItems.map(({ entry, product }) => {
                  const isWishlisted = wishlistIds.has(product.id);
                  const itemTotal = product.priceRupees * entry.quantity;
                  const itemMrpTotal = product.mrpRupees * entry.quantity;

                  return (
                    <div
                      key={product.id}
                      className="group relative flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-2xl border border-[#E5DDD0] bg-[#FFFDF9] p-3 sm:p-4 shadow-[0_2px_8px_rgba(70,50,20,0.04)] transition-all hover:border-[#8C6D3B]/50"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#E5DDD0] bg-[#FAF5EE] mx-auto sm:mx-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl text-[#8C6D3B]">
                            ✦
                          </div>
                        )}
                        {product.badge && product.badge !== 'None' && (
                          <span className="absolute top-1 left-1 rounded bg-[#8C6D3B] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Product Info & Controls */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6D3B]">
                                {product.category}
                              </span>
                              <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#1A1817] leading-tight">
                                {product.name}
                              </h3>
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(product.id)}
                              title="Remove item"
                              className="text-[#9A9085] hover:text-[#8C2A2A] p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="mt-1 line-clamp-1 text-xs text-[#6B635B]">
                            {product.shortDescription}
                          </p>
                        </div>

                        {/* Price, Stepper & Action footer */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DDD0]/70 pt-2.5">
                          {/* Unit & Subtotal Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="font-cinzel text-base sm:text-lg font-bold text-[#1A1817]">
                              ₹{formatPrice(itemTotal)}
                            </span>
                            {product.mrpRupees > product.priceRupees && (
                              <>
                                <span className="text-xs text-[#9A9085] line-through">
                                  ₹{formatPrice(itemMrpTotal)}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  -{product.discountPercent}%
                                </span>
                              </>
                            )}
                          </div>

                          {/* Stepper & Wishlist buttons */}
                          <div className="flex items-center gap-2">
                            {/* Quantity Stepper */}
                            <div className="flex items-center rounded-lg border border-[#E5DDD0] bg-[#FAF7F2]">
                              <button
                                type="button"
                                onClick={() => handleDecreaseQty(product.id)}
                                title={entry.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                                className="flex h-7 w-7 items-center justify-center text-[#6B635B] hover:text-[#1A1817] hover:bg-[#8C6D3B]/10 rounded-l-lg transition-colors cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center font-cinzel text-xs font-bold text-[#1A1817]">
                                {entry.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncreaseQty(product.id)}
                                title="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center text-[#6B635B] hover:text-[#1A1817] hover:bg-[#8C6D3B]/10 rounded-r-lg transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Move to Wishlist */}
                            <button
                              type="button"
                              onClick={() => handleMoveToWishlist(product.id)}
                              title="Move to Wishlist"
                              className="flex items-center gap-1 rounded-lg border border-[#E5DDD0] bg-white px-2.5 py-1 text-xs text-[#6B635B] hover:text-[#8C6D3B] hover:border-[#8C6D3B]/40 transition-colors cursor-pointer"
                            >
                              <Heart
                                className={`h-3.5 w-3.5 ${
                                  isWishlisted ? 'fill-[#A34335] text-[#A34335]' : 'text-[#6B635B]'
                                }`}
                              />
                              <span className="hidden sm:inline">Wishlist</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY CARD (4 cols / sticky) */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-20 rounded-2xl border border-[#E5DDD0] bg-[#FFFDF9] p-4 sm:p-5 shadow-[0_4px_16px_rgba(70,50,20,0.06)]">
                  <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817] border-b border-[#E5DDD0] pb-2.5">
                    Order Summary
                  </h2>

                  {/* Price Breakdown */}
                  <div className="mt-3.5 space-y-2.5 text-xs text-[#5C5650]">
                    <div className="flex justify-between">
                      <span>Total MRP ({totalItemCount} items)</span>
                      <span>₹{formatPrice(subtotalMrp)}</span>
                    </div>

                    {discountOnMrp > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount on MRP</span>
                        <span>-₹{formatPrice(discountOnMrp)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <span>Vedic Consecration &amp; Puja</span>
                        <span className="text-[10px] text-[#8C6D3B]">✦</span>
                      </span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Delivery Fee</span>
                      {deliveryCharge === 0 ? (
                        <span className="font-semibold text-emerald-600">FREE</span>
                      ) : (
                        <span>₹{deliveryCharge}</span>
                      )}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="mt-4 border-t-2 border-[#E5DDD0] pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#6B635B] block">
                        Total Amount
                      </span>
                      <span className="text-[10px] text-[#9A9085]">Inclusive of all Vedic rituals</span>
                    </div>
                    <span className="font-cinzel text-xl sm:text-2xl font-bold text-[#8C6D3B]">
                      ₹{formatPrice(totalPayable)}
                    </span>
                  </div>

                  {/* Savings Banner */}
                  {totalSavings > 0 && (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700">
                      You will save ₹{formatPrice(totalSavings)} on this order!
                    </div>
                  )}

                  {/* Proceed to Checkout CTA */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] font-cinzel text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Trust footer */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[10.5px] text-[#6B635B]">
                    <Shield className="h-3.5 w-3.5 text-[#8C6D3B]" />
                    <span>100% Secure Checkout &amp; Vedic Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ CHECKOUT & SHIPPING ADDRESS MODAL ═══ */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E5DDD0] bg-[#FFFDF9] p-5 sm:p-7 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D3B]">
                  Shipping &amp; Checkout
                </span>
                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#1A1817]">
                  Delivery Address
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-[#9A9085] hover:text-[#1A1817] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
                {formError}
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#5C5650] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varun Menariya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#5C5650] block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#5C5650] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#5C5650] block mb-1">
                  Street Address &amp; House/Flat No *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House/Apartment, Street name, Landmark"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DDD0] bg-white px-3 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-[#5C5650] block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="313001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DDD0] bg-white px-2.5 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#5C5650] block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DDD0] bg-white px-2.5 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#5C5650] block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DDD0] bg-white px-2.5 py-2 text-xs text-[#1A1817] outline-none focus:border-[#8C6D3B]"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="border-t border-[#E5DDD0] pt-3">
                <label className="text-[11px] font-semibold text-[#5C5650] block mb-1.5">
                  Choose Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`flex flex-col gap-1 rounded-xl border p-2.5 text-xs text-left cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-[#8C6D3B] bg-[#8C6D3B]/10 font-bold text-[#765722] ring-1 ring-[#8C6D3B]'
                        : 'border-[#E5DDD0] bg-white text-[#6B635B] hover:border-[#8C6D3B]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'ONLINE' ? 'border-[#8C6D3B] bg-[#8C6D3B]' : 'border-[#9A9085]'
                        }`}
                      >
                        {paymentMethod === 'ONLINE' && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="font-bold">Online (Razorpay)</span>
                    </div>
                    <span className="text-[10px] text-[#8C6D3B] pl-5 font-normal">
                      UPI, Cards, Netbanking
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex flex-col gap-1 rounded-xl border p-2.5 text-xs text-left cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#8C6D3B] bg-[#8C6D3B]/10 font-bold text-[#765722] ring-1 ring-[#8C6D3B]'
                        : 'border-[#E5DDD0] bg-white text-[#6B635B] hover:border-[#8C6D3B]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'COD' ? 'border-[#8C6D3B] bg-[#8C6D3B]' : 'border-[#9A9085]'
                        }`}
                      >
                        {paymentMethod === 'COD' && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="font-bold">Cash on Delivery</span>
                    </div>
                    <span className="text-[10px] text-[#6B635B] pl-5 font-normal">
                      Pay at your doorstep
                    </span>
                  </button>
                </div>
              </div>

              {/* Order Final Amount & Submit */}
              <div className="border-t border-[#E5DDD0] pt-3">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-[#6B635B]">Payable Amount:</span>
                  <span className="font-cinzel text-xl font-bold text-[#8C6D3B]">
                    ₹{formatPrice(totalPayable)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] font-cinzel text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {checkoutSubmitting ? (
                    <span>Opening Razorpay Gateway...</span>
                  ) : paymentMethod === 'ONLINE' ? (
                    <>
                      <span>Pay ₹{formatPrice(totalPayable)} via Razorpay</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Confirm Cash on Delivery Order (₹{formatPrice(totalPayable)})</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

