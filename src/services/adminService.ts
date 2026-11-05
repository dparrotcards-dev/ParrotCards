import { api } from './api';

export interface AdminDashboardData {
  metrics: {
    totalUsers: number;
    totalDecks: number;
    totalCalculations: number;
    totalOrders: number;
    paidOrdersCount: number;
    paymentSuccessRate: number;
    totalRevenueRupees: number;
    activePassesCount: number;
    aiInterpretationsCount: number;
    fallbackInterpretationsCount: number;
    aiGenerationRate: number;
  };
  revenueTrend: Array<{
    date: string;
    revenueRupees: number;
    ordersCount: number;
  }>;
  userGrowthTrend: Array<{
    date: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  }>;
  recentDecks: Array<{
    id: string;
    userName: string;
    sovereignCardKey: string;
    avatarPhrase: string;
    isAvatarAiGenerated: boolean;
    generatedAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderId: string;
    userEmail: string;
    amountRupees: number;
    itemType: string;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  systemStatus: {
    nodeEnv: string;
    geminiModel: string;
    geminiConfigured: boolean;
    astronomyProvider: string;
    razorpayConfigured: boolean;
    database: {
      host: string;
      isAtlas: boolean;
      connected: boolean;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminService = {
  getStats: async (): Promise<AdminDashboardData> => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  getUserDetails: async (id: string) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  getDecks: async (params?: { page?: number; limit?: number; search?: string; aiFilter?: string }) => {
    const res = await api.get('/admin/decks', { params });
    return res.data.data;
  },

  getDeckDetails: async (id: string) => {
    const res = await api.get(`/admin/decks/${id}`);
    return res.data.data;
  },

  getCardsCatalog: async () => {
    const res = await api.get('/admin/cards');
    return res.data.data;
  },

  updateCard: async (id: string, cardData: Record<string, any>) => {
    const res = await api.put(`/admin/cards/${id}`, cardData);
    return res.data;
  },

  toggleCardAccess: async (id: string, isFree: boolean) => {
    const res = await api.patch(`/admin/cards/${id}/access`, { isFree });
    return res.data;
  },

  deleteCard: async (id: string) => {
    const res = await api.delete(`/admin/cards/${id}`);
    return res.data;
  },

  getPayments: async (params?: { page?: number; limit?: number; status?: string; itemType?: string; search?: string }) => {
    const res = await api.get('/admin/payments', { params });
    return res.data.data;
  },

  deletePayment: async (id: string) => {
    const res = await api.delete(`/admin/payments/${id}`);
    return res.data;
  },

  getAiMonitoring: async () => {
    const res = await api.get('/admin/ai-monitoring');
    return res.data.data;
  },

  getAstronomyMonitoring: async () => {
    const res = await api.get('/admin/astronomy');
    return res.data.data;
  },

  getAnalytics: async (range: string = '30d') => {
    const res = await api.get('/admin/analytics', { params: { range } });
    return res.data.data;
  },

  getSystemHealth: async () => {
    const res = await api.get('/admin/system');
    return res.data.data;
  },

  getAdmins: async () => {
    const res = await api.get('/admin/admins');
    return res.data.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string; targetType?: string }) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/admin/change-password', data);
    return res.data;
  },
};

