import { api } from './api';
import { IUser } from '../types';

export const authService = {
  async register(data: { email: string; password: string; name: string }): Promise<{ user: IUser; token: string }> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: IUser; token: string }> {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  async loginWithGoogle(idToken: string): Promise<{ user: IUser; token: string }> {
    const res = await api.post('/auth/google', { idToken });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('pc_token');
  },

  async getMe(): Promise<IUser> {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  async forgotPassword(
    email: string,
    accountType: 'customer' | 'admin' = 'customer'
  ): Promise<{ success: boolean; message: string; devLink?: string }> {
    const res = await api.post('/auth/forgot-password', { email, accountType });
    return res.data;
  },

  async verifyResetToken(
    token: string,
    accountType?: 'customer' | 'admin'
  ): Promise<{ valid: boolean; accountType?: 'customer' | 'admin'; message?: string }> {
    const res = await api.post('/auth/verify-reset-token', { token, accountType });
    return res.data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
    accountType?: 'customer' | 'admin'
  ): Promise<{ success: boolean; message: string; accountType?: string }> {
    const res = await api.post('/auth/reset-password', { token, newPassword, accountType });
    return res.data;
  },
};
