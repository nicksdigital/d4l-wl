import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../types';
interface DashboardStats {
    totalRegistered: number;
    totalMinted: number;
    totalClaimed: number;
    totalRewards: number;
    totalUsers: number;
    conversionRate: string;
}
interface User {
    wallet: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    lastLogin: string;
}
interface UserDetails extends User {
    sessions: Session[];
    claims: Claim[];
}
interface Session {
    id: string;
    createdAt: string;
    expiresAt: string;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}
interface AirdropStats {
    totalAllocated: number;
    totalClaimed: number;
    claimRate: string;
    uniqueClaimers: number;
}
interface Claim {
    id: string;
    wallet: string;
    amount: number;
    timestamp: string;
    txHash: string;
    status: 'pending' | 'completed' | 'failed';
}
interface Content {
    id: string;
    title: string;
    slug: string;
    content: string;
    lastModified: string;
    status: 'published' | 'draft';
}
interface Settings {
    siteTitle: string;
    siteDescription: string;
    airdropEnabled: boolean;
    maintenanceMode: boolean;
}
declare const adminController: {
    getDashboardStats: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<DashboardStats>>;
    getUsers: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<User[]>>;
    getUserDetails: (request: FastifyRequest<{
        Params: {
            wallet: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<UserDetails>>;
    deactivateUser: (request: FastifyRequest<{
        Params: {
            wallet: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    reactivateUser: (request: FastifyRequest<{
        Params: {
            wallet: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    getAirdropStats: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<AirdropStats>>;
    getAirdropClaims: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<Claim[]>>;
    addAirdropAllocation: (request: FastifyRequest<{
        Body: {
            wallet: string;
            amount: number;
            reason?: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    getContent: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<Content[]>>;
    getContentById: (request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<Content>>;
    createContent: (request: FastifyRequest<{
        Body: Omit<Content, "id" | "lastModified">;
    }>, reply: FastifyReply) => Promise<ApiResponse<Content>>;
    updateContent: (request: FastifyRequest<{
        Params: {
            id: string;
        };
        Body: Omit<Content, "id" | "lastModified">;
    }>, reply: FastifyReply) => Promise<ApiResponse<Content>>;
    deleteContent: (request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    getCacheKeys: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<string[]>>;
    deleteCacheKey: (request: FastifyRequest<{
        Params: {
            key: string;
        };
    }>, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    flushCache: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<{
        message: string;
    }>>;
    getSettings: (request: FastifyRequest, reply: FastifyReply) => Promise<ApiResponse<Settings>>;
    updateSettings: (request: FastifyRequest<{
        Body: Partial<Settings>;
    }>, reply: FastifyReply) => Promise<ApiResponse<Settings>>;
};
export default adminController;
