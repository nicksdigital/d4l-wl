"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blockchain_service_1 = __importDefault(require("./blockchain.service"));
class AuthServiceImpl {
    async registerWithSignature(username, email, deadline, signature) {
        return await blockchain_service_1.default.registerWithSignature(username, email, deadline, signature);
    }
    async loginWithSignature(deadline, signature) {
        return await blockchain_service_1.default.loginWithSignature(deadline, signature);
    }
    async logout(sessionId) {
        return await blockchain_service_1.default.logout(sessionId);
    }
    async validateSession(wallet, sessionId) {
        return await blockchain_service_1.default.validateSession(wallet, sessionId);
    }
    async getUser(wallet) {
        return await blockchain_service_1.default.getUser(wallet);
    }
    async getSession(sessionId) {
        return await blockchain_service_1.default.getSession(sessionId);
    }
    async deactivateUser(wallet) {
        return await blockchain_service_1.default.deactivateUser(wallet);
    }
    async reactivateUser(wallet) {
        return await blockchain_service_1.default.reactivateUser(wallet);
    }
    async getWalletByUsername(username) {
        return await blockchain_service_1.default.getWalletByUsername(username);
    }
    async getWalletByEmail(email) {
        return await blockchain_service_1.default.getWalletByEmail(email);
    }
    async getActiveSessions(wallet) {
        return await blockchain_service_1.default.getActiveSessions(wallet);
    }
    async isUsernameAvailable(username) {
        return await blockchain_service_1.default.isUsernameAvailable(username);
    }
    async isEmailAvailable(email) {
        return await blockchain_service_1.default.isEmailAvailable(email);
    }
    // Helper method to generate EIP-712 domain for client-side signing
    getDomain(contractName, version, chainId, verifyingContract) {
        return {
            name: contractName,
            version: version,
            chainId: chainId,
            verifyingContract: verifyingContract
        };
    }
    // Helper method to generate a deadline timestamp
    getDeadline(minutes = 30) {
        return Math.floor(Date.now() / 1000) + minutes * 60;
    }
}
exports.default = new AuthServiceImpl();
//# sourceMappingURL=auth.service.js.map