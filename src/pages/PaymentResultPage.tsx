import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useDeck } from '../context/DeckContext';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { entitlements } = useDeck();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="bg-[#FFFDF9] border border-[#8C6D3B]/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 w-full">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-[#1A1817]">Access Granted</h1>
          <p className="text-sm text-[#1A1817]/70">
            Your payment has been cryptographically verified and your cosmic access is now active.
          </p>
        </div>

        {entitlements?.isDeckPassActive && (
          <div className="p-4 rounded-2xl bg-[#F2ECE1] border border-[#8C6D3B]/30 text-xs text-[#1A1817] space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[#8C6D3B] font-bold uppercase tracking-wider text-[11px]">
              <Crown className="w-4 h-4" />
              <span>30-Day Complete Deck Pass</span>
            </div>
            {entitlements.deckPassExpiresAt && (
              <p className="text-[#1A1817]/70 font-mono">
                Valid until:{' '}
                <strong className="text-[#1A1817]">
                  {new Date(entitlements.deckPassExpiresAt).toLocaleDateString()}
                </strong>
              </p>
            )}
          </div>
        )}

        {paymentId && (
          <div className="text-[11px] font-mono text-[#8C6D3B]">
            Transaction ID: {paymentId}
          </div>
        )}

        <Link
          to="/deck"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2"
        >
          <span>Return to Your 55 Cards</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
