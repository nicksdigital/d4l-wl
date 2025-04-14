/**
 * Frontend event listener for analytics
 */
import { FastifyInstance, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import eventsService from '../services/events.service';
import sessionsService from '../services/sessions.service';
import usersService from '../services/users.service';
import { AnalyticsEventType, createUIEvent } from '../models';

// Register the frontend event listener
function registerFrontendListener(fastify: FastifyInstance) {
  // Create a route for tracking events
  fastify.post('/api/analytics/track', async (request: FastifyRequest<{
    Body: {
      eventType: AnalyticsEventType;
      sessionId?: string;
      walletAddress?: string;
      url?: string;
      referrer?: string;
      element?: string;
      action?: string;
      value?: string;
      metadata?: Record<string, any>;
    }
  }>, reply) => {
    try {
      const {
        eventType,
        sessionId,
        walletAddress,
        url,
        referrer,
        element,
        action,
        value,
        metadata
      } = request.body;
      
      // Get user agent and IP address from request
      const userAgent = request.headers['user-agent'];
      const ipAddress = request.ip;
      
      // Create UI event
      const event = createUIEvent(
        eventType,
        walletAddress,
        sessionId,
        url,
        referrer,
        userAgent,
        ipAddress,
        element,
        action,
        value,
        metadata
      );
      
      // Store the event
      await eventsService.storeUIEvent(event);
      
      // Update session stats if session ID is provided
      if (sessionId) {
        await sessionsService.updateSessionStats(
          sessionId,
          eventType === AnalyticsEventType.PAGE_VIEW,
          eventType !== AnalyticsEventType.PAGE_VIEW,
          url
        );
      }
      
      // Update user stats if wallet address is provided
      if (walletAddress) {
        await usersService.getOrCreateUser(walletAddress);
        await usersService.updateUserStats(
          walletAddress,
          false,
          true,
          false,
          '0',
          metadata
        );
      }
      
      return {
        success: true,
        data: {
          eventId: event.id
        }
      };
    } catch (error) {
      console.error('Error tracking event:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error tracking event'
      });
    }
  });
  
  // Create a route for starting a session
  fastify.post('/api/analytics/session/start', async (request: FastifyRequest<{
    Body: {
      walletAddress?: string;
      referrer?: string;
      entryPage?: string;
      chainId?: number;
    }
  }>, reply) => {
    try {
      const {
        walletAddress,
        referrer,
        entryPage,
        chainId
      } = request.body;
      
      // Get user agent and IP address from request
      const userAgent = request.headers['user-agent'];
      const ipAddress = request.ip;
      
      // Create a new session
      const session = await sessionsService.createSession(
        walletAddress,
        userAgent,
        ipAddress,
        referrer,
        entryPage,
        chainId
      );
      
      // Update user stats if wallet address is provided
      if (walletAddress) {
        await usersService.getOrCreateUser(walletAddress);
        await usersService.updateUserStats(
          walletAddress,
          true,
          false,
          false
        );
      }
      
      return {
        success: true,
        data: {
          sessionId: session.id
        }
      };
    } catch (error) {
      console.error('Error starting session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error starting session'
      });
    }
  });
  
  // Create a route for ending a session
  fastify.post('/api/analytics/session/end', async (request: FastifyRequest<{
    Body: {
      sessionId: string;
      exitPage?: string;
    }
  }>, reply) => {
    try {
      const { sessionId, exitPage } = request.body;
      
      // End the session
      const session = await sessionsService.endSession(sessionId, exitPage);
      
      if (!session) {
        return reply.code(404).send({
          success: false,
          error: 'Session not found'
        });
      }
      
      return {
        success: true,
        data: {
          sessionId: session.id,
          duration: session.duration
        }
      };
    } catch (error) {
      console.error('Error ending session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error ending session'
      });
    }
  });
}

export default {
  registerFrontendListener
};
