/**
 * Database service for analytics
 */
import { Pool } from 'pg';
import config from '../../config';

// Create a connection pool
const pool = new Pool({
  user: config.database?.user || process.env.DB_USER,
  host: config.database?.host || process.env.DB_HOST,
  database: config.database?.name || process.env.DB_NAME,
  password: config.database?.password || process.env.DB_PASSWORD,
  port: config.database?.port || parseInt(process.env.DB_PORT || '5432', 10),
  ssl: config.database?.ssl || process.env.DB_SSL === 'true'
});

// In-memory fallback storage for development or when database is not available
const inMemoryStorage: {
  events: Record<string, any[]>;
  sessions: Record<string, any>;
  users: Record<string, any>;
  contracts: Record<string, any>;
  snapshots: Record<string, any>;
} = {
  events: {},
  sessions: {},
  users: {},
  contracts: {},
  snapshots: {}
};

// Helper to determine if we're using PostgreSQL or in-memory storage
const usePostgres = () => {
  try {
    return !!pool && config.database?.enabled !== false && process.env.USE_IN_MEMORY_DB !== 'true';
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
};

// Flag to track if we've already shown the database fallback warning
let dbFallbackWarningShown = false;

// Wrapper for database operations with fallback
const withFallback = async <T>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  if (!usePostgres()) {
    if (!dbFallbackWarningShown) {
      console.log('Using in-memory storage fallback for analytics database operations');
      dbFallbackWarningShown = true;
    }
    return fallback();
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed, using fallback:', error);
    return fallback();
  }
};

// Export the database connection
export { pool, inMemoryStorage, usePostgres, withFallback };
