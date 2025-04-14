/**
 * Analytics services
 */
import { analyticsApi } from '@/lib/api';
import { 
  AnalyticsTimePeriod, 
  AnalyticsDashboardResponse,
  AnalyticsSnapshotsResponse,
  ContractAnalyticsResponse,
  UIEvent
} from '../models';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(period: AnalyticsTimePeriod = 'all'): Promise<AnalyticsDashboardResponse> {
  try {
    return await analyticsApi.getDashboardStats(period);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalTransactions: 0,
        totalVolume: 0,
        averageTransactionValue: 0
      },
      error: 'Failed to fetch dashboard stats'
    };
  }
}

/**
 * Get daily snapshots
 */
export async function getDailySnapshots(startDate: string, endDate: string): Promise<AnalyticsSnapshotsResponse> {
  try {
    return await analyticsApi.getDailySnapshots(startDate, endDate);
  } catch (error) {
    console.error('Error fetching daily snapshots:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to fetch daily snapshots'
    };
  }
}

/**
 * Create a daily snapshot
 */
export async function createDailySnapshot(date: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await analyticsApi.createDailySnapshot(date);
  } catch (error) {
    console.error('Error creating daily snapshot:', error);
    return {
      success: false,
      error: 'Failed to create daily snapshot'
    };
  }
}

/**
 * Get contract analytics
 */
export async function getContractAnalytics(address: string): Promise<ContractAnalyticsResponse> {
  try {
    return await analyticsApi.getContractAnalytics(address);
  } catch (error) {
    console.error('Error fetching contract analytics:', error);
    return {
      success: false,
      data: {
        address,
        totalInteractions: 0,
        uniqueUsers: 0,
        lastInteraction: 0,
        events: {}
      },
      error: 'Failed to fetch contract analytics'
    };
  }
}

/**
 * Track an event (stub for future implementation)
 */
export async function trackEvent(event: UIEvent): Promise<boolean> {
  try {
    // This would normally send the event to the backend
    console.log('Tracking event:', event);
    return true;
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
}

export default {
  getDashboardStats,
  getDailySnapshots,
  createDailySnapshot,
  getContractAnalytics,
  trackEvent
};
