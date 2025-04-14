/**
 * Export all analytics listeners
 */
import { FastifyInstance } from 'fastify';
import blockchainListener from './blockchain.listener';
import frontendListener from './frontend.listener';

// Initialize all listeners
async function initializeListeners(fastify: FastifyInstance) {
  // Register frontend listener
  frontendListener.registerFrontendListener(fastify);
  
  // Start blockchain listener
  await blockchainListener.startListening();
}

export {
  blockchainListener,
  frontendListener,
  initializeListeners
};
