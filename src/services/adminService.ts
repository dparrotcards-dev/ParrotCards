import { api } from './api';

export interface AdminDashboardData {
  metrics: {
    totalUsers: number;
    totalDecks: number;
    totalCalculations: number;
    totalOrders: number;
    paidOrdersCount: number;
    storeStatusCounts?: {
      delivered: number;
      shipped: number;
      processing: number;
      confirmed: number;
      cancelled: number;
    };
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
    customerName?: string;
    userEmail: string;
    productName?: string;
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

  getStoreOrders: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const res = await api.get('/admin/store-orders', { params });
    return res.data.data;
  },

  updateStoreOrderStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/store-orders/${id}/status`, { status });
    return res.data;
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

  // Cosmic Store Products
  createProduct: async (productData: {
    name: string;
    shortDescription: string;
    price: number;
    mrp: number;
    badge: string;
    category: string;
    image: string;
  }) => {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: string;
    isActive?: string;
  }) => {
    const res = await api.get('/admin/products', { params });
    return res.data.data;
  },

  updateProduct: async (
    id: string,
    data: {
      name?: string;
      shortDescription?: string;
      price?: number;
      mrp?: number;
      badge?: string;
      category?: string;
      image?: string;
      inStock?: boolean;
      isActive?: boolean;
    }
  ) => {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  toggleProductStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/admin/products/${id}/status`, { isActive });
    return res.data;
  },

  toggleProductStock: async (id: string, inStock: boolean) => {
    const res = await api.patch(`/admin/products/${id}/stock`, { inStock });
    return res.data;
  },
};

