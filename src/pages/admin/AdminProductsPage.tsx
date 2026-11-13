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
  sku: string;
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
    defaultCount: number;
  }
> = {
  Gemstones: {
    label: 'Gemstones',
    badgeClasses: 'bg-[#F3EEF9] text-[#71449B] border-[#E3D5F0]',
    icon: (props) => <Diamond {...props} strokeWidth={1.8} />,
    defaultCount: 72,
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
    defaultCount: 58,
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
    defaultCount: 36,
  },
  'Astrology Books': {
    label: 'Astrology Books',
    badgeClasses: 'bg-[#EEF5FC] text-[#29689C] border-[#CCE2F7]',
    icon: (props) => <BookOpen {...props} strokeWidth={1.8} />,
    defaultCount: 28,
  },
  'Spiritual Accessories': {
    label: 'Spiritual Accessories',
    badgeClasses: 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]',
    icon: (props) => <Flower2 {...props} strokeWidth={1.8} />,
    defaultCount: 54,
  },
};

// Seed / Showcase products matching the user's reference screenshot
const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-rud-001',
    name: 'Rudraksha Mala',
    shortDescription: '5 Mukhi Original Rudraksha',
    sku: 'RUD-001',
    category: 'Rudraksha',
    priceRupees: 800,
    mrpRupees: 1200,
    stock: 48,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-gem-014',
    name: 'Amethyst Gemstone',
    shortDescription: 'Natural & Certified',
    sku: 'GEM-014',
    category: 'Gemstones',
    priceRupees: 4200,
    mrpRupees: 5500,
    stock: 12,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-ynt-009',
    name: 'Shree Yantra',
    shortDescription: 'For Wealth & Prosperity',
    sku: 'YNT-009',
    category: 'Yantra',
    priceRupees: 1499,
    mrpRupees: 2200,
    stock: 25,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-bk-003',
    name: 'Vedic Astrology Guide',
    shortDescription: "A Complete Beginner's Book",
    sku: 'BK-003',
    category: 'Astrology Books',
    priceRupees: 599,
    mrpRupees: 899,
    stock: 36,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-acc-027',
    name: 'Brass Dhoop Dani',
    shortDescription: 'For Daily पूजा & Rituals',
    sku: 'ACC-027',
    category: 'Spiritual Accessories',
    priceRupees: 1200,
    mrpRupees: 1800,
    stock: 8,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-gem-022',
    name: 'Yellow Sapphire (Pukhraj)',
    shortDescription: 'Jupiter Cosmic Stone · Lab Certified',
    sku: 'GEM-022',
    category: 'Gemstones',
    priceRupees: 11500,
    mrpRupees: 14000,
    stock: 5,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-rud-007',
    name: 'Ek Mukhi Rudraksha',
    shortDescription: 'Nepal Origin · Rare Shiva Bead',
    sku: 'RUD-007',
    category: 'Rudraksha',
    priceRupees: 8500,
    mrpRupees: 10500,
    stock: 3,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-ynt-015',
    name: 'Kuber Yantra Plate',
    shortDescription: 'Pure Copper Gold-Plated Embossed',
    sku: 'YNT-015',
    category: 'Yantra',
    priceRupees: 1250,
    mrpRupees: 1800,
    stock: 19,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-bk-010',
    name: 'Brihat Parashara Hora Sastra',
    shortDescription: 'Classic Vedic Text · Complete Set',
    sku: 'BK-010',
    category: 'Astrology Books',
    priceRupees: 1850,
    mrpRupees: 2400,
    stock: 14,
    inStock: true,
    isActive: true,
  },
  {
    id: 'prod-acc-033',
    name: 'Panchmukhi Brass Diya',
    shortDescription: 'Handcrafted Temple Oil Lamp',
    sku: 'ACC-033',
    category: 'Spiritual Accessories',
    priceRupees: 950,
    mrpRupees: 1400,
    stock: 22,
    inStock: true,
    isActive: true,
  },
];

