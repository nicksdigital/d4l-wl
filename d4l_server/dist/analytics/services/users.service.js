"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service for managing user analytics
 */
const uuid_1 = require("uuid");
const db_1 = require("./db");
const models_1 = require("../models");
class UsersService {
    /**
     * Get or create user analytics
     */
    async getOrCreateUser(walletAddress, metadata) {
        return (0, db_1.withFallback)(async () => {
            // First, try to get the user
            const getQuery = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [walletAddress]);
            if (getResult.rows.length > 0) {
                const row = getResult.rows[0];
                return {
                    id: row.id,
                    walletAddress: row.wallet_address,
                    firstSeen: row.first_seen,
                    lastSeen: row.last_seen,
                    totalSessions: row.total_sessions,
                    totalInteractions: row.total_interactions,
                    totalTransactions: row.total_transactions,
                    totalGasSpent: row.total_gas_spent,
                    assetsLinked: row.assets_linked,
                    tokensHeld: row.tokens_held,
                    tags: row.tags,
                    metadata: row.metadata
                };
            }
            // If not found, create a new user
            const userId = (0, uuid_1.v4)();
            const user = (0, models_1.createUser)(userId, walletAddress, metadata);
            const createQuery = `
          INSERT INTO analytics_users (
            id, wallet_address, first_seen, last_seen,
            total_sessions, total_interactions, total_transactions,
            total_gas_spent, assets_linked, tokens_held, tags, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;
            const createResult = await db_1.pool.query(createQuery, [
                user.id,
                user.walletAddress,
                user.firstSeen,
                user.lastSeen,
                user.totalSessions,
                user.totalInteractions,
                user.totalTransactions,
                user.totalGasSpent,
                user.assetsLinked,
                JSON.stringify(user.tokensHeld),
                user.tags ? JSON.stringify(user.tags) : null,
                user.metadata ? JSON.stringify(user.metadata) : null
            ]);
            const row = createResult.rows[0];
            return {
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            if (db_1.inMemoryStorage.users[walletAddress]) {
                return db_1.inMemoryStorage.users[walletAddress];
            }
            const userId = (0, uuid_1.v4)();
            const user = (0, models_1.createUser)(userId, walletAddress, metadata);
            db_1.inMemoryStorage.users[walletAddress] = user;
            return user;
        });
    }
    /**
     * Update user stats
     */
    async updateUserStats(walletAddress, newSession = false, newInteraction = false, newTransaction = false, gasSpent = '0', metadata) {
        return (0, db_1.withFallback)(async () => {
            // First, get the user
            const getQuery = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [walletAddress]);
            if (getResult.rows.length === 0) {
                return null;
            }
            const row = getResult.rows[0];
            const user = {
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            };
            // Update the user stats
            const updateQuery = `
          UPDATE analytics_users
          SET
            last_seen = $1,
            total_sessions = total_sessions + $2,
            total_interactions = total_interactions + $3,
            total_transactions = total_transactions + $4,
            total_gas_spent = $5,
            metadata = $6
          WHERE wallet_address = $7
          RETURNING *
        `;
            const updateResult = await db_1.pool.query(updateQuery, [
                Date.now(),
                newSession ? 1 : 0,
                newInteraction ? 1 : 0,
                newTransaction ? 1 : 0,
                addBigNumbers(user.totalGasSpent, gasSpent),
                metadata ? JSON.stringify({ ...user.metadata, ...metadata }) : JSON.stringify(user.metadata),
                walletAddress
            ]);
            const updatedRow = updateResult.rows[0];
            return {
                id: updatedRow.id,
                walletAddress: updatedRow.wallet_address,
                firstSeen: updatedRow.first_seen,
                lastSeen: updatedRow.last_seen,
                totalSessions: updatedRow.total_sessions,
                totalInteractions: updatedRow.total_interactions,
                totalTransactions: updatedRow.total_transactions,
                totalGasSpent: updatedRow.total_gas_spent,
                assetsLinked: updatedRow.assets_linked,
                tokensHeld: updatedRow.tokens_held,
                tags: updatedRow.tags,
                metadata: updatedRow.metadata
            };
        }, () => {
            // In-memory fallback
            const user = db_1.inMemoryStorage.users[walletAddress];
            if (!user) {
                return null;
            }
            const updatedUser = (0, models_1.updateUserStats)(user, newSession, newInteraction, newTransaction, gasSpent, metadata);
            db_1.inMemoryStorage.users[walletAddress] = updatedUser;
            return updatedUser;
        });
    }
    /**
     * Get user by wallet address
     */
    async getUserByWalletAddress(walletAddress) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
            const result = await db_1.pool.query(query, [walletAddress]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            return db_1.inMemoryStorage.users[walletAddress] || null;
        });
    }
    /**
     * Get all users
     */
    async getAllUsers() {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_users
          ORDER BY last_seen DESC
        `;
            const result = await db_1.pool.query(query);
            return result.rows.map(row => ({
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.users)
                .sort((a, b) => b.lastSeen - a.lastSeen);
        });
    }
    /**
     * Get active users (users who have been active in the last 24 hours)
     */
    async getActiveUsers() {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_users
          WHERE last_seen >= $1
          ORDER BY last_seen DESC
        `;
            const result = await db_1.pool.query(query, [oneDayAgo]);
            return result.rows.map(row => ({
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.users)
                .filter(user => user.lastSeen >= oneDayAgo)
                .sort((a, b) => b.lastSeen - a.lastSeen);
        });
    }
    /**
     * Get new users (users who have been created in the last 24 hours)
     */
    async getNewUsers() {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_users
          WHERE first_seen >= $1
          ORDER BY first_seen DESC
        `;
            const result = await db_1.pool.query(query, [oneDayAgo]);
            return result.rows.map(row => ({
                id: row.id,
                walletAddress: row.wallet_address,
                firstSeen: row.first_seen,
                lastSeen: row.last_seen,
                totalSessions: row.total_sessions,
                totalInteractions: row.total_interactions,
                totalTransactions: row.total_transactions,
                totalGasSpent: row.total_gas_spent,
                assetsLinked: row.assets_linked,
                tokensHeld: row.tokens_held,
                tags: row.tags,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.users)
                .filter(user => user.firstSeen >= oneDayAgo)
                .sort((a, b) => b.firstSeen - a.firstSeen);
        });
    }
}
// Helper function to add big numbers as strings
function addBigNumbers(a, b) {
    const aBigInt = BigInt(a);
    const bBigInt = BigInt(b);
    return (aBigInt + bBigInt).toString();
}
exports.default = new UsersService();
//# sourceMappingURL=users.service.js.map