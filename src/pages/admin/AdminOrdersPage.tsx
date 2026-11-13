import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export type OrderStatus =
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemProduct {
  name: string;
  category: string;
  quantity: number;
  priceRupees: number;
  imageUrl?: string;
}

export interface CustomerOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerInitial: string;
  products: OrderItemProduct[];
  totalAmountRupees: number;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  orderDateFormatted: string;
  orderTimeFormatted: string;
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
}

// Initial orders matching the user's reference screenshot
const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderId: '#PC78421',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'aarav.sharma@example.com',
    customerInitial: 'A',
    products: [
      { name: 'Rudraksha Mala', category: 'Rudraksha', quantity: 1, priceRupees: 800 },
      { name: 'Amethyst Gemstone', category: 'Gemstones', quantity: 1, priceRupees: 4200 },
      { name: 'Shree Yantra', category: 'Yantra', quantity: 1, priceRupees: 299 },
    ],
    totalAmountRupees: 5299,
    shippingCity: 'Udaipur',
    shippingState: 'Rajasthan',
    shippingPincode: '313001',
    orderDateFormatted: '30 Jan 2025',
    orderTimeFormatted: '10:24 AM',
    status: 'Delivered',
    courierName: 'Blue Dart Express',
    trackingNumber: 'BD-847291039',
  },
  {
    id: 'ord-2',
    orderId: '#PC78420',
    customerName: 'Nisha Verma',
    customerPhone: '+91 98765 43211',
    customerEmail: 'nisha.verma@example.com',
    customerInitial: 'N',
    products: [
      { name: 'Shree Yantra', category: 'Yantra', quantity: 1, priceRupees: 1499 },
    ],
    totalAmountRupees: 1499,
    shippingCity: 'Jaipur',
    shippingState: 'Rajasthan',
    shippingPincode: '302015',
    orderDateFormatted: '30 Jan 2025',
    orderTimeFormatted: '09:57 AM',
    status: 'Shipped',
    courierName: 'Delhivery Surface',
    trackingNumber: 'DEL-992384712',
  },
  {
    id: 'ord-3',
    orderId: '#PC78419',
    customerName: 'Rohit Mehta',
    customerPhone: '+91 98765 43212',
    customerEmail: 'rohit.mehta@example.com',
    customerInitial: 'R',
    products: [
      { name: 'Vedic Astrology Guide', category: 'Astrology Books', quantity: 1, priceRupees: 599 },
      { name: 'Brass Dhoop Dani', category: 'Spiritual Accessories', quantity: 1, priceRupees: 1199 },
    ],
    totalAmountRupees: 1798,
    shippingCity: 'Ahmedabad',
    shippingState: 'Gujarat',
    shippingPincode: '380015',
    orderDateFormatted: '30 Jan 2025',
    orderTimeFormatted: '09:18 AM',
    status: 'Processing',
    courierName: 'DTDC Courier',
    trackingNumber: 'DTDC-4829104',
  },
  {
    id: 'ord-4',
    orderId: '#PC78418',
    customerName: 'Priya Desai',
    customerPhone: '+91 98765 43213',
    customerEmail: 'priya.desai@example.com',
    customerInitial: 'P',
    products: [
      { name: 'Amethyst Gemstone', category: 'Gemstones', quantity: 1, priceRupees: 4200 },
    ],
    totalAmountRupees: 4200,
    shippingCity: 'Mumbai',
    shippingState: 'Maharashtra',
    shippingPincode: '400001',
    orderDateFormatted: '29 Jan 2025',
    orderTimeFormatted: '11:36 PM',
    status: 'Delivered',
    courierName: 'Blue Dart Air',
    trackingNumber: 'BD-77382910',
  },
  {
    id: 'ord-5',
    orderId: '#PC78417',
    customerName: 'Kunal Singh',
    customerPhone: '+91 98765 43214',
    customerEmail: 'kunal.singh@example.com',
    customerInitial: 'K',
    products: [
      { name: 'Rudraksha Mala', category: 'Rudraksha', quantity: 1, priceRupees: 800 },
      { name: 'Brass Dhoop Dani', category: 'Spiritual Accessories', quantity: 1, priceRupees: 1200 },
    ],
    totalAmountRupees: 2000,
    shippingCity: 'Delhi',
    shippingState: 'Delhi',
    shippingPincode: '110034',
    orderDateFormatted: '29 Jan 2025',
    orderTimeFormatted: '10:11 PM',
    status: 'Shipped',
    courierName: 'Delhivery Express',
    trackingNumber: 'DEL-38291023',
  },
  {
    id: 'ord-6',
    orderId: '#PC78416',
    customerName: 'Sneha Kulkarni',
    customerPhone: '+91 98765 43215',
    customerEmail: 'sneha.k@example.com',
    customerInitial: 'S',
    products: [
      { name: 'Yellow Sapphire (Pukhraj)', category: 'Gemstones', quantity: 1, priceRupees: 11500 },
    ],
    totalAmountRupees: 11500,
    shippingCity: 'Pune',
    shippingState: 'Maharashtra',
    shippingPincode: '411001',
    orderDateFormatted: '29 Jan 2025',
    orderTimeFormatted: '08:45 PM',
    status: 'Confirmed',
  },
  {
    id: 'ord-7',
    orderId: '#PC78415',
    customerName: 'Vikram Rajput',
    customerPhone: '+91 98765 43216',
    customerEmail: 'vikram.r@example.com',
    customerInitial: 'V',
    products: [
      { name: 'Ek Mukhi Rudraksha', category: 'Rudraksha', quantity: 1, priceRupees: 8500 },
    ],
    totalAmountRupees: 8500,
    shippingCity: 'Jodhpur',
    shippingState: 'Rajasthan',
    shippingPincode: '342001',
    orderDateFormatted: '28 Jan 2025',
    orderTimeFormatted: '04:15 PM',
    status: 'Cancelled',
  },
];

