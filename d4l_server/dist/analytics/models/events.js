"use strict";
/**
 * Event models for the analytics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContractEvent = createContractEvent;
exports.createUIEvent = createUIEvent;
const types_1 = require("./types");
// Factory function to create a contract event
function createContractEvent(contractAddress, eventName, transactionHash, blockNumber, logIndex, returnValues, walletAddress, chainId, gasUsed, gasPrice, metadata) {
    return {
        eventType: types_1.AnalyticsEventType.CONTRACT_INTERACTION,
        timestamp: Date.now(),
        walletAddress,
        chainId,
        contractAddress,
        eventName,
        transactionHash,
        blockNumber,
        logIndex,
        returnValues,
        gasUsed,
        gasPrice,
        metadata
    };
}
// Factory function to create a UI event
function createUIEvent(eventType, walletAddress, sessionId, url, referrer, userAgent, ipAddress, element, action, value, metadata) {
    return {
        eventType,
        timestamp: Date.now(),
        walletAddress,
        sessionId,
        url,
        referrer,
        userAgent,
        ipAddress,
        element,
        action,
        value,
        metadata
    };
}
//# sourceMappingURL=events.js.map