import authService from '../auth.service';
import blockchainService from '../blockchain.service';

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
      
      (blockchainService.registerWithSignature as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.registerWithSignature(
        username,
        email,
        deadline,
        signature
      );
      
      expect(blockchainService.registerWithSignature).toHaveBeenCalledWith(
        username,
        email,
        deadline,
        signature
      );
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
      
      (blockchainService.loginWithSignature as jest.Mock).mockResolvedValue(expectedResult);
      
      const result = await authService.loginWithSignature(deadline, signature);
      
      expect(blockchainService.loginWithSignature).toHaveBeenCalledWith(deadline, signature);
      expect(result).toEqual(expectedResult);
    });
  });
  
  describe('logout', () => {
    it('should call blockchain service logout', async () => {
      const sessionId = '0x1234567890';
      
      (blockchainService.logout as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.logout(sessionId);
      
      expect(blockchainService.logout).toHaveBeenCalledWith(sessionId);
      expect(result).toBe(true);
    });
  });
  
  describe('validateSession', () => {
    it('should call blockchain service validateSession', async () => {
      const wallet = '0x1234567890';
      const sessionId = '0x1234567890';
      
      (blockchainService.validateSession as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.validateSession(wallet, sessionId);
      
      expect(blockchainService.validateSession).toHaveBeenCalledWith(wallet, sessionId);
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
      
      (blockchainService.getUser as jest.Mock).mockResolvedValue(expectedUser);
      
      const result = await authService.getUser(wallet);
      
      expect(blockchainService.getUser).toHaveBeenCalledWith(wallet);
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
      
      (blockchainService.getSession as jest.Mock).mockResolvedValue(expectedSession);
      
      const result = await authService.getSession(sessionId);
      
      expect(blockchainService.getSession).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(expectedSession);
    });
  });
  
  describe('deactivateUser', () => {
    it('should call blockchain service deactivateUser', async () => {
      const wallet = '0x1234567890';
      
      (blockchainService.deactivateUser as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.deactivateUser(wallet);
      
      expect(blockchainService.deactivateUser).toHaveBeenCalledWith(wallet);
      expect(result).toBe(true);
    });
  });
  
  describe('reactivateUser', () => {
    it('should call blockchain service reactivateUser', async () => {
      const wallet = '0x1234567890';
      
      (blockchainService.reactivateUser as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.reactivateUser(wallet);
      
      expect(blockchainService.reactivateUser).toHaveBeenCalledWith(wallet);
      expect(result).toBe(true);
    });
  });
  
  describe('getWalletByUsername', () => {
    it('should call blockchain service getWalletByUsername', async () => {
      const username = 'testuser';
      const expectedWallet = '0x1234567890';
      
      (blockchainService.getWalletByUsername as jest.Mock).mockResolvedValue(expectedWallet);
      
      const result = await authService.getWalletByUsername(username);
      
      expect(blockchainService.getWalletByUsername).toHaveBeenCalledWith(username);
      expect(result).toBe(expectedWallet);
    });
  });
  
  describe('getWalletByEmail', () => {
    it('should call blockchain service getWalletByEmail', async () => {
      const email = 'test@example.com';
      const expectedWallet = '0x1234567890';
      
      (blockchainService.getWalletByEmail as jest.Mock).mockResolvedValue(expectedWallet);
      
      const result = await authService.getWalletByEmail(email);
      
      expect(blockchainService.getWalletByEmail).toHaveBeenCalledWith(email);
      expect(result).toBe(expectedWallet);
    });
  });
  
  describe('getActiveSessions', () => {
    it('should call blockchain service getActiveSessions', async () => {
      const wallet = '0x1234567890';
      const expectedSessions = ['0x1234567890', '0x0987654321'];
      
      (blockchainService.getActiveSessions as jest.Mock).mockResolvedValue(expectedSessions);
      
      const result = await authService.getActiveSessions(wallet);
      
      expect(blockchainService.getActiveSessions).toHaveBeenCalledWith(wallet);
      expect(result).toEqual(expectedSessions);
    });
  });
  
  describe('isUsernameAvailable', () => {
    it('should call blockchain service isUsernameAvailable', async () => {
      const username = 'testuser';
      
      (blockchainService.isUsernameAvailable as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.isUsernameAvailable(username);
      
      expect(blockchainService.isUsernameAvailable).toHaveBeenCalledWith(username);
      expect(result).toBe(true);
    });
  });
  
  describe('isEmailAvailable', () => {
    it('should call blockchain service isEmailAvailable', async () => {
      const email = 'test@example.com';
      
      (blockchainService.isEmailAvailable as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.isEmailAvailable(email);
      
      expect(blockchainService.isEmailAvailable).toHaveBeenCalledWith(email);
      expect(result).toBe(true);
    });
  });
  
  describe('getDomain', () => {
    it('should return the correct domain object', () => {
      const contractName = 'D4LAuth';
      const version = '1';
      const chainId = 1;
      const verifyingContract = '0x1234567890';
      
      const result = authService.getDomain(
        contractName,
        version,
        chainId,
        verifyingContract
      );
      
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
      
      const result = authService.getDeadline(minutes);
      
      expect(result).toBeGreaterThan(now);
      expect(result).toBeLessThanOrEqual(now + minutes * 60 + 1); // Add 1 second for test execution time
    });
    
    it('should use default 30 minutes if not specified', () => {
      const now = Math.floor(Date.now() / 1000);
      
      const result = authService.getDeadline();
      
      expect(result).toBeGreaterThan(now);
      expect(result).toBeLessThanOrEqual(now + 30 * 60 + 1); // Add 1 second for test execution time
    });
  });
});
