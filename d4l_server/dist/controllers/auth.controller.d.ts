import { FastifyReply } from 'fastify';
import { RegisterRequest, LoginRequest, LogoutRequest, ValidateSessionRequest, GetUserRequest, GetSessionRequest, DeactivateUserRequest, ReactivateUserRequest, GetWalletByUsernameRequest, GetWalletByEmailRequest, GetActiveSessionsRequest, IsUsernameAvailableRequest, IsEmailAvailableRequest, AdminLoginRequest } from '../types';
declare class AuthController {
    adminLogin(request: AdminLoginRequest, reply: FastifyReply): Promise<never>;
    register(request: RegisterRequest, reply: FastifyReply): Promise<never>;
    login(request: LoginRequest, reply: FastifyReply): Promise<never>;
    logout(request: LogoutRequest, reply: FastifyReply): Promise<never>;
    validateSession(request: ValidateSessionRequest, reply: FastifyReply): Promise<never>;
    getUser(request: GetUserRequest, reply: FastifyReply): Promise<never>;
    getSession(request: GetSessionRequest, reply: FastifyReply): Promise<never>;
    deactivateUser(request: DeactivateUserRequest, reply: FastifyReply): Promise<never>;
    reactivateUser(request: ReactivateUserRequest, reply: FastifyReply): Promise<never>;
    getWalletByUsername(request: GetWalletByUsernameRequest, reply: FastifyReply): Promise<never>;
    getWalletByEmail(request: GetWalletByEmailRequest, reply: FastifyReply): Promise<never>;
    getActiveSessions(request: GetActiveSessionsRequest, reply: FastifyReply): Promise<never>;
    isUsernameAvailable(request: IsUsernameAvailableRequest, reply: FastifyReply): Promise<never>;
    isEmailAvailable(request: IsEmailAvailableRequest, reply: FastifyReply): Promise<never>;
    getSigningInfo(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
declare const _default: AuthController;
export default _default;
