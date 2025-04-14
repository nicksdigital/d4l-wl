/**
 * Snapshot models for the analytics system
 */

import { AnalyticsEventType } from './types';

// Daily analytics snapshot
export interface DailyAnalyticsSnapshot {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalTransactions: number;
  totalGasUsed: string;
  topContracts: Array<{
    address: string;
    interactions: number;
  }>;
  topEvents: Array<{
    eventType: AnalyticsEventType;
    count: number;
  }>;
  metadata?: Record<string, any>;
}

// Real-time analytics
export interface RealTimeAnalytics {
  activeUsers: number;
  activeSessions: number;
  transactionsInLastHour: number;
  eventsInLastHour: number;
  topCurrentPages: Array<{
    url: string;
    users: number;
  }>;
  recentEvents: Array<{
    eventType: AnalyticsEventType;
    timestamp: number;
    walletAddress?: string;
    metadata?: Record<string, any>;
  }>;
  updatedAt: number;
}

// Factory function to create a daily snapshot
export function createDailySnapshot(
  date: string,
  newUsers: number = 0,
  activeUsers: number = 0,
  totalSessions: number = 0,
  averageSessionDuration: number = 0,
  totalTransactions: number = 0,
  totalGasUsed: string = '0',
  topContracts: Array<{ address: string; interactions: number }> = [],
  topEvents: Array<{ eventType: AnalyticsEventType; count: number }> = [],
  metadata?: Record<string, any>
): DailyAnalyticsSnapshot {
  return {
    date,
    newUsers,
    activeUsers,
    totalSessions,
    averageSessionDuration,
    totalTransactions,
    totalGasUsed,
    topContracts,
    topEvents,
    metadata
  };
}

// Factory function to create real-time analytics
export function createRealTimeAnalytics(
  activeUsers: number = 0,
  activeSessions: number = 0,
  transactionsInLastHour: number = 0,
  eventsInLastHour: number = 0,
  topCurrentPages: Array<{ url: string; users: number }> = [],
  recentEvents: Array<{
    eventType: AnalyticsEventType;
    timestamp: number;
    walletAddress?: string;
    metadata?: Record<string, any>;
  }> = []
): RealTimeAnalytics {
  return {
    activeUsers,
    activeSessions,
    transactionsInLastHour,
    eventsInLastHour,
    topCurrentPages,
    recentEvents,
    updatedAt: Date.now()
  };
}
