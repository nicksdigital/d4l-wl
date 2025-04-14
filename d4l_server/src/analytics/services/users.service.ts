/**
 * Service for managing user analytics
 */
import { v4 as uuidv4 } from 'uuid';
import { pool, inMemoryStorage, withFallback } from './db';
import { AnalyticsUser, createUser, updateUserStats } from '../models';

class UsersService {
  /**
   * Get or create user analytics
   */
  async getOrCreateUser(
    walletAddress: string,
    metadata?: Record<string, any>
  ): Promise<AnalyticsUser> {
    return withFallback(
      async () => {
        // First, try to get the user
        const getQuery = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
        
        const getResult = await pool.query(getQuery, [walletAddress]);
        
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
        const userId = uuidv4();
        const user = createUser(userId, walletAddress, metadata);
        
        const createQuery = `
          INSERT INTO analytics_users (
            id, wallet_address, first_seen, last_seen,
            total_sessions, total_interactions, total_transactions,
            total_gas_spent, assets_linked, tokens_held, tags, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;
        
        const createResult = await pool.query(createQuery, [
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
      },
      () => {
        // In-memory fallback
        if (inMemoryStorage.users[walletAddress]) {
          return inMemoryStorage.users[walletAddress];
        }
        
        const userId = uuidv4();
        const user = createUser(userId, walletAddress, metadata);
        
        inMemoryStorage.users[walletAddress] = user;
        return user;
      }
    );
  }
  
  /**
   * Update user stats
   */
  async updateUserStats(
    walletAddress: string,
    newSession: boolean = false,
    newInteraction: boolean = false,
    newTransaction: boolean = false,
    gasSpent: string = '0',
    metadata?: Record<string, any>
  ): Promise<AnalyticsUser | null> {
    return withFallback(
      async () => {
        // First, get the user
        const getQuery = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
        
        const getResult = await pool.query(getQuery, [walletAddress]);
        
        if (getResult.rows.length === 0) {
          return null;
        }
        
        const row = getResult.rows[0];
        const user: AnalyticsUser = {
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
        
        const updateResult = await pool.query(updateQuery, [
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
      },
      () => {
        // In-memory fallback
        const user = inMemoryStorage.users[walletAddress];
        
        if (!user) {
          return null;
        }
        
        const updatedUser = updateUserStats(
          user,
          newSession,
          newInteraction,
          newTransaction,
          gasSpent,
          metadata
        );
        
        inMemoryStorage.users[walletAddress] = updatedUser;
        return updatedUser;
      }
    );
  }
  
  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress: string): Promise<AnalyticsUser | null> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_users
          WHERE wallet_address = $1
        `;
        
        const result = await pool.query(query, [walletAddress]);
        
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
      },
      () => {
        // In-memory fallback
        return inMemoryStorage.users[walletAddress] || null;
      }
    );
  }
  
  /**
   * Get all users
   */
  async getAllUsers(): Promise<AnalyticsUser[]> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_users
          ORDER BY last_seen DESC
        `;
        
        const result = await pool.query(query);
        
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
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.users)
          .sort((a, b) => b.lastSeen - a.lastSeen);
      }
    );
  }
  
  /**
   * Get active users (users who have been active in the last 24 hours)
   */
  async getActiveUsers(): Promise<AnalyticsUser[]> {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_users
          WHERE last_seen >= $1
          ORDER BY last_seen DESC
        `;
        
        const result = await pool.query(query, [oneDayAgo]);
        
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
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.users)
          .filter(user => user.lastSeen >= oneDayAgo)
          .sort((a, b) => b.lastSeen - a.lastSeen);
      }
    );
  }
  
  /**
   * Get new users (users who have been created in the last 24 hours)
   */
  async getNewUsers(): Promise<AnalyticsUser[]> {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_users
          WHERE first_seen >= $1
          ORDER BY first_seen DESC
        `;
        
        const result = await pool.query(query, [oneDayAgo]);
        
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
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.users)
          .filter(user => user.firstSeen >= oneDayAgo)
          .sort((a, b) => b.firstSeen - a.firstSeen);
      }
    );
  }
}

// Helper function to add big numbers as strings
function addBigNumbers(a: string, b: string): string {
  const aBigInt = BigInt(a);
  const bBigInt = BigInt(b);
  return (aBigInt + bBigInt).toString();
}

export default new UsersService();
