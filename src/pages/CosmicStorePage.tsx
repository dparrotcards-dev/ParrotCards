import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Diamond,
  Grid3X3,
  Heart,
  LayoutGrid,
  Loader2,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../services/api';

/* ──────────── types ──────────── */

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
  rating: number;
  ratingCount: number;
}

type SortOption = 'newest' | 'price_low' | 'price_high' | 'discount';

const CATEGORIES = [
  'All',
  'Gemstones',
  'Rudraksha',
  'Yantra',
  'Astrology Books',
  'Spiritual Accessories',
] as const;

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <LayoutGrid className="h-5 w-5" />,
  Gemstones: <Diamond className="h-5 w-5" />,
  Rudraksha: <span className="text-lg">📿</span>,
  Yantra: <Grid3X3 className="h-5 w-5" />,
  'Astrology Books': <BookOpen className="h-5 w-5" />,
  'Spiritual Accessories': <Sparkles className="h-5 w-5" />,
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
];

const BADGE_COLORS: Record<string, string> = {
  Bestseller: 'bg-[#D97706] text-white',
  Trending: 'bg-[#7C3AED] text-white',
  Recommended: 'bg-[#059669] text-white',
  'New Arrival': 'bg-[#2563EB] text-white',
};

/* ──────────── Component ──────────── */

