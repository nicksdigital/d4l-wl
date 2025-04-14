"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service for managing analytics sessions
 */
const uuid_1 = require("uuid");
const db_1 = require("./db");
const models_1 = require("../models");
class SessionsService {
    /**
     * Create a new session
     */
    async createSession(walletAddress, userAgent, ipAddress, referrer, entryPage, chainId) {
        const sessionId = (0, uuid_1.v4)();
        const session = (0, models_1.createSession)(sessionId, walletAddress, userAgent, ipAddress, referrer, entryPage, chainId);
        return (0, db_1.withFallback)(async () => {
            const query = `
          INSERT INTO analytics_sessions (
            id, user_id, wallet_address, start_time, is_active,
            user_agent, ip_address, referrer, entry_page, page_views,
            interactions, chain_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;
            const values = [
                session.id,
                session.userId || null,
                session.walletAddress || null,
                session.startTime,
                session.isActive,
                session.userAgent || null,
                session.ipAddress || null,
                session.referrer || null,
                session.entryPage || null,
                session.pageViews || 1,
                session.interactions || 0,
                session.chainId || null
            ];
            const result = await db_1.pool.query(query, values);
            return {
                id: result.rows[0].id,
                userId: result.rows[0].user_id,
                walletAddress: result.rows[0].wallet_address,
                startTime: result.rows[0].start_time,
                endTime: result.rows[0].end_time,
                duration: result.rows[0].duration,
                isActive: result.rows[0].is_active,
                userAgent: result.rows[0].user_agent,
                ipAddress: result.rows[0].ip_address,
                referrer: result.rows[0].referrer,
                entryPage: result.rows[0].entry_page,
                exitPage: result.rows[0].exit_page,
                pageViews: result.rows[0].page_views,
                interactions: result.rows[0].interactions,
                chainId: result.rows[0].chain_id
            };
        }, () => {
            // In-memory fallback
            db_1.inMemoryStorage.sessions[session.id] = session;
            return session;
        });
    }
    /**
     * End a session
     */
    async endSession(sessionId, exitPage) {
        return (0, db_1.withFallback)(async () => {
            // First, get the session
            const getQuery = `
          SELECT * FROM analytics_sessions
          WHERE id = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [sessionId]);
            if (getResult.rows.length === 0) {
                return null;
            }
            const session = {
                id: getResult.rows[0].id,
                userId: getResult.rows[0].user_id,
                walletAddress: getResult.rows[0].wallet_address,
                startTime: getResult.rows[0].start_time,
                endTime: getResult.rows[0].end_time,
                duration: getResult.rows[0].duration,
                isActive: getResult.rows[0].is_active,
                userAgent: getResult.rows[0].user_agent,
                ipAddress: getResult.rows[0].ip_address,
                referrer: getResult.rows[0].referrer,
                entryPage: getResult.rows[0].entry_page,
                exitPage: getResult.rows[0].exit_page,
                pageViews: getResult.rows[0].page_views,
                interactions: getResult.rows[0].interactions,
                chainId: getResult.rows[0].chain_id
            };
            if (!session.isActive) {
                return session;
            }
            // End the session
            const endTime = Date.now();
            const duration = endTime - session.startTime;
            const updateQuery = `
          UPDATE analytics_sessions
          SET
            is_active = false,
            end_time = $1,
            duration = $2,
            exit_page = $3
          WHERE id = $4
          RETURNING *
        `;
            const updateResult = await db_1.pool.query(updateQuery, [
                endTime,
                duration,
                exitPage || session.exitPage,
                sessionId
            ]);
            return {
                id: updateResult.rows[0].id,
                userId: updateResult.rows[0].user_id,
                walletAddress: updateResult.rows[0].wallet_address,
                startTime: updateResult.rows[0].start_time,
                endTime: updateResult.rows[0].end_time,
                duration: updateResult.rows[0].duration,
                isActive: updateResult.rows[0].is_active,
                userAgent: updateResult.rows[0].user_agent,
                ipAddress: updateResult.rows[0].ip_address,
                referrer: updateResult.rows[0].referrer,
                entryPage: updateResult.rows[0].entry_page,
                exitPage: updateResult.rows[0].exit_page,
                pageViews: updateResult.rows[0].page_views,
                interactions: updateResult.rows[0].interactions,
                chainId: updateResult.rows[0].chain_id
            };
        }, () => {
            // In-memory fallback
            const session = db_1.inMemoryStorage.sessions[sessionId];
            if (!session) {
                return null;
            }
            if (!session.isActive) {
                return session;
            }
            const updatedSession = (0, models_1.endSession)(session, exitPage);
            db_1.inMemoryStorage.sessions[sessionId] = updatedSession;
            return updatedSession;
        });
    }
    /**
     * Update session stats
     */
    async updateSessionStats(sessionId, pageView = false, interaction = false, currentPage) {
        return (0, db_1.withFallback)(async () => {
            // First, get the session
            const getQuery = `
          SELECT * FROM analytics_sessions
          WHERE id = $1
        `;
            const getResult = await db_1.pool.query(getQuery, [sessionId]);
            if (getResult.rows.length === 0) {
                return null;
            }
            const session = {
                id: getResult.rows[0].id,
                userId: getResult.rows[0].user_id,
                walletAddress: getResult.rows[0].wallet_address,
                startTime: getResult.rows[0].start_time,
                endTime: getResult.rows[0].end_time,
                duration: getResult.rows[0].duration,
                isActive: getResult.rows[0].is_active,
                userAgent: getResult.rows[0].user_agent,
                ipAddress: getResult.rows[0].ip_address,
                referrer: getResult.rows[0].referrer,
                entryPage: getResult.rows[0].entry_page,
                exitPage: getResult.rows[0].exit_page,
                pageViews: getResult.rows[0].page_views,
                interactions: getResult.rows[0].interactions,
                chainId: getResult.rows[0].chain_id
            };
            if (!session.isActive) {
                return session;
            }
            // Update the session stats
            const updateQuery = `
          UPDATE analytics_sessions
          SET
            page_views = $1,
            interactions = $2,
            exit_page = $3
          WHERE id = $4
          RETURNING *
        `;
            const updateResult = await db_1.pool.query(updateQuery, [
                pageView ? (session.pageViews || 0) + 1 : session.pageViews,
                interaction ? (session.interactions || 0) + 1 : session.interactions,
                currentPage || session.exitPage,
                sessionId
            ]);
            return {
                id: updateResult.rows[0].id,
                userId: updateResult.rows[0].user_id,
                walletAddress: updateResult.rows[0].wallet_address,
                startTime: updateResult.rows[0].start_time,
                endTime: updateResult.rows[0].end_time,
                duration: updateResult.rows[0].duration,
                isActive: updateResult.rows[0].is_active,
                userAgent: updateResult.rows[0].user_agent,
                ipAddress: updateResult.rows[0].ip_address,
                referrer: updateResult.rows[0].referrer,
                entryPage: updateResult.rows[0].entry_page,
                exitPage: updateResult.rows[0].exit_page,
                pageViews: updateResult.rows[0].page_views,
                interactions: updateResult.rows[0].interactions,
                chainId: updateResult.rows[0].chain_id
            };
        }, () => {
            // In-memory fallback
            const session = db_1.inMemoryStorage.sessions[sessionId];
            if (!session) {
                return null;
            }
            if (!session.isActive) {
                return session;
            }
            const updatedSession = (0, models_1.updateSessionStats)(session, pageView, interaction, currentPage);
            db_1.inMemoryStorage.sessions[sessionId] = updatedSession;
            return updatedSession;
        });
    }
    /**
     * Get session by ID
     */
    async getSessionById(sessionId) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_sessions
          WHERE id = $1
        `;
            const result = await db_1.pool.query(query, [sessionId]);
            if (result.rows.length === 0) {
                return null;
            }
            return {
                id: result.rows[0].id,
                userId: result.rows[0].user_id,
                walletAddress: result.rows[0].wallet_address,
                startTime: result.rows[0].start_time,
                endTime: result.rows[0].end_time,
                duration: result.rows[0].duration,
                isActive: result.rows[0].is_active,
                userAgent: result.rows[0].user_agent,
                ipAddress: result.rows[0].ip_address,
                referrer: result.rows[0].referrer,
                entryPage: result.rows[0].entry_page,
                exitPage: result.rows[0].exit_page,
                pageViews: result.rows[0].page_views,
                interactions: result.rows[0].interactions,
                chainId: result.rows[0].chain_id
            };
        }, () => {
            // In-memory fallback
            const session = db_1.inMemoryStorage.sessions[sessionId];
            return session || null;
        });
    }
    /**
     * Get active sessions
     */
    async getActiveSessions() {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_sessions
          WHERE is_active = true
        `;
            const result = await db_1.pool.query(query);
            return result.rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                walletAddress: row.wallet_address,
                startTime: row.start_time,
                endTime: row.end_time,
                duration: row.duration,
                isActive: row.is_active,
                userAgent: row.user_agent,
                ipAddress: row.ip_address,
                referrer: row.referrer,
                entryPage: row.entry_page,
                exitPage: row.exit_page,
                pageViews: row.page_views,
                interactions: row.interactions,
                chainId: row.chain_id
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.sessions).filter(session => session.isActive);
        });
    }
    /**
     * Get sessions by wallet address
     */
    async getSessionsByWalletAddress(walletAddress) {
        return (0, db_1.withFallback)(async () => {
            const query = `
          SELECT * FROM analytics_sessions
          WHERE wallet_address = $1
          ORDER BY start_time DESC
        `;
            const result = await db_1.pool.query(query, [walletAddress]);
            return result.rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                walletAddress: row.wallet_address,
                startTime: row.start_time,
                endTime: row.end_time,
                duration: row.duration,
                isActive: row.is_active,
                userAgent: row.user_agent,
                ipAddress: row.ip_address,
                referrer: row.referrer,
                entryPage: row.entry_page,
                exitPage: row.exit_page,
                pageViews: row.page_views,
                interactions: row.interactions,
                chainId: row.chain_id
            }));
        }, () => {
            // In-memory fallback
            return Object.values(db_1.inMemoryStorage.sessions)
                .filter(session => session.walletAddress === walletAddress)
                .sort((a, b) => b.startTime - a.startTime);
        });
    }
}
exports.default = new SessionsService();
//# sourceMappingURL=sessions.service.js.map