/**
 * Routes for user analytics
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { usersController } from '../controllers';

export default async function usersRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get all users
  fastify.get('/', {
    handler: usersController.getAllUsers
  });
  
  // Get active users
  fastify.get('/active', {
    handler: usersController.getActiveUsers
  });
  
  // Get new users
  fastify.get('/new', {
    handler: usersController.getNewUsers
  });
  
  // Get user by wallet address
  fastify.get('/:walletAddress', {
    schema: {
      params: {
        type: 'object',
        required: ['walletAddress'],
        properties: {
          walletAddress: { type: 'string' }
        }
      }
    },
    handler: usersController.getUserByWalletAddress
  });
  
  // Get sessions by wallet address
  fastify.get('/:walletAddress/sessions', {
    schema: {
      params: {
        type: 'object',
        required: ['walletAddress'],
        properties: {
          walletAddress: { type: 'string' }
        }
      }
    },
    handler: usersController.getSessionsByWalletAddress
  });
  
  // Get all active sessions
  fastify.get('/sessions/active', {
    handler: usersController.getActiveSessions
  });
  
  // Get session by ID
  fastify.get('/sessions/:sessionId', {
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' }
        }
      }
    },
    handler: usersController.getSessionById
  });
}
