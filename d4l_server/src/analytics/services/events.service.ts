/**
 * Service for managing analytics events
 */
import { v4 as uuidv4 } from 'uuid';
import { pool, inMemoryStorage, withFallback } from './db';
import { 
  AnalyticsEvent, 
  ContractEvent, 
  UIEvent, 
  AnalyticsQueryParams, 
  AnalyticsQueryResult 
} from '../models';

class EventsService {
  /**
   * Store a contract event in the database
   */
  async storeContractEvent(event: ContractEvent): Promise<string> {
    const id = event.id || uuidv4();
    
    return withFallback(
      async () => {
        const query = `
          INSERT INTO analytics_events (
            id, event_type, timestamp, wallet_address, chain_id, 
            contract_address, event_name, transaction_hash, block_number, 
            log_index, return_values, gas_used, gas_price, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id
        `;
        
        const values = [
          id,
          event.eventType,
          event.timestamp,
          event.walletAddress || null,
          event.chainId || null,
          event.contractAddress,
          event.eventName,
          event.transactionHash,
          event.blockNumber,
          event.logIndex,
          JSON.stringify(event.returnValues),
          event.gasUsed || null,
          event.gasPrice || null,
          event.metadata ? JSON.stringify(event.metadata) : null
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0].id;
      },
      () => {
        // In-memory fallback
        const eventWithId = { ...event, id };
        
        if (!inMemoryStorage.events[event.eventType]) {
          inMemoryStorage.events[event.eventType] = [];
        }
        
        inMemoryStorage.events[event.eventType].push(eventWithId);
        return id;
      }
    );
  }
  
  /**
   * Store a UI event in the database
   */
  async storeUIEvent(event: UIEvent): Promise<string> {
    const id = event.id || uuidv4();
    
    return withFallback(
      async () => {
        const query = `
          INSERT INTO analytics_events (
            id, event_type, timestamp, session_id, wallet_address, 
            url, referrer, user_agent, ip_address, element, 
            action, value, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `;
        
        const values = [
          id,
          event.eventType,
          event.timestamp,
          event.sessionId || null,
          event.walletAddress || null,
          event.url || null,
          event.referrer || null,
          event.userAgent || null,
          event.ipAddress || null,
          event.element || null,
          event.action || null,
          event.value || null,
          event.metadata ? JSON.stringify(event.metadata) : null
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0].id;
      },
      () => {
        // In-memory fallback
        const eventWithId = { ...event, id };
        
        if (!inMemoryStorage.events[event.eventType]) {
          inMemoryStorage.events[event.eventType] = [];
        }
        
        inMemoryStorage.events[event.eventType].push(eventWithId);
        return id;
      }
    );
  }
  
