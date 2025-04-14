/**
 * Register all analytics routes
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import eventsRoutes from './events.routes';
import contractsRoutes from './contracts.routes';
import usersRoutes from './users.routes';
import snapshotsRoutes from './snapshots.routes';
import adminAnalyticsRoutes from './admin.routes';

export default async function analyticsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Register all routes
  fastify.register(eventsRoutes, { prefix: '/events' });
  fastify.register(contractsRoutes, { prefix: '/contracts' });
  fastify.register(usersRoutes, { prefix: '/users' });
  fastify.register(snapshotsRoutes, { prefix: '/snapshots' });

  // Register admin routes
  fastify.register(adminAnalyticsRoutes, { prefix: '/admin' });
}
