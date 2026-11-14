import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Edit3,
  Flower2,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export type ProductCategory =
  | 'Gemstones'
  | 'Rudraksha'
  | 'Yantra'
  | 'Astrology Books'
  | 'Spiritual Accessories';

export interface ProductItem {
  id: string;
  name: string;
  shortDescription: string;
  category: ProductCategory;
  priceRupees: number;
  mrpRupees: number;
  stock: number;
  inStock: boolean;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
}

// Category Configuration matching reference screenshot
const CATEGORY_CONFIG: Record<
  ProductCategory,
  {
    label: string;
    badgeClasses: string;
    icon: (props: { className?: string }) => React.JSX.Element;
  }
> = {
  Gemstones: {
    label: 'Gemstones',
    badgeClasses: 'bg-[#F3EEF9] text-[#71449B] border-[#E3D5F0]',
    icon: (props) => <Diamond {...props} strokeWidth={1.8} />,
  },
  Rudraksha: {
    label: 'Rudraksha',
    badgeClasses: 'bg-[#FDF0EE] text-[#9E3E34] border-[#FADCD7]',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className}>
        <circle cx="12" cy="12" r="6" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.4" />
      </svg>
    ),
  },
  Yantra: {
    label: 'Yantra',
    badgeClasses: 'bg-[#FEF7E6] text-[#A66E16] border-[#F9E5B8]',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={props.className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <polygon points="12,6 18,17 6,17" />
        <polygon points="12,18 6,7 18,7" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  'Astrology Books': {
    label: 'Astrology Books',
    badgeClasses: 'bg-[#EEF5FC] text-[#29689C] border-[#CCE2F7]',
    icon: (props) => <BookOpen {...props} strokeWidth={1.8} />,
  },
  'Spiritual Accessories': {
    label: 'Spiritual Accessories',
    badgeClasses: 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]',
    icon: (props) => <Flower2 {...props} strokeWidth={1.8} />,
  },
};

const PAGE_SIZE = 10;

/**
 * Rich artistic SVG product thumbnail matching the reference screenshot
 */
