/**
 * Controller for user analytics
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import usersService from '../services/users.service';
import sessionsService from '../services/sessions.service';

class UsersController {
  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(
    request: FastifyRequest<{
      Params: {
        walletAddress: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { walletAddress } = request.params;
      
      const user = await usersService.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting user'
      });
    }
  }
  
  /**
   * Get all users
   */
  async getAllUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const users = await usersService.getAllUsers();
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting all users'
      });
    }
  }
  
  /**
   * Get active users
   */
  async getActiveUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const users = await usersService.getActiveUsers();
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Error getting active users:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting active users'
      });
    }
  }
  
  /**
   * Get new users
   */
  async getNewUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const users = await usersService.getNewUsers();
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Error getting new users:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting new users'
      });
    }
  }
  
  /**
   * Get sessions by wallet address
   */
  async getSessionsByWalletAddress(
    request: FastifyRequest<{
      Params: {
        walletAddress: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { walletAddress } = request.params;
      
      const sessions = await sessionsService.getSessionsByWalletAddress(walletAddress);
      
      return {
        success: true,
        data: sessions
      };
    } catch (error) {
      console.error('Error getting sessions:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting sessions'
      });
    }
  }
  
  /**
   * Get session by ID
   */
  async getSessionById(
    request: FastifyRequest<{
      Params: {
        sessionId: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId } = request.params;
      
      const session = await sessionsService.getSessionById(sessionId);
      
      if (!session) {
        return reply.code(404).send({
          success: false,
          error: 'Session not found'
        });
      }
      
      return {
        success: true,
        data: session
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting session'
      });
    }
  }
  
  /**
   * Get active sessions
   */
  async getActiveSessions(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const sessions = await sessionsService.getActiveSessions();
      
      return {
        success: true,
        data: sessions
      };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return reply.code(500).send({
        success: false,
        error: 'Error getting active sessions'
      });
    }
  }
}

export default new UsersController();
