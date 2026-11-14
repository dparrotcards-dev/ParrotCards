import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  deckCount: number;
  hasActivePass: boolean;
  unlockedCardsCount: number;
  totalOrders: number;
  totalSpentRupees: number;
  createdAt: string;
};

type UserMetrics = {
  totalCustomers: number;
  newCustomersLast7Days: number;
  customersWithOrders: number;
  totalCustomerSpendingRupees: number;
};

const EMPTY_METRICS: UserMetrics = {
  totalCustomers: 0,
  newCustomersLast7Days: 0,
  customersWithOrders: 0,
  totalCustomerSpendingRupees: 0,
};

const numberFormat = new Intl.NumberFormat('en-IN');
const moneyFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const formatDate = (date?: string) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (date?: string) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const exportCsv = (users: AdminUser[]) => {
  const rows = [
    ['Customer', 'Email', 'Registered On', 'Total Orders', 'Total Spent'],
    ...users.map((user) => [
      user.name,
      user.email,
      formatDateTime(user.createdAt),
      String(user.totalOrders),
      String(user.totalSpentRupees),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'parrot-cards-customers.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const CustomerMetric: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ReactNode;
  detail?: React.ReactNode;
}> = ({ label, value, icon, detail }) => (
  <article className="admin-customer-metric">
    <div className="admin-customer-metric-icon">{icon}</div>
    <div className="min-w-0">
      <h2 className="font-serif text-[18px] font-bold leading-tight text-[#2c180f]">{label}</h2>
      <div className="mt-1 flex items-end gap-2">
        <span className="font-serif text-[36px] font-bold leading-none tracking-[-0.04em] text-[#30170e]">{value}</span>
        {detail && <span className="mb-0.5 text-sm font-bold text-[#18812d]">{detail}</span>}
      </div>
    </div>
  </article>
);

export const AdminUsersPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const currentAdmin = (() => {
    try {
      const saved = localStorage.getItem('pc_admin_user');
      return saved ? JSON.parse(saved) : authUser;
    } catch {
      return authUser;
    }
  })();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async (requestedPage = page) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page: requestedPage,
        limit: 8,
        search,
      });
      setUsers(data.users || []);
      setMetrics(data.metrics || EMPTY_METRICS);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Customer records could not be loaded. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const visibleUsers = users;

  const firstCustomerNumber = totalCount ? (page - 1) * 8 + 1 : 0;
  const lastCustomerNumber = totalCount ? Math.min((page - 1) * 8 + users.length, totalCount) : 0;

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const handleInspectUser = async (id: string) => {
    setSelectedUserId(id);
    setUserDetails(null);
    setLoadingDetails(true);
    try {
      setUserDetails(await adminService.getUserDetails(id));
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      showToast('Customer details could not be loaded.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminService.deleteUser(deletingUser.id);
      showToast(`Customer account for ${deletingUser.name} was deleted.`);
      setDeletingUser(null);
      if (selectedUserId === deletingUser.id) {
        setSelectedUserId(null);
        setUserDetails(null);
      }
      fetchUsers();
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || error.message || 'Failed to delete customer account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-5">
      {toastMessage && (
        <div className="fixed right-5 top-5 z-[70] flex max-w-sm items-center gap-2.5 rounded-2xl border border-[#9fcf93] bg-[#eff9ea] px-4 py-3 text-sm font-semibold text-[#286d29] shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerMetric label="Total Customers" value={numberFormat.format(metrics.totalCustomers)} icon={<Users className="h-10 w-10" strokeWidth={1.65} />} />
        <CustomerMetric label={<><span>New Customers</span><span className="block text-[15px] font-semibold">(Last 7 Days)</span></>} value={numberFormat.format(metrics.newCustomersLast7Days)} icon={<UserPlus className="h-10 w-10" strokeWidth={1.65} />} />
        <CustomerMetric label="Customers with Orders" value={numberFormat.format(metrics.customersWithOrders)} icon={<ShoppingCart className="h-10 w-10" strokeWidth={1.65} />} />
        <CustomerMetric label="Total Customer Spending" value={`₹ ${moneyFormat.format(metrics.totalCustomerSpendingRupees)}`} icon={<span className="font-serif text-[44px] font-bold leading-none">₹</span>} />
      </section>

      <section className="admin-customer-filters flex flex-col gap-3 p-3 sm:p-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2f2118]" strokeWidth={2.25} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search customers"
            className="h-[52px] w-full rounded-xl border border-[#b78a4f]/35 bg-[#fffdf9] py-2 pl-14 pr-4 text-[16px] text-[#332117] outline-none transition placeholder:text-[#766c63] focus:border-[#98641c] focus:ring-2 focus:ring-[#d6b374]/25"
          />
        </form>

        <button
          onClick={() => exportCsv(visibleUsers)}
          type="button"
          className="flex h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#6a3507] to-[#572906] px-6 font-serif text-[18px] font-bold text-[#fff9ed] shadow-[0_3px_8px_rgba(77,38,3,0.2)] transition hover:brightness-110"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </section>

      <section className="admin-paper-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-users-table w-full min-w-[1110px] text-left">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Registered On</th>
                <th className="text-center">Total Orders</th>
                <th className="text-right">Total Spent</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#735e49]">
                    <span className="mx-auto mb-3 block h-7 w-7 rounded-full border-2 border-[#b67619] border-t-transparent animate-spin" />
                    Loading customer records…
                  </td>
                </tr>
              ) : visibleUsers.length ? (
                visibleUsers.map((customer, index) => {
                  const isSelf =
                    (currentAdmin?.email && currentAdmin.email.toLowerCase() === customer.email.toLowerCase()) ||
                    currentAdmin?.id === customer.id;
                  return (
                    <tr key={customer.id}>
                      <td className="font-semibold">{firstCustomerNumber + index}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="admin-user-avatar">{initials(customer.name)}</span>
                          <span className="font-serif text-[18px] font-bold">{customer.name}</span>
                        </div>
                      </td>
                      <td className="text-[15px]">{customer.email}</td>
                      <td className="text-[15px]">{formatDateTime(customer.createdAt)}</td>
                      <td className="text-center font-semibold">{numberFormat.format(customer.totalOrders)}</td>
                      <td className="text-right font-semibold">₹ {moneyFormat.format(customer.totalSpentRupees)}</td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleInspectUser(customer.id)} className="admin-row-action" title="View customer details" aria-label={`View ${customer.name}`}>
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(customer)}
                            disabled={isSelf}
                            className="admin-row-action disabled:cursor-not-allowed disabled:opacity-30"
                            title={isSelf ? 'You cannot delete your own active account' : 'Delete customer'}
                            aria-label={`Delete ${customer.name}`}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center italic text-[#806a57]">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#b9884a]/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="font-serif text-[17px] text-[#492e1c]">
            Showing {firstCustomerNumber || 0} – {lastCustomerNumber || 0} of {numberFormat.format(totalCount)} customers
          </p>
          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} className="admin-page-control" aria-label="Previous page">
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[page - 1, page, page + 1]
              .filter((candidate) => candidate >= 1 && candidate <= totalPages)
              .map((candidate) => (
                <button key={candidate} onClick={() => setPage(candidate)} className={`admin-page-control ${candidate === page ? 'admin-page-control-active' : ''}`}>
                  {candidate}
                </button>
              ))}
            {totalPages > page + 2 && <span className="px-1.5 font-serif text-lg">…</span>}
            {totalPages > page + 1 && <button onClick={() => setPage(totalPages)} className="admin-page-control">{totalPages}</button>}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading} className="admin-page-control" aria-label="Next page">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a170b]/45 p-4 backdrop-blur-sm">
          <section className="admin-user-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
            <header className="flex items-start justify-between gap-4 border-b border-[#b9884a]/22 pb-4">
              <div>
                <h2 className="font-serif text-[28px] font-bold">Customer Profile</h2>
                <p className="mt-1 text-sm text-[#795f49]">Purchase and account history</p>
              </div>
              <button onClick={() => { setSelectedUserId(null); setUserDetails(null); }} className="admin-row-action" aria-label="Close customer profile"><X className="h-5 w-5" /></button>
            </header>
            {loadingDetails ? (
              <div className="py-16 text-center text-[#735e49]"><span className="mx-auto mb-3 block h-7 w-7 rounded-full border-2 border-[#b67619] border-t-transparent animate-spin" />Loading profile…</div>
            ) : userDetails ? (
              <div className="space-y-5 pt-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Role', userDetails.user?.role?.replace(/_/g, ' ') || 'Customer'],
                    ['Joined', formatDate(userDetails.user?.createdAt)],
                    ['Decks', userDetails.decks?.length || 0],
                    ['Orders', userDetails.orders?.length || 0],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-xl border border-[#b9884a]/25 bg-[#fffaf3] p-3">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-[#816650]">{label}</span>
                      <span className="mt-1 block font-serif text-[17px] font-bold capitalize text-[#3b2114]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#b9884a]/25 bg-[#fffaf3] p-4">
                  <div className="font-serif text-[20px] font-bold">{userDetails.user?.name}</div>
                  <div className="mt-0.5 text-sm text-[#745b45]">{userDetails.user?.email}</div>
                </div>
                <div>
                  <h3 className="font-serif text-[21px] font-bold">Recent Purchases</h3>
                  <div className="mt-2 space-y-2">
                    {userDetails.orders?.length ? userDetails.orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between rounded-xl border border-[#b9884a]/22 bg-[#fffaf3] px-4 py-3 text-sm">
                        <div><div className="font-semibold">{order.orderId}</div><div className="capitalize text-[#775f4a]">{String(order.itemType).replace(/_/g, ' ').toLowerCase()}</div></div>
                        <div className="text-right"><div className="font-serif text-lg font-bold">₹ {moneyFormat.format(order.amountRupees)}</div><div className="text-xs text-[#775f4a]">{order.status}</div></div>
                      </div>
                    )) : <p className="rounded-xl border border-dashed border-[#b9884a]/30 px-4 py-6 text-center text-sm italic text-[#806a57]">No purchases have been recorded yet.</p>}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2a170b]/50 p-4 backdrop-blur-sm">
          <section className="admin-user-modal w-full max-w-md p-6">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f9ddd7] text-[#9c3026]"><Trash2 className="h-5 w-5" /></span>
              <div><h2 className="font-serif text-[25px] font-bold">Delete Customer</h2><p className="text-sm text-[#795f49]">This action cannot be undone.</p></div>
            </div>
            {deleteError && <div className="mt-5 flex gap-2 rounded-xl border border-[#dd9c91] bg-[#fce9e5] p-3 text-sm text-[#8d2d25]"><AlertCircle className="h-4 w-4 shrink-0" />{deleteError}</div>}
            <div className="mt-5 rounded-xl border border-[#d8a79c] bg-[#fff6f2] p-4 text-sm leading-relaxed text-[#5e342b]">
              <p>Delete <strong>{deletingUser.name}</strong> and all associated personal profiles, decks, cards and passes?</p>
              <p className="mt-2 flex gap-1.5 text-xs text-[#95362d]"><AlertTriangle className="h-4 w-4 shrink-0" />The deletion is recorded in the admin audit log.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeletingUser(null)} disabled={deleteLoading} className="rounded-xl border border-[#bd8b4d]/35 px-4 py-2.5 text-sm font-bold text-[#66421d] hover:bg-[#f7ead8]">Cancel</button>
              <button onClick={handleDeleteUserConfirm} disabled={deleteLoading} className="flex items-center gap-2 rounded-xl bg-[#a53329] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#bc4034] disabled:opacity-60">
                {deleteLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Delete Account
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
