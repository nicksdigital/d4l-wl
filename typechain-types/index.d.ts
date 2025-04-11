// Temporary mock types for typechain-types imports
// This will prevent TS errors until you generate actual typechain types

import { ethers } from "ethers";

export interface SoulboundProfile extends ethers.Contract {
  hasProfile(address: string): Promise<boolean>;
  getProfileId(address: string): Promise<number>;
  getAirdropInfo(tokenId: number): Promise<{
    baseAmount: number;
    bonusAmount: number;
    claimed: boolean;
    claimTimestamp: number;
  }>;
  markAirdropClaimed(tokenId: number): Promise<void>;
  setAirdropInfo(tokenId: number, baseAmount: number, bonusAmount: number): Promise<void>;
  mintProfile(address: string): Promise<void>;
  batchMintProfiles(addresses: string[]): Promise<void>;
  ownerOf(tokenId: number): Promise<string>;
  addModule(moduleAddress: string, name: string): Promise<void>;
  getModules(): Promise<string[]>;
  updateModuleData(profileId: number, moduleAddress: string, data: string): Promise<void>;
  getModuleData(profileId: number, moduleAddress: string): Promise<string>;
  removeModule(moduleAddress: string): Promise<void>;
  setBaseURI(baseURI: string): Promise<void>;
  tokenURI(tokenId: number): Promise<string>;
  setTokenURI(tokenId: number, tokenURI: string): Promise<void>;
}

export interface SocialModule extends ethers.Contract {
  getAddress(): Promise<string>;
}

export interface WishlistRegistry extends ethers.Contract {
  getAddress(): Promise<string>;
  isRegistered(address: string): Promise<boolean>;
  register(email: string, social: string): Promise<void>;
  batchRegister(addresses: string[], emails: string[], socials: string[]): Promise<void>;
  registrationDetails(address: string): Promise<{
    email: string;
    social: string;
    hasEmailOrSocial: boolean;
    bonusTokens: number;
    nftTokenId: number;
  }>;
  removeUser(address: string): Promise<void>;
  totalRegistered(): Promise<number>;
  registrationOpen(): Promise<boolean>;
  openRegistration(): Promise<void>;
  closeRegistration(): Promise<void>;
  pause(): Promise<void>;
  unpause(): Promise<void>;
  setController(address: string): Promise<void>;
  connectSocial(platform: string, handle: string, followers: number): Promise<void>;
  disconnectSocial(platform: string): Promise<void>;
  verifySocial(userAddress: string, platform: string, verified: boolean): Promise<void>;
  updateFollowers(userAddress: string, platform: string, followers: number): Promise<void>;
  getSocialData(userAddress: string, platform: string): Promise<{
    handle: string;
    platform: string;
    followers: number;
    verified: boolean;
  }>;
  getActivePlatforms(userAddress: string): Promise<string[]>;
  getInfluenceScore(userAddress: string): Promise<number>;
  createReferral(referrer: string): Promise<void>;
  getReferral(userAddress: string): Promise<{
    referrer: string;
    validated: boolean;
    reward: number;
  }>;
  validateReferral(userAddress: string): Promise<void>;
  rewardReferral(userAddress: string): Promise<void>;
  configureReferralSystem(baseReward: number, bonus: number, maxBonus: number): Promise<void>;
  getReferrerInfo(referrer: string): Promise<{
    totalReferrals: number;
    totalRewards: number;
  }>;
  setMerkleRoot(root: string): Promise<void>;
  verifyMerkleProof(leaf: string, proof: string[]): Promise<boolean>;
  verifyMultipleMerkleProofs(leaves: string[], proofs: string[][]): Promise<boolean[]>;
}

export interface AirdropController extends ethers.Contract {
  getAddress(): Promise<string>;
  initialize(registry: string, profile: string, token: string): Promise<void>;
  registry(): Promise<string>;
  profile(): Promise<string>;
  token(): Promise<string>;
  signer(): Promise<string>;
  paused(): Promise<boolean>;
  mintNFTForUser(address: string): Promise<void>;
  batchMintNFTs(addresses: string[]): Promise<void>;
  getTotalMinted(): Promise<number>;
  setAirdropStartTime(startTime: number): Promise<void>;
  getAirdropStatus(): Promise<{
    isActive: boolean;
    isPaused: boolean;
    startTime: number;
  }>;
  pauseAirdrop(): Promise<void>;
  unpauseAirdrop(): Promise<void>;
  verifySignature(address: string, signature: string): Promise<boolean>;
  claimAirdrop(address: string, signature: string): Promise<void>;
  setSigner(signer: string): Promise<void>;
  setRewardRegistry(registry: string): Promise<void>;
  getUserRewardBonus(address: string): Promise<number>;
  getRoot(): Promise<string>;
  verifyProof(proof: string[], address: string, amount: string): Promise<boolean>;
  getCurrentBatch(): Promise<number>;
  getBatchStartTime(batch: number): Promise<number>;
  getBatchDuration(): Promise<number>;
  hasClaimed(address: string): Promise<boolean>;
  waitForDeployment(): Promise<void>;
}

export interface MockERC20 extends ethers.Contract {
  mint(address: string, amount: string): Promise<void>;
  getAddress(): Promise<string>;
  transfer(to: string, amount: string): Promise<void>;
  balanceOf(address: string): Promise<bigint>;
  waitForDeployment(): Promise<void>;
}

export interface RewardRegistry extends ethers.Contract {
  getAddress(): Promise<string>;
  setWishlistRegistry(address: string): Promise<void>;
  setAirdropController(address: string): Promise<void>;
  setVerifier(address: string): Promise<void>;
  createAction(
    actionId: string,
    name: string,
    description: string,
    rewardPoints: number,
    cooldownPeriod: number,
    maxCompletions: number,
    requiresVerification: boolean
  ): Promise<void>;
  updateAction(
    actionId: string,
    name: string,
    description: string,
    rewardPoints: number,
    active: boolean,
    cooldownPeriod: number,
    maxCompletions: number,
    requiresVerification: boolean
  ): Promise<void>;
  getAction(actionId: string): Promise<{
    name: string;
    description: string;
    rewardPoints: number;
    active: boolean;
    cooldownPeriod: number;
    maxCompletions: number;
    requiresVerification: boolean;
  }>;
  getActionIds(): Promise<string[]>;
  completeAction(actionId: string): Promise<void>;
  getUserAction(address: string, actionId: string): Promise<{
    completions: number;
    totalPoints: number;
    verified: boolean;
    lastCompletedAt: number;
  }>;
  getUserRewardPoints(address: string): Promise<number>;
  getUserBonusPoints(address: string): Promise<number>;
  verifyAction(address: string, actionId: string): Promise<void>;
  batchVerifyActions(addresses: string[], actionIds: string[]): Promise<void>;
  claimBonusPoints(): Promise<void>;
  hasClaimed(address: string): Promise<boolean>;
}