export const CosmicStorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWishlistFilter = searchParams.get('wishlist') === 'true';

  // Fast session-cache initialization for instant 0ms rendering
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    try {
      const cached = sessionStorage.getItem('pc_store_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() => {
    try {
      const cached = sessionStorage.getItem('pc_store_counts');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return {};
  });

  const [totalProducts, setTotalProducts] = useState<number>(() => {
    try {
      const cached = sessionStorage.getItem('pc_store_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = sessionStorage.getItem('pc_store_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {
      // ignore
    }
    return true;
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('pc_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const [cartIds, setCartIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('pc_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map((x: any) => (typeof x === 'object' && x?.id ? x.id : String(x))));
        }
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const [cartToast, setCartToast] = useState<{ show: boolean; name: string }>({ show: false, name: '' });

  useEffect(() => {
    const syncCart = () => {
      try {
        const stored = localStorage.getItem('pc_cart');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartIds(new Set(parsed.map((x: any) => (typeof x === 'object' && x?.id ? x.id : String(x)))));
            return;
          }
        }
      } catch {
        // ignore
      }
      setCartIds(new Set());
    };
    window.addEventListener('pc_store_updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('pc_store_updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  // Filter panel state
  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Collapsible filter sections
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  /* ──── Fetch products (Fast background refresh with session cache) ──── */
  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent && products.length === 0) {
      setLoading(true);
    }
    try {
      const params: Record<string, string> = {
        sortBy,
        limit: '100',
      };
      if (searchQuery) params.search = searchQuery;
      if (priceRange[0] > 0) params.minPrice = String(priceRange[0]);
      if (priceRange[1] < 50000) params.maxPrice = String(priceRange[1]);
      if (inStockOnly) params.inStockOnly = 'true';

      const res = await api.get('/store/products', { params });
      const data = res.data.data;
      setProducts(data.products);
      setCategoryCounts(data.categoryCounts || {});
      setTotalProducts(data.pagination?.total || data.products.length);

      try {
        sessionStorage.setItem('pc_store_products', JSON.stringify(data.products));
        sessionStorage.setItem('pc_store_counts', JSON.stringify(data.categoryCounts || {}));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to fetch store products:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, searchQuery, priceRange, inStockOnly, products.length]);

  useEffect(() => {
    fetchProducts(products.length > 0);
  }, [fetchProducts]);

  /* ──── Filtered products (instant client-side category chip, checkbox & wishlist) ──── */
  const displayProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (isWishlistFilter) {
      list = list.filter((p) => wishlist.has(p.id));
    }
    if (filterCategories.size > 0) {
      list = list.filter((p) => filterCategories.has(p.category));
    }
    return list;
  }, [products, activeCategory, isWishlistFilter, wishlist, filterCategories]);

  /* ──── Wishlist toggle ──── */
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('pc_wishlist', JSON.stringify([...next]));
        window.dispatchEvent(new Event('pc_store_updated'));
      } catch {
        // ignore
      }
      return next;
    });
  };

  /* ──── Cart add ──── */
  const addToCart = (product: StoreProduct) => {
    try {
      const stored = localStorage.getItem('pc_cart');
      const list: any[] = stored ? JSON.parse(stored) : [];
      const item = list.find((x: any) =>
        typeof x === 'object' && x?.id ? x.id === product.id : x === product.id
      );
      if (item && typeof item === 'object') {
        item.quantity = (item.quantity || 1) + 1;
      } else if (!item) {
        list.push({ id: product.id, quantity: 1 });
      }
      localStorage.setItem('pc_cart', JSON.stringify(list));
      setCartIds((prev) => new Set([...prev, product.id]));
      window.dispatchEvent(new Event('pc_store_updated'));
      setCartToast({ show: true, name: product.name });
      setTimeout(() => setCartToast({ show: false, name: '' }), 3200);
    } catch {
      // ignore
    }
  };

  /* ──── Category filter checkbox toggle ──── */
  const toggleFilterCategory = (cat: string) => {
    setFilterCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  /* ──── Format price ──── */
  const formatPrice = (rupees: number) =>
    new Intl.NumberFormat('en-IN').format(rupees);

  /* ──── Filter sidebar content (shared between desktop and mobile) ──── */
  const FilterContent = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex w-full items-center justify-between pb-2 text-sm font-bold text-[#1A1817]"
        >
          Category
          {categoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {categoryOpen && (
          <div className="space-y-2 pt-1">
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#4A443D]">
                <input
                  type="checkbox"
                  checked={filterCategories.has(cat)}
                  onChange={() => toggleFilterCategory(cat)}
                  className="h-4 w-4 rounded border-[#C8C1B8] text-[#8C6D3B] accent-[#8C6D3B]"
                />
                {cat}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t border-[#E8E2D8] pt-4">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex w-full items-center justify-between pb-2 text-sm font-bold text-[#1A1817]"
        >
          Price Range
          {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {priceOpen && (
          <div className="pt-2">
            <input
              type="range"
              min={0}
              max={50000}
              step={100}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#8C6D3B]"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-[#6B635B]">
              <span>₹{formatPrice(priceRange[0])}</span>
              <span>₹{formatPrice(priceRange[1])}+</span>
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border-t border-[#E8E2D8] pt-4">
        <button
          onClick={() => setAvailabilityOpen(!availabilityOpen)}
          className="flex w-full items-center justify-between pb-2 text-sm font-bold text-[#1A1817]"
        >
          Availability
          {availabilityOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {availabilityOpen && (
          <div className="pt-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#4A443D]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="h-4 w-4 rounded border-[#C8C1B8] text-[#8C6D3B] accent-[#8C6D3B]"
              />
              In Stock Only
            </label>
          </div>
        )}
      </div>
    </div>
  );

  /* ──── Product Card ──── */
  const ProductCard = ({ product }: { product: StoreProduct }) => {
    const isWished = wishlist.has(product.id);

    return (
      <div className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[#E8E2D8] bg-white shadow-[0_2px_8px_rgba(70,50,20,0.04)] transition-all duration-200 hover:shadow-[0_6px_22px_rgba(70,50,20,0.10)] hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3.2] overflow-hidden bg-[#F7F3EE]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badge */}
          {product.badge && product.badge !== 'None' && (
            <span
              className={`absolute left-2 top-2 rounded-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[9.5px] font-bold shadow-xs uppercase tracking-wider ${
                BADGE_COLORS[product.badge] || 'bg-gray-700 text-white'
              }`}
            >
              {product.badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-colors hover:bg-white cursor-pointer"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                isWished ? 'fill-red-500 text-red-500' : 'text-[#9C958C]'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-3 justify-between">
          <div>
            <h3
              title={product.name}
              className="text-[12.5px] sm:text-[13px] font-bold leading-snug text-[#1A1817] line-clamp-1"
            >
              {product.name}
            </h3>
            <p className="mt-0.5 text-[10.5px] sm:text-[11px] leading-tight text-[#8B8178] line-clamp-1">
              {product.shortDescription}
            </p>

            {/* Price */}
            <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[13.5px] sm:text-[14px] font-bold text-[#1A1817]">
                ₹{formatPrice(product.priceRupees)}
              </span>
              {product.mrpRupees > product.priceRupees && (
                <>
                  <span className="text-[10.5px] sm:text-[11px] text-[#A09890] line-through">
                    ₹{formatPrice(product.mrpRupees)}
                  </span>
                  <span className="text-[10px] sm:text-[10.5px] font-semibold text-[#059669]">
                    -{product.discountPercent}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => addToCart(product)}
            className={`mt-2 flex h-7.5 sm:h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[11px] sm:text-[11.5px] font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !product.inStock
                ? 'cursor-not-allowed bg-[#E8E2D8] text-[#A09890]'
                : 'bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] text-white shadow-xs hover:brightness-105 active:scale-[0.98]'
            }`}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{!product.inStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="store-page flex-1 pb-10">
      {/* ═══ HERO BANNER ═══ */}
      <section
        className="store-hero relative mx-2 sm:mx-4 lg:mx-7 mt-2 sm:mt-3 flex min-h-[150px] sm:min-h-[180px] items-center overflow-hidden rounded-2xl sm:rounded-[20px] px-4 py-5 sm:px-10 sm:py-7 text-white lg:px-[7%]"
        aria-labelledby="store-title"
      >
        <div className="store-hero-copy relative z-10 max-w-[520px]">
          <div className="mb-1.5 flex items-center gap-2.5 text-[9.5px] font-semibold uppercase tracking-[0.35em] text-[#F5D881] sm:text-[10.5px]">
            <span className="h-px w-6 bg-[#E3B95A]" />
            Cosmic Store
          </div>
          <h1
            id="store-title"
            className="font-cinzel text-xl sm:text-2xl lg:text-[26px] font-bold uppercase tracking-[0.08em] leading-tight text-white"
          >
            Astrology &amp; Spiritual
            <br />
            Products
          </h1>
          <p className="mt-2 text-[11px] sm:text-xs text-[#F4EBDD] max-w-md leading-relaxed">
            Genuine, Energetically Charged &amp; Expert-Recommended
          </p>
          <a
            href="#products-section"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F4D788] to-[#D9A94D] px-4 py-2 font-cinzel text-xs font-bold uppercase tracking-wider text-[#2A1B11] shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Shop Now
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <div aria-hidden="true" className="store-hero-orbit absolute -right-10 top-[-200px] h-[520px] w-[520px] rounded-full border border-[#E5B85F]/40 sm:right-[13%] sm:top-[-215px]" />
        <div aria-hidden="true" className="store-hero-orbit store-hero-orbit-inner absolute -right-[-18px] top-[-135px] h-[390px] w-[390px] rounded-full border border-[#E5B85F]/25 sm:right-[20%] sm:top-[-145px]" />
        <div aria-hidden="true" className="store-hero-star absolute right-[45%] top-[15%] text-2xl text-[#F8D984]">✦</div>
        <div aria-hidden="true" className="store-hero-star absolute right-[12%] top-[20%] text-sm text-[#F8D984]">✧</div>
        <div aria-hidden="true" className="store-hero-visual absolute inset-y-0 right-0 hidden w-[54%] md:block" />
      </section>

      {/* ═══ CATEGORY TABS ═══ */}
      <div id="products-section" className="mx-auto mt-4 sm:mt-6 max-w-[1325px] px-2 sm:px-6 lg:px-7">
        <div className="no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setFilterCategories(new Set());
                }}
                className={`flex shrink-0 flex-col items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border px-3.5 py-2 sm:px-6 sm:py-3.5 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#8C6D3B] bg-[#FFFBF0] text-[#7A5B28] shadow-[0_2px_8px_rgba(140,109,59,0.12)]'
                    : 'border-[#E8E2D8] bg-white text-[#6B635B] hover:border-[#C8B88A] hover:bg-[#FEFCF7]'
                }`}
              >
                <span className={isActive ? 'text-[#8C6D3B]' : 'text-[#9C958C]'}>
                  {CATEGORY_ICONS[cat]}
                </span>
                <span className="whitespace-nowrap text-[11px] sm:text-[12px] font-semibold">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="mx-auto mt-4 sm:mt-6 max-w-[1325px] px-2 sm:px-6 lg:px-7">
        <div className="flex gap-6">
          {/* ─── LEFT SIDEBAR FILTERS (Desktop) ─── */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <h3 className="mb-3 font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#1A1817]">Filter Products</h3>
            <FilterContent />
          </aside>

          {/* ─── RIGHT: TOOLBAR + PRODUCTS GRID ─── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817]">
                {activeCategory === 'All' ? 'All Products' : activeCategory}{' '}
                <span className="font-normal font-sans text-xs text-[#8B8178]">({totalProducts})</span>
              </h2>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
                {/* Search (mobile-friendly) */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09890]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-44 md:w-48 rounded-lg border border-[#E0DAD0] bg-white pl-9 pr-3 text-[13px] text-[#1A1817] outline-none transition-colors placeholder:text-[#B8B1A8] focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/20"
                  />
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden text-[12px] text-[#6B635B] sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-9 rounded-lg border border-[#E0DAD0] bg-white px-2.5 sm:px-3 pr-7 sm:pr-8 text-xs sm:text-[13px] text-[#1A1817] outline-none transition-colors focus:border-[#8C6D3B]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E0DAD0] bg-white px-3 text-xs sm:text-[13px] text-[#6B635B] lg:hidden cursor-pointer"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Filters
                </button>
              </div>
            </div>

            {/* Active Wishlist Filter Banner */}
            {isWishlistFilter && (
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#F2D4CE] bg-[#FDF5F3] px-4 py-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A34335] text-white">
                    <Heart className="h-4 w-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#A34335]">
                      Your Wishlisted Items ({displayProducts.length})
                    </h3>
                    <p className="text-[11px] text-[#7A362C]">
                      Showing only sacred products saved to your personal wishlist
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('wishlist');
                    setSearchParams(next);
                  }}
                  className="rounded-lg border border-[#F0CECA] bg-white px-3 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-wider text-[#A34335] shadow-xs transition-colors hover:bg-[#FDF3F0]"
                >
                  Show All Products
                </button>
              </div>
            )}

            {/* Loading Skeleton Cards (instant visual feedback on cold load) */}
            {loading && products.length === 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-3.5 lg:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[#E8E2D8] bg-white p-3 shadow-xs animate-pulse"
                  >
                    <div className="aspect-[4/3.2] w-full rounded-lg bg-[#F0EBE1]" />
                    <div className="mt-2.5 h-3.5 w-3/4 rounded bg-[#E8E2D8]" />
                    <div className="mt-1.5 h-2.5 w-1/2 rounded bg-[#EFE9DF]" />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="h-4 w-14 rounded bg-[#E8E2D8]" />
                      <div className="h-7 w-20 rounded-lg bg-[#EFE9DF]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && displayProducts.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#D8BD83]/50 bg-[#FFFCF6] px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D8BD83]/70 bg-[#F6EBD8] text-[#93651E]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-cormorant text-2xl font-bold text-[#302419]">
                  {isWishlistFilter
                    ? 'Your Wishlist is Empty'
                    : searchQuery || filterCategories.size > 0
                    ? 'No products match your filters'
                    : 'Our collection is being curated'}
                </h3>
                <p className="mt-2 max-w-md text-sm text-[#746B60]">
                  {isWishlistFilter
                    ? 'You have not saved any items to your wishlist yet. Tap the heart icon on any product to save it!'
                    : searchQuery || filterCategories.size > 0
                    ? 'Try adjusting your filters or search to find what you are looking for.'
                    : 'The Cosmic Store has no products available right now. Check back soon!'}
                </p>
                {(isWishlistFilter || searchQuery || filterCategories.size > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategories(new Set());
                      setActiveCategory('All');
                      setPriceRange([0, 50000]);
                      setInStockOnly(false);
                      const next = new URLSearchParams(searchParams);
                      next.delete('wishlist');
                      setSearchParams(next);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#805511] to-[#9E711E] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                  >
                    {isWishlistFilter ? 'View All Store Products' : 'Clear Filters'}
                  </button>
                )}
              </div>
            )}

            {/* Product Grid (renders immediately from cache/memory with 0ms delay) */}
            {displayProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-3.5 lg:gap-4">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE FILTER DRAWER ═══ */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1817]">Filter Products</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2ECE1]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterContent />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#7A5B28] to-[#9E711E] py-3 text-sm font-bold text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Floating Add to Cart Toast Alert */}
      {cartToast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#8C6D3B]/40 bg-[#1A1817] px-4 py-3 text-xs text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8C6D3B] text-white">
            <ShoppingCart className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-semibold text-[#F4D788]">{cartToast.name}</p>
            <p className="text-[10px] text-[#D8D0C5]">Added to your Cosmic Cart</p>
          </div>
          <Link
            to="/cart"
            className="ml-2 rounded-lg bg-[#8C6D3B] px-2.5 py-1 font-cinzel text-[10px] font-bold uppercase tracking-wider text-white hover:brightness-110 transition-all"
          >
            View Cart →
          </Link>
        </div>
      )}
    </div>
  );
};
