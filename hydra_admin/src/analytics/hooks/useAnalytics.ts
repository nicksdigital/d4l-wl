'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AnalyticsTimePeriod, 
  AnalyticsEventType,
  UIEvent,
  createUIEvent
} from '../models';
import { 
  getDashboardStats, 
  getDailySnapshots,
  trackEvent
} from '../services';

interface UseAnalyticsOptions {
  initialPeriod?: AnalyticsTimePeriod;
  autoFetch?: boolean;
}

interface UseAnalyticsReturn {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalTransactions: number;
    totalVolume: number;
    averageTransactionValue: number;
  };
  snapshots: Array<{
    date: string;
    users: number;
    transactions: number;
    volume: number;
  }>;
  isLoading: boolean;
  error: string | null;
  period: AnalyticsTimePeriod;
  setPeriod: (period: AnalyticsTimePeriod) => void;
  fetchData: () => Promise<void>;
  trackPageView: (url: string) => void;
  trackEvent: (eventType: AnalyticsEventType, metadata?: Record<string, any>) => void;
}

/**
 * Hook for analytics functionality
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { initialPeriod = 'week', autoFetch = true } = options;
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    averageTransactionValue: 0
  });
  
  const [snapshots, setSnapshots] = useState<Array<{
    date: string;
    users: number;
    transactions: number;
    volume: number;
  }>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsTimePeriod>(initialPeriod);
  
  // Calculate date range based on period
  const getDateRange = useCallback(() => {
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;
    
    switch (period) {
      case 'day':
        startDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'all':
      default:
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }
    
    return { startDate, endDate };
  }, [period]);
  
  // Fetch analytics data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch dashboard stats
      const statsResponse = await getDashboardStats(period);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else if (statsResponse.error) {
        setError(statsResponse.error);
      }
      
      // Fetch daily snapshots
      const { startDate, endDate } = getDateRange();
      const snapshotsResponse = await getDailySnapshots(startDate, endDate);
      if (snapshotsResponse.success) {
        setSnapshots(snapshotsResponse.data);
      } else if (snapshotsResponse.error) {
        setError(prev => prev || snapshotsResponse.error);
      }
    } catch (err) {
      setError('An error occurred while fetching analytics data');
      console.error('Error in useAnalytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period, getDateRange]);
  
  // Track page view
  const trackPageView = useCallback((url: string) => {
    const event = createUIEvent(
      AnalyticsEventType.PAGE_VIEW,
      url,
      undefined,
      undefined,
      undefined,
      undefined
    );
    
    trackEvent(event);
  }, []);
  
  // Track custom event
  const trackCustomEvent = useCallback((eventType: AnalyticsEventType, metadata?: Record<string, any>) => {
    const event = createUIEvent(
      eventType,
      typeof window !== 'undefined' ? window.location.href : undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      metadata
    );
    
    trackEvent(event);
  }, []);
  
  // Fetch data when period changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [period, fetchData, autoFetch]);
  
  return {
    stats,
    snapshots,
    isLoading,
    error,
    period,
    setPeriod,
    fetchData,
    trackPageView,
    trackEvent: trackCustomEvent
  };
}
