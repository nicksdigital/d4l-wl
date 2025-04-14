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
  newSession: boolean = false,
  newInteraction: boolean = false,
  newTransaction: boolean = false,
  gasSpent: string = '0',
  metadata?: Record<string, any>
): AnalyticsUser {
  return {
    ...user,
    lastSeen: Date.now(),
    totalSessions: newSession ? user.totalSessions + 1 : user.totalSessions,
    totalInteractions: newInteraction ? user.totalInteractions + 1 : user.totalInteractions,
    totalTransactions: newTransaction ? user.totalTransactions + 1 : user.totalTransactions,
    totalGasSpent: addBigNumbers(user.totalGasSpent, gasSpent),
    metadata: { ...user.metadata, ...metadata }
  };
}

// Helper function to add big numbers as strings
function addBigNumbers(a: string, b: string): string {
  const aBigInt = BigInt(a);
  const bBigInt = BigInt(b);
  return (aBigInt + bBigInt).toString();
}
