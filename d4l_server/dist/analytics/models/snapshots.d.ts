/**
 * Snapshot models for the analytics system
 */
import { AnalyticsEventType } from './types';
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
export declare function createDailySnapshot(date: string, newUsers?: number, activeUsers?: number, totalSessions?: number, averageSessionDuration?: number, totalTransactions?: number, totalGasUsed?: string, topContracts?: Array<{
    address: string;
    interactions: number;
}>, topEvents?: Array<{
    eventType: AnalyticsEventType;
    count: number;
}>, metadata?: Record<string, any>): DailyAnalyticsSnapshot;
export declare function createRealTimeAnalytics(activeUsers?: number, activeSessions?: number, transactionsInLastHour?: number, eventsInLastHour?: number, topCurrentPages?: Array<{
    url: string;
    users: number;
}>, recentEvents?: Array<{
    eventType: AnalyticsEventType;
    timestamp: number;
    walletAddress?: string;
    metadata?: Record<string, any>;
}>): RealTimeAnalytics;
