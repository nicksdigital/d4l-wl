import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import authController from '../controllers/auth.controller';
import { verifyJWT } from '../utils/auth';

export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Admin login route
  fastify.post('/admin/login', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      }
    },
    handler: authController.adminLogin
  });

  // Public routes
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'deadline', 'signature'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          deadline: { type: 'number' },
          signature: { type: 'string' }
        }
      }
    },
    handler: authController.register
  });

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['deadline', 'signature'],
        properties: {
          deadline: { type: 'number' },
          signature: { type: 'string' }
        }
      }
    },
    handler: authController.login
  });

  fastify.get('/signing-info', {
    handler: authController.getSigningInfo
  });

  fastify.get('/username-available/:username', {
    schema: {
      params: {
        type: 'object',
        required: ['username'],
        properties: {
          username: { type: 'string' }
        }
      }
    },
    handler: authController.isUsernameAvailable
  });

  fastify.get('/email-available/:email', {
    schema: {
      params: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    },
    handler: authController.isEmailAvailable
  });

  // Protected routes (require JWT)
  fastify.register(async (fastify) => {
    // Apply JWT verification to all routes in this context
    fastify.addHook('preHandler', verifyJWT);

    fastify.post('/logout', {
      schema: {
        body: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' }
          }
        }
      },
      handler: authController.logout
    });

    fastify.post('/validate-session', {
      schema: {
        body: {
          type: 'object',
          required: ['wallet', 'sessionId'],
          properties: {
            wallet: { type: 'string' },
            sessionId: { type: 'string' }
          }
        }
      },
      handler: authController.validateSession
    });

    fastify.get('/user/:wallet', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: authController.getUser
    });

    fastify.get('/session/:sessionId', {
      schema: {
        params: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' }
          }
        }
      },
      handler: authController.getSession
    });

    fastify.get('/wallet-by-username/:username', {
      schema: {
        params: {
          type: 'object',
          required: ['username'],
          properties: {
            username: { type: 'string' }
          }
        }
      },
      handler: authController.getWalletByUsername
    });

    fastify.get('/wallet-by-email/:email', {
      schema: {
        params: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' }
          }
        }
      },
      handler: authController.getWalletByEmail
    });

    fastify.get('/active-sessions/:wallet', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: authController.getActiveSessions
    });
  });

  // Admin routes (require JWT and admin role)
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

    fastify.post('/deactivate-user/:wallet', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: authController.deactivateUser
    });

    fastify.post('/reactivate-user/:wallet', {
      schema: {
        params: {
          type: 'object',
          required: ['wallet'],
          properties: {
            wallet: { type: 'string' }
          }
        }
      },
      handler: authController.reactivateUser
    });
  });
}
