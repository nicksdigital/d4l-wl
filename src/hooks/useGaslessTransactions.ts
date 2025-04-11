'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

interface TransactionParams {
  [key: string]: any;
}

interface TransactionResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
}

export function useGaslessTransactions() {
  const { data: session, status } = useSession();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Execute a gasless transaction through the backend
   * @param action The action to perform (register, transfer, airdrop)
   * @param params Parameters for the transaction
   * @returns Transaction result
   */
  const executeTransaction = async (
    action: 'register' | 'transfer' | 'airdrop',
    params: TransactionParams
  ): Promise<TransactionResult> => {
    // Reset state
    setError(null);
    setIsLoading(true);

    try {
      // Check if user is connected
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Check if user is authenticated
      if (!session && status !== 'loading') {
        console.warn('User not authenticated. Some features may be limited.');
        // We'll continue anyway, but the API will likely reject the request
      }

      // Make API request
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          params: {
            ...params,
            userAddress: params.userAddress || address,
          },
        }),
      });

      // Parse response
      const data = await response.json();

      // Handle error
      if (!response.ok) {
        throw new Error(data.error || 'Transaction failed');
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      return {
        success: false,
        message: 'Transaction failed',
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a user without requiring gas fees
   * @param email Optional email for registration
   * @param social Optional social handle for registration
   * @param redirectToProfile Whether to redirect to the profile page after successful registration
   * @returns Transaction result
   */
  const registerUser = async (email?: string, social?: string, redirectToProfile: boolean = true): Promise<TransactionResult> => {
    const result = await executeTransaction('register', { 
      userAddress: address,
      email,
      social
    });
    
    // If registration was successful and redirectToProfile is true, redirect to the profile page
    if (result.success && redirectToProfile) {
      // Add a small delay to allow the transaction to be processed
      setTimeout(() => {
        router.push(`/profile/${address}`);
      }, 1000);
    }
    
    return result;
  };

  /**
   * Transfer tokens without requiring gas fees
   * @param recipient Recipient address
   * @param amount Amount to transfer
   * @returns Transaction result
   */
  const transferTokens = async (
    recipient: string,
    amount: string
  ): Promise<TransactionResult> => {
    return executeTransaction('transfer', { recipient, amount });
  };

  /**
   * Airdrop tokens to a user without requiring gas fees
   * @param userAddress User address to receive tokens
   * @param amount Amount to airdrop
   * @returns Transaction result
   */
  const airdropTokens = async (
    userAddress: string = address as string,
    amount: string
  ): Promise<TransactionResult> => {
    return executeTransaction('airdrop', { userAddress, amount });
  };

  return {
    registerUser,
    transferTokens,
    airdropTokens,
    isLoading,
    error,
  };
}
