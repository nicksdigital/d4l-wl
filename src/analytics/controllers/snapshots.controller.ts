/**
 * Controller for analytics snapshots
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import snapshotsService from '../services/snapshots.service';

class SnapshotsController {
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
  
  /**
   * Get daily snapshot by date
   */
  async getDailySnapshot(
    request: FastifyRequest<{
      Params: {
        date: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { date } = request.params;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      
      const snapshot = await snapshotsService.getDailySnapshot(date);
      
      if (!snapshot) {
        return reply.code(404).send({
          success: false,
          error: 'Snapshot not found'
        });
      }
      
      return {
        success: true,
        data: snapshot
      };
    } catch (error) {
      console.error('Error getting daily snapshot:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting daily snapshot'
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
   * Get real-time analytics
   */
  async getRealTimeAnalytics(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const analytics = await snapshotsService.getRealTimeAnalytics();
      
      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting real-time analytics'
      });
    }
  }
}

export default new SnapshotsController();
