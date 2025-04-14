"use strict";
/**
 * Snapshot models for the analytics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDailySnapshot = createDailySnapshot;
exports.createRealTimeAnalytics = createRealTimeAnalytics;
// Factory function to create a daily snapshot
function createDailySnapshot(date, newUsers = 0, activeUsers = 0, totalSessions = 0, averageSessionDuration = 0, totalTransactions = 0, totalGasUsed = '0', topContracts = [], topEvents = [], metadata) {
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
function createRealTimeAnalytics(activeUsers = 0, activeSessions = 0, transactionsInLastHour = 0, eventsInLastHour = 0, topCurrentPages = [], recentEvents = []) {
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
//# sourceMappingURL=snapshots.js.map