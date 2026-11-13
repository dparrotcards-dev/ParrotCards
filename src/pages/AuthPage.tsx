import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, ExternalLink, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(false);
    setForgotMessage(null);
    setDevLink(null);

    if (!forgotEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSuccess(true);
      setForgotMessage(res.message);
      if (res.devLink) setDevLink(res.devLink);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!data.name || data.name.trim().length < 2) {
          throw new Error('Please enter your name');
        }
        await registerUser({
          email: data.email,
          password: data.password,
          name: data.name,
        });
        const returnUrl = (location.state as any)?.from || '/';
        navigate(returnUrl);
      } else {
        const loggedInUser = await login({
          email: data.email,
          password: data.password,
        });

        if (loggedInUser && ['admin', 'superadmin', 'analytics_manager', 'content_manager', 'support_admin'].includes(loggedInUser.role)) {
          navigate('/admin/dashboard');
        } else {
          const returnUrl = (location.state as any)?.from || '/';
          navigate(returnUrl);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[#8C6D3B] text-3xl select-none">✦</span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1817]">
            {isRegister ? 'Begin Your Journey' : 'Welcome Back'}
          </h1>
          <p className="font-serif italic text-sm text-[#8C6D3B]">
            {isRegister
              ? 'Create an account to save your natal sky & access purchased passes'
              : 'Sign in to access your birth sky, personalized deck & entitlements'}
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {isForgotPassword ? (
            <div className="space-y-4">
              <div className="text-center space-y-1 pb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECE1] text-[#8C6D3B] text-xs font-semibold uppercase tracking-wider mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Reset</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1817]">Forgot Your Password?</h3>
                <p className="text-xs text-[#7A746E]">
                  Enter your registered email address and we will dispatch a secure reset link.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#7A1C1C]/10 border border-[#7A1C1C]/30 text-xs text-[#7A1C1C] font-medium">
                  {error}
                </div>
              )}

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-emerald-950">Reset Link Dispatched!</p>
                      <p className="leading-relaxed">{forgotMessage}</p>
                      <p className="text-[11px] text-emerald-800/80 mt-1">Check your inbox and spam folder for the link.</p>
                    </div>
                  </div>

                  {devLink && (
                    <div className="p-3.5 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D3B]">
                        <span>Dev Mode Quick Link:</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                      <a href={devLink} className="text-xs text-[#7A1C1C] hover:underline font-mono break-all block">
                        {devLink}
                      </a>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSuccess(false);
                      setError(null);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 hover:bg-[#EAE2D5] text-[#1A1817] font-semibold text-xs tracking-wide transition-all"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-[#8C6D3B] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#8C6D3B]" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seeker@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 text-[#1A1817] placeholder-[#8C6D3B]/50 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-sm"
                    />
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] hover:brightness-105 active:scale-[0.98] text-[#FFFDF9] font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <div className="w-5 h-5 border-2 border-[#FFFDF9] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setError(null);
                      }}
                      className="w-full py-2.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] font-medium transition-colors text-center"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/20 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    !isRegister
                      ? 'bg-[#8C6D3B] text-[#FFFDF9] shadow-md font-bold'
                      : 'text-[#1A1817]/70 hover:text-[#1A1817]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    isRegister
                      ? 'bg-[#8C6D3B] text-[#FFFDF9] shadow-md font-bold'
                      : 'text-[#1A1817]/70 hover:text-[#1A1817]'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[#8C6D3B] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Full Name</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Arjun Verma"
                  className="w-full px-4 py-3 rounded-xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 text-[#1A1817] placeholder-[#8C6D3B]/50 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-[#8C6D3B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Email Address</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="seeker@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 text-[#1A1817] placeholder-[#8C6D3B]/50 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-sm"
              />
              {errors.email && (
                <span className="text-xs text-[#7A1C1C] font-medium">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-widest font-semibold text-[#8C6D3B] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Password</span>
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                    }}
                    className="text-xs text-[#8C6D3B] hover:text-[#1A1817] font-medium transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 text-[#1A1817] placeholder-[#8C6D3B]/50 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-sm"
              />
              {errors.password && (
                <span className="text-xs text-[#7A1C1C] font-medium">{errors.password.message}</span>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#7A1C1C]/10 border border-[#7A1C1C]/30 text-xs text-[#7A1C1C] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] hover:brightness-105 active:scale-[0.98] text-[#FFFDF9] font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#FFFDF9] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};
