import { AuthService, User, Session } from '../types';
declare class AuthServiceImpl implements AuthService {
    registerWithSignature(username: string, email: string, deadline: number, signature: string): Promise<boolean>;
    loginWithSignature(deadline: number, signature: string): Promise<{
        sessionId: string;
        expiresAt: number;
    }>;
    logout(sessionId: string): Promise<boolean>;
    validateSession(wallet: string, sessionId: string): Promise<boolean>;
    getUser(wallet: string): Promise<User>;
    getSession(sessionId: string): Promise<Session>;
    deactivateUser(wallet: string): Promise<boolean>;
    reactivateUser(wallet: string): Promise<boolean>;
    getWalletByUsername(username: string): Promise<string>;
    getWalletByEmail(email: string): Promise<string>;
    getActiveSessions(wallet: string): Promise<string[]>;
    isUsernameAvailable(username: string): Promise<boolean>;
    isEmailAvailable(email: string): Promise<boolean>;
    getDomain(contractName: string, version: string, chainId: number, verifyingContract: string): {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
    };
    getDeadline(minutes?: number): number;
}
declare const _default: AuthServiceImpl;
export default _default;
