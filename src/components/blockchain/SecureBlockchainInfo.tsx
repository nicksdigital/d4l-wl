'use client';

import { useState, useEffect } from 'react';
import { useSecureRpc } from '@/hooks/useSecureRpc';
import { useAccount } from 'wagmi';
import { formatEther } from 'ethers';

export default function SecureBlockchainInfo() {
  const { address, isConnected } = useAccount();
  const { getBalance, getBlockNumber, isLoading, error } = useSecureRpc();
  const [balance, setBalance] = useState<string>('0');
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data on mount and when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      fetchData().catch(err => {
        console.error('Error in initial data fetch:', err);
      });
    }
  }, [isConnected, address]);

  // Function to fetch blockchain data
  const fetchData = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    
    try {
      // Get balance and block number in parallel, with error handling for each
      const [balanceWei, currentBlock] = await Promise.all([
        getBalance(address).catch(error => {
          console.error('Balance fetch error:', error);
          // Return '0' if balance fetch fails
          return '0';
        }),
        getBlockNumber().catch(error => {
          console.error('Block number fetch error:', error);
          // Return 0 if block number fetch fails
          return 0;
        })
      ]);
      
      // Convert balance from Wei to Ether
      setBalance(formatEther(balanceWei));
      setBlockNumber(currentBlock);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-white">Blockchain Info</h2>
        <p className="text-gray-300">Please connect your wallet to view blockchain information.</p>
      </div>
    );
  }

  if (error && error.includes('Authentication required')) {
    return (
      <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-white">Blockchain Info</h2>
        <div className="p-4 bg-amber-900/30 rounded-lg mb-4">
          <p className="text-amber-400">Authentication required. Please sign in to access blockchain data.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/api/auth/signin'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Blockchain Info</h2>
        <button 
          onClick={fetchData}
          disabled={isLoading || isRefreshing}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error ? (
        <div className="p-4 bg-red-900/30 rounded-lg mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      ) : null}
      
      <div className="space-y-4">
        <div>
          <p className="text-gray-400">Your Address</p>
          <p className="font-mono text-sm break-all text-white">{address}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Balance</p>
            <p className="font-semibold text-white">{balance} ETH</p>
          </div>
          
          <div>
            <p className="text-gray-400">Current Block</p>
            <p className="font-semibold text-white">{blockNumber}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p className="text-gray-400">This data is fetched securely through our API proxy, protecting your API keys.</p>
      </div>
    </div>
  );
}
