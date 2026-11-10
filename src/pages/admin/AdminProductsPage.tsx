import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  CloudUpload,
  X,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export interface AdminProductItem {
  id: string;
  name: string;
  shortDescription: string;
  priceRupees: number;
  mrpRupees: number;
  discountPercent: number;
  badge: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  inStock: boolean;
  createdAt: string;
}

const CATEGORIES = [
  'All',
  'Gemstones',
  'Rudraksha',
  'Yantra',
  'Astrology Books',
  'Spiritual Accessories',
] as const;

const BADGES = ['None', 'Bestseller', 'Trending', 'Recommended', 'New Arrival'] as const;

const BADGE_COLORS: Record<string, string> = {
  Bestseller: 'bg-[#D97706]/20 text-[#F59E0B] border-[#D97706]/40',
  Trending: 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40',
  Recommended: 'bg-[#059669]/20 text-[#34D399] border-[#059669]/40',
  'New Arrival': 'bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/40',
};

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    inStockCount: 0,
    outOfStockCount: 0,
    activeCount: 0,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [modalSaving, setModalSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Gemstones');
  const [formBadge, setFormBadge] = useState<string>('None');
  const [formInStock, setFormInStock] = useState<boolean>(true);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formImage, setFormImage] = useState<string | null>(null);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<AdminProductItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts({
        page,
        limit: 12,
        search,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        inStock: stockFilter === 'in_stock' ? 'true' : stockFilter === 'out_of_stock' ? 'false' : undefined,
        isActive: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined,
      });

      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load store products:', err);
      showToast('Error loading store products.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, stockFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormMrp('');
    setFormCategory('Gemstones');
    setFormBadge('None');
    setFormInStock(true);
    setFormIsActive(true);
    setFormImage(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (p: AdminProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.shortDescription);
    setFormPrice(String(p.priceRupees));
    setFormMrp(String(p.mrpRupees));
    setFormCategory(p.category);
    setFormBadge(p.badge || 'None');
    setFormInStock(p.inStock);
    setFormIsActive(p.isActive);
    setFormImage(p.imageUrl);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setModalError(null);
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setModalError('Please upload a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      } else {
        setModalError('Could not read image file.');
      }
    };
    reader.onerror = () => setModalError('Error uploading image.');
    reader.readAsDataURL(file);
  };

  // Save (Create or Update)
  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const priceNum = Number(formPrice);
    const mrpNum = Number(formMrp);

    if (!formName.trim()) {
      setModalError('Product name is required.');
      return;
    }
    if (!formDescription.trim()) {
      setModalError('Short description is required.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setModalError('Selling price must be a positive number.');
      return;
    }
    if (!Number.isFinite(mrpNum) || mrpNum < priceNum) {
      setModalError('MRP must be equal to or higher than Selling Price.');
      return;
    }
    if (!formImage) {
      setModalError('Product image is required.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        await adminService.updateProduct(editingProduct.id, {
          name: formName.trim(),
          shortDescription: formDescription.trim(),
          price: priceNum,
          mrp: mrpNum,
          category: formCategory,
          badge: formBadge,
          inStock: formInStock,
          isActive: formIsActive,
          image: formImage,
        });
        showToast(`Product "${formName}" updated successfully.`);
      } else {
        // Create new product
        await adminService.createProduct({
          name: formName.trim(),
          shortDescription: formDescription.trim(),
          price: priceNum,
          mrp: mrpNum,
          category: formCategory,
          badge: formBadge,
          image: formImage,
        });
        showToast(`Product "${formName}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setModalSaving(false);
    }
  };

  // Instant In-Stock Toggle
  const handleToggleStock = async (product: AdminProductItem) => {
    const newStock = !product.inStock;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: newStock } : p))
      );
      await adminService.toggleProductStock(product.id, newStock);
      showToast(`"${product.name}" marked as ${newStock ? 'In Stock' : 'Out of Stock'}.`);
    } catch {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: product.inStock } : p))
      );
      showToast('Failed to update stock status.');
    }
  };

  // Instant Active Toggle
  const handleToggleStatus = async (product: AdminProductItem) => {
    const newStatus = !product.isActive;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
      );
      await adminService.toggleProductStatus(product.id, newStatus);
      showToast(`"${product.name}" marked as ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: product.isActive } : p))
      );
      showToast('Failed to update visibility status.');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteProduct(deletingProduct.id);
      showToast(`Product "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const calculatedDiscount =
    Number(formPrice) > 0 && Number(formMrp) >= Number(formPrice)
      ? Math.round(((Number(formMrp) - Number(formPrice)) / Number(formMrp)) * 100)
      : 0;

  return (
    <div className="space-y-6 text-[#F4F0E7]">
      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#D9A638]/40 bg-[#171626] px-5 py-3.5 text-sm font-medium text-[#F4F0E7] shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-[#D9A638]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══ HEADER BAR ═══ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#383654] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9A638]/15 border border-[#D9A638]/30 text-[#D9A638] shadow-inner">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-white">
                Cosmic Store Management
              </h1>
              <p className="text-xs text-[#AAA8B5]">
                Curate gemstones, rudrakshas, yantras, sacred books & spiritual merchandise.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/cosmic-store"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-[#383654] bg-[#171626] px-3.5 py-2 text-xs font-semibold text-[#D4CEBE] transition-colors hover:border-[#D9A638]/50 hover:text-white"
          >
            <span>Live Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => fetchProducts()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[#383654] bg-[#171626] px-3.5 py-2 text-xs font-semibold text-[#D4CEBE] transition-colors hover:border-[#D9A638]/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#D9A638]' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A638] to-[#B38322] px-4 py-2 text-xs font-bold text-[#11101F] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* ═══ METRICS SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-[#383654] bg-[#171626]/80 p-4 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-[#AAA8B5]">
            <span>Total Catalog</span>
            <Package className="h-4 w-4 text-[#D9A638]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-white">{metrics.totalProducts}</span>
            <span className="text-[11px] text-[#AAA8B5]">products</span>
          </div>
        </div>

        {/* In Stock */}
        <div className="rounded-2xl border border-[#383654] bg-[#171626]/80 p-4 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-[#AAA8B5]">
            <span>In Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-emerald-400">{metrics.inStockCount}</span>
            <span className="text-[11px] text-emerald-500/80">ready to ship</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl border border-[#383654] bg-[#171626]/80 p-4 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-[#AAA8B5]">
            <span>Out of Stock</span>
            <XCircle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-amber-400">{metrics.outOfStockCount}</span>
            <span className="text-[11px] text-amber-500/80">needs restock</span>
          </div>
        </div>

        {/* Active Visibility */}
        <div className="rounded-2xl border border-[#383654] bg-[#171626]/80 p-4 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-[#AAA8B5]">
            <span>Active Store Visibility</span>
            <Sparkles className="h-4 w-4 text-[#D9A638]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-white">{metrics.activeCount}</span>
            <span className="text-[11px] text-[#AAA8B5]">live on web</span>
          </div>
        </div>
      </div>

      {/* ═══ SEARCH & FILTERS BAR ═══ */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#383654] bg-[#171626] p-4 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAA8B5]" />
          <input
            type="text"
            placeholder="Search by product name or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] pl-10 pr-4 text-xs text-[#F4F0E7] outline-none transition-colors placeholder:text-[#888599] focus:border-[#D9A638]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-[#383654] bg-[#10101F] px-3 text-xs text-[#F4F0E7] outline-none transition-colors focus:border-[#D9A638]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-[#383654] bg-[#10101F] px-3 text-xs text-[#F4F0E7] outline-none transition-colors focus:border-[#D9A638]"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-[#383654] bg-[#10101F] px-3 text-xs text-[#F4F0E7] outline-none transition-colors focus:border-[#D9A638]"
          >
            <option value="all">All Status</option>
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>

          {(search || categoryFilter !== 'All' || stockFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setStockFilter('all');
                setStatusFilter('all');
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#7A1C1C]/40 bg-[#7A1C1C]/20 px-3 text-xs font-semibold text-rose-300 hover:bg-[#7A1C1C]/30"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ═══ PRODUCTS TABLE ═══ */}
      <div className="overflow-hidden rounded-2xl border border-[#383654] bg-[#171626] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#383654] bg-[#11101F]/80 text-[#AAA8B5] font-cinzel tracking-wider uppercase">
                <th className="py-3.5 pl-4 pr-2">Product</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Price & MRP</th>
                <th className="py-3.5 px-3">Badge</th>
                <th className="py-3.5 px-3 text-center">Stock</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#383654]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#AAA8B5]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D9A638] border-t-transparent" />
                      <span>Loading products catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#AAA8B5]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="h-10 w-10 text-[#AAA8B5]/50" />
                      <p className="font-serif text-base text-[#D4CEBE]">No Cosmic Store Products Found</p>
                      <p className="text-xs text-[#888599]">Try modifying your filters or click below to add a product.</p>
                      <button
                        onClick={handleOpenCreate}
                        className="mt-2 flex items-center gap-2 rounded-xl bg-[#D9A638] px-4 py-2 text-xs font-bold text-[#11101F]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add First Product</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-[#1C1A2E]/60"
                  >
                    {/* Product & Image */}
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#383654] bg-[#11101F]">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-white truncate text-[13px]">{product.name}</p>
                          <p className="text-[11px] text-[#AAA8B5] truncate mt-0.5">{product.shortDescription}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block rounded-md border border-[#383654] bg-[#10101F] px-2.5 py-1 text-[11px] font-medium text-[#D4CEBE]">
                        {product.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-[#D9A638] text-[13px]">
                            ₹{product.priceRupees.toLocaleString('en-IN')}
                          </span>
                          {product.mrpRupees > product.priceRupees && (
                            <span className="text-[11px] text-[#888599] line-through">
                              ₹{product.mrpRupees.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {product.discountPercent > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-400 mt-0.5">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-3">
                      {product.badge && product.badge !== 'None' ? (
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            BADGE_COLORS[product.badge] || 'border-[#383654] bg-[#10101F] text-white'
                          }`}
                        >
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#888599]">—</span>
                      )}
                    </td>

                    {/* Stock Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          product.inStock
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                            : 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                        }`}
                        title="Click to toggle stock status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.inStock ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Status Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          product.isActive
                            ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                            : 'border-zinc-500/40 bg-zinc-500/15 text-zinc-400 hover:bg-zinc-500/25'
                        }`}
                        title="Click to toggle store visibility"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.isActive ? 'bg-cyan-400' : 'bg-zinc-500'
                          }`}
                        />
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          title="Edit product"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#383654] bg-[#10101F] text-[#AAA8B5] transition-colors hover:border-[#D9A638] hover:text-[#D9A638]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          title="Delete product"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#7A1C1C]/40 bg-[#10101F] text-rose-400 transition-colors hover:bg-rose-500/15 hover:border-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ PAGINATION ═══ */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#383654] bg-[#11101F]/80 px-4 py-3">
            <span className="text-xs text-[#AAA8B5]">
              Showing <span className="font-semibold text-white">{(page - 1) * 12 + 1}</span> to{' '}
              <span className="font-semibold text-white">{Math.min(page * 12, totalCount)}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#383654] bg-[#171626] text-xs text-[#D4CEBE] transition-colors hover:border-[#D9A638] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-xs text-[#AAA8B5]">
                Page <span className="font-bold text-white">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#383654] bg-[#171626] text-xs text-[#D4CEBE] transition-colors hover:border-[#D9A638] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ADD / EDIT PRODUCT MODAL ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#383654] bg-[#171626] p-6 text-[#F4F0E7] shadow-2xl no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#383654] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A638]/15 border border-[#D9A638]/30 text-[#D9A638]">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-white">
                    {editingProduct ? 'Edit Cosmic Store Product' : 'Add New Cosmic Store Product'}
                  </h2>
                  <p className="text-[11px] text-[#AAA8B5]">
                    {editingProduct ? 'Update product details, pricing and inventory.' : 'Add a new sacred talisman or merchandise to the store catalog.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-[#AAA8B5] hover:bg-[#383654]/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-[#D4CEBE]">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natural Blue Sapphire (Neelam)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] px-3.5 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="text-xs font-semibold text-[#D4CEBE]">
                  Short Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={120}
                  placeholder="A concise summary of energetic potency, astrological benefits, or origin..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#383654] bg-[#10101F] p-3 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                />
                <span className="text-[10px] text-[#888599]">{formDescription.length}/120 characters</span>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[#D4CEBE]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] px-3 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#D4CEBE]">Promotional Badge</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] px-3 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                  >
                    {BADGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing (Selling Price & MRP) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-[#D4CEBE]">
                    Selling Price (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 4999"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] px-3.5 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#D4CEBE]">
                    MRP Price (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 7999"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#383654] bg-[#10101F] px-3.5 text-xs text-white outline-none transition-colors focus:border-[#D9A638]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#D4CEBE]">Auto Discount</label>
                  <div className="mt-1.5 flex h-10 items-center rounded-xl border border-[#383654] bg-[#10101F] px-3.5 text-xs font-bold text-emerald-400">
                    {calculatedDiscount > 0 ? `${calculatedDiscount}% Discount` : 'No Discount'}
                  </div>
                </div>
              </div>

              {/* Stock and Active Switches */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[#383654] bg-[#10101F] p-3.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#D4CEBE]">
                  <input
                    type="checkbox"
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-[#383654] bg-[#171626] text-[#D9A638] accent-[#D9A638]"
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#D4CEBE]">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-[#383654] bg-[#171626] text-[#D9A638] accent-[#D9A638]"
                  />
                  <span>Visible in Cosmic Store (Active)</span>
                </label>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="text-xs font-semibold text-[#D4CEBE]">
                  Product Image <span className="text-rose-400">*</span>
                </label>
                <div className="mt-1.5 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#383654] bg-[#10101F] p-4 text-center sm:flex-row sm:text-left">
                  {formImage ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#383654]">
                      <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImage(null)}
                        className="absolute top-1 right-1 rounded-full bg-black/75 p-1 text-white hover:bg-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[#383654] bg-[#171626] text-[#888599]">
                      <CloudUpload className="h-8 w-8" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#383654] bg-[#171626] px-4 py-2 text-xs font-semibold text-[#D9A638] transition-colors hover:border-[#D9A638]">
                      <CloudUpload className="h-4 w-4" />
                      <span>{formImage ? 'Change Image' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-[11px] text-[#888599]">
                      Supports PNG, JPG, or WEBP up to 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-[#383654] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#383654] px-4 py-2 text-xs font-semibold text-[#AAA8B5] transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A638] to-[#B38322] px-5 py-2 text-xs font-bold text-[#11101F] shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {modalSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#11101F] border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl border border-[#7A1C1C]/40 bg-[#171626] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7A1C1C]/20 border border-[#7A1C1C]/40 text-rose-400">
              <Trash2 className="h-7 w-7" />
            </div>

            <h3 className="mt-4 font-serif text-lg font-bold text-white">Delete Product</h3>
            <p className="mt-2 text-xs text-[#AAA8B5] leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <span className="font-semibold text-rose-300">"{deletingProduct.name}"</span> from the Cosmic Store catalog?
            </p>

            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-[#383654] bg-[#10101F] p-3 text-left">
              <img
                src={deletingProduct.imageUrl}
                alt={deletingProduct.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{deletingProduct.name}</p>
                <p className="text-[11px] text-[#D9A638]">₹{deletingProduct.priceRupees.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleteLoading}
                className="rounded-xl border border-[#383654] px-4 py-2 text-xs font-semibold text-[#AAA8B5] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

