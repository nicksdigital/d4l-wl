import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { verifyJWT } from '../utils/auth';
import adminController from '../controllers/admin.controller';
import adminAnalyticsController from '../analytics/controllers/admin.controller';

export default async function adminRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All admin routes require JWT authentication and admin role
  fastify.register(async (fastify) => {
    // Apply JWT verification and admin check to all routes in this context
    fastify.addHook('preHandler', verifyJWT);
    fastify.addHook('preHandler', async (request, reply) => {
      // Check if user has admin role
      if (!request.user.isAdmin) {
        return reply.code(403).send({
          success: false,
          error: 'Forbidden: Admin access required'
        });
      }
    });

    // Dashboard stats
    fastify.get('/dashboard/stats', {
      handler: adminController.getDashboardStats
    });

    // Users management
    fastify.get('/users', {
      handler: adminController.getUsers
    });

    fastify.get('/users/:wallet', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: adminController.getUserDetails
    });

    fastify.post('/users/:wallet/deactivate', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: adminController.deactivateUser
    });

    fastify.post('/users/:wallet/reactivate', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: adminController.reactivateUser
    });

    // Airdrop management
    fastify.get('/airdrop/stats', {
      handler: adminController.getAirdropStats
    });

    fastify.get('/airdrop/claims', {
      handler: adminController.getAirdropClaims
    });

    fastify.post('/airdrop/add', {
      schema: {
        body: {
          type: 'object',
          required: ['wallet', 'amount'],
          properties: {
            wallet: { type: 'string' },
            amount: { type: 'number' },
            reason: { type: 'string' }
          }
        }
      },
      handler: adminController.addAirdropAllocation
    });

    // Content management
    fastify.get('/content', {
      handler: adminController.getContent
    });

    fastify.get('/content/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      },
      handler: adminController.getContentById
    });

    fastify.post('/content', {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'slug', 'content'],
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['published', 'draft'] }
          }
        }
      },
      handler: adminController.createContent
    });

    fastify.put('/content/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['title', 'slug', 'content'],
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['published', 'draft'] }
          }
        }
      },
      handler: adminController.updateContent
    });

    fastify.delete('/content/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      },
      handler: adminController.deleteContent
    });

    // Cache management
    fastify.get('/cache/keys', {
      handler: adminController.getCacheKeys
    });

    fastify.delete('/cache/keys/:key', {
      schema: {
        params: {
          type: 'object',
          required: ['key'],
          properties: {
            key: { type: 'string' }
          }
        }
      },
      handler: adminController.deleteCacheKey
    });

    fastify.delete('/cache/flush', {
      handler: adminController.flushCache
    });

    // Settings management
    fastify.get('/settings', {
      handler: adminController.getSettings
    });

    fastify.put('/settings', {
      schema: {
        body: {
          type: 'object',
          properties: {
            siteTitle: { type: 'string' },
            siteDescription: { type: 'string' },
            airdropEnabled: { type: 'boolean' },
            maintenanceMode: { type: 'boolean' }
          }
        }
      },
      handler: adminController.updateSettings
    });

    // Analytics routes
    fastify.get('/analytics/dashboard/stats', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['day', 'week', 'month', 'all'] }
          }
        }
      },
      handler: adminAnalyticsController.getDashboardStats
    });

    fastify.get('/analytics/snapshots/daily', {
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
      handler: adminAnalyticsController.getDailySnapshots
    });

    fastify.post('/analytics/snapshots/daily', {
      schema: {
        body: {
          type: 'object',
          required: ['date'],
          properties: {
            date: { type: 'string' }
          }
        }
      },
      handler: adminAnalyticsController.createDailySnapshot
    });

    fastify.get('/analytics/contracts/:address', {
      schema: {
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      },
      handler: adminAnalyticsController.getContractAnalytics
    });

    fastify.get('/analytics/contracts', {
      handler: adminAnalyticsController.getAllContracts
    });

    fastify.get('/analytics/users/:walletAddress', {
      schema: {
        params: {
          type: 'object',
          required: ['walletAddress'],
          properties: {
            walletAddress: { type: 'string' }
          }
        }
      },
      handler: adminAnalyticsController.getUserAnalytics
    });

    fastify.get('/analytics/users', {
      handler: adminAnalyticsController.getAllUsers
    });
  });
}