const PAGE_SIZE = 5;

/**
 * Renders small mini SVG artwork thumbnail for product in table cell
 */
const ProductMiniIcon: React.FC<{ productName: string }> = ({ productName }) => {
  const name = productName.toLowerCase();

  if (name.includes('rudraksha')) {
    return (
      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D9C4AB] bg-gradient-to-b from-[#8C5E24] to-[#2B1704] flex items-center justify-center shrink-0 shadow-2xs" title={productName}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <circle cx="12" cy="12" r="5" fill="#582C09" stroke="#E8AA50" strokeWidth="1" />
          <path d="M12 7v10M8 10l8 4M8 14l8-4" stroke="#FCE6A4" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M12 17v4" stroke="#D82A1B" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (name.includes('gemstone') || name.includes('amethyst') || name.includes('sapphire')) {
    return (
      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D9C4AB] bg-gradient-to-b from-[#4A206B] to-[#160624] flex items-center justify-center shrink-0 shadow-2xs" title={productName}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <ellipse cx="12" cy="12" rx="7" ry="6" fill="#8E44AD" />
          <polygon points="12,7 16.5,9 17.5,12 16.5,15 12,17 7.5,15 6.5,12 7.5,9" fill="#AF7AC5" stroke="#D7BDE2" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="1" fill="#FFFFFF" fillOpacity="0.8" />
        </svg>
      </div>
    );
  }

  if (name.includes('yantra')) {
    return (
      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D9C4AB] bg-gradient-to-b from-[#8C6228] to-[#2B1B06] flex items-center justify-center shrink-0 shadow-2xs" title={productName}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#D49A3D" />
          <polygon points="12,6 17,16 7,16" stroke="#5F3C0C" strokeWidth="0.7" fill="#FDE49E" fillOpacity="0.3" />
          <polygon points="12,18 7,8 17,8" stroke="#5F3C0C" strokeWidth="0.7" fill="#FDE49E" fillOpacity="0.3" />
        </svg>
      </div>
    );
  }

  if (name.includes('book') || name.includes('astrology') || name.includes('guide')) {
    return (
      <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D9C4AB] bg-gradient-to-b from-[#1C2842] to-[#080D18] flex items-center justify-center shrink-0 shadow-2xs" title={productName}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#1B263B" stroke="#E6B85C" strokeWidth="0.8" />
          <circle cx="12" cy="11" r="3.5" stroke="#FCE6A4" strokeWidth="0.6" />
        </svg>
      </div>
    );
  }

  // Spiritual Accessory / Incense
  return (
    <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#D9C4AB] bg-gradient-to-b from-[#8A6328] to-[#2B1B05] flex items-center justify-center shrink-0 shadow-2xs" title={productName}>
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
        <ellipse cx="12" cy="18" rx="4" ry="1.5" fill="#D4993B" stroke="#FFEAA8" strokeWidth="0.6" />
        <path d="M7 13c0 3 2 4 5 4s5-1 5-4H7z" fill="#D4993B" stroke="#FFEAA8" strokeWidth="0.6" />
        <path d="M7.5 12.5C7.5 10 10 8 12 8s4.5 2 4.5 4.5H7.5z" fill="#FCE49E" stroke="#5F3E0C" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // Selected Order for View Details Modal
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Status update modal / quick changer
  const [statusUpdatingOrder, setStatusUpdatingOrder] = useState<CustomerOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Confirmed');
  const [courierInput, setCourierInput] = useState<string>('');
  const [trackingInput, setTrackingInput] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Try to load any real live orders from backend payments/orders API
  const loadOrders = async () => {
    try {
      const data = await adminService.getPayments({ page: 1, limit: 50 });
      if (data?.payments && data.payments.length > 0) {
        const liveMapped: CustomerOrder[] = data.payments.map((p: any, idx: number) => {
          const name = p.seekerName || p.userEmail?.split('@')[0] || `Seeker ${idx + 1}`;
          const statusMap: Record<string, OrderStatus> = {
            paid: 'Delivered',
            completed: 'Delivered',
            created: 'Confirmed',
            processing: 'Processing',
            shipped: 'Shipped',
            failed: 'Cancelled',
            refunded: 'Cancelled',
          };
          const resolvedStatus: OrderStatus = statusMap[p.status] || 'Confirmed';

          return {
            id: p.id || `live-${idx}`,
            orderId: p.orderId?.startsWith('#') ? p.orderId : `#${p.orderId || `PC78${430 + idx}`}`,
            customerName: name,
            customerPhone: p.phone || '+91 98765 43210',
            customerEmail: p.userEmail || 'customer@example.com',
            customerInitial: name.charAt(0).toUpperCase(),
            products: [
              {
                name: p.itemTitle || (p.itemType === 'DECK_PASS' ? 'Full 55-Card Cosmic Deck Pass' : 'Personalized Natal Card'),
                category: 'Cosmic Entitlement',
                quantity: 1,
                priceRupees: p.amountRupees || 299,
              },
            ],
            totalAmountRupees: p.amountRupees || 299,
            shippingCity: p.city || 'Udaipur',
            shippingState: p.state || 'Rajasthan',
            shippingPincode: p.pincode || '313001',
            orderDateFormatted: new Date(p.createdAt || Date.now()).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            orderTimeFormatted: new Date(p.createdAt || Date.now()).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            status: resolvedStatus,
          };
        });

        // Merge live orders with showcase reference orders
        const existingOrderIds = new Set(liveMapped.map((o) => o.orderId));
        const combined = [...liveMapped, ...INITIAL_ORDERS.filter((io) => !existingOrderIds.has(io.orderId))];
        setOrders(combined);
      }
    } catch {
      // Keep initial showcase orders
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesQuery =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.shippingCity.toLowerCase().includes(q) ||
        o.shippingState.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const displayedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstIndex = filteredOrders.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastIndex = filteredOrders.length ? Math.min(page * PAGE_SIZE, filteredOrders.length) : 0;

  // Open Status Changer
  const handleOpenStatusUpdater = (order: CustomerOrder) => {
    setStatusUpdatingOrder(order);
    setNewStatus(order.status);
    setCourierInput(order.courierName || 'Blue Dart Express');
    setTrackingInput(order.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Save Status Change
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdatingOrder) return;
    setSavingStatus(true);

    try {
      const updated: CustomerOrder = {
        ...statusUpdatingOrder,
        status: newStatus,
        courierName: courierInput.trim(),
        trackingNumber: trackingInput.trim(),
      };

      setOrders((prev) => prev.map((o) => (o.id === statusUpdatingOrder.id ? updated : o)));
      if (selectedOrder?.id === statusUpdatingOrder.id) {
        setSelectedOrder(updated);
      }

      showToast(`Order ${updated.orderId} status updated to "${newStatus}".`);
      setStatusUpdatingOrder(null);
    } finally {
      setSavingStatus(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Email', 'City', 'State', 'Pincode', 'Total Amount (INR)', 'Order Date', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.orderId,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${o.shippingCity}"`,
      `"${o.shippingState}"`,
      `"${o.shippingPincode}"`,
      o.totalAmountRupees,
      `"${o.orderDateFormatted} ${o.orderTimeFormatted}"`,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV successfully.');
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return {
          dotClass: 'bg-[#1D7E33]',
          pillClass: 'bg-[#EAF7EE] text-[#1D7E33] border-[#C6EED0]',
        };
      case 'Shipped':
        return {
          dotClass: 'bg-[#29689C]',
          pillClass: 'bg-[#EEF5FC] text-[#29689C] border-[#CCE2F7]',
        };
      case 'Processing':
        return {
          dotClass: 'bg-[#B57418]',
          pillClass: 'bg-[#FEF5E7] text-[#B57418] border-[#FBE3B7]',
        };
      case 'Confirmed':
        return {
          dotClass: 'bg-[#71449B]',
          pillClass: 'bg-[#F3EEF9] text-[#71449B] border-[#E3D5F0]',
        };
      case 'Cancelled':
      default:
        return {
          dotClass: 'bg-[#B82B33]',
          pillClass: 'bg-[#FDEEEF] text-[#B82B33] border-[#FACDCF]',
        };
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
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Orders (1,204) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <ShoppingCart className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Total Orders</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">1,204</div>
          </div>
        </div>

        {/* Confirmed (920) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Package className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Confirmed</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">920</div>
          </div>
        </div>

        {/* Shipped (110) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <Truck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Shipped</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">110</div>
          </div>
        </div>

        {/* Delivered (86) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#8C6D3B]">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Delivered</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">86</div>
          </div>
        </div>

        {/* Cancelled (24) */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(44,32,22,0.04)] flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6]/60 flex items-center justify-center shrink-0 text-[#B82B33]">
            <XCircle className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-medium text-[#7A6A58]">Cancelled</div>
            <div className="text-2xl font-bold font-serif text-[#2C2016] leading-tight">24</div>
          </div>
        </div>
      </section>

      {/* 2. Search, Status, Date Range & Export Bar */}
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
                setPage(1);
              }}
              placeholder="Search by Order ID, customer name or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder:text-[#8C7A68] focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Order Status: All</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
          </div>

          {/* Date Range Dropdown */}
          <div className="relative min-w-[140px]">
            <div className="flex items-center">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] focus:border-[#8C6D3B] outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">Date Range</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]" />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-[#FFFDF9] font-serif font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </section>

      {/* 3. Orders Table Matching Reference Screenshot */}
      <section className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(44,32,22,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EADCCE] bg-[#FAF6F0]/80">
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider w-12 text-center">
                  #
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Order ID
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Products
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Shipping Address
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider">
                  Order Date
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Order Status
                </th>
                <th className="py-3.5 px-4 text-xs font-serif font-bold text-[#7A6A58] uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5D8]">
              {displayedOrders.length ? (
                displayedOrders.map((order, index) => {
                  const badge = getStatusBadge(order.status);
                  const firstTwo = order.products.slice(0, 2);
                  const extraCount = order.products.length - 2;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF6F0]/60 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-sm font-semibold text-[#5A4838] text-center">
                        {firstIndex + index}
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#2C2016]">
                        {order.orderId}
                      </td>

                      {/* Customer with Initial Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EBDCCB] text-[#5A3810] font-bold text-xs flex items-center justify-center shrink-0">
                            {order.customerInitial}
                          </div>
                          <div className="space-y-0.5">
                            <strong className="block font-serif text-[15px] font-bold text-[#2C2016] leading-tight">
                              {order.customerName}
                            </strong>
                            <span className="block text-xs text-[#7A6A58]">
                              {order.customerPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Product Mini Thumbnails */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {firstTwo.map((p, pIdx) => (
                            <ProductMiniIcon key={pIdx} productName={p.name} />
                          ))}
                          {extraCount > 0 && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-[#F2ECE1] border border-[#E0D4C2] text-[11px] font-mono font-bold text-[#6B5A4B]">
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#2C2016]">
                        ₹ {order.totalAmountRupees.toLocaleString('en-IN')}
                      </td>

                      {/* Shipping Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 text-left">
                          <MapPin className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="block text-xs font-medium text-[#2C2016] leading-tight">
                              {order.shippingCity}, {order.shippingState}
                            </span>
                            <span className="block text-[11px] font-mono text-[#7A6A58]">
                              {order.shippingPincode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Order Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 text-left">
                          <Calendar className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="block text-xs font-medium text-[#2C2016] leading-tight">
                              {order.orderDateFormatted}
                            </span>
                            <span className="block text-[11px] text-[#7A6A58]">
                              {order.orderTimeFormatted}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Order Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.pillClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                            title="View Order Details"
                            aria-label={`View order ${order.orderId}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusUpdater(order)}
                            className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                            title="Update Status / Delivery Info"
                            aria-label={`Options for ${order.orderId}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center italic text-[#806A57]">
                    No customer orders found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Bar Matching Reference Screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#EADCCE] bg-[#FAF6F0]/40">
          <p className="font-serif text-sm text-[#665444]">
            Showing {firstIndex} – {lastIndex} of 1,204 orders
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
              onClick={() => setPage(241)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === 241 ? 'bg-[#382618] text-[#FFFDF9] shadow-xs' : 'text-[#524032] hover:bg-[#F2ECE1]'
              }`}
            >
              241
            </button>

            {/* Next Button */}
            <button
              onClick={() => setPage(Math.min(241, page + 1))}
              disabled={page === 241}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524032] hover:bg-[#F2ECE1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal: View Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
            <header className="flex items-start justify-between gap-4 border-b border-[#B9884A]/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-[#2C2016]">
                    {selectedOrder.orderId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${
                      getStatusBadge(selectedOrder.status).pillClass
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedOrder.status).dotClass}`} />
                    <span>{selectedOrder.status}</span>
                  </span>
                </div>
                <p className="text-xs text-[#7A6A58] mt-1">
                  Placed on {selectedOrder.orderDateFormatted} at {selectedOrder.orderTimeFormatted}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/60 space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C6D3B]">
                  Customer Contact
                </span>
                <p className="font-serif font-bold text-base text-[#2C2016]">
                  {selectedOrder.customerName}
                </p>
                <p className="text-xs text-[#5A4838]">{selectedOrder.customerPhone}</p>
                <p className="text-xs text-[#5A4838]">{selectedOrder.customerEmail}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/60 space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C6D3B]">
                  Shipping Address
                </span>
                <p className="font-semibold text-sm text-[#2C2016]">
                  {selectedOrder.shippingCity}, {selectedOrder.shippingState}
                </p>
                <p className="text-xs text-[#5A4838]">Pincode: {selectedOrder.shippingPincode}</p>
                {selectedOrder.courierName && (
                  <p className="text-xs text-[#8C6D3B] font-medium mt-1">
                    Via {selectedOrder.courierName} ({selectedOrder.trackingNumber})
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Order Products */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C6D3B]">
                Order Items ({selectedOrder.products.length})
              </span>
              <div className="border border-[#E5D7C6] rounded-2xl overflow-hidden divide-y divide-[#F0E5D8]">
                {selectedOrder.products.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-[#FFFDF9]">
                    <div className="flex items-center gap-3">
                      <ProductMiniIcon productName={item.name} />
                      <div>
                        <span className="block font-serif font-bold text-sm text-[#2C2016]">
                          {item.name}
                        </span>
                        <span className="block text-xs text-[#7A6A58]">
                          Qty: {item.quantity} · {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#2C2016]">
                      ₹ {item.priceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#EBDCCB] flex items-center justify-between">
              <span className="font-serif font-bold text-base text-[#2C2016]">Total Order Amount</span>
              <span className="font-serif font-bold text-xl text-[#2C2016]">
                ₹ {selectedOrder.totalAmountRupees.toLocaleString('en-IN')}
              </span>
            </div>

            <footer className="flex justify-between items-center border-t border-[#B9884A]/20 pt-4">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  handleOpenStatusUpdater(selectedOrder);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
              >
                <span>Update Shipping & Status</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-all shadow-xs"
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Modal: Update Order Delivery & Status */}
      {statusUpdatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-xs">
          <section className="bg-[#FFFDF9] border border-[#B9884A]/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <header className="flex items-start justify-between gap-3 border-b border-[#B9884A]/20 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2C2016]">
                  Update Order {statusUpdatingOrder.orderId}
                </h2>
                <p className="text-xs text-[#7A6A58] mt-0.5">
                  Update customer delivery stage and courier tracking
                </p>
              </div>
              <button
                onClick={() => setStatusUpdatingOrder(null)}
                className="p-1.5 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#F2ECE1] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Order Status
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-medium text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                Courier / Shipping Partner
                <input
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, DTDC"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <label className="block space-y-1 text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                AWB / Tracking Number
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="e.g. BD-847291039"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm font-mono text-[#2C2016] outline-none focus:border-[#8C6D3B]"
                />
              </label>

              <footer className="flex justify-end gap-3 border-t border-[#B9884A]/20 pt-4">
                <button
                  type="button"
                  onClick={() => setStatusUpdatingOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#B88A4F]/40 bg-[#FAF5EE] text-sm font-bold text-[#5A3810] hover:bg-[#F3EBE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={savingStatus}
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-sm font-bold text-[#FFFDF9] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {savingStatus && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Status</span>
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

