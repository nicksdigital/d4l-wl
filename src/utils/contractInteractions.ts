import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, DEFAULT_CLAIM_AMOUNT } from '@/config/contracts';

// Import ABIs
import WishlistRegistryABI from '../abis/WishlistRegistry.json';
import SoulboundProfileABI from '../abis/SoulboundProfile.json';
import AirdropControllerABI from '../abis/AirdropController.json';
import RewardRegistryABI from '../abis/RewardRegistry.json';
import SocialModuleABI from '../abis/SocialModule.json';

// Define a simple ERC20 ABI for token interactions
const TokenABI = {
  abi: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
    'function transferFrom(address, address, uint256) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ]
};

// Export ABIs for use in other files
export { TokenABI, WishlistRegistryABI, SoulboundProfileABI, AirdropControllerABI, RewardRegistryABI, SocialModuleABI };

// Get user token balance
export async function getTokenBalance(provider: ethers.Provider, userAddress: string): Promise<string> {
  try {
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      TokenABI.abi,
      provider
    );
    
    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 18); // Assuming 18 decimals
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
}

// Check if a user is registered
export async function isUserRegistered(provider: ethers.Provider, userAddress: string): Promise<boolean> {
  try {
    const wishlistRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.WISHLIST_REGISTRY,
      WishlistRegistryABI.abi,
      provider
    );
    
    return await wishlistRegistry.isRegistered(userAddress);
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
}

// Register a user for the airdrop
export async function registerUser(
  signer: ethers.Signer,
  email: string,
  social: string
): Promise<ethers.TransactionResponse> {
  const wishlistRegistry = new ethers.Contract(
    CONTRACT_ADDRESSES.WISHLIST_REGISTRY,
    WishlistRegistryABI.abi,
    signer
  );
  
  return await wishlistRegistry.register(email, social);
}

// Get user registration details
export async function getUserRegistrationDetails(provider: ethers.Provider, userAddress: string): Promise<any> {
  try {
    const wishlistRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.WISHLIST_REGISTRY,
      WishlistRegistryABI.abi,
      provider
    );
    
    const details = await wishlistRegistry.registrationDetails(userAddress);
    return {
      timestamp: details.timestamp.toString(),
      email: details.email,
      social: details.social,
      hasEmailOrSocial: details.hasEmailOrSocial,
      bonusTokens: details.bonusTokens.toString(),
      nftTokenId: details.nftTokenId.toString()
    };
  } catch (error) {
    console.error('Error fetching user registration details:', error);
    return null;
  }
}

// Check if a user has a profile
export async function hasUserProfile(provider: ethers.Provider, userAddress: string): Promise<boolean> {
  try {
    // First check if user is registered
    const isRegistered = await isUserRegistered(provider, userAddress);
    if (!isRegistered) {
      console.log('User must be registered before accessing profile');
      return false;
    }
    
    const soulboundProfile = new ethers.Contract(
      CONTRACT_ADDRESSES.SOULBOUND_PROFILE,
      SoulboundProfileABI.abi,
      provider
    );
    
    return await soulboundProfile.hasProfile(userAddress);
  } catch (error) {
    console.error('Error checking if user has profile:', error);
    return false;
  }
}

// Get user profile ID
export async function getUserProfileId(provider: ethers.Provider, userAddress: string): Promise<string> {
  try {
    // First check if user is registered
    const isRegistered = await isUserRegistered(provider, userAddress);
    if (!isRegistered) {
      console.log('User must be registered before accessing profile ID');
      return '0';
    }
    
    const soulboundProfile = new ethers.Contract(
      CONTRACT_ADDRESSES.SOULBOUND_PROFILE,
      SoulboundProfileABI.abi,
      provider
    );
    
    const profileId = await soulboundProfile.getProfileId(userAddress);
    return profileId.toString();
  } catch (error) {
    console.error('Error fetching user profile ID:', error);
    return '0';
  }
}

// Get airdrop info for a profile
export async function getAirdropInfo(provider: ethers.Provider, profileId: string, userAddress: string): Promise<any> {
  try {
    // First check if user is registered
    const isRegistered = await isUserRegistered(provider, userAddress);
    if (!isRegistered) {
      console.log('User must be registered before accessing airdrop info');
      return {
        baseAmount: '0',
        bonusAmount: '0',
        claimed: false,
        claimTimestamp: '0',
        isRegistered: false
      };
    }
    
    const soulboundProfile = new ethers.Contract(
      CONTRACT_ADDRESSES.SOULBOUND_PROFILE,
      SoulboundProfileABI.abi,
      provider
    );
    
    const airdropInfo = await soulboundProfile.getAirdropInfo(profileId);
    return {
      baseAmount: airdropInfo.baseAmount.toString(),
      bonusAmount: airdropInfo.bonusAmount.toString(),
      claimed: airdropInfo.claimed,
      claimTimestamp: airdropInfo.claimTimestamp.toString(),
      isRegistered: true
    };
  } catch (error) {
    console.error('Error fetching airdrop info:', error);
    return null;
  }
}

// Get airdrop status
export async function getAirdropStatus(provider: ethers.Provider): Promise<any> {
  try {
    const airdropController = new ethers.Contract(
      CONTRACT_ADDRESSES.AIRDROP_CONTROLLER,
      AirdropControllerABI.abi,
      provider
    );
    
    const status = await airdropController.getAirdropStatus();
    const totalMinted = await airdropController.getTotalMinted();
    const wishlistRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.WISHLIST_REGISTRY,
      WishlistRegistryABI.abi,
      provider
    );
    const totalRegistered = await wishlistRegistry.totalRegistered();
    
    return {
      isActive: status.isActive,
      isPaused: status.isPaused,
      startTime: status.startTime.toString(),
      totalMinted: totalMinted.toString(),
      totalRegistered: totalRegistered.toString(),
      maxRegistrations: 5000 // Hardcoded from Common.MAX_REGISTRATIONS
    };
  } catch (error) {
    console.error('Error fetching airdrop status:', error);
    return null;
  }
}

// Claim airdrop
export async function claimAirdrop(
  signer: ethers.Signer,
  userAddress: string,
  signature: string
): Promise<ethers.TransactionResponse | { error: string }> {
  try {
    // First check if user is registered
    const provider = signer.provider as ethers.Provider;
    const isRegistered = await isUserRegistered(provider, userAddress);
    if (!isRegistered) {
      return { error: 'User must be registered before claiming rewards' };
    }
    
    const airdropController = new ethers.Contract(
      CONTRACT_ADDRESSES.AIRDROP_CONTROLLER,
      AirdropControllerABI.abi,
      signer
    );
    
    return await airdropController.claimAirdrop(userAddress, signature);
  } catch (error) {
    console.error('Error claiming airdrop:', error);
    return { error: 'Failed to claim rewards. Please try again later.' };
  }
}
