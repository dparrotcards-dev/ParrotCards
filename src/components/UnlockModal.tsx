import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ICard } from '../types';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';

interface UnlockModalProps {
  card?: ICard | null;
  mode?: 'CARD' | 'PASS';
  onClose: () => void;
  onSuccess?: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  card,
  mode = 'CARD',
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, register: registerUser } = useAuth();
  const { refreshDeck } = useDeck();
  const [selectedMode, setSelectedMode] = useState<'CARD' | 'PASS'>(mode);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cardPrice = card?.price !== undefined ? card.price : 2;

  // Authentication view state (for users who are not logged in)
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const startPaymentFlow = async () => {
    setLoading(true);
    setError(null);

    try {
      const itemType = selectedMode === 'CARD' ? 'CARD_UNLOCK' : 'DECK_PASS';
      const cardKey = selectedMode === 'CARD' ? card?.key : undefined;

      // 1. Create order on backend
      const orderData = await paymentService.createOrder(itemType, cardKey);

      // 2. Load Razorpay SDK
      const sdkLoaded = await paymentService.loadRazorpayScript();

      // If Razorpay SDK not loaded or running test simulated keys
      if (!sdkLoaded || !window.Razorpay || orderData.razorpayOrderId.startsWith('order_sim_')) {
        // Automatically verify in simulated test environment
        const verifyRes = await paymentService.verifyPayment({
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'simulated_valid_sig',
        });

        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        setSuccessMessage(verifyRes.message || 'Payment verified and access granted!');
        await refreshDeck();
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1600);
        return;
      }

      // 3. Open Real Razorpay Checkout Modal
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Parrot Cards',
        description: selectedMode === 'CARD' ? `Unlock ${card?.title || 'Card'}` : '30-Day Complete Deck Pass',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#e2bd6b',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });

            setSuccessMessage(verifyRes.message || 'Payment successful!');
            await refreshDeck();
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 1600);
          } catch (err: any) {
            setError(err.message || 'Payment signature verification failed.');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setAuthView('LOGIN');
      setError(null);
      return;
    }
    startPaymentFlow();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authView === 'LOGIN') {
        await login({ email: authEmail, password: authPassword });
      } else {
        if (!authName.trim()) {
          throw new Error('Please enter your full name');
        }
        await registerUser({ email: authEmail, password: authPassword, name: authName.trim() });
      }

      // Successfully logged in / registered! Proceed directly to payment
      setAuthView(null);
      await startPaymentFlow();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-[#1A1817]/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF7F2] border-2 border-[#8C6D3B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#1A1817] space-y-6 my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-[#F2ECE1] hover:bg-[#EAE1D2] text-[#6B635B] hover:text-[#1A1817] border border-[#8C6D3B]/25 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════════ AUTHENTICATION VIEW ════════════════════ */}
        {authView ? (
          <div className="space-y-5">
            {/* Back Button & Price Tag Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#8C6D3B]/20">
              <button
                type="button"
                onClick={() => setAuthView(null)}
                className="flex items-center gap-1.5 text-xs font-cinzel font-semibold text-[#8C6D3B] hover:text-[#73582D] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Options</span>
              </button>
              <span className="text-[11px] font-mono font-bold text-[#8C6D3B] px-2 py-0.5 rounded-full bg-[#FAF0D9] border border-[#D5B87D]">
                {selectedMode === 'CARD' ? `₹${cardPrice} UNLOCK` : '₹25 PASS'}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <span className="text-[#8C6D3B] text-2xl font-serif">✦</span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#8C6D3B]">
                {authView === 'LOGIN' ? 'Sign In to Unlock' : 'Create Account to Unlock'}
              </h3>
              <p className="text-xs text-[#6B635B] max-w-xs mx-auto font-serif">
                {authView === 'LOGIN'
                  ? `Sign in to unlock ${card?.title || 'your card'} and link it permanently to your account.`
                  : 'Create an account to save your natal sky & access purchased cards anytime.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthView('LOGIN');
                  setAuthError(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authView === 'LOGIN'
                    ? 'bg-[#8C6D3B] text-[#FFFDF9] shadow-md font-bold'
                    : 'text-[#6B635B] hover:text-[#1A1817]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView('REGISTER');
                  setAuthError(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authView === 'REGISTER'
                    ? 'bg-[#8C6D3B] text-[#FFFDF9] shadow-md font-bold'
                    : 'text-[#6B635B] hover:text-[#1A1817]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authView === 'REGISTER' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#6B635B] uppercase tracking-wider mb-1 font-cinzel">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]/60" />
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8C6D3B]/30 bg-[#FFFDF9] text-sm text-[#1A1817] focus:outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#6B635B] uppercase tracking-wider mb-1 font-cinzel">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]/60" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8C6D3B]/30 bg-[#FFFDF9] text-sm text-[#1A1817] focus:outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B635B] uppercase tracking-wider mb-1 font-cinzel">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D3B]/60" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#8C6D3B]/30 bg-[#FFFDF9] text-sm text-[#1A1817] focus:outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-sm uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>
                    {authView === 'LOGIN' ? 'Sign In & Pay' : 'Create Account & Pay'} · {selectedMode === 'CARD' ? `₹${cardPrice}` : '₹25'}
                  </span>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login', { state: { from: location.pathname } });
                }}
                className="text-xs text-[#8C6D3B] hover:text-[#73582D] underline font-serif cursor-pointer"
              >
                Or open full login / register page →
              </button>
            </div>
          </div>
        ) : (
          /* ════════════════════ PRICING OPTIONS VIEW ════════════════════ */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[#8C6D3B] text-2xl font-serif">✦</span>
              <h3 className="font-cinzel text-2xl font-bold text-[#8C6D3B]">Unlock Cosmic Wisdom</h3>
              <p className="text-xs text-[#6B635B] max-w-xs mx-auto font-serif">
                Choose an option below to reveal your authentic astrological placements & deep interpretations.
              </p>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-2 gap-3">
              {card && (
                <button
                  onClick={() => setSelectedMode('CARD')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedMode === 'CARD'
                      ? 'border-[#8C6D3B] bg-[#FFFDF9] shadow-[0_4px_16px_rgba(140,109,59,0.22)]'
                      : 'border-[#8C6D3B]/25 bg-[#F2ECE1]/60 hover:bg-[#F2ECE1]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D3B] mb-1 font-cinzel">
                    Single Card
                  </div>
                  <div className="font-cinzel text-2xl font-bold text-[#1A1817]">₹{cardPrice}</div>
                  <div className="text-[11px] text-[#6B635B] mt-1 line-clamp-1 truncate font-serif">
                    {card.title}
                  </div>
                </button>
              )}

              <button
                onClick={() => setSelectedMode('PASS')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedMode === 'PASS' || !card
                    ? 'border-[#8C6D3B] bg-[#FFFDF9] shadow-[0_4px_16px_rgba(140,109,59,0.22)]'
                    : 'border-[#8C6D3B]/25 bg-[#F2ECE1]/60 hover:bg-[#F2ECE1]'
                } ${!card ? 'col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#8C6D3B] mb-1 font-cinzel">
                  <span>All 55 Cards</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#8C6D3B]/15 text-[#8C6D3B] text-[9px] font-bold">Best Value</span>
                </div>
                <div className="font-cinzel text-2xl font-bold text-[#1A1817]">₹25</div>
                <div className="text-[11px] text-[#6B635B] mt-1 font-serif">30-Day All-Access Pass</div>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/20 space-y-2 text-xs text-[#5C5650]">
              <div className="flex items-center gap-2 text-[#1A1817]">
                <CheckCircle2 className="w-4 h-4 text-[#2E5A36] flex-shrink-0" />
                <span className="font-serif">
                  {selectedMode === 'CARD'
                    ? `Permanent unlock for "${card?.label || 'Selected Card'}"`
                    : 'Full access to all 55 cards & 3 Master Keys for 30 days'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1817]">
                <Sparkles className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span className="font-serif">AI Oracle deep interpretations, reflection inquiries & action steps</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1817]">
                <Shield className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
                <span className="font-serif">Secure 256-bit encrypted checkout via Razorpay</span>
              </div>
            </div>

            {/* Friendly Sign-In Reminder for Guests */}
            {!isAuthenticated && (
              <div
                onClick={() => setAuthView('LOGIN')}
                className="p-3 rounded-2xl bg-[#FAF0D9] border border-[#D5B87D] text-xs text-[#8C6D3B] flex items-center justify-between gap-2 cursor-pointer hover:bg-[#F5E6C3] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="w-4 h-4 flex-shrink-0 text-[#8C6D3B]" />
                  <span className="truncate">Sign in required to link & save cards permanently.</span>
                </div>
                <span className="font-cinzel font-bold text-[11px] underline shrink-0">Sign In →</span>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div
                onClick={() => {
                  if (!isAuthenticated) setAuthView('LOGIN');
                }}
                className={`p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 flex items-center justify-between gap-2 ${
                  !isAuthenticated ? 'cursor-pointer hover:bg-red-200/80 transition-colors' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {!isAuthenticated && (
                  <span className="font-bold underline text-[11px] shrink-0 font-cinzel">Sign In →</span>
                )}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              disabled={loading || !!successMessage}
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#8C6D3B] hover:bg-[#73582D] text-[#FAF7F2] font-cinzel font-bold text-sm uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {!isAuthenticated ? 'Sign In & Proceed to Pay' : 'Proceed to Pay'} · {selectedMode === 'CARD' ? `₹${cardPrice}` : '₹25'}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
