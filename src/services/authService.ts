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

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('pc_token');
  },

  async getMe(): Promise<IUser> {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },
};
