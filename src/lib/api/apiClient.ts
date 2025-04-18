import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { getAuthToken } from '@/lib/auth/authToken';

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get the auth token
    const authToken = getAuthToken();
    
    // If the auth token exists, add it to the Authorization header
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken.address}:${authToken.signature}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Could redirect to login page or show a message
      console.error('Authentication required');
    }
    
    return Promise.reject(error);
  },
);

export default apiClient;
