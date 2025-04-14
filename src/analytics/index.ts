/**
 * Main analytics module
 */
import { FastifyInstance } from 'fastify';
import analyticsRoutes from './routes';
import { initializeListeners } from './listeners';
import { initializeSchema, healthCheck } from './utils/db';

/**
 * Initialize the analytics module
 */
export async function initializeAnalytics(fastify: FastifyInstance): Promise<boolean> {
  try {
    console.log('Initializing analytics module...');
    
    // Initialize database schema
    await initializeSchema();
    
    // Check database health
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      console.warn('Analytics database is not healthy, but continuing with in-memory fallback');
    }
    
    // Register analytics routes
    fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
    
    // Initialize listeners
    await initializeListeners(fastify);
    
    console.log('Analytics module initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing analytics module:', error);
    return false;
  }
}

// Export all analytics components
export * from './models';
export * from './services';
export * from './controllers';
export * from './listeners';
export * from './utils/db';
