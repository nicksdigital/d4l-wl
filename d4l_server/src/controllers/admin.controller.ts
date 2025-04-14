import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../types';

// Dashboard stats
interface DashboardStats {
  totalRegistered: number;
  totalMinted: number;
  totalClaimed: number;
  totalRewards: number;
  totalUsers: number;
  conversionRate: string;
}

// User types
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

// Airdrop types
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

// Content types
interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastModified: string;
  status: 'published' | 'draft';
}

// Settings types
interface Settings {
  siteTitle: string;
  siteDescription: string;
  airdropEnabled: boolean;
  maintenanceMode: boolean;
}

// Mock data for development
const mockDashboardStats: DashboardStats = {
  totalRegistered: 1253,
  totalMinted: 1253,
  totalClaimed: 987,
  totalRewards: 12650,
  totalUsers: 2450,
  conversionRate: '78.8%'
};

const mockUsers: User[] = [
  {
    wallet: '0x1234567890123456789012345678901234567890',
    username: 'user1',
    email: 'user1@example.com',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: '2023-01-02T00:00:00Z'
  },
  {
    wallet: '0x0987654321098765432109876543210987654321',
    username: 'user2',
    email: 'user2@example.com',
    isActive: true,
    createdAt: '2023-01-03T00:00:00Z',
    lastLogin: '2023-01-04T00:00:00Z'
  }
];

const mockSessions: Session[] = [
  {
    id: 'session1',
    createdAt: '2023-01-01T00:00:00Z',
    expiresAt: '2023-01-02T00:00:00Z',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    isActive: true
  }
];

const mockClaims: Claim[] = [
  {
    id: 'claim1',
    wallet: '0x1234567890123456789012345678901234567890',
    amount: 100,
    timestamp: '2023-01-01T00:00:00Z',
    txHash: '0xabcdef1234567890',
    status: 'completed'
  }
];

const mockContent: Content[] = [
  {
    id: 'content1',
    title: 'Welcome to D4L',
    slug: 'welcome',
    content: 'Welcome to the D4L platform!',
    lastModified: '2023-01-01T00:00:00Z',
    status: 'published'
  }
];

const mockSettings: Settings = {
  siteTitle: 'D4L Platform',
  siteDescription: 'Decentralized for Life',
  airdropEnabled: true,
  maintenanceMode: false
};

