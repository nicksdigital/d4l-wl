/**
 * Database service for analytics
 */
import { Pool } from 'pg';
declare const pool: Pool;
declare const inMemoryStorage: {
    events: Record<string, any[]>;
    sessions: Record<string, any>;
    users: Record<string, any>;
    contracts: Record<string, any>;
    snapshots: Record<string, any>;
};
declare const usePostgres: () => boolean;
declare const withFallback: <T>(operation: () => Promise<T>, fallback: () => T) => Promise<T>;
export { pool, inMemoryStorage, usePostgres, withFallback };
