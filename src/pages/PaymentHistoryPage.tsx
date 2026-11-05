import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    paymentService
      .getPaymentHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <div>
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] mb-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1A1817]">Payment History & Receipts</h1>
        <p className="text-xs text-[#8C6D3B] mt-1 font-medium">
          Complete ledger of your purchases and transactions on Parrot Cards.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-serif text-[#8C6D3B]">
          Loading payment ledger…
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#FFFDF9] border border-[#8C6D3B]/25 text-center space-y-3 shadow-md">
          <History className="w-8 h-8 text-[#8C6D3B] mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-[#1A1817]">No Transactions Recorded</h3>
          <p className="text-xs text-[#1A1817]/70">
            You have not made any purchases yet. The first 3 cards are always open for free!
          </p>
          <Link
            to="/pricing"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
          >
            View Pricing Options
          </Link>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A1817]/10 text-[#1A1817]/70 uppercase text-[10px] tracking-wider bg-[#F2ECE1]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Item Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1817]/5">
              {history.map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#F2ECE1]/40 transition-colors">
                  <td className="py-3 px-4 text-[#1A1817]/70 font-mono">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1A1817]">
                    {tx.itemType === 'DECK_PASS' ? '30-Day Deck Pass' : 'Individual Card'}
                  </td>
                  <td className="py-3 px-4 text-[#8C6D3B] font-mono">
                    {tx.itemId || 'All 55 Cards'}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-[#8C6D3B] text-sm">
                    ₹{tx.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {tx.status === 'PAID' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
