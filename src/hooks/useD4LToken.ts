"use client";

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { TokenABI } from '@/utils/contractInteractions';
import { formatUnits } from 'ethers';

export function useD4LToken() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Read token balance
  const { data: balanceData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
    abi: TokenABI.abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  // Write contract functions
  const { writeContract, isPending } = useWriteContract();

  // Update balance when data changes
  useEffect(() => {
    if (balanceData) {
      setBalance(formatUnits(balanceData as bigint, 18));
    }
  }, [balanceData]);

  // Set loading state
  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending]);

  // Transfer tokens
  const transferTokens = async (to: string, amount: string) => {
    if (!isConnected || !address) return;
    
    try {
      const amountInWei = BigInt(amount) * BigInt(10 ** 18);
      
      writeContract({
        address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
        abi: TokenABI.abi,
        functionName: 'transfer',
        args: [to, amountInWei],
      });
    } catch (error) {
      console.error('Error transferring tokens:', error);
    }
  };

  // Refresh balance
  const refreshBalance = () => {
    if (isConnected && address) {
      refetch();
    }
  };

  return {
    balance,
    isLoading,
    transferTokens,
    refreshBalance,
  };
}
