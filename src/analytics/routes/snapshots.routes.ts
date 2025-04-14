/**
 * Routes for analytics snapshots
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { snapshotsController } from '../controllers';

export default async function snapshotsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Create a daily snapshot
  fastify.post('/daily', {
    schema: {
      body: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string' }
        }
      }
    },
    handler: snapshotsController.createDailySnapshot
  });
  
  // Get daily snapshot by date
  fastify.get('/daily/:date', {
    schema: {
      params: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string' }
        }
      }
    },
    handler: snapshotsController.getDailySnapshot
  });
  
  // Get daily snapshots for a date range
  fastify.get('/daily', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    },
    handler: snapshotsController.getDailySnapshots
  });
  
  // Get real-time analytics
  fastify.get('/realtime', {
    handler: snapshotsController.getRealTimeAnalytics
  });
}
