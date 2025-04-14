"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const config_1 = __importDefault(require("../config"));
class AuthController {
    // Admin Login
    async adminLogin(request, reply) {
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
                    expiresIn: config_1.default.jwt.expiration
                });
                return reply.code(200).send({
                    success: true,
                    data: {
                        token,
                        expiresAt: Math.floor(Date.now() / 1000) + config_1.default.jwt.expiration
                    }
                });
            }
            // Invalid credentials
            return reply.code(401).send({
                success: false,
                error: 'Invalid credentials'
            });
        }
        catch (error) {
            console.error('Admin login error:', error);
            return reply.code(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    // User Registration
    async register(request, reply) {
        try {
            const { username, email, deadline, signature } = request.body;
            const success = await auth_service_1.default.registerWithSignature(username, email, deadline, signature);
            const response = {
                success: true,
                data: { success }
            };
            return reply.code(201).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to register user'
            };
            return reply.code(400).send(response);
        }
    }
    async login(request, reply) {
        try {
            const { deadline, signature } = request.body;
            const { sessionId, expiresAt } = await auth_service_1.default.loginWithSignature(deadline, signature);
            // Generate JWT token
            const token = await reply.jwtSign({
                wallet: request.user.wallet,
                sessionId,
                exp: Math.floor(expiresAt)
            });
            const response = {
                success: true,
                data: {
                    token,
                    sessionId,
                    expiresAt
                }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to login'
            };
            return reply.code(400).send(response);
        }
    }
    async logout(request, reply) {
        try {
            const { sessionId } = request.body;
            const success = await auth_service_1.default.logout(sessionId);
            const response = {
                success: true,
                data: { success }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to logout'
            };
            return reply.code(400).send(response);
        }
    }
    async validateSession(request, reply) {
        try {
            const { wallet, sessionId } = request.body;
            const valid = await auth_service_1.default.validateSession(wallet, sessionId);
            const response = {
                success: true,
                data: { valid }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to validate session'
            };
            return reply.code(400).send(response);
        }
    }
    // User Management
    async getUser(request, reply) {
        try {
            const { wallet } = request.params;
            const user = await auth_service_1.default.getUser(wallet);
            const response = {
                success: true,
                data: user
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get user'
            };
            return reply.code(400).send(response);
        }
    }
    async getSession(request, reply) {
        try {
            const { sessionId } = request.params;
            const session = await auth_service_1.default.getSession(sessionId);
            const response = {
                success: true,
                data: session
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get session'
            };
            return reply.code(400).send(response);
        }
    }
    async deactivateUser(request, reply) {
        try {
            const { wallet } = request.params;
            const success = await auth_service_1.default.deactivateUser(wallet);
            const response = {
                success: true,
                data: { success }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to deactivate user'
            };
            return reply.code(400).send(response);
        }
    }
    async reactivateUser(request, reply) {
        try {
            const { wallet } = request.params;
            const success = await auth_service_1.default.reactivateUser(wallet);
            const response = {
                success: true,
                data: { success }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to reactivate user'
            };
            return reply.code(400).send(response);
        }
    }
    // Utility Functions
    async getWalletByUsername(request, reply) {
        try {
            const { username } = request.params;
            const wallet = await auth_service_1.default.getWalletByUsername(username);
            const response = {
                success: true,
                data: { wallet }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get wallet by username'
            };
            return reply.code(400).send(response);
        }
    }
    async getWalletByEmail(request, reply) {
        try {
            const { email } = request.params;
            const wallet = await auth_service_1.default.getWalletByEmail(email);
            const response = {
                success: true,
                data: { wallet }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get wallet by email'
            };
            return reply.code(400).send(response);
        }
    }
    async getActiveSessions(request, reply) {
        try {
            const { wallet } = request.params;
            const sessions = await auth_service_1.default.getActiveSessions(wallet);
            const response = {
                success: true,
                data: { sessions }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get active sessions'
            };
            return reply.code(400).send(response);
        }
    }
    async isUsernameAvailable(request, reply) {
        try {
            const { username } = request.params;
            const available = await auth_service_1.default.isUsernameAvailable(username);
            const response = {
                success: true,
                data: { available }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to check username availability'
            };
            return reply.code(400).send(response);
        }
    }
    async isEmailAvailable(request, reply) {
        try {
            const { email } = request.params;
            const available = await auth_service_1.default.isEmailAvailable(email);
            const response = {
                success: true,
                data: { available }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to check email availability'
            };
            return reply.code(400).send(response);
        }
    }
    // Helper method to generate signing information for client
    async getSigningInfo(request, reply) {
        try {
            const deadline = auth_service_1.default.getDeadline(30); // 30 minutes from now
            const domain = auth_service_1.default.getDomain('D4LAuth', '1', config_1.default.blockchain.chainId, config_1.default.blockchain.authContractAddress);
            const response = {
                success: true,
                data: {
                    domain,
                    deadline
                }
            };
            return reply.code(200).send(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: error.message || 'Failed to get signing info'
            };
            return reply.code(400).send(response);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map