import { useState, useCallback } from 'react';
// @ts-ignore - Fix for wagmi version compatibility
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
  addUserData,
  getUserData,
  addReferral,
  claimReferralRewards,
  getReferralData,
  UserProfileData,
  ReferralData
} from '@/utils/profileManager';

interface UseProfileManagerState {
  loading: boolean;
  error: Error | null;
  profile: UserProfileData | null;
  referralData: ReferralData | null;
  userData: Record<string, string>;
}

export function useProfileManager() {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const [state, setState] = useState<UseProfileManagerState>({
    loading: false,
    error: null,
    profile: null,
    referralData: null,
    userData: {}
  });

  // Load user profile
  const loadProfile = useCallback(async (targetAddress?: string) => {
    if (!provider) return;
    
    const userAddress = targetAddress || address;
    if (!userAddress) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const profile = await getUserProfile(provider, userAddress);
      
      setState(prev => ({ 
        ...prev, 
        profile,
        loading: false 
      }));
      
      return profile;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to load profile'),
        loading: false 
      }));
      return null;
    }
  }, [provider, address]);

  // Create a new profile
  const createProfile = useCallback(async (username: string, email: string, socialHandle: string) => {
    if (!signer) {
      setState(prev => ({ 
        ...prev, 
        error: new Error('Wallet not connected'),
        loading: false 
      }));
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tx = await createUserProfile(signer, username, email, socialHandle);
      const receipt = await tx.wait();
      
      // Reload profile after creation
      await loadProfile();
      
      setState(prev => ({ ...prev, loading: false }));
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to create profile'),
        loading: false 
      }));
      return null;
    }
  }, [signer, loadProfile]);

  // Update an existing profile
  const updateProfile = useCallback(async (username: string, email: string, socialHandle: string) => {
    if (!signer) {
      setState(prev => ({ 
        ...prev, 
        error: new Error('Wallet not connected'),
        loading: false 
      }));
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tx = await updateUserProfile(signer, username, email, socialHandle);
      const receipt = await tx.wait();
      
      // Reload profile after update
      await loadProfile();
      
      setState(prev => ({ ...prev, loading: false }));
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to update profile'),
        loading: false 
      }));
      return null;
    }
  }, [signer, loadProfile]);

  // Add user data
  const addData = useCallback(async (dataType: string, data: string) => {
    if (!signer) {
      setState(prev => ({ 
        ...prev, 
        error: new Error('Wallet not connected'),
        loading: false 
      }));
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tx = await addUserData(signer, dataType, data);
      const receipt = await tx.wait();
      
      // Update local userData state
      setState(prev => ({ 
        ...prev, 
        userData: { ...prev.userData, [dataType]: data },
        loading: false 
      }));
      
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to add user data'),
        loading: false 
      }));
      return null;
    }
  }, [signer]);

  // Load user data for a specific data type
  const loadData = useCallback(async (dataType: string, targetAddress?: string) => {
    if (!provider) return null;
    
    const userAddress = targetAddress || address;
    if (!userAddress) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await getUserData(provider, userAddress, dataType);
      
      // Update local userData state
      if (data) {
        setState(prev => ({ 
          ...prev, 
          userData: { ...prev.userData, [dataType]: data },
          loading: false 
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
      
      return data;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to load user data'),
        loading: false 
      }));
      return null;
    }
  }, [provider, address]);

  // Add a referral
  const addUserReferral = useCallback(async (refereeAddress: string) => {
    if (!signer) {
      setState(prev => ({ 
        ...prev, 
        error: new Error('Wallet not connected'),
        loading: false 
      }));
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tx = await addReferral(signer, refereeAddress);
      const receipt = await tx.wait();
      
      // Reload referral data
      await loadReferralData();
      
      setState(prev => ({ ...prev, loading: false }));
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to add referral'),
        loading: false 
      }));
      return null;
    }
  }, [signer]);

  // Claim referral rewards
  const claimRewards = useCallback(async () => {
    if (!signer) {
      setState(prev => ({ 
        ...prev, 
        error: new Error('Wallet not connected'),
        loading: false 
      }));
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const tx = await claimReferralRewards(signer);
      const receipt = await tx.wait();
      
      // Reload referral data
      await loadReferralData();
      
      setState(prev => ({ ...prev, loading: false }));
      return receipt;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to claim rewards'),
        loading: false 
      }));
      return null;
    }
  }, [signer]);

  // Load referral data
  const loadReferralData = useCallback(async (targetAddress?: string) => {
    if (!provider) return null;
    
    const userAddress = targetAddress || address;
    if (!userAddress) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await getReferralData(provider, userAddress);
      
      setState(prev => ({ 
        ...prev, 
        referralData: data,
        loading: false 
      }));
      
      return data;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: new Error(error.message || 'Failed to load referral data'),
        loading: false 
      }));
      return null;
    }
  }, [provider, address]);

  return {
    ...state,
    loadProfile,
    createProfile,
    updateProfile,
    addData,
    loadData,
    addReferral: addUserReferral,
    claimRewards,
    loadReferralData
  };
}
