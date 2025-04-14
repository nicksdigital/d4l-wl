declare class BlockchainService {
    private provider;
    private wallet;
    private authContract;
    constructor();
    registerWithSignature(username: string, email: string, deadline: number, signature: string): Promise<boolean>;
    loginWithSignature(deadline: number, signature: string): Promise<{
        sessionId: string;
        expiresAt: number;
    }>;
    logout(sessionId: string): Promise<boolean>;
    validateSession(wallet: string, sessionId: string): Promise<boolean>;
    getUser(wallet: string): Promise<any>;
    getSession(sessionId: string): Promise<any>;
    deactivateUser(wallet: string): Promise<boolean>;
    reactivateUser(wallet: string): Promise<boolean>;
    getWalletByUsername(username: string): Promise<string>;
    getWalletByEmail(email: string): Promise<string>;
    getActiveSessions(wallet: string): Promise<string[]>;
    isUsernameAvailable(username: string): Promise<boolean>;
    isEmailAvailable(email: string): Promise<boolean>;
}
declare const _default: BlockchainService;
export default _default;
