"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withFallback = exports.usePostgres = exports.inMemoryStorage = exports.pool = void 0;
/**
 * Database service for analytics
 */
const pg_1 = require("pg");
const config_1 = __importDefault(require("../../config"));
// Create a connection pool
const pool = new pg_1.Pool({
    user: config_1.default.database?.user || process.env.DB_USER,
    host: config_1.default.database?.host || process.env.DB_HOST,
    database: config_1.default.database?.name || process.env.DB_NAME,
    password: config_1.default.database?.password || process.env.DB_PASSWORD,
    port: config_1.default.database?.port || parseInt(process.env.DB_PORT || '5432', 10),
    ssl: config_1.default.database?.ssl || process.env.DB_SSL === 'true'
});
exports.pool = pool;
// In-memory fallback storage for development or when database is not available
const inMemoryStorage = {
    events: {},
    sessions: {},
    users: {},
    contracts: {},
    snapshots: {}
};
exports.inMemoryStorage = inMemoryStorage;
// Helper to determine if we're using PostgreSQL or in-memory storage
const usePostgres = () => {
    try {
        return !!pool && config_1.default.database?.enabled !== false && process.env.USE_IN_MEMORY_DB !== 'true';
    }
    catch (error) {
        console.error('Error checking database connection:', error);
        return false;
    }
};
exports.usePostgres = usePostgres;
// Flag to track if we've already shown the database fallback warning
let dbFallbackWarningShown = false;
// Wrapper for database operations with fallback
const withFallback = async (operation, fallback) => {
    if (!usePostgres()) {
        if (!dbFallbackWarningShown) {
            console.log('Using in-memory storage fallback for analytics database operations');
            dbFallbackWarningShown = true;
        }
        return fallback();
    }
    try {
        return await operation();
    }
    catch (error) {
        console.error('Database operation failed, using fallback:', error);
        return fallback();
    }
};
exports.withFallback = withFallback;
//# sourceMappingURL=db.js.map