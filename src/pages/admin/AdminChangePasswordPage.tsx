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
      const msg = err.response?.data?.message || err.message || 'Failed to update password. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isMinLength = newPassword.length >= 6;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#F6F0E6] tracking-tight">
                Change Admin Password
              </h1>
              <p className="text-xs text-[#A7A4C4] mt-0.5">
                Update your administrative console credentials securely with bcrypt encryption
              </p>
            </div>
          </div>
        </div>

        {/* Current Admin Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#111033] border border-white/10 text-xs text-[#A7A4C4]">
          <Shield className="w-4 h-4 text-[#C9A45C]" />
          <span>Signed in as:</span>
          <span className="font-semibold text-[#F6F0E6]">{user?.email || 'Administrator'}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#C9A45C]/20 text-[#C9A45C] text-[10px] font-bold uppercase tracking-wider">
            {user?.role || 'Admin'}
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[#111033] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle Cosmic Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A45C]/5 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Error Banner */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {success && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-emerald-200">Success!</p>
                    <p>{success}</p>
                  </div>
                </div>
              )}

              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#F6F0E6] uppercase tracking-wider">
                  Current Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7A4C4]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing admin password"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#08071B]/80 border border-white/15 text-sm text-[#F6F0E6] placeholder-[#A7A4C4]/50 focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#F6F0E6] uppercase tracking-wider">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7A4C4]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#08071B]/80 border border-white/15 text-sm text-[#F6F0E6] placeholder-[#A7A4C4]/50 focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {newPassword && (
                  <div className="pt-1.5 flex flex-wrap gap-3 text-[11px]">
                    <span className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-400' : 'text-[#A7A4C4]'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Minimum 6 characters
                    </span>
                    <span className={`flex items-center gap-1 ${hasLettersAndNumbers ? 'text-emerald-400' : 'text-[#A7A4C4]'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Letters & numbers recommended
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#F6F0E6] uppercase tracking-wider">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A7A4C4]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#08071B]/80 border border-white/15 text-sm text-[#F6F0E6] placeholder-[#A7A4C4]/50 focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A7A4C4] hover:text-[#F6F0E6] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <p className={`text-[11px] ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#C9A45C] hover:bg-[#d6b36a] text-[#08071B] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C9A45C]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encrypting & Updating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
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
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-[#A7A4C4] hover:text-[#F6F0E6] font-medium transition-all"
                >
                  Clear Fields
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Audit Guidelines Sidebar Card */}
        <div className="space-y-4">
          <div className="bg-[#111033] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#C9A45C]">
              <Shield className="w-4 h-4" />
              <h3 className="font-serif font-bold text-sm text-[#F6F0E6]">Security Protocol</h3>
            </div>
            <p className="text-xs text-[#A7A4C4] leading-relaxed">
              Administrative credentials gate access to celestial card configurations, financial data, and user registries.
            </p>
            <ul className="space-y-2.5 text-xs text-[#A7A4C4]">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A45C] font-bold">•</span>
                <span>Passwords are salted with 10 rounds of bcrypt hashing before database commit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A45C] font-bold">•</span>
                <span>Any change event is permanently stored in the immutable system Audit Trail.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A45C] font-bold">•</span>
                <span>Never share administrative credentials or reuse consumer account passwords.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-[#08071B] border border-white/5 text-center space-y-1">
            <span className="text-[11px] text-[#A7A4C4]">Active Session Protocol:</span>
            <div className="text-xs font-mono text-emerald-400 font-semibold">JWT Bearer • SSL Encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminChangePasswordPage;
