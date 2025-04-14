import { AnalyticsUser } from '../models';
declare class UsersService {
    /**
     * Get or create user analytics
     */
    getOrCreateUser(walletAddress: string, metadata?: Record<string, any>): Promise<AnalyticsUser>;
    /**
     * Update user stats
     */
    updateUserStats(walletAddress: string, newSession?: boolean, newInteraction?: boolean, newTransaction?: boolean, gasSpent?: string, metadata?: Record<string, any>): Promise<AnalyticsUser | null>;
    /**
     * Get user by wallet address
     */
    getUserByWalletAddress(walletAddress: string): Promise<AnalyticsUser | null>;
    /**
     * Get all users
     */
    getAllUsers(): Promise<AnalyticsUser[]>;
    /**
     * Get active users (users who have been active in the last 24 hours)
     */
    getActiveUsers(): Promise<AnalyticsUser[]>;
    /**
     * Get new users (users who have been created in the last 24 hours)
     */
    getNewUsers(): Promise<AnalyticsUser[]>;
}
declare const _default: UsersService;
export default _default;
