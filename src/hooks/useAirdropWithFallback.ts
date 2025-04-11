'use client';

import { useState, useCallback } from 'react';
import useWeb3 from '@/hooks/useWeb3';
import { ethers } from 'ethers';

interface ClaimResult {
  success: boolean;
  message: string;
  txHash?: string;
  error?: string;
}

interface AirdropStatus {
  isActive: boolean;
  isPaused: boolean;
  startTime: number;
  hasClaimed: boolean;
}

export function useAirdropWithFallback() {
  const web3 = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus | null>(null);

  // Get airdrop status from blockchain or fallback
  const getAirdropStatus = useCallback(async () => {
    if (!web3.isConnected || !web3.address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to get status from blockchain first
      if (web3.contracts.airdropController) {
        const status = await web3.contracts.airdropController.read('getAirdropStatus', []);
        const hasClaimed = await web3.contracts.airdropController.read('hasClaimed', [web3.address]);

        const airdropStatus = {
          isActive: status.isActive,
          isPaused: status.isPaused,
          startTime: Number(status.startTime),
          hasClaimed
        };

        setAirdropStatus(airdropStatus);
        setIsLoading(false);
        return airdropStatus;
      }
    } catch (blockchainError) {
      console.error('Error getting airdrop status from blockchain:', blockchainError);
      
      // If blockchain call fails, try the database fallback
      try {
        const response = await fetch(`/api/fallback/airdrop?address=${web3.address}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // If user has a claim in the database
          if (data.data.hasClaim) {
            // For fallback, we'll consider the airdrop active if there's a claim
            const fallbackStatus = {
              isActive: true,
              isPaused: false,
              startTime: data.data.timestamp || Date.now(),
              hasClaimed: data.data.status === 'confirmed'
            };
            
            setAirdropStatus(fallbackStatus);
            setIsLoading(false);
            return fallbackStatus;
          }
        }
        
        // If no claim in database, try to get general airdrop status
        const statusResponse = await fetch('/api/airdrop');
        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.data) {
          const generalStatus = {
            isActive: statusData.data.status.isActive,
            isPaused: statusData.data.status.isPaused,
            startTime: statusData.data.status.startTime,
            hasClaimed: false
          };
          
          setAirdropStatus(generalStatus);
          setIsLoading(false);
          return generalStatus;
        }
      } catch (fallbackError) {
        console.error('Error getting airdrop status from fallback:', fallbackError);
        setError('Failed to get airdrop status. Please try again later.');
      }
    }
    
    setIsLoading(false);
    return null;
  }, [web3.isConnected, web3.address, web3.contracts.airdropController]);

  // Claim airdrop with merkle proof
  const claimAirdrop = useCallback(async (amount: string, merkleProof: string[]) => {
    if (!web3.isConnected || !web3.address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setClaimResult(null);

    try {
      // Try to claim from blockchain first
      if (web3.contracts.airdropController) {
        // Check if already claimed
        const hasClaimed = await web3.contracts.airdropController.read('hasClaimed', [web3.address]);
        
        if (hasClaimed) {
          setClaimResult({
            success: false,
            message: 'You have already claimed your tokens'
          });
          setIsLoading(false);
          return false;
        }
        
        // Claim tokens
        const hash = await web3.contracts.airdropController.write('claimTokens', [
          web3.address,
          amount,
          merkleProof
        ]);
        
        setClaimResult({
          success: true,
          message: 'Tokens claimed successfully!',
          txHash: hash
        });
        
        // Update airdrop status
        await getAirdropStatus();
        
        setIsLoading(false);
        return true;
      }
    } catch (blockchainError: any) {
      console.error('Error claiming airdrop from blockchain:', blockchainError);
      
      // If blockchain call fails, try the database fallback
      try {
        // Get the merkle root (in a real app, this would be fetched from a secure source)
        const merkleRootResponse = await fetch('/api/merkle/root');
        const merkleRootData = await merkleRootResponse.json();
        const merkleRoot = merkleRootData.data?.merkleRoot || '0x8a29648bed032bf77f4ab0da8b6f9599f3c5b1726bb5169767ee9165f7cf7b50';
        
        // Store claim in database
        const response = await fetch('/api/fallback/airdrop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: web3.address,
            amount,
            merkleProof,
            merkleRoot
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setClaimResult({
            success: true,
            message: 'Your claim has been recorded and will be processed soon. Please check back later for confirmation.'
          });
          
          setIsLoading(false);
          return true;
        } else {
          throw new Error(data.error?.message || 'Failed to store claim');
        }
      } catch (fallbackError: any) {
        console.error('Error claiming airdrop from fallback:', fallbackError);
        setError(fallbackError.message || 'Failed to claim tokens. Please try again later.');
        
        setClaimResult({
          success: false,
          message: 'Failed to claim tokens',
          error: fallbackError.message
        });
      }
    }
    
    setIsLoading(false);
    return false;
  }, [web3.isConnected, web3.address, web3.contracts.airdropController, getAirdropStatus]);

  // Check claim status from database
  const checkClaimStatus = useCallback(async () => {
    if (!web3.address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      const response = await fetch(`/api/fallback/airdrop?address=${web3.address}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking claim status:', error);
      return null;
    }
  }, [web3.address]);

  return {
    isLoading,
    error,
    claimResult,
    airdropStatus,
    getAirdropStatus,
    claimAirdrop,
    checkClaimStatus
  };
}
