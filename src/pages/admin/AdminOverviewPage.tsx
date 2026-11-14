import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  ChevronDown,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import { adminService, AdminDashboardData } from '../../services/adminService';

type StoreProduct = {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  priceRupees: number;
  imageUrl: string;
};

type StatusSlice = {
  label: string;
  value: number;
  color: string;
};

const numberFormat = new Intl.NumberFormat('en-IN');
const moneyFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const fallbackProducts: StoreProduct[] = [
  {
    id: 'catalog-rudraksha',
    name: 'Rudraksha',
    shortDescription: 'Spiritual Protection & Energy',
    category: 'Rudraksha',
    priceRupees: 0,
    imageUrl: '/store_rudraksha_bracelet.jpg',
  },
  {
    id: 'catalog-gemstone',
    name: 'Gemstones',
    shortDescription: 'Healing & Planetary Balance',
    category: 'Gemstones',
    priceRupees: 0,
    imageUrl: '/store_cosmic_watch.jpg',
  },
  {
    id: 'catalog-yantra',
    name: 'Sacred Yantras',
    shortDescription: 'Wealth, Protection & Harmony',
    category: 'Yantra',
    priceRupees: 0,
    imageUrl: '/card_emblem_sun.png',
  },
];

const formatDate = (date?: string) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatChartDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatItemType = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const orderStatus = (status: string) => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'DELIVERED') return { label: 'Delivered', className: 'admin-status-paid' };
  if (normalized === 'SHIPPED') return { label: 'Shipped', className: 'admin-status-processing' };
  if (normalized === 'PROCESSING' || normalized === 'PENDING' || normalized === 'CREATED') return { label: 'Processing', className: 'admin-status-pending' };
  if (normalized === 'CONFIRMED' || normalized === 'PAID') return { label: 'Confirmed', className: 'admin-status-paid' };
  if (normalized === 'CANCELLED' || normalized === 'FAILED') return { label: 'Cancelled', className: 'admin-status-failed' };
  return { label: status, className: 'admin-status-pending' };
};

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  valueClassName?: string;
}> = ({ label, value, icon, valueClassName = '' }) => (
  <article className="admin-stat-card flex min-h-[148px] flex-col items-center justify-center px-3 py-4 text-center">
    <div className="mb-2 text-[#9a6113]">{icon}</div>
    <h2 className="font-serif text-[18px] font-bold leading-tight text-[#2c180f]">{label}</h2>
    <div className={`mt-1 font-serif text-[36px] font-bold leading-none tracking-[-0.04em] text-[#30170e] ${valueClassName}`}>{value}</div>
  </article>
);