const ProductArtThumbnail: React.FC<{ product: ProductItem }> = ({ product }) => {
  if (product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:image'))) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 bg-[#FFFDF9] flex items-center justify-center">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  const cat = product.category;

  // 1. Rudraksha Mala (Brown beads with golden pendant/tassel)
  if (cat === 'Rudraksha') {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b from-[#8C5E24] via-[#5F380E] to-[#2B1704] relative">
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <circle cx="24" cy="20" r="10" fill="#6A3B12" stroke="#E6A84E" strokeWidth="1" strokeDasharray="2 2" />
          {/* Main Mukhi Bead */}
          <circle cx="24" cy="26" r="8" fill="#582C09" stroke="#E8AA50" strokeWidth="1.2" />
          {/* Mukhi Lines */}
          <path d="M24 18V34M17.5 21L30.5 31M17.5 31L30.5 21" stroke="#FCE6A4" strokeWidth="0.8" strokeLinecap="round" />
          {/* Golden Cap & Tassel */}
          <polygon points="21,18 27,18 24,14" fill="#FCE59F" />
          <circle cx="24" cy="13" r="1.5" fill="#FFEBB2" />
          <path d="M24 34V42M22 36L21 42M26 36L27 42" stroke="#D82A1B" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 2. Amethyst / Gemstone (Faceted oval sparkling purple gemstone)
  if (cat === 'Gemstones') {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b from-[#4A206B] via-[#2D1244] to-[#160624] relative">
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <ellipse cx="24" cy="24" rx="14" ry="12" fill="#8E44AD" />
          {/* Facets */}
          <polygon points="24,14 33,18 35,24 33,30 24,34 15,30 13,24 15,18" fill="#9B59B6" stroke="#D7BDE2" strokeWidth="0.8" />
          <polygon points="24,17 30,20 31,24 30,28 24,31 18,28 17,24 18,20" fill="#AF7AC5" />
          <ellipse cx="24" cy="24" rx="4.5" ry="3.5" fill="#E8DAEF" />
          {/* Highlights */}
          <circle cx="19" cy="19" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          <circle cx="28" cy="29" r="1" fill="#FFFFFF" fillOpacity="0.6" />
        </svg>
      </div>
    );
  }

  // 3. Shree Yantra (Golden Sacred Geometry on plate)
  if (cat === 'Yantra') {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b from-[#8C6228] via-[#5C3F14] to-[#2B1B06] relative">
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <rect x="7" y="7" width="34" height="34" rx="3" fill="#D49A3D" stroke="#FFE7A5" strokeWidth="1" />
          <circle cx="24" cy="24" r="13" stroke="#5F3C0C" strokeWidth="0.8" />
          <circle cx="24" cy="24" r="11" stroke="#5F3C0C" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
          {/* Interlocking Triangles */}
          <polygon points="24,15 32,29 16,29" stroke="#5F3C0C" strokeWidth="0.9" fill="#FDE49E" fillOpacity="0.3" />
          <polygon points="24,33 16,19 32,19" stroke="#5F3C0C" strokeWidth="0.9" fill="#FDE49E" fillOpacity="0.3" />
          <polygon points="24,18 29,27 19,27" stroke="#5F3C0C" strokeWidth="0.8" />
          <polygon points="24,30 19,21 29,21" stroke="#5F3C0C" strokeWidth="0.8" />
          <circle cx="24" cy="24" r="1.5" fill="#5F3C0C" />
        </svg>
      </div>
    );
  }

  // 4. Vedic Astrology Guide (Deep Blue & Gold Book)
  if (cat === 'Astrology Books') {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b from-[#1C2842] via-[#10192B] to-[#080D18] relative">
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <rect x="11" y="8" width="26" height="32" rx="2.5" fill="#1B263B" stroke="#E6B85C" strokeWidth="1" />
          <line x1="15" y1="8" x2="15" y2="40" stroke="#E6B85C" strokeWidth="0.8" />
          {/* Celestial Wheel */}
          <circle cx="25" cy="22" r="7" stroke="#FCE6A4" strokeWidth="0.8" />
          <circle cx="25" cy="22" r="4.5" stroke="#FCE6A4" strokeWidth="0.6" strokeDasharray="1 1" />
          <circle cx="25" cy="22" r="1.5" fill="#FCE6A4" />
          <line x1="17" y1="33" x2="33" y2="33" stroke="#FCE6A4" strokeWidth="1" />
          <line x1="19" y1="36" x2="31" y2="36" stroke="#FCE6A4" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // 5. Brass Dhoop Dani / Spiritual Accessories (Incense burner with smoke)
  return (
    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-b from-[#8A6328] via-[#5D4013] to-[#2B1B05] relative">
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        {/* Pedestal */}
        <ellipse cx="24" cy="38" rx="8" ry="2.5" fill="#D4993B" stroke="#FFEAA8" strokeWidth="0.8" />
        <rect x="22" y="32" width="4" height="6" fill="#C2872D" />
        {/* Bowl */}
        <path d="M14 26C14 31 18 34 24 34C30 34 34 31 34 26H14Z" fill="#D4993B" stroke="#FFEAA8" strokeWidth="0.8" />
        {/* Ornate Lid */}
        <path d="M15 25C15 20 20 16 24 16C28 16 33 20 33 25H15Z" fill="#FCE49E" stroke="#5F3E0C" strokeWidth="0.8" />
        <circle cx="24" cy="14" r="2" fill="#FFEAA8" stroke="#5F3E0C" strokeWidth="0.8" />
        {/* Incense Holes */}
        <circle cx="21" cy="22" r="1" fill="#5F3E0C" />
        <circle cx="24" cy="20" r="1" fill="#5F3E0C" />
        <circle cx="27" cy="22" r="1" fill="#5F3E0C" />
        {/* Swirling Smoke */}
        <path d="M24 11C23 8 26 6 25 4" stroke="#FFEAA8" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      </svg>
    </div>
  );
};

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [modalSaving, setModalSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Gemstones');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formImage, setFormImage] = useState<string | null>(null);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Load products strictly from backend API
  const loadBackendProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts({ page: 1, limit: 100 });
      if (data?.products && Array.isArray(data.products)) {
        const mapped: ProductItem[] = data.products.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          shortDescription: p.shortDescription || '',
          category: (p.category as ProductCategory) || 'Gemstones',
          priceRupees: p.priceRupees ?? Math.round((p.pricePaise || 0) / 100),
          mrpRupees: p.mrpRupees ?? Math.round((p.mrpPaise || 0) / 100),
          stock: p.stock ?? (p.inStock ? 25 : 0),
          inStock: p.inStock ?? true,
          isActive: p.isActive ?? true,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
        }));
        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendProducts();
  }, []);

  // Dynamic category counts from real database products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Gemstones: 0,
      Rudraksha: 0,
      Yantra: 0,
      'Astrology Books': 0,
      'Spiritual Accessories': 0,
    };
    for (const p of products) {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      } else {
        counts[p.category] = 1;
      }
    }
    return counts;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryTab === 'ALL' || p.category === selectedCategoryTab;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? p.isActive : !p.isActive);
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock'
          ? p.stock > 10
          : stockFilter === 'low_stock'
          ? p.stock > 0 && p.stock <= 10
          : p.stock === 0);
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesStock && matchesQuery;
    });
  }, [products, selectedCategoryTab, statusFilter, stockFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const displayedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstIndex = filteredProducts.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastIndex = filteredProducts.length ? Math.min(page * PAGE_SIZE, filteredProducts.length) : 0;

  const resetToFirstPage = () => setPage(1);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('999');
    setFormMrp('1499');
    setFormStock('25');
    setFormCategory('Gemstones');
    setFormIsActive(true);
    setFormImage(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.shortDescription);
    setFormPrice(String(p.priceRupees));
    setFormMrp(String(p.mrpRupees));
    setFormStock(String(p.stock));
    setFormCategory(p.category);
    setFormIsActive(p.isActive);
    setFormImage(p.imageUrl || null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Image File Upload (Base64)
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image file must be less than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Product (Create or Update in Backend)
  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const priceNum = Number(formPrice);
    const mrpNum = Number(formMrp);
    const stockNum = Number(formStock);

    if (!formName.trim()) {
      setModalError('Product name is required.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setModalError('Valid selling price is required.');
      return;
    }
    if (!Number.isFinite(mrpNum) || mrpNum < priceNum) {
      setModalError('MRP must be equal to or higher than Selling Price.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, {
          name: formName.trim(),
          shortDescription: formDescription.trim(),
          price: priceNum,
          mrp: mrpNum,
          category: formCategory,
          inStock: stockNum > 0,
          isActive: formIsActive,
          image: formImage || '',
        });

        showToast(`Product "${formName.trim()}" updated successfully.`);
      } else {
        await adminService.createProduct({
          name: formName.trim(),
          shortDescription: formDescription.trim() || formName.trim(),
          price: priceNum,
          mrp: mrpNum,
          category: formCategory,
          badge: 'None',
          image: formImage || '',
        });

        showToast(`Product "${formName.trim()}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadBackendProducts();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save product.');
    } finally {
      setModalSaving(false);
    }
  };

  // Instant Toggle Status (Active / Inactive)
  const handleToggleStatus = async (product: ProductItem) => {
    const nextStatus = !product.isActive;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: nextStatus } : p))
    );

    try {
      await adminService.toggleProductStatus(product.id, nextStatus);
      showToast(`"${product.name}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !nextStatus } : p))
      );
      showToast(err.message || 'Failed to update status.');
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteProduct(deletingProduct.id);
      showToast(`Product "${deletingProduct.name}" removed.`);
      setDeletingProduct(null);
      await loadBackendProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 top-6 z-[70] flex max-w-sm items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#EAF7EE] px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Metric Stat Cards Strip with Dynamic Database Counts */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Products */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Package className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Total Products</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {products.length}
            </div>
          </div>
        </div>

        {/* Gemstones */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Diamond className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Gemstones</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {categoryCounts.Gemstones || 0}
            </div>
          </div>
        </div>

        {/* Rudraksha */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            {CATEGORY_CONFIG.Rudraksha.icon({ className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Rudraksha</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {categoryCounts.Rudraksha || 0}
            </div>
          </div>
        </div>

        {/* Yantra */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            {CATEGORY_CONFIG.Yantra.icon({ className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Yantra</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {categoryCounts.Yantra || 0}
            </div>
          </div>
        </div>

        {/* Astrology Books */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <BookOpen className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Astrology Books</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {categoryCounts['Astrology Books'] || 0}
            </div>
          </div>
        </div>

        {/* Spiritual Accessories */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Flower2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Spiritual Accessories</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">
              {categoryCounts['Spiritual Accessories'] || 0}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Tabs (Pill Buttons) */}
      <section className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setSelectedCategoryTab('ALL');
            resetToFirstPage();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all cursor-pointer ${
            selectedCategoryTab === 'ALL'
              ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
              : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Products ({products.length})</span>
        </button>

        {(Object.keys(CATEGORY_CONFIG) as ProductCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isActive = selectedCategoryTab === cat;
          const Icon = cfg.icon;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategoryTab(cat);
                resetToFirstPage();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
                  : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>
                {cfg.label} ({count})
              </span>
            </button>
          );
        })}
      </section>

      {/* 3. Search and Actions Controls Bar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search product by name or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder:text-[#8C7A68] focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                resetToFirstPage();
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="active">Status: Active</option>
              <option value="inactive">Status: Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
          </div>

          {/* Stock Filter Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                resetToFirstPage();
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Stock: All</option>
              <option value="in_stock">Stock: In Stock</option>
              <option value="low_stock">Stock: Low Stock</option>
              <option value="out_of_stock">Stock: Out of Stock</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-[#FFFDF9] font-serif font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </section>

      {/* 4. Products Table Matching Reference Screenshot */}
      <section className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(44,32,22,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EADCCE] bg-[#FAF6F0]/80">
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider w-12 text-center">
                  #
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Product
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Price (₹)
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Stock
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Availability
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5D8]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#735e49]">
                    <span className="mx-auto mb-3 block h-8 w-8 rounded-full border-2 border-[#8C6D3B] border-t-transparent animate-spin" />
                    <span className="font-serif text-sm">Loading store inventory…</span>
                  </td>
                </tr>
              ) : displayedProducts.length ? (
                displayedProducts.map((product, index) => {
                  const catCfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.Gemstones;
                  const Icon = catCfg.icon;

                  // Availability logic
                  const isLow = product.stock > 0 && product.stock <= 10;
                  const isOut = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF6F0]/60 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-sm font-semibold text-[#5A4838] text-center">
                        {firstIndex + index}
                      </td>

                      {/* Product Thumbnail + Title + Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5 text-left">
                          <ProductArtThumbnail product={product} />
                          <div className="space-y-0.5">
                            <strong className="block font-serif text-[15px] font-bold text-[#2C2016] group-hover:text-[#8C6D3B] transition-colors leading-tight">
                              {product.name}
                            </strong>
                            <span className="block text-xs text-[#7A6A58] max-w-[240px] truncate">
                              {product.shortDescription}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill with Icon */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${catCfg.badgeClasses}`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{product.category}</span>
                        </span>
                      </td>

                      {/* Price (₹) */}
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#2C2016]">
                        ₹ {product.priceRupees.toLocaleString('en-IN')}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-center font-semibold text-sm text-[#2C2016]">
                        {product.stock}
                      </td>

                      {/* Availability Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border ${
                            isOut
                              ? 'bg-[#FDEEEF] text-[#B82B33] border-[#FACDCF]'
                              : isLow
                              ? 'bg-[#FEF4E6] text-[#B76718] border-[#FCDDBA]'
                              : 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={product.isActive}
                            onClick={() => handleToggleStatus(product)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                              product.isActive ? 'bg-[#382618]' : 'bg-[#E5D7C6]'
                            }`}
                            title={`Toggle visibility: ${product.isActive ? 'Active' : 'Inactive'}`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                product.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                            title="Edit Product"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg text-[#B82B33] hover:text-[#8C1B22] hover:bg-[#FDEEEF] transition-colors cursor-pointer"
                            title="Delete Product"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#806A57]">
                    {products.length === 0 ? (
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#F5EDE1] border border-[#E8DCCF] flex items-center justify-center text-[#8C6D3B] mb-3 shadow-inner">
                          <Package className="w-7 h-7" />
                        </div>
                        <h4 className="font-serif text-base font-bold text-[#2C2016] mb-1">
                          No Products in Store
                        </h4>
                        <p className="text-xs text-[#7A6A58] mb-4">
                          No products found in store. Click below to add your first authentic item.
                        </p>
                        <button
                          onClick={handleOpenCreate}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#382618] text-[#FFFDF9] font-serif text-xs font-bold hover:bg-[#4E3725] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Product</span>
                        </button>
                      </div>
                    ) : (
                      <span className="italic">No store products match the selected filters.</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#EADCCE] bg-[#FAF6F0]/40">
          <p className="font-serif text-sm text-[#665444]">
            Showing {firstIndex} – {lastIndex} of {filteredProducts.length} products
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Prev Button */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dynamic Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === pNum ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal: Add or Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl max-h-[92vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7 shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#B9884A]/20 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2016]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-[#7A6A58] mt-0.5">
                  Configure store listing, inventory quantity, and retail pricing
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {modalError && (
              <div className="mt-4 flex gap-2 rounded-xl border border-[#dd9c91] bg-[#fce9e5] p-3 text-sm text-[#8d2d25]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Product Name
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rudraksha Mala"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Category
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as ProductCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Selling Price (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="800"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  MRP (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    placeholder="1200"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Stock Inventory Quantity
                  <input
                    required
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="48"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-xl border border-[#E5D7C6] bg-[#FAF5EE] px-3.5 py-2.5 text-xs font-bold text-[#2C2016]">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="accent-[#8C6D3B] w-4 h-4"
                  />
                  <span>Publish product to active storefront</span>
                </label>
              </div>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Short Description / Tagline
                <input
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 5 Mukhi Original Rudraksha"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Product Image (File or URL)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {formImage ? (
                    <div className="relative w-16 h-16 rounded-xl border border-[#D9C4AB] overflow-hidden bg-[#FAF6F0] shrink-0">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImage(null)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-[#D9C4AB] bg-[#FAF6F0] flex items-center justify-center text-[#8C6D3B] shrink-0">
                      <Package className="w-6 h-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D9C4AB] bg-[#FAF5EE] hover:bg-[#F3EBE0] text-xs font-bold text-[#5A3810] transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File (Max 5MB)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-[#8C7A68]">or enter URL below</span>
                    </div>
                    <input
                      type="url"
                      value={formImage && formImage.startsWith('http') ? formImage : ''}
                      onChange={(e) => setFormImage(e.target.value || null)}
                      placeholder="https://images.example.com/product.jpg"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-xs text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                    />
                  </div>
                </div>
              </div>

              <footer className="flex justify-end gap-3 border-t border-[#B9884A]/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={modalSaving}
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {modalSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Product</span>
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2a170b]/50 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#dd9c91] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEEEF] text-[#B82B33]">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2016]">Delete Product</h2>
                <p className="text-xs text-[#7A6A58] mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#FACDCF] bg-[#FFF8F8] p-4 text-sm text-[#5E342B] leading-relaxed">
              <p>
                Are you sure you want to delete <strong>{deletingProduct.name}</strong> from the store catalog?
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#B9884A]/20 pt-4">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A53329] hover:bg-[#8B241C] text-sm font-bold text-white transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {deleteLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete Product</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
