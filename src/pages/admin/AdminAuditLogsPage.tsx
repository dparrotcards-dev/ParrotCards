import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminAuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'admins'>('logs');
  const [logs, setLogs] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        page,
        limit: 15,
        action: actionFilter,
      });
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Failed to load admins list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else {
      fetchAdmins();
    }
  }, [activeTab, page, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#F6F0E6] to-[#C9A45C]">
            Administrative Security & Audit Logs
          </h1>
          <p className="text-xs text-[#A7A4C4] font-serif italic">
            Track privileged administrative operations, inspector actions, and authorized staff accounts
          </p>
        </div>

        <button
          onClick={() => (activeTab === 'logs' ? fetchLogs() : fetchAdmins())}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A45C] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => {
            setActiveTab('logs');
            setPage(1);
          }}
          className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-[#C9A45C] text-[#08071B] font-bold shadow-md'
              : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Operational Audit Trail ({totalCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'bg-[#C9A45C] text-[#08071B] font-bold shadow-md'
              : 'text-[#A7A4C4] hover:text-[#F6F0E6] hover:bg-white/5'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Authorized Administrators ({admins.length})</span>
        </button>
      </div>

      {/* Tab 1: Audit Logs Table */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Operator (Admin)</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Target ID</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#A7A4C4]">
                        <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading audit records...</span>
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#C9A45C]">{log.action}</td>
                        <td className="py-3 px-4 text-[#F6F0E6]">
                          <div>{log.adminEmail}</div>
                          {log.adminName && <div className="text-[10px] text-[#A7A4C4]">{log.adminName}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">
                            {log.targetType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#A7A4C4] max-w-[120px] truncate" title={log.targetId}>
                          {log.targetId || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#A7A4C4] text-[11px]">{log.ipAddress}</td>
                        <td className="py-3 px-4 text-[#A7A4C4] font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#A7A4C4] italic">
                        No audit records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
        </div>
      )}

      {/* Tab 2: Authorized Administrators */}
      {activeTab === 'admins' && (
        <div className="bg-[#111033] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[#A7A4C4] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Admin Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Authorized Role</th>
                  <th className="py-3 px-4">Account Creation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#F6F0E6] flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>{admin.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#A7A4C4]">{admin.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[#C9A45C] font-bold text-[10px] tracking-wide uppercase">
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#A7A4C4] font-mono text-[11px]">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#A7A4C4] italic">
                      No admin records retrieved.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
