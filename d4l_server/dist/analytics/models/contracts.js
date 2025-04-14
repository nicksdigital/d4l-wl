"use strict";
/**
 * Contract models for the analytics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContractAnalytics = createContractAnalytics;
exports.updateContractAnalytics = updateContractAnalytics;
// Factory function to create contract analytics
function createContractAnalytics(address, name, type, deployedAt, deployerAddress, metadata) {
    return {
        address,
        name,
        type,
        deployedAt,
        deployerAddress,
        totalInteractions: 0,
        uniqueUsers: 0,
        lastInteraction: Date.now(),
        gasUsed: '0',
        events: {},
        metadata
    };
}
// Function to update contract analytics
function updateContractAnalytics(contract, eventName, userAddress, gasUsed = '0', metadata) {
    // Create a copy of the events object
    const updatedEvents = { ...contract.events };
    // Increment the count for this event
    updatedEvents[eventName] = (updatedEvents[eventName] || 0) + 1;
    return {
        ...contract,
        totalInteractions: contract.totalInteractions + 1,
        // We would need to check if this is a new user in the actual implementation
        uniqueUsers: userAddress ? contract.uniqueUsers + 1 : contract.uniqueUsers,
        lastInteraction: Date.now(),
        gasUsed: addBigNumbers(contract.gasUsed, gasUsed),
        events: updatedEvents,
        metadata: { ...contract.metadata, ...metadata }
    };
}
// Helper function to add big numbers as strings
function addBigNumbers(a, b) {
    const aBigInt = BigInt(a);
    const bBigInt = BigInt(b);
    return (aBigInt + bBigInt).toString();
}
//# sourceMappingURL=contracts.js.map