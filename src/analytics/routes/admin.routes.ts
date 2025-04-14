/**
 * Admin routes for analytics
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import adminController from '../controllers/admin.controller';

export default async function adminAnalyticsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get analytics dashboard stats
  fastify.get('/dashboard/stats', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['day', 'week', 'month', 'all'] }
        }
      }
    },
    handler: adminController.getDashboardStats
  });
  
  // Get daily snapshots for a date range
  fastify.get('/snapshots/daily', {
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
    handler: adminController.getDailySnapshots
  });
  
  // Create a daily snapshot
  fastify.post('/snapshots/daily', {
    schema: {
      body: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string' }
        }
      }
    },
    handler: adminController.createDailySnapshot
  });
  
  // Get contract analytics
  fastify.get('/contracts/:address', {
    schema: {
      params: {
        type: 'object',
        required: ['address'],
        properties: {
          address: { type: 'string' }
        }
      }
    },
    handler: adminController.getContractAnalytics
  });
  
  // Get all contracts
  fastify.get('/contracts', {
    handler: adminController.getAllContracts
  });
  
  // Get user analytics
  fastify.get('/users/:walletAddress', {
    schema: {
      params: {
        type: 'object',
        required: ['walletAddress'],
        properties: {
          walletAddress: { type: 'string' }
        }
      }
    },
    handler: adminController.getUserAnalytics
  });
  
  // Get all users
  fastify.get('/users', {
    handler: adminController.getAllUsers
  });
}
