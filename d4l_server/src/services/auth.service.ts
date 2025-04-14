import { ethers } from 'ethers';
import blockchainService from './blockchain.service';
import { AuthService, User, Session } from '../types';

class AuthServiceImpl implements AuthService {
  async registerWithSignature(
    username: string,
    email: string,
    deadline: number,
    signature: string
  ): Promise<boolean> {
    return await blockchainService.registerWithSignature(
      username,
      email,
      deadline,
      signature
    );
  }
  
  async loginWithSignature(
    deadline: number,
    signature: string
  ): Promise<{ sessionId: string; expiresAt: number }> {
    return await blockchainService.loginWithSignature(deadline, signature);
  }
  
  async logout(sessionId: string): Promise<boolean> {
    return await blockchainService.logout(sessionId);
  }
  
  async validateSession(wallet: string, sessionId: string): Promise<boolean> {
    return await blockchainService.validateSession(wallet, sessionId);
  }
  
  async getUser(wallet: string): Promise<User> {
    return await blockchainService.getUser(wallet);
  }
  
  async getSession(sessionId: string): Promise<Session> {
    return await blockchainService.getSession(sessionId);
  }
  
  async deactivateUser(wallet: string): Promise<boolean> {
    return await blockchainService.deactivateUser(wallet);
  }
  
  async reactivateUser(wallet: string): Promise<boolean> {
    return await blockchainService.reactivateUser(wallet);
  }
  
  async getWalletByUsername(username: string): Promise<string> {
    return await blockchainService.getWalletByUsername(username);
  }
  
  async getWalletByEmail(email: string): Promise<string> {
    return await blockchainService.getWalletByEmail(email);
  }
  
  async getActiveSessions(wallet: string): Promise<string[]> {
    return await blockchainService.getActiveSessions(wallet);
  }
  
  async isUsernameAvailable(username: string): Promise<boolean> {
    return await blockchainService.isUsernameAvailable(username);
  }
  
  async isEmailAvailable(email: string): Promise<boolean> {
    return await blockchainService.isEmailAvailable(email);
  }
  
  // Helper method to generate EIP-712 domain for client-side signing
  getDomain(contractName: string, version: string, chainId: number, verifyingContract: string) {
    return {
      name: contractName,
      version: version,
      chainId: chainId,
      verifyingContract: verifyingContract
    };
  }
  
  // Helper method to generate a deadline timestamp
  getDeadline(minutes = 30): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
  }
}

export default new AuthServiceImpl();
