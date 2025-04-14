import { FastifyRequest, FastifyReply } from 'fastify';

// Auth Types
export interface User {
  wallet: string;
  username: string;
  email: string;
  registeredAt: number;
  active: boolean;
}

export interface Session {
  wallet: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  active: boolean;
}

export interface JwtPayload {
  wallet: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Request Types
export interface RegisterRequest extends FastifyRequest {
  body: {
    username: string;
    email: string;
    deadline: number;
    signature: string;
  };
}

export interface LoginRequest extends FastifyRequest {
  body: {
    deadline: number;
    signature: string;
  };
}

export interface LogoutRequest extends FastifyRequest {
  body: {
    sessionId: string;
  };
}

export interface ValidateSessionRequest extends FastifyRequest {
  body: {
    wallet: string;
    sessionId: string;
  };
}

export interface GetUserRequest extends FastifyRequest {
  params: {
    wallet: string;
  };
}

export interface GetSessionRequest extends FastifyRequest {
  params: {
    sessionId: string;
  };
}

export interface DeactivateUserRequest extends FastifyRequest {
  params: {
    wallet: string;
  };
}

export interface ReactivateUserRequest extends FastifyRequest {
  params: {
    wallet: string;
  };
}

export interface GetWalletByUsernameRequest extends FastifyRequest {
  params: {
    username: string;
  };
}

export interface GetWalletByEmailRequest extends FastifyRequest {
  params: {
    email: string;
  };
}

export interface GetActiveSessionsRequest extends FastifyRequest {
  params: {
    wallet: string;
  };
}

export interface IsUsernameAvailableRequest extends FastifyRequest {
  params: {
    username: string;
  };
}

export interface IsEmailAvailableRequest extends FastifyRequest {
  params: {
    email: string;
  };
}

export interface AdminLoginRequest extends FastifyRequest {
  body: {
    username: string;
    password: string;
  };
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth Service Types
export interface AuthService {
  registerWithSignature(
    username: string,
    email: string,
    deadline: number,
    signature: string
  ): Promise<boolean>;

  loginWithSignature(
    deadline: number,
    signature: string
  ): Promise<{ sessionId: string; expiresAt: number }>;

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
}
