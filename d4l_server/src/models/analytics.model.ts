/**
 * Analytics data models for the D4L platform
 */

// Event types for analytics
export enum AnalyticsEventType {
  // Contract events
  CONTRACT_INTERACTION = 'contract_interaction',
  TOKEN_TRANSFER = 'token_transfer',
  ASSET_LINKED = 'asset_linked',
  ASSET_UNLINKED = 'asset_unlinked',
  ASSET_TRANSFERRED = 'asset_transferred',
  ROUTE_EXECUTED = 'route_executed',
  ROUTE_REGISTERED = 'route_registered',
  USER_REGISTERED = 'user_registered',
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',
  AIRDROP_CLAIMED = 'airdrop_claimed',
  NFT_MINTED = 'nft_minted',
  
  // User interface events
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMISSION = 'form_submission',
  WALLET_CONNECTED = 'wallet_connected',
  WALLET_DISCONNECTED = 'wallet_disconnected',
  ERROR_OCCURRED = 'error_occurred',
  FEATURE_USED = 'feature_used'
}

// Base event interface
export interface AnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  walletAddress?: string;
  chainId?: number;
  metadata?: Record<string, any>;
}

// Contract event interface
export interface ContractEvent extends AnalyticsEvent {
  contractAddress: string;
  eventName: string;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  returnValues: Record<string, any>;
  gasUsed?: number;
  gasPrice?: string;
}

// User interface event interface
export interface UIEvent extends AnalyticsEvent {
  url?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  element?: string;
  action?: string;
  value?: string;
}

// Session interface
export interface AnalyticsSession {
  id: string;
  userId?: string;
  walletAddress?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isActive: boolean;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  entryPage?: string;
  exitPage?: string;
  pageViews?: number;
  interactions?: number;
  chainId?: number;
}

// User profile for analytics
export interface AnalyticsUser {
  id: string;
  walletAddress: string;
  firstSeen: number;
  lastSeen: number;
  totalSessions: number;
  totalInteractions: number;
  totalTransactions: number;
  totalGasSpent: string;
  assetsLinked: number;
  tokensHeld: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Contract analytics
export interface ContractAnalytics {
  address: string;
  name?: string;
  type?: string;
  deployedAt?: number;
  deployerAddress?: string;
  totalInteractions: number;
  uniqueUsers: number;
  lastInteraction: number;
  gasUsed: string;
  events: Record<string, number>;
  metadata?: Record<string, any>;
}

// Daily analytics snapshot
export interface DailyAnalyticsSnapshot {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalTransactions: number;
  totalGasUsed: string;
  topContracts: Array<{
    address: string;
    interactions: number;
  }>;
  topEvents: Array<{
    eventType: AnalyticsEventType;
    count: number;
  }>;
  metadata?: Record<string, any>;
}

// Real-time analytics
export interface RealTimeAnalytics {
  activeUsers: number;
  activeSessions: number;
  transactionsInLastHour: number;
  eventsInLastHour: number;
  topCurrentPages: Array<{
    url: string;
    users: number;
  }>;
  recentEvents: AnalyticsEvent[];
  updatedAt: number;
}

// Analytics query parameters
export interface AnalyticsQueryParams {
  startDate?: number;
  endDate?: number;
  walletAddress?: string;
  contractAddress?: string;
  eventType?: AnalyticsEventType;
  chainId?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  groupBy?: string;
  filter?: Record<string, any>;
}

// Analytics query result
export interface AnalyticsQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
