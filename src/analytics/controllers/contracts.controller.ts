/**
 * Controller for contract analytics
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import contractsService from '../services/contracts.service';
import blockchainListener from '../listeners/blockchain.listener';

class ContractsController {
  /**
   * Get contract analytics by address
   */
  async getContractAnalytics(
    request: FastifyRequest<{
      Params: {
        address: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { address } = request.params;
      
      const contract = await contractsService.getContractAnalytics(address);
      
      if (!contract) {
        return reply.code(404).send({
          success: false,
          error: 'Contract not found'
        });
      }
      
      return {
        success: true,
        data: contract
      };
    } catch (error) {
      console.error('Error getting contract analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting contract analytics'
      });
    }
  }
  
  /**
   * Get all contract analytics
   */
  async getAllContractAnalytics(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const contracts = await contractsService.getAllContractAnalytics();
      
      return {
        success: true,
        data: contracts
      };
    } catch (error) {
      console.error('Error getting all contract analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting all contract analytics'
      });
    }
  }
  
  /**
   * Get top contracts by interactions
   */
  async getTopContractsByInteractions(
    request: FastifyRequest<{
      Querystring: {
        limit?: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { limit } = request.query;
      
      const contracts = await contractsService.getTopContractsByInteractions(
        limit ? parseInt(limit) : 10
      );
      
      return {
        success: true,
        data: contracts
      };
    } catch (error) {
      console.error('Error getting top contracts:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting top contracts'
      });
    }
  }
  
  /**
   * Add a contract to listen to
   */
  async addContractToListen(
    request: FastifyRequest<{
      Body: {
        address: string;
        abi: any;
        name?: string;
        type?: string;
        chainId?: number;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { address, abi, name, type, chainId } = request.body;
      
      const success = await blockchainListener.addContractToListen(
        address,
        abi,
        name,
        type,
        chainId
      );
      
      if (!success) {
        return reply.code(400).send({
          success: false,
          error: 'Failed to add contract to listen'
        });
      }
      
      return {
        success: true,
        data: {
          address,
          chainId: chainId || 1,
          name
        }
      };
    } catch (error) {
      console.error('Error adding contract to listen:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error adding contract to listen'
      });
    }
  }
  
  /**
   * Stop listening to a contract
   */
  async stopListeningToContract(
    request: FastifyRequest<{
      Params: {
        address: string;
      },
      Querystring: {
        chainId?: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { address } = request.params;
      const { chainId } = request.query;
      
      const success = blockchainListener.stopListeningToContract(
        address,
        chainId ? parseInt(chainId) : 1
      );
      
      if (!success) {
        return reply.code(400).send({
          success: false,
          error: 'Failed to stop listening to contract'
        });
      }
      
      return {
        success: true,
        data: {
          address,
          chainId: chainId ? parseInt(chainId) : 1
        }
      };
    } catch (error) {
      console.error('Error stopping listening to contract:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error stopping listening to contract'
      });
    }
  }
  
  /**
   * Get all contracts we're listening to
   */
  async getListeningContracts(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const contracts = blockchainListener.getListeningContracts();
      
      return {
        success: true,
        data: contracts
      };
    } catch (error) {
      console.error('Error getting listening contracts:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting listening contracts'
      });
    }
  }
}

export default new ContractsController();
