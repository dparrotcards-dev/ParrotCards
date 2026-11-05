import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token or guest session if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let guestId = localStorage.getItem('pc_guest_session_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('pc_guest_session_id', guestId);
  }
  config.headers['X-Guest-Session-Id'] = guestId;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? error.response.data.errors.map((e: any) => e.message).join(', ')
        : error.message) ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
