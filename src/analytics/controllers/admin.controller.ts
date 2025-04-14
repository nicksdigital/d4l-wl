/**
 * Admin controller for analytics
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import eventsService from '../services/events.service';
import contractsService from '../services/contracts.service';
import usersService from '../services/users.service';
import snapshotsService from '../services/snapshots.service';
import { AnalyticsEventType } from '../models';

// Analytics dashboard stats
interface AnalyticsDashboardStats {
  activeUsers: number;
  newUsers: number;
  totalSessions: number;
  totalTransactions: number;
  totalGasUsed: string;
  topContracts: Array<{
    address: string;
    name?: string;
    interactions: number;
  }>;
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
  recentEvents: Array<{
    eventType: string;
    timestamp: number;
    walletAddress?: string;
  }>;
}

class AdminAnalyticsController {
  /**
   * Get analytics dashboard stats
   */
  async getDashboardStats(
    request: FastifyRequest<{
      Querystring: {
        period?: 'day' | 'week' | 'month' | 'all';
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { period = 'day' } = request.query;
      
      // Calculate start date based on period
      const now = Date.now();
      let startDate: number;
      
      switch (period) {
        case 'day':
          startDate = now - 24 * 60 * 60 * 1000; // 1 day ago
          break;
        case 'week':
          startDate = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
          break;
        case 'month':
          startDate = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
          break;
        case 'all':
        default:
          startDate = 0; // All time
          break;
      }
      
      // Get active users
      const activeUsers = await usersService.getActiveUsers();
      
      // Get new users in the period
      const allUsers = await usersService.getAllUsers();
      const newUsers = allUsers.filter(user => user.firstSeen >= startDate);
      
      // Get event counts
      const eventCounts = await eventsService.getEventCountsByType(startDate, now);
      
      // Calculate total transactions
      const totalTransactions = eventCounts[AnalyticsEventType.CONTRACT_INTERACTION] || 0;
      
      // Get top contracts
      const topContracts = await contractsService.getTopContractsByInteractions(5);
      
      // Get total gas used
      let totalGasUsed = '0';
      for (const contract of topContracts) {
        totalGasUsed = addBigNumbers(totalGasUsed, contract.gasUsed);
      }
      
      // Format top events
      const topEvents = Object.entries(eventCounts)
        .map(([eventType, count]) => ({ eventType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Get recent events
      const recentEventsResult = await eventsService.queryEvents({
        startDate,
        limit: 10,
        sortBy: 'timestamp',
        sortDirection: 'desc'
      });
      
      const recentEvents = recentEventsResult.data.map(event => ({
        eventType: event.eventType,
        timestamp: event.timestamp,
        walletAddress: event.walletAddress
      }));
      
      // Calculate total sessions
      const totalSessions = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
      
      // Create dashboard stats
      const stats: AnalyticsDashboardStats = {
        activeUsers: activeUsers.length,
        newUsers: newUsers.length,
        totalSessions,
        totalTransactions,
        totalGasUsed,
        topContracts: topContracts.map(contract => ({
          address: contract.address,
          name: contract.name,
          interactions: contract.totalInteractions
        })),
        topEvents,
        recentEvents
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting analytics dashboard stats:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting analytics dashboard stats'
      });
    }
  }
  
  /**
   * Get daily snapshots for a date range
   */
  async getDailySnapshots(
    request: FastifyRequest<{
      Querystring: {
        startDate: string;
        endDate: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { startDate, endDate } = request.query;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      
      const snapshots = await snapshotsService.getDailySnapshots(startDate, endDate);
      
      return {
        success: true,
        data: snapshots
      };
    } catch (error) {
      console.error('Error getting daily snapshots:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting daily snapshots'
      });
    }
  }
  
  /**
   * Get contract analytics
   */
  async getContractAnalytics(
    request: FastifyRequest<{
      Params: {
        address: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { address } = request.params;
      
      const contract = await contractsService.getContractAnalytics(address);
      
      if (!contract) {
        return reply.code(404).send({
          success: false,
          error: 'Contract not found'
        });
      }
      
      return {
        success: true,
        data: contract
      };
    } catch (error) {
      console.error('Error getting contract analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting contract analytics'
      });
    }
  }
  
  /**
   * Get all contracts
   */
  async getAllContracts(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const contracts = await contractsService.getAllContractAnalytics();
      
      return {
        success: true,
        data: contracts
      };
    } catch (error) {
      console.error('Error getting all contracts:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting all contracts'
      });
    }
  }
  
  /**
   * Get user analytics
   */
  async getUserAnalytics(
    request: FastifyRequest<{
      Params: {
        walletAddress: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { walletAddress } = request.params;
      
      const user = await usersService.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }
      
      // Get user sessions
      const sessions = await usersService.getSessionsByWalletAddress(walletAddress);
      
      // Get user events
      const events = await eventsService.queryEvents({
        walletAddress,
        limit: 100,
        sortBy: 'timestamp',
        sortDirection: 'desc'
      });
      
      return {
        success: true,
        data: {
          user,
          sessions,
          events: events.data
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting user analytics'
      });
    }
  }
  
  /**
   * Get all users
   */
  async getAllUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const users = await usersService.getAllUsers();
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting all users'
      });
    }
  }
  
  /**
   * Create a daily snapshot
   */
  async createDailySnapshot(
    request: FastifyRequest<{
      Body: {
        date: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { date } = request.body;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      
      const snapshot = await snapshotsService.createDailySnapshot(date);
      
      return {
        success: true,
        data: snapshot
      };
    } catch (error) {
      console.error('Error creating daily snapshot:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error creating daily snapshot'
      });
    }
  }
}

// Helper function to add big numbers as strings
function addBigNumbers(a: string, b: string): string {
  const aBigInt = BigInt(a);
  const bBigInt = BigInt(b);
  return (aBigInt + bBigInt).toString();
}

export default new AdminAnalyticsController();
