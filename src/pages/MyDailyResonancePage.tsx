import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyResonanceAccount } from '../components/DailyResonanceAccount';

export const MyDailyResonancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: '/my-daily-resonance' },
      });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) {
    return (
      <div role="status" className="flex min-h-[50vh] flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8C6D3B] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] flex-1 px-3 py-4 sm:px-5 sm:py-6">
      <Link
        to="/account"
        className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[#8C6D3B] transition-colors hover:text-[#1A1817] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6D3B]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        <span>Back to Account</span>
      </Link>
      <DailyResonanceAccount />
    </div>
  );
};
