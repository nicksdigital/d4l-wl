/**
 * Session models for the analytics system
 */
export interface AnalyticsSession {
    id: string;
    userId?: string;
    walletAddress?: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    isActive: boolean;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    entryPage?: string;
    exitPage?: string;
    pageViews?: number;
    interactions?: number;
    chainId?: number;
}
export declare function createSession(id: string, walletAddress?: string, userAgent?: string, ipAddress?: string, referrer?: string, entryPage?: string, chainId?: number): AnalyticsSession;
export declare function endSession(session: AnalyticsSession, exitPage?: string): AnalyticsSession;
export declare function updateSessionStats(session: AnalyticsSession, pageView?: boolean, interaction?: boolean, currentPage?: string): AnalyticsSession;
