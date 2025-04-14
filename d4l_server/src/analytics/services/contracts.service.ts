/**
 * Service for managing contract analytics
 */
import { pool, inMemoryStorage, withFallback } from './db';
import { ContractAnalytics, createContractAnalytics, updateContractAnalytics } from '../models';

class ContractsService {
  /**
   * Get or create contract analytics
   */
  async getOrCreateContractAnalytics(
    address: string,
    name?: string,
    type?: string,
    deployedAt?: number,
    deployerAddress?: string,
    metadata?: Record<string, any>
  ): Promise<ContractAnalytics> {
    return withFallback(
      async () => {
        // First, try to get the contract
        const getQuery = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
        
        const getResult = await pool.query(getQuery, [address]);
        
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
        const contract = createContractAnalytics(
          address,
          name,
          type,
          deployedAt,
          deployerAddress,
          metadata
        );
        
        const createQuery = `
          INSERT INTO analytics_contracts (
            address, name, type, deployed_at, deployer_address,
            total_interactions, unique_users, last_interaction,
            gas_used, events, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
        
        const createResult = await pool.query(createQuery, [
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
      },
      () => {
        // In-memory fallback
        if (inMemoryStorage.contracts[address]) {
          return inMemoryStorage.contracts[address];
        }
        
        const contract = createContractAnalytics(
          address,
          name,
          type,
          deployedAt,
          deployerAddress,
          metadata
        );
        
        inMemoryStorage.contracts[address] = contract;
        return contract;
      }
    );
  }
  
  /**
   * Update contract analytics
   */
  async updateContractAnalytics(
    address: string,
    eventName: string,
    userAddress?: string,
    gasUsed: string = '0',
    metadata?: Record<string, any>
  ): Promise<ContractAnalytics | null> {
    return withFallback(
      async () => {
        // First, get the contract
        const getQuery = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
        
        const getResult = await pool.query(getQuery, [address]);
        
        if (getResult.rows.length === 0) {
          return null;
        }
        
        const row = getResult.rows[0];
        const contract: ContractAnalytics = {
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
          
          const userResult = await pool.query(userQuery, [address, userAddress]);
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
        
        const updateResult = await pool.query(updateQuery, [
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
      },
      () => {
        // In-memory fallback
        const contract = inMemoryStorage.contracts[address];
        
        if (!contract) {
          return null;
        }
        
        // Check if this is a new user
        let isNewUser = false;
        if (userAddress) {
          const userEvents = Object.values(inMemoryStorage.events)
            .flat()
            .filter(event => 
              (event as any).contractAddress === address && 
              event.walletAddress === userAddress
            );
          
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
        
        inMemoryStorage.contracts[address] = updatedContract;
        return updatedContract;
      }
    );
  }
  
  /**
   * Get contract analytics by address
   */
  async getContractAnalytics(address: string): Promise<ContractAnalytics | null> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_contracts
          WHERE address = $1
        `;
        
        const result = await pool.query(query, [address]);
        
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
      },
      () => {
        // In-memory fallback
        return inMemoryStorage.contracts[address] || null;
      }
    );
  }
  
  /**
   * Get all contract analytics
   */
  async getAllContractAnalytics(): Promise<ContractAnalytics[]> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_contracts
          ORDER BY total_interactions DESC
        `;
        
        const result = await pool.query(query);
        
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
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.contracts)
          .sort((a, b) => b.totalInteractions - a.totalInteractions);
      }
    );
  }
  
  /**
   * Get top contracts by interactions
   */
  async getTopContractsByInteractions(limit: number = 10): Promise<ContractAnalytics[]> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_contracts
          ORDER BY total_interactions DESC
          LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        
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
      },
      () => {
        // In-memory fallback
        return Object.values(inMemoryStorage.contracts)
          .sort((a, b) => b.totalInteractions - a.totalInteractions)
          .slice(0, limit);
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

export default new ContractsService();
