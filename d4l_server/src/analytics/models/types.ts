/**
 * Common types for the analytics system
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
