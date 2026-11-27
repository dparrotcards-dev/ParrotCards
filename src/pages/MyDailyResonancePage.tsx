import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <DailyResonanceAccount />
    </div>
  );
};
