import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // If already logged in as admin via admin token, redirect to dashboard
  useEffect(() => {
    const adminToken = localStorage.getItem('pc_admin_token');
    const adminSaved = localStorage.getItem('pc_admin_user');
    if (adminToken && adminSaved) {
      try {
        const u = JSON.parse(adminSaved);
        const adminRoles = ['admin', 'superadmin', 'analytics_manager', 'content_manager', 'support_admin'];
        if (adminRoles.includes(u.role)) {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch {
        // invalid JSON, ignore
      }
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password');
      }

      // Log in directly without overwriting the consumer seeker session
      const res = await authService.login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const adminRoles = ['admin', 'superadmin', 'analytics_manager', 'content_manager', 'support_admin'];
      if (!adminRoles.includes(res.user.role)) {
        throw new Error('This account does not have administrative privileges.');
      }

      // Store in dedicated admin keys — preserving frontend user session!
      localStorage.setItem('pc_admin_token', res.token);
      localStorage.setItem('pc_admin_user', JSON.stringify(res.user));

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify admin credentials.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,calc(100vw-2rem))] aspect-square bg-[#8C6D3B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2ECE1] border border-[#8C6D3B]/40 text-[#8C6D3B] text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-[#8C6D3B]" />
            Parrot Cards Admin
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
            Admin Portal
          </h1>
          <p className="font-serif italic text-sm text-[#8C6D3B]">
            Sign in with your administrator account.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6D3B] via-[#7A1C1C] to-[#8C6D3B]" />

          {/* Error / Success Notifications */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#7A1C1C]/10 border border-[#7A1C1C]/30 text-[#7A1C1C] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#7A1C1C] mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Signed in. Opening the admin dashboard…</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8C6D3B] tracking-wide uppercase">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-[#1A1817] text-sm outline-none transition-all placeholder:text-[#8C6D3B]/40"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8C6D3B] tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-[#1A1817] text-sm outline-none transition-all placeholder:text-[#8C6D3B]/40 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6D3B] hover:text-[#1A1817] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] hover:brightness-105 active:scale-[0.98] text-[#FFFDF9] font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FFFDF9] border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In To Admin Panel</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#8C6D3B] hover:text-[#1A1817] transition-colors font-serif font-medium"
          >
            ← Return to Seeker Deck Experience
          </button>
        </div>
      </div>
    </div>
  );
};
