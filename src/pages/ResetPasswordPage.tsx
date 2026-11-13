import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token. Please use the exact link sent to your email.');
      return;
    }

    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,calc(100vw-2rem))] aspect-square bg-[#8C6D3B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2ECE1] border border-[#8C6D3B]/40 text-[#8C6D3B] text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm">
            <KeyRound className="w-3.5 h-3.5 text-[#8C6D3B]" />
            Security & Authentication
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
            Reset Your Password
          </h1>
          <p className="font-serif italic text-sm text-[#8C6D3B]">
            Create a secure new password for your Parrot Cards account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6D3B] via-[#D4AF37] to-[#8C6D3B]" />

          {/* Missing Token Alert */}
          {!token && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#7A1C1C]/10 border border-[#7A1C1C]/30 text-[#7A1C1C] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#7A1C1C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Invalid or Missing Reset Token</p>
                <p>This password reset page requires a valid security token from the email link.</p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="mt-3 text-xs font-bold underline hover:opacity-80 block"
                >
                  Return to Admin Login &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#7A1C1C]/10 border border-[#7A1C1C]/30 text-[#7A1C1C] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#7A1C1C] mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success State */}
          {success ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#1A1817]">Password Updated!</h3>
                <p className="text-xs text-[#7A746E] leading-relaxed">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <span>Sign In To Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 px-5 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 text-[#1A1817] font-semibold text-xs tracking-wide hover:bg-[#EAE2D5] transition-all"
                >
                  Sign In As Seeker / User
                </button>
              </div>
            </div>
          ) : (
            token && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#8C6D3B] tracking-wide uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-[#1A1817] text-sm outline-none transition-all placeholder:text-[#8C6D3B]/40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6D3B] hover:text-[#1A1817] transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#8C6D3B] tracking-wide uppercase">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B] pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-[#1A1817] text-sm outline-none transition-all placeholder:text-[#8C6D3B]/40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6D3B] hover:text-[#1A1817] transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] hover:brightness-105 active:scale-[0.98] text-[#FFFDF9] font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FFFDF9] border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Save New Password</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="text-xs text-[#8C6D3B] hover:text-[#1A1817] transition-colors font-serif font-medium"
          >
            ← Back to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

