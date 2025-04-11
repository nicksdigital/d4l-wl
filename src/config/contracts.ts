// Contract addresses on Base Sepolia
export const CONTRACT_ADDRESSES = {
  // D4L Token contract (ERC20)
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x4e569c16220c734484be84430a995a33d3543e0d',
  
  // WishlistRegistry contract - for registering users for the airdrop
  WISHLIST_REGISTRY: process.env.NEXT_PUBLIC_WISHLIST_REGISTRY_ADDRESS || '0x3b2b7F694923cf9E1d45615DEEf911fAC1f947cD',
  
  // SoulboundProfile contract - for managing user profiles
  SOULBOUND_PROFILE: process.env.NEXT_PUBLIC_SOULBOUND_PROFILE_ADDRESS || '0xF2208b825E64cacD5eD1e899FD41122ab3943953',
  
  // AirdropController contract - for controlling the airdrop process
  AIRDROP_CONTROLLER: process.env.NEXT_PUBLIC_AIRDROP_CONTROLLER_ADDRESS || '0xb8997647019787fB5C745c727b8b718d4005d9d0',
  
  // RewardRegistry contract - for managing rewards
  REWARD_REGISTRY: process.env.NEXT_PUBLIC_REWARD_REGISTRY_ADDRESS || '0x19b41E27447faee0a9cb4f61B098c9F77692f6B0',
  
  // SocialModule contract - for social interactions
  SOCIAL_MODULE: process.env.NEXT_PUBLIC_SOCIAL_MODULE_ADDRESS || '0x10aE67E499Ffb9b94eCc0Eed96270Fd85C707d7A',
  
  // Merkle Distributor contract - for merkle-based token distribution
  MERKLE_DISTRIBUTOR: process.env.NEXT_PUBLIC_MERKLE_DISTRIBUTOR_ADDRESS || '0x4726Ad8E817bf21A334497AD171766bcB493E18C',
  
  // UserProfileManager contract - for enhanced user profile management
  USER_PROFILE_MANAGER: process.env.NEXT_PUBLIC_USER_PROFILE_MANAGER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  
  // Admin/Owner address
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be',
};

// Default claim amount (200 tokens with 18 decimals)
export const DEFAULT_CLAIM_AMOUNT = process.env.NEXT_PUBLIC_DEFAULT_CLAIM_AMOUNT || '200000000000000000000';

// Merkle Root for the airdrop
export const MERKLE_ROOT = process.env.NEXT_PUBLIC_MERKLE_ROOT || '0x8a29648bed032bf77f4ab0da8b6f9599f3c5b1726bb5169767ee9165f7cf7b50';
