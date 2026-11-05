import React, { useEffect, useState, useRef } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminPaymentsPage: React.FC = () => {
  const [paymentsData, setPaymentsData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Table horizontal slider ref and progress
  const tableRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const handleTableScroll = () => {
    if (!tableRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.round((scrollLeft / maxScroll) * 100));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    if (!tableRef.current) return;
    const { scrollWidth, clientWidth } = tableRef.current;
    const maxScroll = scrollWidth - clientWidth;
    tableRef.current.scrollLeft = (val / 100) * maxScroll;
  };

  const slideTable = (direction: 'left' | 'right') => {
    if (!tableRef.current) return;
    const delta = direction === 'left' ? -260 : 260;
    tableRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Delete state
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments({
        page,
        limit: 10,
        status: statusFilter,
        itemType: itemTypeFilter,
        search,
      });
      setPaymentsData(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, itemTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleDeleteOrderConfirm = async () => {
    if (!deletingOrder) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminService.deletePayment(deletingOrder.id);
      setActionSuccess(`Payment record '${deletingOrder.orderId}' deleted successfully.`);
      setDeletingOrder(null);
      fetchPayments();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete payment record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const summary = paymentsData?.summary;
  const orders = paymentsData?.orders || [];
  const pagination = paymentsData?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Payments & Verified Revenue
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Customer checkout audit, individual unlocks (₹2), and 30-day deck passes (₹25)
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
          title="Refresh Payments"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Verified Revenue KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111033] border border-white/10 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="text-[11px] font-semibold text-[#A7A4C4] uppercase tracking-wider">Net Verified Revenue</div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
            ₹{summary?.totalRevenueRupees ?? 0}
          </div>
          <div className="text-[10px] text-[#A7A4C4] font-mono">
            From {summary?.paidOrdersCount ?? 0} confirmed paid orders
          </div>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="text-[11px] font-semibold text-[#A7A4C4] uppercase tracking-wider">30-Day Deck Passes</div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#C9A45C]">
            ₹{summary?.deckPassesRevenue ?? 0}
          </div>
          <div className="text-[10px] text-[#A7A4C4] font-mono">₹25 per pass unlock</div>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="text-[11px] font-semibold text-[#A7A4C4] uppercase tracking-wider">Card Unlocks</div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
            ₹{summary?.cardUnlocksRevenue ?? 0}
          </div>
          <div className="text-[10px] text-[#A7A4C4] font-mono">₹2 per card unlock</div>
        </div>

        <div className="bg-[#111033] border border-white/10 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="text-[11px] font-semibold text-[#A7A4C4] uppercase tracking-wider">Failed / Abandoned</div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-rose-400">
            {summary?.failedOrdersCount ?? 0}
          </div>
          <div className="text-[10px] text-[#A7A4C4] font-mono">Excluded from revenue tally</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A7A4C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, order ID, or Razorpay ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C]/50 text-xs text-[#F6F0E6] outline-none placeholder:text-[#A7A4C4]/50"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F6F0E6] outline-none"
          >
            <option value="ALL" className="bg-[#111033]">All Statuses</option>
            <option value="PAID" className="bg-[#111033]">PAID Only (Verified)</option>
            <option value="CREATED" className="bg-[#111033]">CREATED (Pending)</option>
            <option value="FAILED" className="bg-[#111033]">FAILED</option>
          </select>

          <select
            value={itemTypeFilter}
            onChange={(e) => {
              setItemTypeFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F6F0E6] outline-none"
          >
            <option value="ALL" className="bg-[#111033]">All Item Types</option>
            <option value="DECK_PASS" className="bg-[#111033]">30-Day Deck Pass (₹25)</option>
            <option value="CARD_UNLOCK" className="bg-[#111033]">Card Unlock (₹2)</option>
          </select>

          <button
            onClick={handleSearchSubmit}
            className="py-2 px-4 rounded-xl bg-[#C9A45C] hover:brightness-110 text-[#08071B] font-bold text-xs transition-all flex-shrink-0"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table Slider Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111033] border border-white/10 px-4 py-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 text-xs text-[#A7A4C4]">
          <span className="text-[#C9A45C] font-serif text-sm">✦</span>
          <span className="font-semibold text-[#F6F0E6]">Table Slider:</span>
          <span className="text-[11px] text-[#A7A4C4] hidden md:inline">
            Slide horizontally to explore all columns and delete records
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Slide Left Button */}
          <button
            type="button"
            onClick={() => slideTable('left')}
            className="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-all flex items-center gap-1"
            title="Slide Table Left"
          >
            <ChevronLeft className="w-4 h-4 text-[#C9A45C]" />
            <span className="text-[11px]">Slide Left</span>
          </button>

          {/* Interactive Range Slider */}
          <div className="flex items-center gap-2 flex-1 sm:w-48">
            <input
              type="range"
              min="0"
              max="100"
              value={scrollProgress}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A45C]"
              title="Drag slider to scroll horizontally"
            />
          </div>

          {/* Slide Right Button */}
          <button
            type="button"
            onClick={() => slideTable('right')}
            className="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
            title="Slide Table Right"
          >
            <span className="text-[11px]">Right Slide</span>
            <ChevronRight className="w-4 h-4 text-[#C9A45C]" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-full min-w-0">
        <div
          ref={tableRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto w-full table-horizontal-slider"
        >
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5">Customer Details</th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Razorpay Ref</th>
                <th className="py-3 px-3">Item Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-4 text-right sticky right-0 bg-[#161444] shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.6)] z-10 border-l border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A7A4C4]">
                    <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Auditing verified transactions...</span>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((o: any) => {
                  const customerName = o.customer?.name || o.userName || 'Guest Seeker';
                  const customerEmail = o.customer?.email || o.userEmail || 'Unregistered Guest';
                  const customerStatus = o.customer?.status;
                  const userId = o.customer?.userId;

                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Customer Details Column */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col space-y-0.5 max-w-[200px]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`font-semibold text-xs truncate ${
                                customerStatus === 'UNAVAILABLE'
                                  ? 'text-amber-300/90 italic'
                                  : customerStatus === 'DELETED_ACCOUNT'
                                  ? 'text-rose-300/90 italic'
                                  : customerStatus === 'GUEST'
                                  ? 'text-[#A7A4C4] italic'
                                  : 'text-[#F6F0E6]'
                              }`}
                            >
                              {customerName}
                            </span>
                            {customerStatus === 'UNAVAILABLE' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium whitespace-nowrap">
                                User details unavailable
                              </span>
                            )}
                            {customerStatus === 'DELETED_ACCOUNT' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium whitespace-nowrap">
                                Deleted Account
                              </span>
                            )}
                            {customerStatus === 'GUEST' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/5 border border-white/10 text-[#A7A4C4] whitespace-nowrap">
                                Guest
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[11px] text-[#A7A4C4] font-mono truncate">
                            {customerEmail}
                          </span>

                          {userId && (
                            <span
                              className="text-[9px] text-[#A7A4C4]/60 font-mono inline-flex items-center gap-1"
                              title={`User ID: ${userId}`}
                            >
                              <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] text-[#C9A45C]/90 font-mono">
                                UID: {userId.slice(-6)}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-[#C9A45C] whitespace-nowrap">
                        {o.orderId}
                      </td>
                      
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="text-[#A7A4C4] max-w-[140px] truncate" title={o.razorpayOrderId}>
                          {o.razorpayOrderId}
                        </div>
                        {o.razorpayPaymentId && (
                          <div className="text-[10px] text-emerald-400 font-mono max-w-[140px] truncate" title={o.razorpayPaymentId}>
                            Pay: {o.razorpayPaymentId}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#A7A4C4] font-mono text-[10px]">
                          {o.itemType} {o.itemId ? `(${o.itemId})` : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-emerald-400 font-mono text-xs whitespace-nowrap">
                        ₹{o.amountRupees}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : o.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#A7A4C4] font-mono text-[10px] whitespace-nowrap">
                        <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                        <div className="text-[#A7A4C4]/60 text-[9px]">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions Column (Sticky on right edge) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[#111033] shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.6)] z-10 border-l border-white/5">
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingOrder(o);
                          }}
                          className="py-1 px-3 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-200 shadow-sm hover:scale-[1.02]"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A7A4C4] italic">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A7A4C4]">
          <div>
            Showing Page <strong className="text-[#F6F0E6]">{page}</strong> of <strong className="text-[#F6F0E6]">{pagination.totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[#F6F0E6] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[#F6F0E6] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Payment Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111033] border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F6F0E6]">Delete Payment Record</h3>
                <p className="text-xs text-rose-300 font-mono">Irreversible Transaction Removal</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <p className="text-[#F6F0E6] leading-relaxed">
                Are you sure you want to permanently delete payment record <span className="font-bold text-[#C9A45C]">"{deletingOrder.orderId}"</span>?
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-black/30 border border-white/5 font-mono">
                <div>
                  <span className="text-[#A7A4C4]">Amount: </span>
                  <span className="text-emerald-400 font-bold">₹{deletingOrder.amountRupees}</span>
                </div>
                <div>
                  <span className="text-[#A7A4C4]">Status: </span>
                  <span className={deletingOrder.status === 'PAID' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{deletingOrder.status}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-[#A7A4C4]">Customer: </span>
                  <span className="text-[#F6F0E6]">{deletingOrder.customer?.name || deletingOrder.userName || 'Guest Seeker'}</span>
                </div>
                {deletingOrder.razorpayOrderId && (
                  <div className="col-span-2 truncate text-[10px] text-[#A7A4C4]">
                    <span>Razorpay ID: </span>
                    <span>{deletingOrder.razorpayOrderId}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                  <span>Audit Warning:</span>
                </p>
                <p className="text-[10px] text-rose-200/80 leading-normal">
                  Deleting this order permanently removes the order record and any associated payment transactions. This action will be recorded in the administrative audit log.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingOrder(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrderConfirm}
                disabled={deleteLoading}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                )}
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
