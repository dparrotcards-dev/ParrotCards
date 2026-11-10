import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<IUser>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const saved = localStorage.getItem('pc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !localStorage.getItem('pc_user') && !!localStorage.getItem('pc_token');
  });

  const refreshUser = async () => {
    const rawToken = localStorage.getItem('pc_token');
    const token = rawToken && rawToken !== 'undefined' && rawToken !== 'null' ? rawToken : null;
    if (!token) {
      setUser(null);
      localStorage.removeItem('pc_user');
      setLoading(false);
      return;
    }

    try {
      const u = await authService.getMe();
      if (u) {
        setUser(u);
        localStorage.setItem('pc_user', JSON.stringify(u));
      }
    } catch (err: any) {
      console.warn('Session verification on refresh:', err?.message);
      // Keep user logged in from local cache until they explicitly click Sign Out!
      const saved = localStorage.getItem('pc_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        try {
          setUser(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    localStorage.setItem('pc_token', res.token);
    localStorage.setItem('pc_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    const res = await authService.register(data);
    localStorage.setItem('pc_token', res.token);
    localStorage.setItem('pc_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('pc_token');
      localStorage.removeItem('pc_user');
      localStorage.removeItem('pc_entitlements');
      localStorage.removeItem('pc_deck');
      localStorage.removeItem('pc_cards');
      localStorage.removeItem('pc_profile');
      window.dispatchEvent(new Event('pc_auth_logout'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
