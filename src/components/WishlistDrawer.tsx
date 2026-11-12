import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Loader2,
  PackageOpen,
  ShoppingCart,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoreProduct {
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
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [justAddedToCart, setJustAddedToCart] = useState<Record<string, boolean>>({});

  // Sync wishlist & cart IDs from localStorage
  const syncWishlist = useCallback(() => {
    try {
      const stored = localStorage.getItem('pc_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((id): id is string => typeof id === 'string')) {
          setWishlistIds(parsed);
          return parsed;
        }
      }
      setWishlistIds([]);
      return [];
    } catch {
      setWishlistIds([]);
      return [];
    }
  }, []);

  const syncCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('pc_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartIds(new Set(parsed));
          return;
        }
      }
      setCartIds(new Set());
    } catch {
      setCartIds(new Set());
    }
  }, []);

  // Fetch product details when drawer opens
  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/store/products', { params: { limit: '100' } });
      const allProducts: StoreProduct[] = res.data?.data?.products || [];
      setProducts(allProducts);
      try {
        sessionStorage.setItem('pc_store_products', JSON.stringify(allProducts));
      } catch {
        // Keep the wishlist usable when session storage is unavailable.
      }
    } catch (err) {
      console.error('Failed to fetch wishlist products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const ids = syncWishlist();
      syncCart();
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
      } else {
        let cachedProducts: StoreProduct[] = [];
        try {
          const cached = sessionStorage.getItem('pc_store_products');
          const parsed = cached ? JSON.parse(cached) : null;
          if (Array.isArray(parsed)) cachedProducts = parsed;
        } catch {
          // A cache miss falls back to the product API.
        }
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setLoading(false);
          fetchProducts(true);
        } else {
          fetchProducts();
        }
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, syncWishlist, syncCart, fetchProducts]);

  // Listen to store updates
  useEffect(() => {
    const handleUpdate = () => {
      syncWishlist();
      syncCart();
    };
    window.addEventListener('pc_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('pc_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncWishlist, syncCart]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Remove from wishlist
  const removeFromWishlist = (id: string) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    try {
      localStorage.setItem('pc_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('pc_store_updated'));
    } catch {
      // ignore
    }
  };

  // Add to cart
  const addToCart = (id: string) => {
    try {
      const stored = localStorage.getItem('pc_cart');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('pc_cart', JSON.stringify(list));
      }
      setCartIds(new Set(list));
      setJustAddedToCart((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setJustAddedToCart((prev) => ({ ...prev, [id]: false }));
      }, 1500);
      window.dispatchEvent(new Event('pc_store_updated'));
    } catch {
      // ignore
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistIds([]);
    try {
      localStorage.setItem('pc_wishlist', JSON.stringify([]));
      window.dispatchEvent(new Event('pc_store_updated'));
    } catch {
      // ignore
    }
  };

  // Matched wishlist items
  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Format currency
  const formatPrice = (rupees: number) =>
    new Intl.NumberFormat('en-IN').format(rupees);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" aria-modal="true" role="dialog">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-[#E5DDD0] bg-[#FFFDF9] shadow-[0_0_35px_rgba(0,0,0,0.18)] animate-slideInRight">
        {/* ═══ DRAWER HEADER ═══ */}
        <div className="flex items-center justify-between border-b border-[#E8E2D8] bg-[#FFFBF4] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0D5CD] bg-[#FDF3F0] text-[#A34335] shadow-xs">
              <Heart className="h-5 w-5 fill-[#A34335]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-[16px] font-bold uppercase tracking-[0.06em] text-[#171512]">
                  Your Wishlist
                </h2>
                <span className="rounded-full bg-[#A34335] px-2 py-0.5 text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              </div>
              <p className="font-cinzel text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#786F64]">
                Sacred saved archetypes & items
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist drawer"
            className="rounded-lg p-1.5 text-[#786F64] transition-colors hover:bg-[#8C6D3B]/10 hover:text-[#1A1817]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ═══ DRAWER BODY (SCROLLABLE LIST) ═══ */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#9A7130]" />
              <p className="font-cinzel text-xs font-semibold text-[#8C6D3B] uppercase tracking-wider">
                Loading wishlisted treasures...
              </p>
            </div>
          ) : wishlistedProducts.length === 0 ? (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D5C2A5] bg-[#FFF8EA] text-[#9A7130] shadow-sm">
                <PackageOpen className="h-8 w-8 stroke-[1.6]" />
              </div>
              <h3 className="mt-4 font-cinzel text-lg font-bold uppercase tracking-wider text-[#1A1817]">
                Your Wishlist is Empty
              </h3>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#786F64]">
                You haven&apos;t saved any sacred items yet. Explore our Cosmic Store and tap the heart icon on any gemstone, rudraksha, or sacred tool to save it here.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cosmic-store');
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#987033] via-[#B3873C] to-[#8E6529] px-6 py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.08em] text-white shadow-md transition-all hover:brightness-110 active:scale-98"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Explore Cosmic Store</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {wishlistedProducts.map((product) => {
                const inCart = cartIds.has(product.id);
                const justAdded = justAddedToCart[product.id];

                return (
                  <div
                    key={product.id}
                    className="group relative flex gap-3.5 overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white p-3.5 shadow-[0_2px_10px_rgba(40,30,15,0.04)] transition-all hover:border-[#D5C2A5] hover:shadow-[0_4px_16px_rgba(40,30,15,0.08)]"
                  >
                    {/* Thumbnail image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#EFE9DF] bg-[#FAF7F2]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.badge && product.badge !== 'None' && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#1A1817]/80 px-1.5 py-0.5 text-[8.5px] font-bold text-white uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7130]">
                              {product.category}
                            </span>
                            <h4 className="font-cinzel text-[14px] font-bold leading-snug text-[#1A1817]">
                              {product.name}
                            </h4>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(product.id)}
                            title="Remove from wishlist"
                            className="rounded-md p-1 text-[#A3998D] transition-colors hover:bg-[#FDF2F0] hover:text-[#A34335]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price line */}
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-[15px] font-bold text-[#1A1817]">
                            ₹{formatPrice(product.priceRupees)}
                          </span>
                          {product.mrpRupees > product.priceRupees && (
                            <>
                              <span className="text-xs text-[#A8A196] line-through">
                                ₹{formatPrice(product.mrpRupees)}
                              </span>
                              <span className="text-[11px] font-bold text-[#059669]">
                                -{product.discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Add to cart / In cart button */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(product.id)}
                          disabled={!product.inStock}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 px-3 font-cinzel text-[11px] font-bold uppercase tracking-[0.06em] transition-all ${
                            justAdded
                              ? 'bg-[#059669] text-white shadow-xs'
                              : inCart
                              ? 'border border-[#B8934E] bg-[#FFF8EA] text-[#765722]'
                              : product.inStock
                              ? 'bg-gradient-to-r from-[#7A5B28] to-[#9E711E] text-white shadow-xs hover:brightness-110 active:scale-98'
                              : 'cursor-not-allowed bg-[#E8E2D8] text-[#A09890]'
                          }`}
                        >
                          {justAdded ? (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5 stroke-[1.8]" />
                              <span>{inCart ? 'Add Another' : 'Move to Cart'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ DRAWER FOOTER ═══ */}
        <div className="border-t border-[#E8E2D8] bg-[#FFFBF4] p-3.5 space-y-2 text-center">
          {cartIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] font-cinzel text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Go to Cart ({cartIds.size} {cartIds.size === 1 ? 'item' : 'items'})</span>
            </button>
          )}
          {wishlistedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-[#8C2A2A] transition-colors hover:underline cursor-pointer"
            >
              Clear entire wishlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
