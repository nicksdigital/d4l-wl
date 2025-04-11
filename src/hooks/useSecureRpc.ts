'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface RpcRequest {
  method: string;
  params: any[];
}

interface RpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export function useSecureRpc() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to make a secure RPC call through our API
  const call = useCallback(async (method: string, params: any[] = []): Promise<any> => {
    if (!session) {
      console.warn('No session found when attempting RPC call:', method);
      setError('Authentication required');
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.address || ''}`
        },
        body: JSON.stringify({
          method,
          params
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'RPC call failed');
      }

      // Check for RPC error
      if (data.data.error) {
        throw new Error(data.data.error.message || 'RPC error');
      }

      return data.data.result;
    } catch (err: any) {
      setError(err.message || 'Failed to make RPC call');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Utility function to get the balance of an address
  const getBalance = useCallback(async (address: string): Promise<string> => {
    return call('eth_getBalance', [address, 'latest']);
  }, [call]);

  // Utility function to get the current block number
  const getBlockNumber = useCallback(async (): Promise<number> => {
    const blockHex = await call('eth_blockNumber', []);
    return parseInt(blockHex, 16);
  }, [call]);

  // Utility function to call a contract method
  const callContract = useCallback(async (
    contractAddress: string, 
    encodedData: string
  ): Promise<string> => {
    return call('eth_call', [{
      to: contractAddress,
      data: encodedData
    }, 'latest']);
  }, [call]);

  return {
    call,
    getBalance,
    getBlockNumber,
    callContract,
    isLoading,
    error
  };
}
