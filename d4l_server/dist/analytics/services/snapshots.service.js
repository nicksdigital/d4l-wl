"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service for managing analytics snapshots
 */
const db_1 = require("./db");
const models_1 = require("../models");
const users_service_1 = __importDefault(require("./users.service"));
const events_service_1 = __importDefault(require("./events.service"));
const sessions_service_1 = __importDefault(require("./sessions.service"));
class SnapshotsService {
    /**
     * Create a daily snapshot
     */
    async createDailySnapshot(date) {
        // Get the start and end timestamps for the day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const startTimestamp = startDate.getTime();
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const endTimestamp = endDate.getTime();
        // Get the data for the snapshot
        const newUsers = await this.getNewUsersCount(startTimestamp, endTimestamp);
        const activeUsers = await this.getActiveUsersCount(startTimestamp, endTimestamp);
        const totalSessions = await this.getTotalSessionsCount(startTimestamp, endTimestamp);
        const averageSessionDuration = await this.getAverageSessionDuration(startTimestamp, endTimestamp);
        const totalTransactions = await this.getTotalTransactionsCount(startTimestamp, endTimestamp);
        const totalGasUsed = await this.getTotalGasUsed(startTimestamp, endTimestamp);
        const topContracts = await this.getTopContracts(startTimestamp, endTimestamp);
        const topEvents = await this.getTopEvents(startTimestamp, endTimestamp);
        // Create the snapshot
        const snapshot = (0, models_1.createDailySnapshot)(date, newUsers, activeUsers, totalSessions, averageSessionDuration, totalTransactions, totalGasUsed, topContracts, topEvents);
        return (0, db_1.withFallback)(async () => {
            // Store the snapshot in the database
            const query = `
          INSERT INTO analytics_daily_snapshots (
            date, new_users, active_users, total_sessions,
            average_session_duration, total_transactions, total_gas_used,
            top_contracts, top_events, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (date) DO UPDATE SET
            new_users = $2,
            active_users = $3,
            total_sessions = $4,
            average_session_duration = $5,
            total_transactions = $6,
            total_gas_used = $7,
            top_contracts = $8,
            top_events = $9,
            metadata = $10
          RETURNING *
        `;
            const values = [
                date,
                snapshot.newUsers,
                snapshot.activeUsers,
                snapshot.totalSessions,
                snapshot.averageSessionDuration,
                snapshot.totalTransactions,
                snapshot.totalGasUsed,
                JSON.stringify(snapshot.topContracts),
                JSON.stringify(snapshot.topEvents),
                snapshot.metadata ? JSON.stringify(snapshot.metadata) : null
            ];
            const result = await db_1.pool.query(query, values);
            const row = result.rows[0];
            return {
                date: row.date,
                newUsers: row.new_users,
                activeUsers: row.active_users,
                totalSessions: row.total_sessions,
                averageSessionDuration: row.average_session_duration,
                totalTransactions: row.total_transactions,
                totalGasUsed: row.total_gas_used,
                topContracts: row.top_contracts,
                topEvents: row.top_events,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            db_1.inMemoryStorage.snapshots[date] = snapshot;
            return snapshot;
        });
    }
    /**
     * Get daily snapshot by date
     */
    async getDailySnapshot(date) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_daily_snapshots
          WHERE date = $1
        `;
            const result = await db_1.pool.query(query, [date]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                date: row.date,
                newUsers: row.new_users,
                activeUsers: row.active_users,
                totalSessions: row.total_sessions,
                averageSessionDuration: row.average_session_duration,
                totalTransactions: row.total_transactions,
                totalGasUsed: row.total_gas_used,
                topContracts: row.top_contracts,
                topEvents: row.top_events,
                metadata: row.metadata
            };
        }, () => {
            // In-memory fallback
            return db_1.inMemoryStorage.snapshots[date] || null;
        });
    }
    /**
     * Get daily snapshots for a date range
     */
    async getDailySnapshots(startDate, endDate) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_daily_snapshots
          WHERE date >= $1 AND date <= $2
          ORDER BY date ASC
        `;
            const result = await db_1.pool.query(query, [startDate, endDate]);
            return result.rows.map(row => ({
                date: row.date,
                newUsers: row.new_users,
                activeUsers: row.active_users,
                totalSessions: row.total_sessions,
                averageSessionDuration: row.average_session_duration,
                totalTransactions: row.total_transactions,
                totalGasUsed: row.total_gas_used,
                topContracts: row.top_contracts,
                topEvents: row.top_events,
                metadata: row.metadata
            }));
        }, () => {
            // In-memory fallback
            const snapshots = [];
            // Convert dates to Date objects for comparison
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (const date in db_1.inMemoryStorage.snapshots) {
                const snapshotDate = new Date(date);
                if (snapshotDate >= start && snapshotDate <= end) {
                    snapshots.push(db_1.inMemoryStorage.snapshots[date]);
                }
            }
            return snapshots.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
        });
    }
    /**
     * Get real-time analytics
     */
    async getRealTimeAnalytics() {
        // Get active users
        const activeUsers = (await users_service_1.default.getActiveUsers()).length;
        // Get active sessions
        const activeSessions = (await sessions_service_1.default.getActiveSessions()).length;
        // Get transactions in the last hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const transactionsInLastHour = await this.getTotalTransactionsCount(oneHourAgo, Date.now());
        // Get events in the last hour
        const eventsInLastHour = await this.getTotalEventsCount(oneHourAgo, Date.now());
        // Get top current pages
        const topCurrentPages = await this.getTopCurrentPages();
        // Get recent events
        const recentEvents = await this.getRecentEvents();
        // Create the real-time analytics
        return (0, models_1.createRealTimeAnalytics)(activeUsers, activeSessions, transactionsInLastHour, eventsInLastHour, topCurrentPages, recentEvents);
    }
    /**
     * Helper methods for creating snapshots
     */
    async getNewUsersCount(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT COUNT(*) FROM analytics_users
          WHERE first_seen >= $1 AND first_seen <= $2
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return parseInt(result.rows[0].count, 10);
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.users)
                .filter(user => user.firstSeen >= startTimestamp && user.firstSeen <= endTimestamp)
                .length;
        });
    }
    async getActiveUsersCount(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT COUNT(DISTINCT wallet_address) FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2 AND wallet_address IS NOT NULL
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return parseInt(result.rows[0].count, 10);
        }, () => {
            // In-memory fallback
            const walletAddresses = new Set();
            for (const eventType in db_1.inMemoryStorage.events) {
                db_1.inMemoryStorage.events[eventType].forEach(event => {
                    if (event.timestamp >= startTimestamp &&
                        event.timestamp <= endTimestamp &&
                        event.walletAddress) {
                        walletAddresses.add(event.walletAddress);
                    }
                });
            }
            return walletAddresses.size;
        });
    }
    async getTotalSessionsCount(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT COUNT(*) FROM analytics_sessions
          WHERE start_time >= $1 AND start_time <= $2
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return parseInt(result.rows[0].count, 10);
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.sessions)
                .filter(session => session.startTime >= startTimestamp && session.startTime <= endTimestamp)
                .length;
        });
    }
    async getAverageSessionDuration(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT AVG(duration) FROM analytics_sessions
          WHERE start_time >= $1 AND start_time <= $2 AND duration IS NOT NULL
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return result.rows[0].avg ? parseFloat(result.rows[0].avg) : 0;
        }, () => {
            // In-memory fallback
            const sessions = Object.values(db_1.inMemoryStorage.sessions)
                .filter(session => session.startTime >= startTimestamp &&
                session.startTime <= endTimestamp &&
                session.duration !== undefined);
            if (sessions.length === 0) {
                return 0;
            }
            const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
            return totalDuration / sessions.length;
        });
    }
    async getTotalTransactionsCount(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT COUNT(*) FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2 AND event_type = $3
        `;
            const result = await db_1.pool.query(query, [
                startTimestamp,
                endTimestamp,
                models_1.AnalyticsEventType.CONTRACT_INTERACTION
            ]);
            return parseInt(result.rows[0].count, 10);
        }, () => {
            // In-memory fallback
            const events = db_1.inMemoryStorage.events[models_1.AnalyticsEventType.CONTRACT_INTERACTION] || [];
            return events.filter(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp).length;
        });
    }
    async getTotalEventsCount(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT COUNT(*) FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return parseInt(result.rows[0].count, 10);
        }, () => {
            // In-memory fallback
            let count = 0;
            for (const eventType in db_1.inMemoryStorage.events) {
                count += db_1.inMemoryStorage.events[eventType].filter(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp).length;
            }
            return count;
        });
    }
    async getTotalGasUsed(startTimestamp, endTimestamp) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT SUM(gas_used) FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2 AND gas_used IS NOT NULL
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp]);
            return result.rows[0].sum || '0';
        }, () => {
            // In-memory fallback
            let totalGasUsed = BigInt(0);
            for (const eventType in db_1.inMemoryStorage.events) {
                db_1.inMemoryStorage.events[eventType].forEach(event => {
                    if (event.timestamp >= startTimestamp &&
                        event.timestamp <= endTimestamp &&
                        event.gasUsed) {
                        totalGasUsed += BigInt(event.gasUsed);
                    }
                });
            }
            return totalGasUsed.toString();
        });
    }
    async getTopContracts(startTimestamp, endTimestamp, limit = 10) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT contract_address, COUNT(*) as interactions
          FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2 AND contract_address IS NOT NULL
          GROUP BY contract_address
          ORDER BY interactions DESC
          LIMIT $3
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp, limit]);
            return result.rows.map(row => ({
                address: row.contract_address,
                interactions: parseInt(row.interactions, 10)
            }));
        }, () => {
            // In-memory fallback
            const contractInteractions = {};
            for (const eventType in db_1.inMemoryStorage.events) {
                db_1.inMemoryStorage.events[eventType].forEach(event => {
                    if (event.timestamp >= startTimestamp &&
                        event.timestamp <= endTimestamp &&
                        event.contractAddress) {
                        const contractAddress = event.contractAddress;
                        contractInteractions[contractAddress] = (contractInteractions[contractAddress] || 0) + 1;
                    }
                });
            }
            return Object.entries(contractInteractions)
                .map(([address, interactions]) => ({ address, interactions }))
                .sort((a, b) => b.interactions - a.interactions)
                .slice(0, limit);
        });
    }
    async getTopEvents(startTimestamp, endTimestamp, limit = 10) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT event_type, COUNT(*) as count
          FROM analytics_events
          WHERE timestamp >= $1 AND timestamp <= $2
          GROUP BY event_type
          ORDER BY count DESC
          LIMIT $3
        `;
            const result = await db_1.pool.query(query, [startTimestamp, endTimestamp, limit]);
            return result.rows.map(row => ({
                eventType: row.event_type,
                count: parseInt(row.count, 10)
            }));
        }, () => {
            // In-memory fallback
            const eventCounts = {};
            for (const eventType in db_1.inMemoryStorage.events) {
                eventCounts[eventType] = db_1.inMemoryStorage.events[eventType].filter(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp).length;
            }
            return Object.entries(eventCounts)
                .map(([eventType, count]) => ({
                eventType: eventType,
                count
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
        });
    }
    async getTopCurrentPages() {
        // Get active sessions
        const activeSessions = await sessions_service_1.default.getActiveSessions();
        // Count users by page
        const pageUsers = {};
        activeSessions.forEach(session => {
            if (session.exitPage) {
                pageUsers[session.exitPage] = (pageUsers[session.exitPage] || 0) + 1;
            }
        });
        // Sort and limit
        return Object.entries(pageUsers)
            .map(([url, users]) => ({ url, users }))
            .sort((a, b) => b.users - a.users)
            .slice(0, 10);
    }
    async getRecentEvents() {
        // Get events from the last hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const events = await events_service_1.default.queryEvents({
            startDate: oneHourAgo,
            limit: 20,
            sortBy: 'timestamp',
            sortDirection: 'desc'
        });
        return events.data.map(event => ({
            eventType: event.eventType,
            timestamp: event.timestamp,
            walletAddress: event.walletAddress,
            metadata: event.metadata
        }));
    }
}
exports.default = new SnapshotsService();
//# sourceMappingURL=snapshots.service.js.map