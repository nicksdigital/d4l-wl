"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../auth.service"));
const blockchain_service_1 = __importDefault(require("../blockchain.service"));
// Mock the blockchain service
jest.mock('../blockchain.service', () => ({
    registerWithSignature: jest.fn(),
    loginWithSignature: jest.fn(),
    logout: jest.fn(),
    validateSession: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    deactivateUser: jest.fn(),
    reactivateUser: jest.fn(),
    getWalletByUsername: jest.fn(),
    getWalletByEmail: jest.fn(),
    getActiveSessions: jest.fn(),
    isUsernameAvailable: jest.fn(),
    isEmailAvailable: jest.fn()
}));
describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('registerWithSignature', () => {
        it('should call blockchain service registerWithSignature', async () => {
            const username = 'testuser';
            const email = 'test@example.com';
            const deadline = 1234567890;
            const signature = '0x1234567890';
            blockchain_service_1.default.registerWithSignature.mockResolvedValue(true);
            const result = await auth_service_1.default.registerWithSignature(username, email, deadline, signature);
            expect(blockchain_service_1.default.registerWithSignature).toHaveBeenCalledWith(username, email, deadline, signature);
            expect(result).toBe(true);
        });
    });
    describe('loginWithSignature', () => {
        it('should call blockchain service loginWithSignature', async () => {
            const deadline = 1234567890;
            const signature = '0x1234567890';
            const expectedResult = {
                sessionId: '0x1234567890',
                expiresAt: 1234567890
            };
            blockchain_service_1.default.loginWithSignature.mockResolvedValue(expectedResult);
            const result = await auth_service_1.default.loginWithSignature(deadline, signature);
            expect(blockchain_service_1.default.loginWithSignature).toHaveBeenCalledWith(deadline, signature);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('logout', () => {
        it('should call blockchain service logout', async () => {
            const sessionId = '0x1234567890';
            blockchain_service_1.default.logout.mockResolvedValue(true);
            const result = await auth_service_1.default.logout(sessionId);
            expect(blockchain_service_1.default.logout).toHaveBeenCalledWith(sessionId);
            expect(result).toBe(true);
        });
    });
    describe('validateSession', () => {
        it('should call blockchain service validateSession', async () => {
            const wallet = '0x1234567890';
            const sessionId = '0x1234567890';
            blockchain_service_1.default.validateSession.mockResolvedValue(true);
            const result = await auth_service_1.default.validateSession(wallet, sessionId);
            expect(blockchain_service_1.default.validateSession).toHaveBeenCalledWith(wallet, sessionId);
            expect(result).toBe(true);
        });
    });
    describe('getUser', () => {
        it('should call blockchain service getUser', async () => {
            const wallet = '0x1234567890';
            const expectedUser = {
                wallet,
                username: 'testuser',
                email: 'test@example.com',
                registeredAt: 1234567890,
                active: true
            };
            blockchain_service_1.default.getUser.mockResolvedValue(expectedUser);
            const result = await auth_service_1.default.getUser(wallet);
            expect(blockchain_service_1.default.getUser).toHaveBeenCalledWith(wallet);
            expect(result).toEqual(expectedUser);
        });
    });
    describe('getSession', () => {
        it('should call blockchain service getSession', async () => {
            const sessionId = '0x1234567890';
            const expectedSession = {
                wallet: '0x1234567890',
                sessionId,
                createdAt: 1234567890,
                expiresAt: 1234567890,
                active: true
            };
            blockchain_service_1.default.getSession.mockResolvedValue(expectedSession);
            const result = await auth_service_1.default.getSession(sessionId);
            expect(blockchain_service_1.default.getSession).toHaveBeenCalledWith(sessionId);
            expect(result).toEqual(expectedSession);
        });
    });
    describe('deactivateUser', () => {
        it('should call blockchain service deactivateUser', async () => {
            const wallet = '0x1234567890';
            blockchain_service_1.default.deactivateUser.mockResolvedValue(true);
            const result = await auth_service_1.default.deactivateUser(wallet);
            expect(blockchain_service_1.default.deactivateUser).toHaveBeenCalledWith(wallet);
            expect(result).toBe(true);
        });
    });
    describe('reactivateUser', () => {
        it('should call blockchain service reactivateUser', async () => {
            const wallet = '0x1234567890';
            blockchain_service_1.default.reactivateUser.mockResolvedValue(true);
            const result = await auth_service_1.default.reactivateUser(wallet);
            expect(blockchain_service_1.default.reactivateUser).toHaveBeenCalledWith(wallet);
            expect(result).toBe(true);
        });
    });
    describe('getWalletByUsername', () => {
        it('should call blockchain service getWalletByUsername', async () => {
            const username = 'testuser';
            const expectedWallet = '0x1234567890';
            blockchain_service_1.default.getWalletByUsername.mockResolvedValue(expectedWallet);
            const result = await auth_service_1.default.getWalletByUsername(username);
            expect(blockchain_service_1.default.getWalletByUsername).toHaveBeenCalledWith(username);
            expect(result).toBe(expectedWallet);
        });
    });
    describe('getWalletByEmail', () => {
        it('should call blockchain service getWalletByEmail', async () => {
            const email = 'test@example.com';
            const expectedWallet = '0x1234567890';
            blockchain_service_1.default.getWalletByEmail.mockResolvedValue(expectedWallet);
            const result = await auth_service_1.default.getWalletByEmail(email);
            expect(blockchain_service_1.default.getWalletByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(expectedWallet);
        });
    });
    describe('getActiveSessions', () => {
        it('should call blockchain service getActiveSessions', async () => {
            const wallet = '0x1234567890';
            const expectedSessions = ['0x1234567890', '0x0987654321'];
            blockchain_service_1.default.getActiveSessions.mockResolvedValue(expectedSessions);
            const result = await auth_service_1.default.getActiveSessions(wallet);
            expect(blockchain_service_1.default.getActiveSessions).toHaveBeenCalledWith(wallet);
            expect(result).toEqual(expectedSessions);
        });
    });
    describe('isUsernameAvailable', () => {
        it('should call blockchain service isUsernameAvailable', async () => {
            const username = 'testuser';
            blockchain_service_1.default.isUsernameAvailable.mockResolvedValue(true);
            const result = await auth_service_1.default.isUsernameAvailable(username);
            expect(blockchain_service_1.default.isUsernameAvailable).toHaveBeenCalledWith(username);
            expect(result).toBe(true);
        });
    });
    describe('isEmailAvailable', () => {
        it('should call blockchain service isEmailAvailable', async () => {
            const email = 'test@example.com';
            blockchain_service_1.default.isEmailAvailable.mockResolvedValue(true);
            const result = await auth_service_1.default.isEmailAvailable(email);
            expect(blockchain_service_1.default.isEmailAvailable).toHaveBeenCalledWith(email);
            expect(result).toBe(true);
        });
    });
    describe('getDomain', () => {
        it('should return the correct domain object', () => {
            const contractName = 'D4LAuth';
            const version = '1';
            const chainId = 1;
            const verifyingContract = '0x1234567890';
            const result = auth_service_1.default.getDomain(contractName, version, chainId, verifyingContract);
            expect(result).toEqual({
                name: contractName,
                version,
                chainId,
                verifyingContract
            });
        });
    });
    describe('getDeadline', () => {
        it('should return a deadline in the future', () => {
            const now = Math.floor(Date.now() / 1000);
            const minutes = 30;
            const result = auth_service_1.default.getDeadline(minutes);
            expect(result).toBeGreaterThan(now);
            expect(result).toBeLessThanOrEqual(now + minutes * 60 + 1); // Add 1 second for test execution time
        });
        it('should use default 30 minutes if not specified', () => {
            const now = Math.floor(Date.now() / 1000);
            const result = auth_service_1.default.getDeadline();
            expect(result).toBeGreaterThan(now);
            expect(result).toBeLessThanOrEqual(now + 30 * 60 + 1); // Add 1 second for test execution time
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map