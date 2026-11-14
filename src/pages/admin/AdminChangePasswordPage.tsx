import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

export const AdminChangePasswordPage: React.FC = () => {
  const { user } = useAuth();
  const adminUser = (() => {
    try {
      const saved = localStorage.getItem('pc_admin_user');
      return saved ? JSON.parse(saved) : user;
    } catch {
      return user;
    }
  })();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword.trim()) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess(res.message || 'Password updated successfully! Your credentials are now active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update password. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isMinLength = newPassword.length >= 6;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Current Admin Badge Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DCCF] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8C6D3B]/10 border border-[#8C6D3B]/25 flex items-center justify-center text-[#8C6D3B]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#2C2016]">
              Administrative Credentials
            </h2>
            <p className="text-xs text-[#7B6E64]">
              Change password for your authorized admin console account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#E5D7C6] text-xs text-[#6B5A4E]">
          <Shield className="w-4 h-4 text-[#8C6D3B]" />
          <span>Signed in as:</span>
          <span className="font-semibold text-[#2C2016]">{adminUser?.email || 'Administrator'}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#8C6D3B]/15 text-[#6B4E26] text-[10px] font-bold uppercase tracking-wider">
            {adminUser?.role || 'Admin'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(56,38,24,0.04)] relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Banner */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {success && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-emerald-900">Success!</p>
                    <p className="font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Current Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8988B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing admin password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder-[#A8988B]/60 outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A8988B] hover:text-[#2C2016] transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8988B]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder-[#A8988B]/60 outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A8988B] hover:text-[#2C2016] transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {newPassword && (
                  <div className="pt-1 flex flex-wrap gap-3 text-[11px]">
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isMinLength ? 'text-emerald-700' : 'text-[#8C6D3B]'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Minimum 6 characters
                    </span>
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        hasLettersAndNumbers ? 'text-emerald-700' : 'text-[#8C6D3B]'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Letters & numbers recommended
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C6D3B]">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8988B]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5D7C6] bg-[#FFFDF9] text-sm text-[#2C2016] placeholder-[#A8988B]/60 outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A8988B] hover:text-[#2C2016] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <p
                    className={`text-[11px] font-medium ${
                      newPassword === confirmPassword ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#382618] hover:bg-[#4E3725] text-[#FAF6F0] font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encrypting & Updating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D8B468]" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#E5D7C6] bg-[#FAF5EE] text-xs text-[#694316] hover:bg-[#F0E6D8] font-bold transition-all"
                >
                  Clear Fields
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Audit Guidelines Sidebar Card */}
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl p-6 space-y-4 shadow-[0_4px_24px_rgba(56,38,24,0.04)]">
            <div className="flex items-center gap-2.5 text-[#8C6D3B]">
              <Shield className="w-5 h-5 text-[#8C6D3B]" />
              <h3 className="font-serif font-bold text-sm text-[#2C2016]">Security Protocol</h3>
            </div>
            <p className="text-xs text-[#7B6E64] leading-relaxed">
              Administrative credentials gate access to cards, store products, customers, and financial records.
            </p>
            <ul className="space-y-2.5 text-xs text-[#5D4E43]">
              <li className="flex items-start gap-2">
                <span className="text-[#8C6D3B] font-bold">•</span>
                <span>Passwords are salted with 10 rounds of bcrypt hashing before database commit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C6D3B] font-bold">•</span>
                <span>Any change event is permanently stored in the immutable system Audit Trail.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C6D3B] font-bold">•</span>
                <span>Never share administrative credentials or reuse common personal passwords.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E8DCCF] text-center space-y-1">
            <span className="text-[11px] text-[#7B6E64]">Active Session Protocol:</span>
            <div className="text-xs font-mono text-[#2C2016] font-semibold">JWT Bearer • SSL Encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePasswordPage;
