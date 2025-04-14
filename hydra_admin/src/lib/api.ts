import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/admin/login', { username, password });
    return response.data;
  },
  
  validateToken: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
};

// Dashboard API functions
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};

// Users API functions
export const usersApi = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getUserDetails: async (wallet: string) => {
    const response = await api.get(`/admin/users/${wallet}`);
    return response.data;
  },
  
  deactivateUser: async (wallet: string) => {
    const response = await api.post(`/admin/users/${wallet}/deactivate`);
    return response.data;
  },
  
  reactivateUser: async (wallet: string) => {
    const response = await api.post(`/admin/users/${wallet}/reactivate`);
    return response.data;
  },
};

// Airdrop API functions
export const airdropApi = {
  getStats: async () => {
    const response = await api.get('/admin/airdrop/stats');
    return response.data;
  },
  
  getClaims: async () => {
    const response = await api.get('/admin/airdrop/claims');
    return response.data;
  },
  
  addAllocation: async (wallet: string, amount: number, reason?: string) => {
    const response = await api.post('/admin/airdrop/add', { wallet, amount, reason });
    return response.data;
  },
};

// Content API functions
export const contentApi = {
  getContent: async () => {
    const response = await api.get('/admin/content');
    return response.data;
  },
  
  updateContent: async (id: string, content: any) => {
    const response = await api.put(`/admin/content/${id}`, content);
    return response.data;
  },
};

// Settings API functions
export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  
  updateSettings: async (settings: any) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },
};

// Cache API functions
export const cacheApi = {
  clearAllCache: async () => {
    const response = await api.post('/admin/cache/clear-all');
    return response.data;
  },
  
  clearCacheByTag: async (tag: string) => {
    const response = await api.post('/admin/cache/clear-tag', { tag });
    return response.data;
  },
  
  clearCacheByType: async (type: string) => {
    const response = await api.post('/admin/cache/clear-type', { type });
    return response.data;
  },
};

// Analytics API functions
export const analyticsApi = {
  getDashboardStats: async (period: 'day' | 'week' | 'month' | 'all' = 'all') => {
    const response = await api.get(`/admin/analytics/dashboard/stats?period=${period}`);
    return response.data;
  },
  
  getDailySnapshots: async (startDate: string, endDate: string) => {
    const response = await api.get(`/admin/analytics/snapshots/daily?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  createDailySnapshot: async (date: string) => {
    const response = await api.post('/admin/analytics/snapshots/daily', { date });
    return response.data;
  },
  
  getContractAnalytics: async (address: string) => {
    const response = await api.get(`/admin/analytics/contracts/${address}`);
    return response.data;
  },
};

export default api;
