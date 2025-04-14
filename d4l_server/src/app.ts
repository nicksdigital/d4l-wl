import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import staticFiles from './plugins/static';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { initializeAnalytics } from './analytics';
import config from './config';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      wallet: string;
      sessionId: string;
      isAdmin: boolean;
    };
  }
}

// Create Fastify instance
const server: FastifyInstance = Fastify({
  logger: true
});

// Register plugins
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  // JWT
  await server.register(jwt, {
    secret: config.jwt.secret
  });

  // Static files for admin frontend
  await server.register(staticFiles);

  // Swagger
  await server.register(swagger, {
    swagger: {
      info: {
        title: 'D4L API',
        description: 'API for D4L SoulStream Protocol',
        version: '1.0.0'
      },
      host: `${config.server.host}:${config.server.port}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });

  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // Auth routes
  server.register(authRoutes, { prefix: '/api/auth' });

  // Admin API routes
  server.register(adminRoutes, { prefix: '/api/admin' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    // Initialize analytics module
    await initializeAnalytics(server);

    await server.listen({
      port: config.server.port,
      host: config.server.host
    });

    console.log(`Server listening on ${config.server.host}:${config.server.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  start();
}

export default server;
