"use strict";
/**
 * Session models for the analytics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.endSession = endSession;
exports.updateSessionStats = updateSessionStats;
// Factory function to create a new session
function createSession(id, walletAddress, userAgent, ipAddress, referrer, entryPage, chainId) {
    return {
        id,
        walletAddress,
        startTime: Date.now(),
        isActive: true,
        userAgent,
        ipAddress,
        referrer,
        entryPage,
        pageViews: 1,
        interactions: 0,
        chainId
    };
}
// Function to end a session
function endSession(session, exitPage) {
    const endTime = Date.now();
    return {
        ...session,
        endTime,
        duration: endTime - session.startTime,
        isActive: false,
        exitPage: exitPage || session.exitPage
    };
}
// Function to update session stats
function updateSessionStats(session, pageView = false, interaction = false, currentPage) {
    return {
        ...session,
        pageViews: pageView ? (session.pageViews || 0) + 1 : session.pageViews,
        interactions: interaction ? (session.interactions || 0) + 1 : session.interactions,
        exitPage: currentPage || session.exitPage
    };
}
//# sourceMappingURL=sessions.js.map