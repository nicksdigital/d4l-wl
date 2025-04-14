/**
 * Routes for analytics events
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventsController } from '../controllers';

export default async function eventsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Query events
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          walletAddress: { type: 'string' },
          contractAddress: { type: 'string' },
          eventType: { type: 'string' },
          chainId: { type: 'string' },
          limit: { type: 'string' },
          offset: { type: 'string' },
          sortBy: { type: 'string' },
          sortDirection: { type: 'string', enum: ['asc', 'desc'] }
        }
      }
    },
    handler: eventsController.queryEvents
  });
  
  // Get event by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: eventsController.getEventById
  });
  
  // Delete event by ID
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: eventsController.deleteEventById
  });
  
  // Get event counts by type
  fastify.get('/counts/by-type', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    },
    handler: eventsController.getEventCountsByType
  });
}
