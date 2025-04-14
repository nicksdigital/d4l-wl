import { DailyAnalyticsSnapshot, RealTimeAnalytics } from '../models';
declare class SnapshotsService {
    /**
     * Create a daily snapshot
     */
    createDailySnapshot(date: string): Promise<DailyAnalyticsSnapshot>;
    /**
     * Get daily snapshot by date
     */
    getDailySnapshot(date: string): Promise<DailyAnalyticsSnapshot | null>;
    /**
     * Get daily snapshots for a date range
     */
    getDailySnapshots(startDate: string, endDate: string): Promise<DailyAnalyticsSnapshot[]>;
    /**
     * Get real-time analytics
     */
    getRealTimeAnalytics(): Promise<RealTimeAnalytics>;
    /**
     * Helper methods for creating snapshots
     */
    private getNewUsersCount;
    private getActiveUsersCount;
    private getTotalSessionsCount;
    private getAverageSessionDuration;
    private getTotalTransactionsCount;
    private getTotalEventsCount;
    private getTotalGasUsed;
    private getTopContracts;
    private getTopEvents;
    private getTopCurrentPages;
    private getRecentEvents;
}
declare const _default: SnapshotsService;
export default _default;