const SalesChart: React.FC<{ trend: AdminDashboardData['revenueTrend'] }> = ({ trend }) => {
  const chartData = trend.length > 0 ? trend.slice(-30) : [];
  const width = 700;
  const height = 235;
  const padding = { top: 20, right: 18, bottom: 34, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxRevenue = Math.max(...chartData.map((item) => item.revenueRupees), 1);
  const points = chartData.map((item, index) => {
    const x = padding.left + (chartData.length === 1 ? chartWidth / 2 : (index / (chartData.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (item.revenueRupees / maxRevenue) * chartHeight;
    return { ...item, x, y };
  });
  const linePath = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = points.length
    ? `M ${points[0].x} ${padding.top + chartHeight} L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`
    : '';
  const labelStep = Math.max(1, Math.ceil(chartData.length / 6));

  if (!chartData.length) {
    return <div className="flex h-[230px] items-center justify-center text-sm italic text-[#8b7562]">No completed sales recorded in the last 30 days.</div>;
  }

  return (
    <div className="h-[230px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" role="img" aria-label="Sales overview chart">
        <defs>
          <linearGradient id="salesArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d18b1e" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#f6e0b4" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((line) => {
          const y = padding.top + chartHeight - line * chartHeight;
          const amount = Math.round(maxRevenue * line);
          return (
            <g key={line}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#9a6b2f" strokeOpacity="0.15" />
              <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="#6e5440" fontFamily="Georgia, serif" fontSize="12">
                {amount === 0 ? '0' : `₹${numberFormat.format(amount)}`}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#salesArea)" />
        <polyline fill="none" points={linePath} stroke="#ba790d" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#c17b0f" />
            <circle cx={point.x} cy={point.y} r="2" fill="#f9ebce" />
            {(index % labelStep === 0 || index === points.length - 1) && (
              <text x={point.x} y={height - 9} textAnchor="middle" fill="#523a28" fontFamily="Georgia, serif" fontSize="12">
                {formatChartDate(point.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const [statsResult, productsResult] = await Promise.allSettled([
      adminService.getStats(),
      adminService.getProducts({ page: 1, limit: 3, isActive: 'true' }),
    ]);

    if (statsResult.status === 'fulfilled') {
      setData(statsResult.value);
    } else {
      setError('Dashboard data could not be refreshed. Please try again.');
    }

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value?.products || []);
      setProductTotal(productsResult.value?.metrics?.totalProducts || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = data?.metrics;
  const totalOrders = metrics?.totalOrders || 0;
  const paidOrders = metrics?.paidOrdersCount || 0;
  const pendingOrders = Math.max(totalOrders - paidOrders, 0);

  const statusSlices = useMemo<StatusSlice[]>(
    () => [
      { label: 'Paid', value: paidOrders, color: '#68411d' },
      { label: 'Processing', value: pendingOrders, color: '#d39b35' },
      { label: 'Failed / Other', value: 0, color: '#e9c170' },
      { label: 'Pending', value: 0, color: '#f8dfad' },
    ],
    [paidOrders, pendingOrders]
  );

  const donutBackground = useMemo(() => {
    const total = statusSlices.reduce((sum, status) => sum + status.value, 0);
    if (!total) return 'conic-gradient(#eadfcb 0 100%)';
    let previousPercent = 0;
    const stops = statusSlices
      .filter((status) => status.value > 0)
      .map((status) => {
        const nextPercent = previousPercent + (status.value / total) * 100;
        const stop = `${status.color} ${previousPercent}% ${nextPercent}%`;
        previousPercent = nextPercent;
        return stop;
      });
    return `conic-gradient(${stops.join(', ')})`;
  }, [statusSlices]);

  const displayProducts = products.length ? products : fallbackProducts;

  return (
    <div className="space-y-5 pb-5">
      {error && <div className="rounded-2xl border border-[#bd5c46]/35 bg-[#fbebe4] px-4 py-3 text-sm text-[#8a3228]">{error}</div>}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Total Products" value={numberFormat.format(productTotal)} icon={<Box className="h-9 w-9" strokeWidth={1.7} />} />
        <MetricCard label="Total Customers" value={numberFormat.format(metrics?.totalUsers || 0)} icon={<Users className="h-9 w-9" strokeWidth={1.7} />} />
        <MetricCard label="Total Orders" value={numberFormat.format(totalOrders)} icon={<ShoppingCart className="h-9 w-9" strokeWidth={1.7} />} />
        <MetricCard label="Total Revenue" value={`₹ ${moneyFormat.format(metrics?.totalRevenueRupees || 0)}`} valueClassName="text-[30px]" icon={<span className="font-serif text-[44px] font-bold leading-none">₹</span>} />
        <MetricCard label="Pending Orders" value={numberFormat.format(pendingOrders)} icon={<Truck className="h-9 w-9" strokeWidth={1.7} />} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
        <article className="admin-paper-panel overflow-hidden p-4 sm:p-5">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[27px] font-bold leading-none text-[#2c180f]">Sales Overview</h2>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-[#bb8a4e]/40 bg-[#fffaf2] px-3.5 py-2 font-serif text-sm font-bold text-[#3d291c] shadow-sm transition hover:bg-[#f7ead7] disabled:opacity-60"
            >
              <span className="hidden sm:inline">Last 30 Days</span>
              <span className="sm:hidden">30 Days</span>
              <ChevronDown className="h-4 w-4" />
              <RefreshCw className={`h-3.5 w-3.5 text-[#a56815] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <SalesChart trend={data?.revenueTrend || []} />
        </article>

        <article className="admin-paper-panel p-4 sm:p-5">
          <h2 className="font-serif text-[25px] font-bold leading-none text-[#2c180f]">Order Status <span className="text-[18px]">(Last 30 Days)</span></h2>
          <div className="mt-4 flex flex-col items-center gap-5 min-[440px]:flex-row min-[440px]:items-center xl:gap-4">
            <div className="relative flex h-[188px] w-[188px] shrink-0 items-center justify-center rounded-full" style={{ background: donutBackground }}>
              <div className="flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full bg-[#fffaf3] shadow-[inset_0_1px_6px_rgba(83,49,17,0.12)]">
                <span className="font-serif text-[31px] font-bold leading-none text-[#2e180e]">{numberFormat.format(totalOrders)}</span>
                <span className="mt-1 font-serif text-[16px] leading-none text-[#4c3020]">Total Orders</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {statusSlices.map((status) => (
                <div key={status.label} className="flex items-center gap-3 border-b border-[#b9884a]/20 pb-2 last:border-0">
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="flex-1 font-serif text-[17px] font-semibold text-[#382116]">{status.label}</span>
                  <span className="font-serif text-[18px] font-bold text-[#382116]">{numberFormat.format(status.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.95fr)]">
        <article className="admin-paper-panel overflow-hidden p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[27px] font-bold leading-none text-[#2c180f]">Recent Orders</h2>
            <button onClick={() => navigate('/admin/orders')} className="group flex items-center gap-2 font-serif text-[16px] font-bold text-[#5d360e] transition hover:text-[#9b5e0b]">
              <span>View All Orders</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-orders-table w-full min-w-[650px] text-left">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders?.length ? (
                  data.recentOrders.slice(0, 5).map((order) => {
                    const status = orderStatus(order.status);
                    const formattedOrderId = order.orderId
                      ? (order.orderId.startsWith('#') ? order.orderId : `#${order.orderId}`)
                      : '#PC78421';
                    const customerDisplay = order.customerName || order.userEmail;
                    const productDisplay = order.productName || formatItemType(order.itemType);
                    return (
                      <tr key={order.id}>
                        <td className="font-semibold text-[#8C6D3B]">{formattedOrderId}</td>
                        <td className="font-medium text-[#2c180f]">{customerDisplay}</td>
                        <td className="font-medium text-[#2c180f]">{productDisplay}</td>
                        <td className="font-semibold">₹ {moneyFormat.format(order.amountRupees)}</td>
                        <td><span className={`admin-order-status ${status.className}`}>{status.label}</span></td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-9 text-center italic text-[#806a57]">New orders will appear here as your customers check out.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-paper-panel p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[27px] font-bold leading-none text-[#2c180f]">Top Selling Products</h2>
            <button onClick={() => navigate('/admin/store')} className="group flex items-center gap-1.5 whitespace-nowrap font-serif text-[15px] font-bold text-[#5d360e] transition hover:text-[#9b5e0b]">
              <span>View All</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="divide-y divide-[#b9884a]/20">
            {displayProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex min-h-[77px] items-center gap-3 py-2 first:pt-0 last:pb-0">
                <div className="h-[68px] w-[74px] shrink-0 overflow-hidden rounded-lg bg-[#f0e6d5]">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-serif text-[19px] font-bold leading-tight text-[#382116]">{product.name}</div>
                  <div className="mt-0.5 truncate font-serif text-[15px] leading-tight text-[#5e4837]">{product.shortDescription || product.category}</div>
                </div>
                <div className="text-right font-serif">
                  <div className="text-[18px] font-bold leading-tight text-[#3b2114]">
                    {product.priceRupees ? `₹ ${moneyFormat.format(product.priceRupees)}` : product.category}
                  </div>
                  <div className="text-[13px] leading-tight text-[#654a33]">{products.length ? 'Listed' : 'Catalogue'}</div>
                </div>
              </div>
            ))}
          </div>
          {!products.length && <p className="mt-3 text-xs italic text-[#8c725b]">These are catalogue placeholders until products are added to your store.</p>}
        </article>
      </section>
    </div>
  );
};
