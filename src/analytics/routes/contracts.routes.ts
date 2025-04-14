/**
 * Routes for contract analytics
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { contractsController } from '../controllers';

export default async function contractsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get all contract analytics
  fastify.get('/', {
    handler: contractsController.getAllContractAnalytics
  });
  
  // Get top contracts by interactions
  fastify.get('/top', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' }
        }
      }
    },
    handler: contractsController.getTopContractsByInteractions
  });
  
  // Get contract analytics by address
  fastify.get('/:address', {
    schema: {
      params: {
        type: 'object',
        required: ['address'],
        properties: {
          address: { type: 'string' }
        }
      }
    },
    handler: contractsController.getContractAnalytics
  });
  
  // Add a contract to listen to
  fastify.post('/listen', {
    schema: {
      body: {
        type: 'object',
        required: ['address', 'abi'],
        properties: {
          address: { type: 'string' },
          abi: { type: 'object' },
          name: { type: 'string' },
          type: { type: 'string' },
          chainId: { type: 'number' }
        }
      }
    },
    handler: contractsController.addContractToListen
  });
  
  // Stop listening to a contract
  fastify.delete('/listen/:address', {
    schema: {
      params: {
        type: 'object',
        required: ['address'],
        properties: {
          address: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          chainId: { type: 'string' }
        }
      }
    },
    handler: contractsController.stopListeningToContract
  });
  
  // Get all contracts we're listening to
  fastify.get('/listen/all', {
    handler: contractsController.getListeningContracts
  });
}
