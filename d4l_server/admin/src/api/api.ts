import axios from 'axios';
import { mockAnalyticsDashboardStats, mockDailySnapshots, mockContracts } from './mockData';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Mock API for development
const mockApi = {
  get: async (url: string) => {
    // Wait for a short time to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data based on the URL
    if (url.includes('/api/admin/analytics/dashboard/stats')) {
      return { data: mockAnalyticsDashboardStats };
    } else if (url.includes('/api/admin/analytics/snapshots/daily')) {
      return { data: mockDailySnapshots };
    } else if (url.includes('/api/admin/analytics/contracts')) {
      return { data: mockContracts };
    } else {
      // For other endpoints, use the real API
      return api.get(url);
    }
  },
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch
};

// Use mock API in development, real API in production
const isDevelopment = import.meta.env.DEV;
export default isDevelopment ? mockApi : api;
