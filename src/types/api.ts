// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: number;
  };
}

// Airdrop API Types
export interface AirdropStatus {
  isActive: boolean;
  isPaused: boolean;
  startTime: number;
}

export interface UserAirdropInfo {
  address: string;
  hasClaimed: boolean;
}

export interface AirdropResponse {
  status: AirdropStatus;
  userInfo: UserAirdropInfo;
}

// Profile API Types
export interface AirdropInfo {
  baseAmount: number;
  bonusAmount: number;
  claimed: boolean;
  claimTimestamp: number | null;
}

export interface ProfileResponse {
  address: string;
  hasProfile: boolean;
  profileId: number | null;
  tokenURI: string | null;
  airdropInfo: AirdropInfo | null;
}

// Merkle Proof API Types
export interface MerkleProofResponse {
  address: string;
  isWhitelisted: boolean;
  proof: string[] | null;
  amount: string;
  merkleRoot?: string;
}

export interface MerkleVerificationResponse {
  verified: boolean;
  address: string;
  merkleRoot: string;
}

// API Error Types
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
}
