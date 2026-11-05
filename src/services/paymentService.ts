import { api } from './api';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export const paymentService = {
  async createOrder(itemType: 'CARD_UNLOCK' | 'DECK_PASS', cardKey?: string) {
    const res = await api.post('/payments/create-order', {
      itemType,
      cardKey,
    });
    return res.data.data;
  },

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },

  async getPaymentHistory() {
    const res = await api.get('/payments/history');
    return res.data.data;
  },

  async getEntitlements() {
    const res = await api.get('/entitlements');
    return res.data.data;
  },

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
