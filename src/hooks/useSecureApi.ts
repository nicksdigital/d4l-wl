import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ApiResponse } from '@/types/api';

interface UseSecureApiOptions {
  requireAuth?: boolean;
  headers?: Record<string, string>;
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

interface ApiState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useSecureApi<T>(defaultOptions: UseSecureApiOptions = {}) {
  const { data: session } = useSession();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const fetchApi = async (
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    // Set default options
    const {
      method = 'GET',
      body,
      headers = {},
      params = {},
    } = options;

    // Check if authentication is required
    if (defaultOptions.requireAuth && !session) {
      throw new Error('Authentication required');
    }

    // Build URL with query parameters
    const url = new URL(`/api${endpoint}`, window.location.origin);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...defaultOptions.headers,
      ...headers,
    };

    // Add authorization header if session exists
    if (session) {
      requestHeaders['Authorization'] = `Bearer ${session}`;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Make the request
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies
      });

      // Parse the response
      const data: ApiResponse<T> = await response.json();

      // Handle API errors
      if (!response.ok) {
        throw new Error(data.error?.message || 'An error occurred');
      }

      setState({ data: data.data || null, error: null, loading: false });
      return data;
    } catch (error: any) {
      const errorObj = new Error(error.message || 'An error occurred');
      setState({ data: null, error: errorObj, loading: false });
      throw errorObj;
    }
  };

  const get = <R = T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ) => {
    // @ts-ignore - Fix for TypeScript generic parameter issue
    return fetchApi<R>(endpoint, { method: 'GET', params });
  };

  const post = <R = T>(endpoint: string, body: any, params?: Record<string, string | number | boolean>) => {
    // @ts-ignore - Fix for TypeScript generic parameter issue
    return fetchApi<R>(endpoint, { method: 'POST', body, params });
  };

  const put = <R = T>(endpoint: string, body: any, params?: Record<string, string | number | boolean>) => {
    // @ts-ignore - Fix for TypeScript generic parameter issue
    return fetchApi<R>(endpoint, { method: 'PUT', body, params });
  };

  const del = <R = T>(endpoint: string, params?: Record<string, string | number | boolean>) => {
    // @ts-ignore - Fix for TypeScript generic parameter issue
    return fetchApi<R>(endpoint, { method: 'DELETE', params });
  };

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    fetchApi,
  };
}
