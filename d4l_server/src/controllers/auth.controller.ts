import { FastifyReply } from 'fastify';
import {
  RegisterRequest,
  LoginRequest,
  LogoutRequest,
  ValidateSessionRequest,
  GetUserRequest,
  GetSessionRequest,
  DeactivateUserRequest,
  ReactivateUserRequest,
  GetWalletByUsernameRequest,
  GetWalletByEmailRequest,
  GetActiveSessionsRequest,
  IsUsernameAvailableRequest,
  IsEmailAvailableRequest,
  AdminLoginRequest,
  ApiResponse
} from '../types';
import authService from '../services/auth.service';
import config from '../config';

class AuthController {
  // Admin Login
  async adminLogin(request: AdminLoginRequest, reply: FastifyReply) {
    try {
      // In a real implementation, you would validate the admin credentials against a database
      // For this example, we'll use hardcoded credentials
      const { username, password } = request.body;

      // Check if credentials are valid
      if (username === 'admin' && password === 'admin123') {
        // Generate JWT token
        const token = reply.jwtSign({
          wallet: '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be', // Admin wallet address
          isAdmin: true,
          sessionId: 'admin-session'
        }, {
          expiresIn: config.jwt.expiration
        });

        return reply.code(200).send({
          success: true,
          data: {
            token,
            expiresAt: Math.floor(Date.now() / 1000) + config.jwt.expiration
          }
        });
      }

      // Invalid credentials
      return reply.code(401).send({
        success: false,
        error: 'Invalid credentials'
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // User Registration
  async register(request: RegisterRequest, reply: FastifyReply) {
    try {
      const { username, email, deadline, signature } = request.body;

      const success = await authService.registerWithSignature(
        username,
        email,
        deadline,
        signature
      );

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: { success }
      };

      return reply.code(201).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to register user'
      };

      return reply.code(400).send(response);
    }
  }

  async login(request: LoginRequest, reply: FastifyReply) {
    try {
      const { deadline, signature } = request.body;

      const { sessionId, expiresAt } = await authService.loginWithSignature(
        deadline,
        signature
      );

      // Generate JWT token
      const token = await reply.jwtSign({
        wallet: request.user.wallet,
        sessionId,
        exp: Math.floor(expiresAt)
      });

      const response: ApiResponse<{ token: string; sessionId: string; expiresAt: number }> = {
        success: true,
        data: {
          token,
          sessionId,
          expiresAt
        }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to login'
      };

      return reply.code(400).send(response);
    }
  }

  async logout(request: LogoutRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.body;

      const success = await authService.logout(sessionId);

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: { success }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to logout'
      };

      return reply.code(400).send(response);
    }
  }

  async validateSession(request: ValidateSessionRequest, reply: FastifyReply) {
    try {
      const { wallet, sessionId } = request.body;

      const valid = await authService.validateSession(wallet, sessionId);

      const response: ApiResponse<{ valid: boolean }> = {
        success: true,
        data: { valid }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to validate session'
      };

      return reply.code(400).send(response);
    }
  }

  // User Management
  async getUser(request: GetUserRequest, reply: FastifyReply) {
    try {
      const { wallet } = request.params;

      const user = await authService.getUser(wallet);

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get user'
      };

      return reply.code(400).send(response);
    }
  }

  async getSession(request: GetSessionRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.params;

      const session = await authService.getSession(sessionId);

      const response: ApiResponse<typeof session> = {
        success: true,
        data: session
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get session'
      };

      return reply.code(400).send(response);
    }
  }

  async deactivateUser(request: DeactivateUserRequest, reply: FastifyReply) {
    try {
      const { wallet } = request.params;

      const success = await authService.deactivateUser(wallet);

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: { success }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to deactivate user'
      };

      return reply.code(400).send(response);
    }
  }

  async reactivateUser(request: ReactivateUserRequest, reply: FastifyReply) {
    try {
      const { wallet } = request.params;

      const success = await authService.reactivateUser(wallet);

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: { success }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to reactivate user'
      };

      return reply.code(400).send(response);
    }
  }

  // Utility Functions
  async getWalletByUsername(request: GetWalletByUsernameRequest, reply: FastifyReply) {
    try {
      const { username } = request.params;

      const wallet = await authService.getWalletByUsername(username);

      const response: ApiResponse<{ wallet: string }> = {
        success: true,
        data: { wallet }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get wallet by username'
      };

      return reply.code(400).send(response);
    }
  }

  async getWalletByEmail(request: GetWalletByEmailRequest, reply: FastifyReply) {
    try {
      const { email } = request.params;

      const wallet = await authService.getWalletByEmail(email);

      const response: ApiResponse<{ wallet: string }> = {
        success: true,
        data: { wallet }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get wallet by email'
      };

      return reply.code(400).send(response);
    }
  }

  async getActiveSessions(request: GetActiveSessionsRequest, reply: FastifyReply) {
    try {
      const { wallet } = request.params;

      const sessions = await authService.getActiveSessions(wallet);

      const response: ApiResponse<{ sessions: string[] }> = {
        success: true,
        data: { sessions }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get active sessions'
      };

      return reply.code(400).send(response);
    }
  }

  async isUsernameAvailable(request: IsUsernameAvailableRequest, reply: FastifyReply) {
    try {
      const { username } = request.params;

      const available = await authService.isUsernameAvailable(username);

      const response: ApiResponse<{ available: boolean }> = {
        success: true,
        data: { available }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to check username availability'
      };

      return reply.code(400).send(response);
    }
  }

  async isEmailAvailable(request: IsEmailAvailableRequest, reply: FastifyReply) {
    try {
      const { email } = request.params;

      const available = await authService.isEmailAvailable(email);

      const response: ApiResponse<{ available: boolean }> = {
        success: true,
        data: { available }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to check email availability'
      };

      return reply.code(400).send(response);
    }
  }

  // Helper method to generate signing information for client
  async getSigningInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const deadline = authService.getDeadline(30); // 30 minutes from now

      const domain = authService.getDomain(
        'D4LAuth',
        '1',
        config.blockchain.chainId,
        config.blockchain.authContractAddress
      );

      const response: ApiResponse<{
        domain: ReturnType<typeof authService.getDomain>;
        deadline: number;
      }> = {
        success: true,
        data: {
          domain,
          deadline
        }
      };

      return reply.code(200).send(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get signing info'
      };

      return reply.code(400).send(response);
    }
  }
}

export default new AuthController();