// Controller methods
const adminController = {
  // Dashboard
  getDashboardStats: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<DashboardStats>> => {
    // In a real implementation, fetch data from database
    return {
      success: true,
      data: mockDashboardStats
    };
  },

  // Users
  getUsers: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<User[]>> => {
    // In a real implementation, fetch users from database
    return {
      success: true,
      data: mockUsers
    };
  },

  getUserDetails: async (request: FastifyRequest<{ Params: { wallet: string } }>, reply: FastifyReply): Promise<ApiResponse<UserDetails>> => {
    const { wallet } = request.params;
    
    // In a real implementation, fetch user details from database
    const user = mockUsers.find(u => u.wallet === wallet);
    
    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return {
      success: true,
      data: {
        ...user,
        sessions: mockSessions,
        claims: mockClaims
      }
    };
  },

  deactivateUser: async (request: FastifyRequest<{ Params: { wallet: string } }>, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    const { wallet } = request.params;
    
    // In a real implementation, deactivate user in database
    const userIndex = mockUsers.findIndex(u => u.wallet === wallet);
    
    if (userIndex === -1) {
      return reply.code(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update mock data
    mockUsers[userIndex].isActive = false;
    
    return {
      success: true,
      data: {
        message: `User ${wallet} has been deactivated`
      }
    };
  },

  reactivateUser: async (request: FastifyRequest<{ Params: { wallet: string } }>, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    const { wallet } = request.params;
    
    // In a real implementation, reactivate user in database
    const userIndex = mockUsers.findIndex(u => u.wallet === wallet);
    
    if (userIndex === -1) {
      return reply.code(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update mock data
    mockUsers[userIndex].isActive = true;
    
    return {
      success: true,
      data: {
        message: `User ${wallet} has been reactivated`
      }
    };
  },

  // Airdrop
  getAirdropStats: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<AirdropStats>> => {
    // In a real implementation, fetch airdrop stats from database
    return {
      success: true,
      data: {
        totalAllocated: 1000000,
        totalClaimed: 750000,
        claimRate: '75%',
        uniqueClaimers: 1500
      }
    };
  },

  getAirdropClaims: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<Claim[]>> => {
    // In a real implementation, fetch claims from database
    return {
      success: true,
      data: mockClaims
    };
  },

  addAirdropAllocation: async (request: FastifyRequest<{ Body: { wallet: string; amount: number; reason?: string } }>, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    const { wallet, amount, reason } = request.body;
    
    // In a real implementation, add allocation to database
    
    return {
      success: true,
      data: {
        message: `Added ${amount} tokens to ${wallet}`
      }
    };
  },

  // Content
  getContent: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<Content[]>> => {
    // In a real implementation, fetch content from database
    return {
      success: true,
      data: mockContent
    };
  },

  getContentById: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<ApiResponse<Content>> => {
    const { id } = request.params;
    
    // In a real implementation, fetch content from database
    const content = mockContent.find(c => c.id === id);
    
    if (!content) {
      return reply.code(404).send({
        success: false,
        error: 'Content not found'
      });
    }
    
    return {
      success: true,
      data: content
    };
  },

  createContent: async (request: FastifyRequest<{ Body: Omit<Content, 'id' | 'lastModified'> }>, reply: FastifyReply): Promise<ApiResponse<Content>> => {
    const { title, slug, content, status } = request.body;
    
    // In a real implementation, create content in database
    const newContent: Content = {
      id: `content${mockContent.length + 1}`,
      title,
      slug,
      content,
      status: status || 'draft',
      lastModified: new Date().toISOString()
    };
    
    // Update mock data
    mockContent.push(newContent);
    
    return {
      success: true,
      data: newContent
    };
  },

  updateContent: async (request: FastifyRequest<{ Params: { id: string }; Body: Omit<Content, 'id' | 'lastModified'> }>, reply: FastifyReply): Promise<ApiResponse<Content>> => {
    const { id } = request.params;
    const { title, slug, content, status } = request.body;
    
    // In a real implementation, update content in database
    const contentIndex = mockContent.findIndex(c => c.id === id);
    
    if (contentIndex === -1) {
      return reply.code(404).send({
        success: false,
        error: 'Content not found'
      });
    }
    
    // Update mock data
    const updatedContent: Content = {
      ...mockContent[contentIndex],
      title,
      slug,
      content,
      status: status || mockContent[contentIndex].status,
      lastModified: new Date().toISOString()
    };
    
    mockContent[contentIndex] = updatedContent;
    
    return {
      success: true,
      data: updatedContent
    };
  },

  deleteContent: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    const { id } = request.params;
    
    // In a real implementation, delete content from database
    const contentIndex = mockContent.findIndex(c => c.id === id);
    
    if (contentIndex === -1) {
      return reply.code(404).send({
        success: false,
        error: 'Content not found'
      });
    }
    
    // Update mock data
    mockContent.splice(contentIndex, 1);
    
    return {
      success: true,
      data: {
        message: `Content ${id} has been deleted`
      }
    };
  },

  // Cache
  getCacheKeys: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<string[]>> => {
    // In a real implementation, fetch cache keys from Redis
    return {
      success: true,
      data: ['key1', 'key2', 'key3']
    };
  },

  deleteCacheKey: async (request: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    const { key } = request.params;
    
    // In a real implementation, delete cache key from Redis
    
    return {
      success: true,
      data: {
        message: `Cache key ${key} has been deleted`
      }
    };
  },

  flushCache: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> => {
    // In a real implementation, flush all cache from Redis
    
    return {
      success: true,
      data: {
        message: 'Cache has been flushed'
      }
    };
  },

  // Settings
  getSettings: async (request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<Settings>> => {
    // In a real implementation, fetch settings from database
    return {
      success: true,
      data: mockSettings
    };
  },

  updateSettings: async (request: FastifyRequest<{ Body: Partial<Settings> }>, reply: FastifyReply): Promise<ApiResponse<Settings>> => {
    const { siteTitle, siteDescription, airdropEnabled, maintenanceMode } = request.body;
    
    // In a real implementation, update settings in database
    
    // Update mock data
    if (siteTitle !== undefined) mockSettings.siteTitle = siteTitle;
    if (siteDescription !== undefined) mockSettings.siteDescription = siteDescription;
    if (airdropEnabled !== undefined) mockSettings.airdropEnabled = airdropEnabled;
    if (maintenanceMode !== undefined) mockSettings.maintenanceMode = maintenanceMode;
    
    return {
      success: true,
      data: mockSettings
    };
  }
};

export default adminController;
