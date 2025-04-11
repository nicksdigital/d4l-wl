"use client";

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { AirdropControllerABI, SoulboundProfileABI, WishlistRegistryABI } from '@/utils/contractInteractions';

export function useMerkleDistributor() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<string>('0');
  const [airdropInfo, setAirdropInfo] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Check if user is registered
  const { data: registrationData, refetch: refetchRegistration } = useReadContract({
    address: CONTRACT_ADDRESSES.WISHLIST_REGISTRY as `0x${string}`,
    abi: WishlistRegistryABI.abi,
    functionName: 'registrationDetails',
    args: [address],
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  // Read profile ID - only enabled if user is registered
  const { data: profileIdData, refetch: refetchProfileId } = useReadContract({
    address: CONTRACT_ADDRESSES.SOULBOUND_PROFILE as `0x${string}`,
    abi: SoulboundProfileABI.abi,
    functionName: 'getProfileId',
    args: [address],
    query: {
      enabled: Boolean(isConnected && address && isRegistered),
    },
  });

  // Read airdrop info - only enabled if user is registered and has a profile
  const { data: airdropInfoData, refetch: refetchAirdropInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.SOULBOUND_PROFILE as `0x${string}`,
    abi: SoulboundProfileABI.abi,
    functionName: 'getAirdropInfo',
    args: [profileId],
    query: {
      enabled: Boolean(isConnected && address && isRegistered && profileId !== '0'),
    },
  });

  // Check if user is registered when registration data changes
  useEffect(() => {
    if (registrationData) {
      const details = registrationData as any;
      // User is registered if they have an email or social account linked
      setIsRegistered(details.hasEmailOrSocial || false);
    } else {
      setIsRegistered(false);
    }
  }, [registrationData]);

  // Update profile ID when data changes
  useEffect(() => {
    if (profileIdData && isRegistered) {
      setProfileId(profileIdData.toString());
    } else {
      setProfileId('0');
    }
  }, [profileIdData, isRegistered]);

  // Update airdrop info when data changes
  useEffect(() => {
    if (airdropInfoData) {
      const info = airdropInfoData as any;
      setAirdropInfo({
        baseAmount: info.baseAmount.toString(),
        bonusAmount: info.bonusAmount.toString(),
        claimed: info.claimed,
        claimTimestamp: info.claimTimestamp.toString()
      });
    }
  }, [airdropInfoData]);

  // Write contract functions
  const { writeContract, isPending } = useWriteContract();

  // Claim airdrop
  const claimAirdrop = async (signature: string) => {
    if (!isConnected || !address) return;
    
    try {
      setIsLoading(true);
      
      // Check if user is registered before allowing claim
      if (!isRegistered) {
        throw new Error('You must register before claiming rewards');
      }
      
      writeContract({
        address: CONTRACT_ADDRESSES.AIRDROP_CONTROLLER as `0x${string}`,
        abi: AirdropControllerABI.abi,
        functionName: 'claimAirdrop',
        args: [address, signature],
      });
    } catch (error) {
      console.error('Error claiming airdrop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check claim status
  const checkIfClaimed = async () => {
    if (!isConnected || !address) return false;
    
    try {
      // First check if user is registered
      await refetchRegistration();
      if (!isRegistered) {
        return false;
      }
      
      await refetchProfileId();
      if (profileId !== '0') {
        const result = await refetchAirdropInfo();
        const info = result.data as any;
        return info?.claimed || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking claim status:', error);
      return false;
    }
  };

  return {
    isClaimed: airdropInfo?.claimed || false,
    airdropInfo,
    profileId,
    isRegistered,
    isLoading: isLoading || isPending,
    claimAirdrop,
    checkIfClaimed,
  };
}
