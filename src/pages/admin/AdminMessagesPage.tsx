import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export interface ContactMessageItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Replied';
  replyText?: string;
  repliedAt?: string;
  createdAt: string;
}

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    replied: 0,
    pending: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Selected message for right-hand details panel
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load messages from Backend
  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await adminService.getContactMessages({
        page,
        limit: 10,
        status: statusFilter,
        search,
        dateRange: dateRangeFilter,
      });

      if (data?.messages) {
        setMessages(data.messages);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || data.messages.length);
        if (data.stats) {
          setStats(data.stats);
        }

        // Auto-select first message if none selected
        if (!selectedMessage && data.messages.length > 0) {
          setSelectedMessage(data.messages[0]);
          setReplyInput(data.messages[0].replyText || '');
        } else if (selectedMessage) {
          // Keep selected message in sync
          const updated = data.messages.find((m: any) => m._id === selectedMessage._id);
          if (updated) {
            setSelectedMessage(updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
      showToast('Failed to load contact messages from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page, statusFilter, dateRangeFilter]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMessages();
  };

  // Select message into right-hand panel
  const handleSelectMessage = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setReplyInput(msg.replyText || '');
  };

  // Handle Send Reply
  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyInput.trim()) {
      showToast('Please type a reply message before sending.');
      return;
    }

    setSubmittingReply(true);
    try {
      await adminService.replyToContactMessage(selectedMessage._id, replyInput.trim(), false);
      const updated: ContactMessageItem = {
        ...selectedMessage,
        status: 'Replied',
        replyText: replyInput.trim(),
        repliedAt: new Date().toISOString(),
      };

      setSelectedMessage(updated);
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      setStats((prev) => ({
        ...prev,
        replied: prev.replied + (selectedMessage.status === 'Pending' ? 1 : 0),
        pending: Math.max(0, prev.pending - (selectedMessage.status === 'Pending' ? 1 : 0)),
      }));

      showToast(`Reply sent to ${selectedMessage.name} successfully.`);
    } catch (err) {
      console.error('Failed to send reply:', err);
      showToast('Failed to send reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Mark as Replied
  const handleMarkAsReplied = async () => {
    if (!selectedMessage) return;

    setSubmittingReply(true);
    try {
      await adminService.replyToContactMessage(selectedMessage._id, replyInput.trim(), true);
      const updated: ContactMessageItem = {
        ...selectedMessage,
        status: 'Replied',
        repliedAt: new Date().toISOString(),
      };

      setSelectedMessage(updated);
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      setStats((prev) => ({
        ...prev,
        replied: prev.replied + (selectedMessage.status === 'Pending' ? 1 : 0),
        pending: Math.max(0, prev.pending - (selectedMessage.status === 'Pending' ? 1 : 0)),
      }));

      showToast(`Message from ${selectedMessage.name} marked as replied.`);
    } catch (err) {
      console.error('Failed to mark as replied:', err);
      showToast('Failed to update status.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (messages.length === 0) {
      showToast('No messages available to export.');
      return;
    }

    const headers = ['#', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Received On', 'Status', 'Reply'];
    const rows = messages.map((m, idx) => [
      idx + 1,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      `"${m.phone || ''}"`,
      `"${m.subject.replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${new Date(m.createdAt).toLocaleString('en-IN')}"`,
      `"${m.status}"`,
      `"${(m.replyText || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Contact messages exported to CSV successfully.');
  };

  // Helpers
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
    return `${dateFormatted}, ${timeFormatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#382618] border border-[#B88A4F]/40 text-[#FFFDF9] px-5 py-3 shadow-2xl text-xs font-medium animate-bounce flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══ 1. TOP STATS CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Messages Card */}
        <div className="rounded-2xl border border-[#E8DCCF] bg-[#FFFDF9] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center text-[#8C6D3B] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#7A6A58]">
              Total Messages
            </span>
            <span className="font-serif text-3xl font-bold text-[#2C2016] tracking-tight">
              {stats.totalMessages}
            </span>
          </div>
        </div>

        {/* Replied Card */}
        <div className="rounded-2xl border border-[#E8DCCF] bg-[#FFFDF9] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] border border-[#C6EED0] flex items-center justify-center text-[#1D7E33] shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#7A6A58]">
              Replied
            </span>
            <span className="font-serif text-3xl font-bold text-[#2C2016] tracking-tight">
              {stats.replied}
            </span>
          </div>
        </div>

        {/* Pending (New) Card */}
        <div className="rounded-2xl border border-[#E8DCCF] bg-[#FFFDF9] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F3EEF9] border border-[#E3D5F0] flex items-center justify-center text-[#71449B] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#7A6A58]">
              Pending (New)
            </span>
            <span className="font-serif text-3xl font-bold text-[#2C2016] tracking-tight">
              {stats.pending}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 2. FILTERS & ACTIONS TOOLBAR ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] max-w-md relative">
          <Search className="w-4 h-4 text-[#8C6D3B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Email, Subject or Message..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-xs text-[#2C2016] placeholder:text-[#A89A88] outline-none focus:border-[#8C6D3B] transition-colors shadow-2xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 pr-8 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-xs font-medium text-[#2C2016] outline-none focus:border-[#8C6D3B] cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="Pending">Status: Pending</option>
              <option value="Replied">Status: Replied</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#8C6D3B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-xs font-medium text-[#2C2016] outline-none focus:border-[#8C6D3B] cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">Select Date Range</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <Calendar className="w-4 h-4 text-[#8C6D3B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-[#8C6D3B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ═══ 3. MAIN SPLIT VIEW (TABLE + DETAILS PANEL) ═══ */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Left: Messages Table */}
        <div className="flex-1 w-full rounded-3xl border border-[#E8DCCF] bg-[#FFFDF9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5D7C6] bg-[#FAF5EE]/50">
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider text-center w-12">
                    #
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider">
                    SUBJECT
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider">
                    RECEIVED ON
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider text-center">
                    STATUS
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-[#8C6D3B] uppercase tracking-wider text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7C6]/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#7A6A58]">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#8C6D3B]" />
                        <span>Loading messages...</span>
                      </div>
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#7A6A58]">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6] flex items-center justify-center text-[#8C6D3B] mb-3 shadow-inner">
                          <Mail className="w-7 h-7" />
                        </div>
                        <h4 className="font-serif text-base font-bold text-[#2C2016] mb-1">
                          No Contact Messages Yet
                        </h4>
                        <p className="text-xs text-[#7A6A58] leading-relaxed">
                          When visitors and customers submit inquiries on the Contact Us page, they will appear here in real-time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  messages.map((msg, idx) => {
                    const isSelected = selectedMessage?._id === msg._id;
                    const rowNumber = (page - 1) * 10 + idx + 1;

                    return (
                      <tr
                        key={msg._id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF5EE] font-medium'
                            : 'hover:bg-[#FAF5EE]/60'
                        }`}
                      >
                        {/* Index */}
                        <td className="py-3.5 px-4 text-center font-medium text-[#7A6A58]">
                          {rowNumber}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-[#2C2016]">
                          {msg.name}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-[#5A4838]">
                          {msg.email}
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-4 text-[#2C2016] max-w-[200px] truncate" title={msg.subject}>
                          {msg.subject}
                        </td>

                        {/* Received On */}
                        <td className="py-3.5 px-4 text-[#7A6A58] whitespace-nowrap">
                          {formatDateTime(msg.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {msg.status === 'Replied' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7EE] text-[#1D7E33] border border-[#C6EED0]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7E33]" />
                              <span>Replied</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EEF9] text-[#71449B] border border-[#E3D5F0]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#71449B]" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectMessage(msg)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#382618] text-[#FFFDF9]'
                                : 'text-[#6B5A4B] hover:text-[#2C2016] hover:bg-[#F2ECE1]'
                            }`}
                            title="View Message Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-[#E5D7C6] bg-[#FAF5EE]/30 text-xs text-[#7A6A58]">
            <div>
              Showing {messages.length > 0 ? (page - 1) * 10 + 1 : 0} –{' '}
              {Math.min(page * 10, totalCount)} of {totalCount} messages
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-lg border border-[#E5D7C6] bg-[#FFFDF9] flex items-center justify-center text-[#2C2016] hover:bg-[#FAF5EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pNum = i + 1;
                const isActive = pNum === page;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#382618] text-[#FFFDF9]'
                        : 'border border-[#E5D7C6] bg-[#FFFDF9] text-[#2C2016] hover:bg-[#FAF5EE]'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-lg border border-[#E5D7C6] bg-[#FFFDF9] flex items-center justify-center text-[#2C2016] hover:bg-[#FAF5EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 4. RIGHT DETAILS PANEL: MESSAGE DETAILS ═══ */}
        {selectedMessage && (
          <div className="w-full xl:w-[410px] shrink-0 rounded-3xl border border-[#E8DCCF] bg-[#FFFDF9] p-5 sm:p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5D7C6]">
              <h3 className="font-serif font-bold text-lg text-[#2C2016]">
                Message Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-[#7A6A58] hover:text-[#2C2016] hover:bg-[#FAF5EE] transition-colors cursor-pointer"
                title="Close Details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Avatar & Contact Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F5EDE1] border border-[#E8DCCF] flex items-center justify-center font-serif font-bold text-lg text-[#8C6D3B] shrink-0">
                {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-base text-[#2C2016] truncate">
                  {selectedMessage.name}
                </h4>
                <p className="text-xs text-[#7A6A58] truncate">
                  {selectedMessage.email}
                </p>
                {selectedMessage.phone && (
                  <p className="text-xs text-[#5A4838] flex items-center gap-1 mt-0.5 font-medium">
                    <Phone className="w-3 h-3 text-[#8C6D3B]" />
                    <span>{selectedMessage.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Subject & Received Date */}
            <div className="space-y-1.5 text-xs pt-1">
              <p className="text-[#2C2016] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                <span className="font-bold">Subject:</span>
                <span className="text-[#5A4838]">{selectedMessage.subject}</span>
              </p>
              <p className="text-[#7A6A58] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                <span>
                  Received:{' '}
                  {new Date(selectedMessage.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(selectedMessage.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).toLowerCase()}
                </span>
              </p>
            </div>

            {/* Message Body Box */}
            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#2C2016] block">
                Message:
              </span>
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E5D7C6]/70 text-xs text-[#4A3828] leading-relaxed whitespace-pre-line">
                {selectedMessage.message}
              </div>
            </div>

            {/* Reply to Customer Section */}
            <div className="space-y-2.5 pt-1 border-t border-[#E5D7C6]/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#2C2016] flex items-center gap-1.5">
                  <span className="text-[#8C6D3B]">↩</span> Reply to Customer
                </span>
                {selectedMessage.status === 'Replied' && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Replied
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-3 rounded-2xl border border-[#E5D7C6] bg-[#FFFDF9] text-xs text-[#2C2016] placeholder:text-[#A89A88] outline-none focus:border-[#8C6D3B] transition-colors resize-none shadow-2xs leading-relaxed"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleMarkAsReplied}
                  disabled={submittingReply || selectedMessage.status === 'Replied'}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#B88A4F]/60 text-[#5A3810] bg-[#FFFDF9] hover:bg-[#F2ECE1] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Mark as Replied</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={submittingReply}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#704214] hover:bg-[#5A340F] text-[#FFFDF9] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReply ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminMessagesPage;