const PAGE_SIZE = 5;

/**
 * Rich artistic SVG product thumbnail matching the reference screenshot
 */
const ProductArtThumbnail: React.FC<{ product: ProductItem }> = ({ product }) => {
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D9C4AB] shadow-xs shrink-0 bg-[#FFFDF9] flex items-center justify-center">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  const sku = (product.sku || '').toUpperCase();
  const cat = product.category;

  // 1. Rudraksha Mala (Brown beads with golden pendant/tassel)
  if (cat === 'Rudraksha' || sku.startsWith('RUD')) {
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
  if (cat === 'Gemstones' || sku.startsWith('GEM')) {
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
  if (cat === 'Yantra' || sku.startsWith('YNT')) {
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
  if (cat === 'Astrology Books' || sku.startsWith('BK')) {
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
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(false);
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
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Gemstones');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formImage, setFormImage] = useState<string | null>(null);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Load products from backend API if available, fallback gracefully to INITIAL_PRODUCTS
  const loadBackendProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts({ page: 1, limit: 100 });
      if (data?.products && data.products.length > 0) {
        const mapped: ProductItem[] = data.products.map((p: any, idx: number) => ({
          id: p.id || p._id,
          name: p.name,
          shortDescription: p.shortDescription || '',
          sku: p.sku || `PRD-${String(idx + 1).padStart(3, '0')}`,
          category: (p.category as ProductCategory) || 'Gemstones',
          priceRupees: p.priceRupees || Math.round((p.pricePaise || 0) / 100),
          mrpRupees: p.mrpRupees || Math.round((p.mrpPaise || 0) / 100),
          stock: p.stock ?? (p.inStock ? 25 : 0),
          inStock: p.inStock ?? true,
          isActive: p.isActive ?? true,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
        }));

        // Merge with initial showcase products if backend has few products
        const existingIds = new Set(mapped.map((m) => m.id));
        const combined = [...mapped, ...INITIAL_PRODUCTS.filter((ip) => !existingIds.has(ip.id))];
        setProducts(combined);
      }
    } catch {
      // Backend not yet populated; preserve INITIAL_PRODUCTS showcase
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendProducts();
  }, []);

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
        p.sku.toLowerCase().includes(q) ||
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
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
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
    setFormSku(p.sku);
    setFormPrice(String(p.priceRupees));
    setFormMrp(String(p.mrpRupees));
    setFormStock(String(p.stock));
    setFormCategory(p.category);
    setFormIsActive(p.isActive);
    setFormImage(p.imageUrl || null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save Product (Create or Update)
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
        // Update in-memory
        const updated: ProductItem = {
          ...editingProduct,
          name: formName.trim(),
          shortDescription: formDescription.trim(),
          sku: formSku.trim() || editingProduct.sku,
          priceRupees: priceNum,
          mrpRupees: mrpNum,
          stock: stockNum,
          inStock: stockNum > 0,
          category: formCategory,
          isActive: formIsActive,
          imageUrl: formImage || undefined,
        };

        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));

        // Try backend sync
        try {
          await adminService.updateProduct(editingProduct.id, {
            name: updated.name,
            shortDescription: updated.shortDescription,
            price: updated.priceRupees,
            mrp: updated.mrpRupees,
            category: updated.category,
            inStock: updated.inStock,
            isActive: updated.isActive,
            image: updated.imageUrl || '',
          });
        } catch {}

        showToast(`Product "${updated.name}" updated successfully.`);
      } else {
        // Create new item
        const newProd: ProductItem = {
          id: `prod-${Date.now()}`,
          name: formName.trim(),
          shortDescription: formDescription.trim() || 'Curated sacred store item',
          sku: formSku.trim() || `PRD-${Math.floor(100 + Math.random() * 900)}`,
          priceRupees: priceNum,
          mrpRupees: mrpNum,
          stock: stockNum,
          inStock: stockNum > 0,
          category: formCategory,
          isActive: formIsActive,
          imageUrl: formImage || undefined,
        };

        setProducts((prev) => [newProd, ...prev]);

        // Try backend sync
        try {
          await adminService.createProduct({
            name: newProd.name,
            shortDescription: newProd.shortDescription,
            price: newProd.priceRupees,
            mrp: newProd.mrpRupees,
            category: newProd.category,
            badge: 'None',
            image: newProd.imageUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
          });
        } catch {}

        showToast(`Product "${newProd.name}" created successfully.`);
      }

      setIsModalOpen(false);
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
    } catch {}

    showToast(`"${product.name}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      try {
        await adminService.deleteProduct(deletingProduct.id);
      } catch {}
      showToast(`Product "${deletingProduct.name}" removed.`);
      setDeletingProduct(null);
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

      {/* 1. Metric Stat Cards Strip Matching Reference Image */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Products (248) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Package className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Total Products</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">248</div>
          </div>
        </div>

        {/* Gemstones (72) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Diamond className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Gemstones</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">72</div>
          </div>
        </div>

        {/* Rudraksha (58) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            {CATEGORY_CONFIG.Rudraksha.icon({ className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Rudraksha</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">58</div>
          </div>
        </div>

        {/* Yantra (36) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            {CATEGORY_CONFIG.Yantra.icon({ className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Yantra</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">36</div>
          </div>
        </div>

        {/* Astrology Books (28) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <BookOpen className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Astrology Books</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">28</div>
          </div>
        </div>

        {/* Spiritual Accessories (54) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Flower2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Spiritual Accessories</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">54</div>
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all ${
            selectedCategoryTab === 'ALL'
              ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
              : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Products (248)</span>
        </button>

        {(Object.keys(CATEGORY_CONFIG) as ProductCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isActive = selectedCategoryTab === cat;
          const Icon = cfg.icon;

          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategoryTab(cat);
                resetToFirstPage();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#382618] text-[#FFFDF9] shadow-sm'
                  : 'bg-[#FDFBF7] hover:bg-[#F5EDE1] border border-[#E8DACB] text-[#4A3828]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>
                {cfg.label} ({cfg.defaultCount})
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
              placeholder="Search product by name, SKU or category..."
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
                  SKU
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
                  <td colSpan={9} className="py-20 text-center text-[#735e49]">
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

                      {/* SKU Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F5ECE0] border border-[#E3D4C2] text-[#4A3828] text-xs font-mono font-bold tracking-wide">
                          {product.sku}
                        </span>
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
                  <td colSpan={9} className="py-16 text-center italic text-[#806A57]">
                    No store products match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar Matching Reference Screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#EADCCE] bg-[#FAF6F0]/40">
          <p className="font-serif text-sm text-[#665444]">
            Showing {firstIndex} – {lastIndex} of 248 products
          </p>

          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <button
              onClick={() => setPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 1 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setPage(2)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 2 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setPage(3)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 3 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setPage(4)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 4 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              4
            </button>
            <button
              onClick={() => setPage(5)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 5 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              5
            </button>

            <span className="px-1 text-xs text-[#8C7A68]">…</span>

            <button
              onClick={() => setPage(50)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 50 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              50
            </button>

            {/* Next Button */}
            <button
              onClick={() => setPage(Math.min(50, page + 1))}
              disabled={page === 50}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
                  Configure store listing, inventory quantity, SKU, and retail pricing
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

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  SKU Identifier
                  <input
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. RUD-001"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-mono text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                  />
                </label>
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

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Product Image URL (Optional)
                <input
                  type="url"
                  value={formImage || ''}
                  onChange={(e) => setFormImage(e.target.value || null)}
                  placeholder="https://images.example.com/product.jpg"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

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
                Are you sure you want to delete <strong>{deletingProduct.name}</strong> ({deletingProduct.sku}) from the store catalog?
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
