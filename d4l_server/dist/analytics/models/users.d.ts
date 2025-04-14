/**
 * User models for the analytics system
 */
export interface AnalyticsUser {
    id: string;
    walletAddress: string;
    firstSeen: number;
    lastSeen: number;
    totalSessions: number;
    totalInteractions: number;
    totalTransactions: number;
    totalGasSpent: string;
    assetsLinked: number;
    tokensHeld: Record<string, string>;
    tags?: string[];
    metadata?: Record<string, any>;
}
export declare function createUser(id: string, walletAddress: string, metadata?: Record<string, any>): AnalyticsUser;
export declare function updateUserStats(user: AnalyticsUser, newSession?: boolean, newInteraction?: boolean, newTransaction?: boolean, gasSpent?: string, metadata?: Record<string, any>): AnalyticsUser;
