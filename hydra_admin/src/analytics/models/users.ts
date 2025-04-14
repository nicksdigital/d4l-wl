/**
 * User models for the analytics system
 */

// User profile for analytics
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

// Factory function to create a new user
export function createUser(
  id: string,
  walletAddress: string,
  metadata?: Record<string, any>
): AnalyticsUser {
  const now = Date.now();
  return {
    id,
    walletAddress,
    firstSeen: now,
    lastSeen: now,
    totalSessions: 1,
    totalInteractions: 0,
    totalTransactions: 0,
    totalGasSpent: '0',
    assetsLinked: 0,
    tokensHeld: {},
    metadata
  };
}

// Function to update user stats
export function updateUserStats(
  user: AnalyticsUser,
  newSession?: boolean,
  newInteraction?: boolean,
  newTransaction?: boolean,
  gasSpent?: string,
  metadata?: Record<string, any>
): AnalyticsUser {
  const now = Date.now();
  
  // Calculate new gas spent
  let totalGasSpent = user.totalGasSpent;
  if (gasSpent) {
    const currentGas = BigInt(user.totalGasSpent || '0');
    const newGas = BigInt(gasSpent);
    totalGasSpent = (currentGas + newGas).toString();
  }
  
  return {
    ...user,
    lastSeen: now,
    totalSessions: newSession ? user.totalSessions + 1 : user.totalSessions,
    totalInteractions: newInteraction ? user.totalInteractions + 1 : user.totalInteractions,
    totalTransactions: newTransaction ? user.totalTransactions + 1 : user.totalTransactions,
    totalGasSpent,
    metadata: metadata ? { ...user.metadata, ...metadata } : user.metadata
  };
}

// User activity summary
export interface UserActivitySummary {
  walletAddress: string;
  lastSeen: number;
  totalSessions: number;
  totalInteractions: number;
  totalTransactions: number;
}
