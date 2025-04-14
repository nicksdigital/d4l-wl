"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const config_1 = __importDefault(require("../config"));
// ABI for the D4LAuth contract
const D4LAuthABI = [
    // User Registration
    'function registerWithSignature(string username, string email, uint256 deadline, bytes signature) external returns (bool)',
    'function loginWithSignature(uint256 deadline, bytes signature) external returns (bytes32, uint256)',
    'function logout(bytes32 sessionId) external returns (bool)',
    'function validateSession(address wallet, bytes32 sessionId) external view returns (bool)',
    // User Management
    'function getUser(address wallet) external view returns (tuple(address wallet, bytes32 username, bytes32 email, uint256 registeredAt, bool active))',
    'function getSession(bytes32 sessionId) external view returns (tuple(address wallet, bytes32 sessionId, uint256 createdAt, uint256 expiresAt, bool active))',
    'function deactivateUser(address wallet) external returns (bool)',
    'function reactivateUser(address wallet) external returns (bool)',
    // Utility Functions
    'function getWalletByUsername(string username) external view returns (address)',
    'function getWalletByEmail(string email) external view returns (address)',
    'function getActiveSessions(address wallet) external view returns (bytes32[])',
    'function isUsernameAvailable(string username) external view returns (bool)',
    'function isEmailAvailable(string email) external view returns (bool)',
    // Events
    'event UserRegistered(address indexed wallet, bytes32 indexed usernameHash, bytes32 indexed emailHash, uint256 timestamp)',
    'event UserLoggedIn(address indexed wallet, bytes32 indexed sessionId, uint256 timestamp, uint256 expiresAt)',
    'event UserLoggedOut(address indexed wallet, bytes32 indexed sessionId, uint256 timestamp)',
    'event UserDeactivated(address indexed wallet, uint256 timestamp)',
    'event UserReactivated(address indexed wallet, uint256 timestamp)'
];
class BlockchainService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.default.blockchain.rpcUrl);
        this.wallet = new ethers_1.ethers.Wallet(config_1.default.blockchain.privateKey, this.provider);
        this.authContract = new ethers_1.ethers.Contract(config_1.default.blockchain.authContractAddress, D4LAuthABI, this.wallet);
    }
    // User Registration
    async registerWithSignature(username, email, deadline, signature) {
        try {
            const tx = await this.authContract.registerWithSignature(username, email, deadline, signature);
            await tx.wait();
            return true;
        }
        catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }
    async loginWithSignature(deadline, signature) {
        try {
            const tx = await this.authContract.loginWithSignature(deadline, signature);
            const receipt = await tx.wait();
            // Parse the event to get the session ID and expiration
            const event = receipt.logs.find((log) => log.fragment && log.fragment.name === 'UserLoggedIn');
            if (!event) {
                throw new Error('Login event not found');
            }
            const sessionId = event.args[1];
            const expiresAt = event.args[3];
            return {
                sessionId,
                expiresAt: Number(expiresAt)
            };
        }
        catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }
    async logout(sessionId) {
        try {
            const tx = await this.authContract.logout(sessionId);
            await tx.wait();
            return true;
        }
        catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }
    async validateSession(wallet, sessionId) {
        try {
            return await this.authContract.validateSession(wallet, sessionId);
        }
        catch (error) {
            console.error('Error validating session:', error);
            throw error;
        }
    }
    // User Management
    async getUser(wallet) {
        try {
            const user = await this.authContract.getUser(wallet);
            return {
                wallet: user.wallet,
                username: ethers_1.ethers.toUtf8String(user.username),
                email: ethers_1.ethers.toUtf8String(user.email),
                registeredAt: Number(user.registeredAt),
                active: user.active
            };
        }
        catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }
    async getSession(sessionId) {
        try {
            const session = await this.authContract.getSession(sessionId);
            return {
                wallet: session.wallet,
                sessionId: session.sessionId,
                createdAt: Number(session.createdAt),
                expiresAt: Number(session.expiresAt),
                active: session.active
            };
        }
        catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }
    async deactivateUser(wallet) {
        try {
            const tx = await this.authContract.deactivateUser(wallet);
            await tx.wait();
            return true;
        }
        catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }
    async reactivateUser(wallet) {
        try {
            const tx = await this.authContract.reactivateUser(wallet);
            await tx.wait();
            return true;
        }
        catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    }
    // Utility Functions
    async getWalletByUsername(username) {
        try {
            return await this.authContract.getWalletByUsername(username);
        }
        catch (error) {
            console.error('Error getting wallet by username:', error);
            throw error;
        }
    }
    async getWalletByEmail(email) {
        try {
            return await this.authContract.getWalletByEmail(email);
        }
        catch (error) {
            console.error('Error getting wallet by email:', error);
            throw error;
        }
    }
    async getActiveSessions(wallet) {
        try {
            return await this.authContract.getActiveSessions(wallet);
        }
        catch (error) {
            console.error('Error getting active sessions:', error);
            throw error;
        }
    }
    async isUsernameAvailable(username) {
        try {
            return await this.authContract.isUsernameAvailable(username);
        }
        catch (error) {
            console.error('Error checking username availability:', error);
            throw error;
        }
    }
    async isEmailAvailable(email) {
        try {
            return await this.authContract.isEmailAvailable(email);
        }
        catch (error) {
            console.error('Error checking email availability:', error);
            throw error;
        }
    }
}
exports.default = new BlockchainService();
//# sourceMappingURL=blockchain.service.js.map