import { ethers } from 'ethers';
import UserProfileManagerABI from '../abis/UserProfileManager.json';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// Add the UserProfileManager address to the contract addresses
// This will need to be updated with the actual deployed contract address
if (!CONTRACT_ADDRESSES.USER_PROFILE_MANAGER) {
  CONTRACT_ADDRESSES.USER_PROFILE_MANAGER = '0x0000000000000000000000000000000000000000'; // Placeholder
}

// Interface for profile data
export interface UserProfileData {
  profileId: string;
  username: string;
  email: string;
  socialHandle: string;
  reputation: string;
  lastUpdated: string;
  dataTypes: string[];
  exists: boolean;
}

// Interface for referral data
export interface ReferralData {
  referrals: string[];
  totalRewards: string;
  pendingRewards: string;
}

/**
 * Create a new user profile
 */
export async function createUserProfile(
  signer: ethers.Signer,
  username: string,
  email: string,
  socialHandle: string
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.createProfile(username, email, socialHandle);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update an existing user profile
 */
export async function updateUserProfile(
  signer: ethers.Signer,
  username: string,
  email: string,
  socialHandle: string
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.updateProfile(username, email, socialHandle);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get a user's profile data
 */
export async function getUserProfile(
  provider: ethers.Provider,
  userAddress: string
): Promise<UserProfileData | null> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      provider
    );
    
    const profile = await profileManager.profiles(userAddress);
    
    if (!profile.exists) {
      return null;
    }
    
    // Get additional profile data
    const fullProfile = await profileManager.getProfile(userAddress);
    
    return {
      profileId: fullProfile.profileId.toString(),
      username: fullProfile.username,
      email: fullProfile.email,
      socialHandle: fullProfile.socialHandle,
      reputation: fullProfile.reputation.toString(),
      lastUpdated: fullProfile.lastUpdated.toString(),
      dataTypes: fullProfile.dataTypes,
      exists: profile.exists
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Add user data to a specific data type
 */
export async function addUserData(
  signer: ethers.Signer,
  dataType: string,
  data: string
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.addUserData(dataType, data);
  } catch (error) {
    console.error('Error adding user data:', error);
    throw error;
  }
}

/**
 * Get user data for a specific data type
 */
export async function getUserData(
  provider: ethers.Provider,
  userAddress: string,
  dataType: string
): Promise<string | null> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      provider
    );
    
    return await profileManager.getUserData(userAddress, dataType);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Add a referral
 */
export async function addReferral(
  signer: ethers.Signer,
  refereeAddress: string
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.addReferral(refereeAddress);
  } catch (error) {
    console.error('Error adding referral:', error);
    throw error;
  }
}

/**
 * Claim referral rewards
 */
export async function claimReferralRewards(
  signer: ethers.Signer
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.claimReferralRewards();
  } catch (error) {
    console.error('Error claiming referral rewards:', error);
    throw error;
  }
}

/**
 * Get referral data for a user
 */
export async function getReferralData(
  provider: ethers.Provider,
  userAddress: string
): Promise<ReferralData | null> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      provider
    );
    
    const referralInfo = await profileManager.referrals(userAddress);
    
    return {
      referrals: referralInfo.referrals || [],
      totalRewards: referralInfo.totalRewards.toString(),
      pendingRewards: referralInfo.pendingRewards.toString()
    };
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return null;
  }
}

/**
 * Execute a gasless transaction via the verifyAndExecute method
 */
export async function executeGaslessTransaction(
  signer: ethers.Signer,
  messageHash: string,
  signature: string,
  functionName: string,
  functionData: string
): Promise<ethers.TransactionResponse> {
  try {
    const profileManager = new ethers.Contract(
      CONTRACT_ADDRESSES.USER_PROFILE_MANAGER,
      UserProfileManagerABI.abi,
      signer
    );
    
    return await profileManager.verifyAndExecute(
      messageHash,
      signature,
      functionName,
      functionData
    );
  } catch (error) {
    console.error('Error executing gasless transaction:', error);
    throw error;
  }
}

/**
 * Helper function to create a signature for gasless transactions
 */
// Define specific interfaces for the different function data types
export interface CreateProfileData {
  username: string;
  email: string;
  socialHandle: string;
}

export interface UpdateProfileData {
  username: string;
  email: string;
  socialHandle: string;
}

export interface AddUserDataInput {
  dataType: string;
  data: string;
}

// Union type for all possible function data types
export type FunctionDataType = CreateProfileData | UpdateProfileData | AddUserDataInput;

export async function createSignature(
  signer: ethers.Signer,
  functionName: string,
  functionData: FunctionDataType
): Promise<{ messageHash: string; signature: string }> {
  try {
    // Encode the function data based on the function name
    let encodedData: string;
    
    if (functionName === 'createProfile' || functionName === 'updateProfile') {
      // Type guard to ensure we're working with the correct data type
      if (!('username' in functionData) || !('email' in functionData) || !('socialHandle' in functionData)) {
        throw new Error(`Invalid data for ${functionName}`);
      }
      
      const { username, email, socialHandle } = functionData as CreateProfileData | UpdateProfileData;
      encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'string'],
        [username, email, socialHandle]
      );
    } else if (functionName === 'addUserData') {
      // Type guard for AddUserDataInput
      if (!('dataType' in functionData) || !('data' in functionData)) {
        throw new Error('Invalid data for addUserData');
      }
      
      const { dataType, data } = functionData as AddUserDataInput;
      encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string'],
        [dataType, data]
      );
    } else {
      throw new Error(`Unsupported function: ${functionName}`);
    }
    
    // Create a hash of the function name and encoded data
    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'bytes', 'uint256'],
        [functionName, encodedData, Date.now()]
      )
    );
    
    // Sign the hash
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    
    return { messageHash, signature };
  } catch (error) {
    console.error('Error creating signature:', error);
    throw error;
  }
}
