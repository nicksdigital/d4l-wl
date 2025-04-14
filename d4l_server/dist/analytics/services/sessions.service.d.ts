import { AnalyticsSession } from '../models';
declare class SessionsService {
    /**
     * Create a new session
     */
    createSession(walletAddress?: string, userAgent?: string, ipAddress?: string, referrer?: string, entryPage?: string, chainId?: number): Promise<AnalyticsSession>;
    /**
     * End a session
     */
    endSession(sessionId: string, exitPage?: string): Promise<AnalyticsSession | null>;
    /**
     * Update session stats
     */
    updateSessionStats(sessionId: string, pageView?: boolean, interaction?: boolean, currentPage?: string): Promise<AnalyticsSession | null>;
    /**
     * Get session by ID
     */
    getSessionById(sessionId: string): Promise<AnalyticsSession | null>;
    /**
     * Get active sessions
     */
    getActiveSessions(): Promise<AnalyticsSession[]>;
    /**
     * Get sessions by wallet address
     */
    getSessionsByWalletAddress(walletAddress: string): Promise<AnalyticsSession[]>;
}
declare const _default: SessionsService;
export default _default;
