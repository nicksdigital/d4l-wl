"use strict";
/**
 * User models for the analytics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.updateUserStats = updateUserStats;
// Factory function to create a new user
function createUser(id, walletAddress, metadata) {
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
function updateUserStats(user, newSession = false, newInteraction = false, newTransaction = false, gasSpent = '0', metadata) {
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
function addBigNumbers(a, b) {
    const aBigInt = BigInt(a);
    const bBigInt = BigInt(b);
    return (aBigInt + bBigInt).toString();
}
//# sourceMappingURL=users.js.map