/**
 * Controller for analytics events
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import eventsService from '../services/events.service';
import { AnalyticsEventType, AnalyticsQueryParams } from '../models';

class EventsController {
  /**
   * Query events
   */
  async queryEvents(
    request: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
        walletAddress?: string;
        contractAddress?: string;
        eventType?: string;
        chainId?: string;
        limit?: string;
        offset?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const {
        startDate,
        endDate,
        walletAddress,
        contractAddress,
        eventType,
        chainId,
        limit,
        offset,
        sortBy,
        sortDirection
      } = request.query;
      
      const params: AnalyticsQueryParams = {
        startDate: startDate ? parseInt(startDate) : undefined,
        endDate: endDate ? parseInt(endDate) : undefined,
        walletAddress,
        contractAddress,
        eventType: eventType as AnalyticsEventType,
        chainId: chainId ? parseInt(chainId) : undefined,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
        sortBy,
        sortDirection
      };
      
      const result = await eventsService.queryEvents(params);
      
      return {
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasMore: result.hasMore
        }
      };
    } catch (error) {
      console.error('Error querying events:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error querying events'
      });
    }
  }
  
  /**
   * Get event by ID
   */
  async getEventById(
    request: FastifyRequest<{
      Params: {
        id: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      const event = await eventsService.getEventById(id);
      
      if (!event) {
        return reply.code(404).send({
          success: false,
          error: 'Event not found'
        });
      }
      
      return {
        success: true,
        data: event
      };
    } catch (error) {
      console.error('Error getting event:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting event'
      });
    }
  }
  
  /**
   * Delete event by ID
   */
  async deleteEventById(
    request: FastifyRequest<{
      Params: {
        id: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      const deleted = await eventsService.deleteEventById(id);
      
      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: 'Event not found'
        });
      }
      
      return {
        success: true,
        data: {
          id
        }
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error deleting event'
      });
    }
  }
  
  /**
   * Get event counts by type
   */
  async getEventCountsByType(
    request: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { startDate, endDate } = request.query;
      
      const counts = await eventsService.getEventCountsByType(
        startDate ? parseInt(startDate) : undefined,
        endDate ? parseInt(endDate) : undefined
      );
      
      return {
        success: true,
        data: counts
      };
    } catch (error) {
      console.error('Error getting event counts:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting event counts'
      });
    }
  }
}

export default new EventsController();
