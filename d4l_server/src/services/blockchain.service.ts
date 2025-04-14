import { ethers } from 'ethers';
import config from '../config';

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
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private authContract: ethers.Contract;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    this.authContract = new ethers.Contract(
      config.blockchain.authContractAddress,
      D4LAuthABI,
      this.wallet
    );
  }
  
  // User Registration
  async registerWithSignature(
    username: string,
    email: string,
    deadline: number,
    signature: string
  ): Promise<boolean> {
    try {
      const tx = await this.authContract.registerWithSignature(
        username,
        email,
        deadline,
        signature
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  async loginWithSignature(
    deadline: number,
    signature: string
  ): Promise<{ sessionId: string; expiresAt: number }> {
    try {
      const tx = await this.authContract.loginWithSignature(deadline, signature);
      const receipt = await tx.wait();
      
      // Parse the event to get the session ID and expiration
      const event = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === 'UserLoggedIn'
      );
      
      if (!event) {
        throw new Error('Login event not found');
      }
      
      const sessionId = event.args[1];
      const expiresAt = event.args[3];
      
      return {
        sessionId,
        expiresAt: Number(expiresAt)
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  async logout(sessionId: string): Promise<boolean> {
    try {
      const tx = await this.authContract.logout(sessionId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
  
  async validateSession(wallet: string, sessionId: string): Promise<boolean> {
    try {
      return await this.authContract.validateSession(wallet, sessionId);
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  }
  
  // User Management
  async getUser(wallet: string): Promise<any> {
    try {
      const user = await this.authContract.getUser(wallet);
      return {
        wallet: user.wallet,
        username: ethers.toUtf8String(user.username),
        email: ethers.toUtf8String(user.email),
        registeredAt: Number(user.registeredAt),
        active: user.active
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
  
  async getSession(sessionId: string): Promise<any> {
    try {
      const session = await this.authContract.getSession(sessionId);
      return {
        wallet: session.wallet,
        sessionId: session.sessionId,
        createdAt: Number(session.createdAt),
        expiresAt: Number(session.expiresAt),
        active: session.active
      };
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }
  
  async deactivateUser(wallet: string): Promise<boolean> {
    try {
      const tx = await this.authContract.deactivateUser(wallet);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }
  
  async reactivateUser(wallet: string): Promise<boolean> {
    try {
      const tx = await this.authContract.reactivateUser(wallet);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }
  
  // Utility Functions
  async getWalletByUsername(username: string): Promise<string> {
    try {
      return await this.authContract.getWalletByUsername(username);
    } catch (error) {
      console.error('Error getting wallet by username:', error);
      throw error;
    }
  }
  
  async getWalletByEmail(email: string): Promise<string> {
    try {
      return await this.authContract.getWalletByEmail(email);
    } catch (error) {
      console.error('Error getting wallet by email:', error);
      throw error;
    }
  }
  
  async getActiveSessions(wallet: string): Promise<string[]> {
    try {
      return await this.authContract.getActiveSessions(wallet);
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }
  
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      return await this.authContract.isUsernameAvailable(username);
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
  }
  
  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      return await this.authContract.isEmailAvailable(email);
    } catch (error) {
      console.error('Error checking email availability:', error);
      throw error;
    }
  }
}

export default new BlockchainService();
