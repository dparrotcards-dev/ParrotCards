import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  Layers,
  CreditCard,
  X,
  Calendar,
  Compass,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Inspect user drawer state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Delete user modal state
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
      });
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.total || 0);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleInspectUser = async (id: string) => {
    setSelectedUserId(id);
    setLoadingDetails(true);
    try {
      const details = await adminService.getUserDetails(id);
      setUserDetails(details);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
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
      showToast(`User account for "${deletingUser.name}" (${deletingUser.email}) deleted successfully.`);
      setDeletingUser(null);
      if (selectedUserId === deletingUser.id) {
        setSelectedUserId(null);
        setUserDetails(null);
      }
      await fetchUsers();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete user account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-medium text-xs shadow-2xl border border-emerald-400/30 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Seeker & User Directory
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Manage authenticated seekers, entitlements, and personalized account sky histories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A7A4C4] font-mono">
            Total Users: <strong className="text-[#C9A45C]">{totalCount}</strong>
          </span>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A7A4C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by seeker name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#C9A45C]/50 text-xs text-[#F6F0E6] outline-none placeholder:text-[#A7A4C4]/50"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F6F0E6] outline-none focus:border-[#C9A45C]/50"
          >
            <option value="ALL">All Roles</option>
            <option value="user">Seeker (User)</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Admin</option>
            <option value="analytics_manager">Analytics Manager</option>
            <option value="content_manager">Content Manager</option>
            <option value="support_admin">Support Admin</option>
          </select>

          <button
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            className="py-2 px-4 rounded-xl bg-[#C9A45C] hover:bg-[#d6b068] text-[#08071B] font-bold text-xs shadow-md transition-all"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Seeker Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Decks Drawn</th>
                <th className="py-3 px-4">Pass Status</th>
                <th className="py-3 px-4">Unlocked Cards</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A7A4C4]">
                    <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading registered seekers...</span>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isSelf = (currentUser?.email && currentUser.email.toLowerCase() === u.email.toLowerCase()) || currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#F6F0E6]">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-[#C9A45C]/20 text-[#C9A45C] font-mono font-normal">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7A4C4] font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                            u.role === 'admin' || u.role === 'superadmin'
                              ? 'bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30'
                              : 'bg-white/5 text-[#A7A4C4]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#F6F0E6]">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>{u.deckCount} decks</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.hasActivePass ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                            ✓ 30-Day Pass Active
                          </span>
                        ) : (
                          <span className="text-[#A7A4C4] text-[11px]">Free Tier</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#F6F0E6]">
                        {u.unlockedCardsCount > 0 ? (
                          <span className="text-emerald-400 font-bold">{u.unlockedCardsCount} unlocked</span>
                        ) : (
                          <span className="text-[#A7A4C4]">3 free default</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#A7A4C4] font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectUser(u.id)}
                            className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[#C9A45C] hover:text-amber-300 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                            title="Inspect User Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                          
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isSelf}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 ${
                              isSelf
                                ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed opacity-40'
                                : 'bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 text-rose-300'
                            }`}
                            title={isSelf ? 'Cannot delete active session account' : 'Delete User Account'}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A7A4C4] italic">
                    No users matching the query found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A7A4C4]">
          <div>
            Showing Page <strong className="text-[#F6F0E6]">{page}</strong> of <strong className="text-[#F6F0E6]">{totalPages}</strong>
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
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[#F6F0E6] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect User Drawer / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#111033] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">Seeker Dossier</h3>
                  <p className="text-xs text-[#A7A4C4] font-mono">{userDetails?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setUserDetails(null);
                }}
                className="p-1.5 rounded-xl text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-16 text-center text-xs text-[#A7A4C4]">
                <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Auditing seeker sky records...</span>
              </div>
            ) : userDetails ? (
              <div className="space-y-6 text-xs">
                {/* Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A7A4C4] uppercase block">Role</span>
                    <span className="font-bold text-[#C9A45C]">{userDetails.user.role}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A7A4C4] uppercase block">Joined</span>
                    <span className="font-bold text-[#F6F0E6]">{new Date(userDetails.user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A7A4C4] uppercase block">Decks</span>
                    <span className="font-bold text-[#F6F0E6]">{userDetails.decks.length}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A7A4C4] uppercase block">Orders</span>
                    <span className="font-bold text-emerald-400">{userDetails.orders.length}</span>
                  </div>
                </div>

                {/* Birth Profiles */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#C9A45C] flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Birth Sky Profiles ({userDetails.profiles.length})</span>
                  </h4>
                  {userDetails.profiles.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {userDetails.profiles.map((p: any) => (
                        <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-[#F6F0E6]">{p.name}</div>
                            <div className="text-[11px] text-[#A7A4C4]">{p.place} • {p.dateOfBirth}</div>
                          </div>
                          <span className="text-[10px] text-[#A7A4C4] font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#A7A4C4] italic">No birth sky profile recorded.</p>
                  )}
                </div>

                {/* Personalized Decks */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#C9A45C] flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Generated Decks ({userDetails.decks.length})</span>
                  </h4>
                  {userDetails.decks.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {userDetails.decks.map((deck: any) => (
                        <div key={deck.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#F6F0E6] font-serif">{deck.sovereignCardKey}</div>
                            <div className="text-[11px] text-[#A7A4C4] line-clamp-1 italic">{deck.avatarPhrase}</div>
                          </div>
                          <div className="text-right font-mono text-[10px]">
                            <span className="text-[#C9A45C]">{deck.totalCards} cards</span>
                            <div className="text-[#A7A4C4]">{new Date(deck.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#A7A4C4] italic">No personalized decks drawn.</p>
                  )}
                </div>

                {/* Orders / Payments */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#C9A45C] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Orders ({userDetails.orders.length})</span>
                  </h4>
                  {userDetails.orders.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {userDetails.orders.map((order: any) => (
                        <div key={order.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <div className="font-mono text-[11px] text-[#C9A45C]">{order.orderId}</div>
                            <div className="text-[11px] text-[#A7A4C4]">{order.itemType}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400">₹{order.amountRupees}</div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#F6F0E6]">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#A7A4C4] italic">No purchases recorded.</p>
                  )}
                </div>

                {/* Dossier Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      const target = {
                        id: userDetails.user.id,
                        name: userDetails.user.name,
                        email: userDetails.user.email,
                        role: userDetails.user.role,
                      };
                      setSelectedUserId(null);
                      setUserDetails(null);
                      setDeletingUser(target);
                    }}
                    disabled={
                      (currentUser?.email && currentUser.email.toLowerCase() === userDetails.user.email.toLowerCase()) ||
                      currentUser?.id === userDetails.user.id
                    }
                    className="py-2 px-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 disabled:opacity-30 disabled:pointer-events-none font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUserId(null);
                      setUserDetails(null);
                    }}
                    className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111033] border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F6F0E6]">Delete Seeker Account</h3>
                <p className="text-xs text-rose-300 font-mono">Irreversible Account Deletion</p>
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
                Are you sure you want to permanently delete the account for <span className="font-bold text-[#C9A45C]">"{deletingUser.name}"</span> (<span className="text-[#A7A4C4] font-mono">{deletingUser.email}</span>)?
              </p>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                  <span>Cascade Deletion Warning:</span>
                </p>
                <p className="text-[10px] text-rose-200/80 leading-normal">
                  All associated birth sky profiles, personalized decks, unlocked cards, and passes will be permanently erased. This operation is recorded in the administrative audit log.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserConfirm}
                disabled={deleteLoading}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                )}
                <span>{deleteLoading ? 'Deleting Account...' : 'Yes, Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
