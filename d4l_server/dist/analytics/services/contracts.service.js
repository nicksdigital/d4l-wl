"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service for managing contract analytics
 */
const db_1 = require("./db");
const models_1 = require("../models");
class ContractsService {
    /**
     * Get or create contract analytics
     */
    async getOrCreateContractAnalytics(address, name, type, deployedAt, deployerAddress, metadata) {
        return (0, db_1.withFallback)(async () => {
            // First, try to get the contract
            const getQuery = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [address]);
            if (getResult.rows.length > 0) {
                const row = getResult.rows[0];
                return {
                    address: row.address,
                    name: row.name,
                    type: row.type,
                    deployedAt: row.deployed_at,
                    deployerAddress: row.deployer_address,
                    totalInteractions: row.total_interactions,
                    uniqueUsers: row.unique_users,
                    lastInteraction: row.last_interaction,
                    gasUsed: row.gas_used,
                    events: row.events,
                    metadata: row.metadata
                };
            }
            // If not found, create a new contract analytics
            const contract = (0, models_1.createContractAnalytics)(address, name, type, deployedAt, deployerAddress, metadata);
            const createQuery = `
          INSERT INTO analytics_contracts (
            address, name, type, deployed_at, deployer_address,
            total_interactions, unique_users, last_interaction,
            gas_used, events, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
            const createResult = await db_1.pool.query(createQuery, [
                contract.address,
                contract.name || null,
                contract.type || null,
                contract.deployedAt || null,
                contract.deployerAddress || null,
                contract.totalInteractions,
                contract.uniqueUsers,
                contract.lastInteraction,
                contract.gasUsed,
                JSON.stringify(contract.events),
                contract.metadata ? JSON.stringify(contract.metadata) : null
            ]);
            const row = createResult.rows[0];
            return {
                address: row.address,
                name: row.name,
                type: row.type,
                deployedAt: row.deployed_at,
                deployerAddress: row.deployer_address,
                totalInteractions: row.total_interactions,
                uniqueUsers: row.unique_users,
                lastInteraction: row.last_interaction,
                gasUsed: row.gas_used,
                events: row.events,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            if (db_1.inMemoryStorage.contracts[address]) {
                return db_1.inMemoryStorage.contracts[address];
            }
            const contract = (0, models_1.createContractAnalytics)(address, name, type, deployedAt, deployerAddress, metadata);
            db_1.inMemoryStorage.contracts[address] = contract;
            return contract;
        });
    }
    /**
     * Update contract analytics
     */
    async updateContractAnalytics(address, eventName, userAddress, gasUsed = '0', metadata) {
        return (0, db_1.withFallback)(async () => {
            // First, get the contract
            const getQuery = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [address]);
            if (getResult.rows.length === 0) {
                return null;
            }
            const row = getResult.rows[0];
            const contract = {
                address: row.address,
                name: row.name,
                type: row.type,
                deployedAt: row.deployed_at,
                deployerAddress: row.deployer_address,
                totalInteractions: row.total_interactions,
                uniqueUsers: row.unique_users,
                lastInteraction: row.last_interaction,
                gasUsed: row.gas_used,
                events: row.events || {},
                metadata: row.metadata
            };
            // Check if this is a new user
            let isNewUser = false;
            if (userAddress) {
                const userQuery = `
            SELECT COUNT(*) FROM analytics_events
            WHERE contract_address = $1 AND wallet_address = $2
          `;
                const userResult = await db_1.pool.query(userQuery, [address, userAddress]);
                isNewUser = parseInt(userResult.rows[0].count, 10) === 0;
            }
            // Update the events count
            const events = { ...contract.events };
            events[eventName] = (events[eventName] || 0) + 1;
            // Update the contract analytics
            const updateQuery = `
          UPDATE analytics_contracts
          SET
            total_interactions = total_interactions + 1,
            unique_users = unique_users + $1,
            last_interaction = $2,
            gas_used = $3,
            events = $4,
            metadata = $5
          WHERE address = $6
          RETURNING *
        `;
            const updateResult = await db_1.pool.query(updateQuery, [
                isNewUser && userAddress ? 1 : 0,
                Date.now(),
                addBigNumbers(contract.gasUsed, gasUsed),
                JSON.stringify(events),
                metadata ? JSON.stringify({ ...contract.metadata, ...metadata }) : JSON.stringify(contract.metadata),
                address
            ]);
            const updatedRow = updateResult.rows[0];
            return {
                address: updatedRow.address,
                name: updatedRow.name,
                type: updatedRow.type,
                deployedAt: updatedRow.deployed_at,
                deployerAddress: updatedRow.deployer_address,
                totalInteractions: updatedRow.total_interactions,
                uniqueUsers: updatedRow.unique_users,
                lastInteraction: updatedRow.last_interaction,
                gasUsed: updatedRow.gas_used,
                events: updatedRow.events,
                metadata: updatedRow.metadata
            };
        }, () => {
            // In-memory fallback
            const contract = db_1.inMemoryStorage.contracts[address];
            if (!contract) {
                return null;
            }
            // Check if this is a new user
            let isNewUser = false;
            if (userAddress) {
                const userEvents = Object.values(db_1.inMemoryStorage.events)
                    .flat()
                    .filter(event => event.contractAddress === address &&
                    event.walletAddress === userAddress);
                isNewUser = userEvents.length === 0;
            }
            // Update the contract analytics
            const updatedContract = {
                ...contract,
                totalInteractions: contract.totalInteractions + 1,
                uniqueUsers: isNewUser && userAddress ? contract.uniqueUsers + 1 : contract.uniqueUsers,
                lastInteraction: Date.now(),
                gasUsed: addBigNumbers(contract.gasUsed, gasUsed),
                events: {
                    ...contract.events,
                    [eventName]: (contract.events[eventName] || 0) + 1
                },
                metadata: {
                    ...contract.metadata,
                    ...metadata
                }
            };
            db_1.inMemoryStorage.contracts[address] = updatedContract;
            return updatedContract;
        });
    }
    /**
     * Get contract analytics by address
     */
    async getContractAnalytics(address) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
            const result = await db_1.pool.query(query, [address]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                address: row.address,
                name: row.name,
                type: row.type,
                deployedAt: row.deployed_at,
                deployerAddress: row.deployer_address,
                totalInteractions: row.total_interactions,
                uniqueUsers: row.unique_users,
                lastInteraction: row.last_interaction,
                gasUsed: row.gas_used,
                events: row.events,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            return db_1.inMemoryStorage.contracts[address] || null;
        });
    }
    /**
     * Get all contract analytics
     */
    async getAllContractAnalytics() {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_contracts
          ORDER BY total_interactions DESC
        `;
            const result = await db_1.pool.query(query);
            return result.rows.map(row => ({
                address: row.address,
                name: row.name,
                type: row.type,
                deployedAt: row.deployed_at,
                deployerAddress: row.deployer_address,
                totalInteractions: row.total_interactions,
                uniqueUsers: row.unique_users,
                lastInteraction: row.last_interaction,
                gasUsed: row.gas_used,
                events: row.events,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.contracts)
                .sort((a, b) => b.totalInteractions - a.totalInteractions);
        });
    }
    /**
     * Get top contracts by interactions
     */
    async getTopContractsByInteractions(limit = 10) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_contracts
          ORDER BY total_interactions DESC
          LIMIT $1
        `;
            const result = await db_1.pool.query(query, [limit]);
            return result.rows.map(row => ({
                address: row.address,
                name: row.name,
                type: row.type,
                deployedAt: row.deployed_at,
                deployerAddress: row.deployer_address,
                totalInteractions: row.total_interactions,
                uniqueUsers: row.unique_users,
                lastInteraction: row.last_interaction,
                gasUsed: row.gas_used,
                events: row.events,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.contracts)
                .sort((a, b) => b.totalInteractions - a.totalInteractions)
                .slice(0, limit);
        });
    }
}
// Helper function to add big numbers as strings
function addBigNumbers(a, b) {
    const aBigInt = BigInt(a);
    const bBigInt = BigInt(b);
    return (aBigInt + bBigInt).toString();
}
exports.default = new ContractsService();
//# sourceMappingURL=contracts.service.js.map