  /**
   * Query events from the database
   */
  async queryEvents(params: AnalyticsQueryParams): Promise<AnalyticsQueryResult<AnalyticsEvent>> {
    return withFallback(
      async () => {
        // Build the query
        let query = `
          SELECT * FROM analytics_events
          WHERE 1=1
        `;
        
        const values: any[] = [];
        let valueIndex = 1;
        
        // Add filters
        if (params.startDate) {
          query += ` AND timestamp >= $${valueIndex++}`;
          values.push(params.startDate);
        }
        
        if (params.endDate) {
          query += ` AND timestamp <= $${valueIndex++}`;
          values.push(params.endDate);
        }
        
        if (params.walletAddress) {
          query += ` AND wallet_address = $${valueIndex++}`;
          values.push(params.walletAddress);
        }
        
        if (params.contractAddress) {
          query += ` AND contract_address = $${valueIndex++}`;
          values.push(params.contractAddress);
        }
        
        if (params.eventType) {
          query += ` AND event_type = $${valueIndex++}`;
          values.push(params.eventType);
        }
        
        if (params.chainId) {
          query += ` AND chain_id = $${valueIndex++}`;
          values.push(params.chainId);
        }
        
        // Add sorting
        const sortBy = params.sortBy || 'timestamp';
        const sortDirection = params.sortDirection || 'desc';
        query += ` ORDER BY ${sortBy} ${sortDirection}`;
        
        // Add pagination
        const limit = params.limit || 100;
        const offset = params.offset || 0;
        query += ` LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
        values.push(limit);
        values.push(offset);
        
        // Execute the query
        const result = await pool.query(query, values);
        
        // Get the total count
        const countQuery = `
          SELECT COUNT(*) FROM analytics_events
          WHERE 1=1
        `;
        
        // Remove the LIMIT and OFFSET from values
        values.pop();
        values.pop();
        
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);
        
        return {
          data: result.rows.map(row => ({
            id: row.id,
            eventType: row.event_type,
            timestamp: row.timestamp,
            sessionId: row.session_id,
            walletAddress: row.wallet_address,
            chainId: row.chain_id,
            contractAddress: row.contract_address,
            eventName: row.event_name,
            transactionHash: row.transaction_hash,
            blockNumber: row.block_number,
            logIndex: row.log_index,
            returnValues: row.return_values,
            gasUsed: row.gas_used,
            gasPrice: row.gas_price,
            url: row.url,
            referrer: row.referrer,
            userAgent: row.user_agent,
            ipAddress: row.ip_address,
            element: row.element,
            action: row.action,
            value: row.value,
            metadata: row.metadata
          })),
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          hasMore: offset + result.rows.length < total
        };
      },
      () => {
        // In-memory fallback
        let allEvents: AnalyticsEvent[] = [];
        
        // Collect events from all types
        Object.values(inMemoryStorage.events).forEach(events => {
          allEvents = allEvents.concat(events);
        });
        
        // Apply filters
        if (params.startDate) {
          allEvents = allEvents.filter(event => event.timestamp >= params.startDate!);
        }
        
        if (params.endDate) {
          allEvents = allEvents.filter(event => event.timestamp <= params.endDate!);
        }
        
        if (params.walletAddress) {
          allEvents = allEvents.filter(event => event.walletAddress === params.walletAddress);
        }
        
        if (params.contractAddress) {
          allEvents = allEvents.filter(event => 
            (event as ContractEvent).contractAddress === params.contractAddress
          );
        }
        
        if (params.eventType) {
          allEvents = allEvents.filter(event => event.eventType === params.eventType);
        }
        
        if (params.chainId) {
          allEvents = allEvents.filter(event => event.chainId === params.chainId);
        }
        
        // Sort events
        const sortBy = params.sortBy || 'timestamp';
        const sortDirection = params.sortDirection || 'desc';
        
        allEvents.sort((a, b) => {
          const aValue = (a as any)[sortBy];
          const bValue = (b as any)[sortBy];
          
          if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        // Apply pagination
        const limit = params.limit || 100;
        const offset = params.offset || 0;
        const paginatedEvents = allEvents.slice(offset, offset + limit);
        
        return {
          data: paginatedEvents,
          total: allEvents.length,
          page: Math.floor(offset / limit) + 1,
          limit,
          hasMore: offset + paginatedEvents.length < allEvents.length
        };
      }
    );
  }
  
  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<AnalyticsEvent | null> {
    return withFallback(
      async () => {
        const query = `
          SELECT * FROM analytics_events
          WHERE id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        const row = result.rows[0];
        
        return {
          id: row.id,
          eventType: row.event_type,
          timestamp: row.timestamp,
          sessionId: row.session_id,
          walletAddress: row.wallet_address,
          chainId: row.chain_id,
          metadata: row.metadata
        };
      },
      () => {
        // In-memory fallback
        for (const eventType in inMemoryStorage.events) {
          const event = inMemoryStorage.events[eventType].find(e => e.id === id);
          if (event) {
            return event;
          }
        }
        
        return null;
      }
    );
  }
  
  /**
   * Delete event by ID
   */
  async deleteEventById(id: string): Promise<boolean> {
    return withFallback(
      async () => {
        const query = `
          DELETE FROM analytics_events
          WHERE id = $1
          RETURNING id
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows.length > 0;
      },
      () => {
        // In-memory fallback
        let deleted = false;
        
        for (const eventType in inMemoryStorage.events) {
          const index = inMemoryStorage.events[eventType].findIndex(e => e.id === id);
          
          if (index !== -1) {
            inMemoryStorage.events[eventType].splice(index, 1);
            deleted = true;
            break;
          }
        }
        
        return deleted;
      }
    );
  }
  
  /**
   * Get event counts by type
   */
  async getEventCountsByType(
    startDate?: number,
    endDate?: number
  ): Promise<Record<string, number>> {
    return withFallback(
      async () => {
        let query = `
          SELECT event_type, COUNT(*) as count
          FROM analytics_events
          WHERE 1=1
        `;
        
        const values: any[] = [];
        let valueIndex = 1;
        
        if (startDate) {
          query += ` AND timestamp >= $${valueIndex++}`;
          values.push(startDate);
        }
        
        if (endDate) {
          query += ` AND timestamp <= $${valueIndex++}`;
          values.push(endDate);
        }
        
        query += ` GROUP BY event_type`;
        
        const result = await pool.query(query, values);
        
        const counts: Record<string, number> = {};
        
        result.rows.forEach(row => {
          counts[row.event_type] = parseInt(row.count, 10);
        });
        
        return counts;
      },
      () => {
        // In-memory fallback
        const counts: Record<string, number> = {};
        
        for (const eventType in inMemoryStorage.events) {
          let events = inMemoryStorage.events[eventType];
          
          if (startDate) {
            events = events.filter(event => event.timestamp >= startDate);
          }
          
          if (endDate) {
            events = events.filter(event => event.timestamp <= endDate);
          }
          
          counts[eventType] = events.length;
        }
        
        return counts;
      }
    );
  }
}

export default new EventsService();
