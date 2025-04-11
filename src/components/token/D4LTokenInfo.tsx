'use client';

import { useState, useEffect } from 'react';
import { useD4LToken } from '@/hooks/useD4LToken';
import { useGaslessTransactions } from '@/hooks/useGaslessTransactions';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function D4LTokenInfo() {
  const { address, isConnected } = useAccount();
  const { balance, refreshBalance, isLoading } = useD4LToken();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format balance for display
  const formattedBalance = parseFloat(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Refresh token balance
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-white">D4L Token</h2>
        <p className="text-gray-300">Please connect your wallet to view your D4L token balance.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50 relative overflow-hidden">
      {/* Glassmorphism effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">D4L Token</h2>
          <button 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex items-center justify-center my-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-md"></div>
            <div className="relative bg-gray-800/70 backdrop-blur-md rounded-full p-8 border border-gray-700/50">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{formattedBalance}</p>
                <p className="text-sm text-gray-400 mt-1">D4L Tokens</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-gray-400 mb-1">Token Contract</p>
            <a 
              href="https://sepolia.basescan.org/token/0x4e569c16220c734484be84430a995a33d3543e0d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-blue-400 hover:text-blue-300 break-all"
            >
              0x4e569c16220c734484be84430a995a33d3543e0d
            </a>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/airdrop"
                className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition-colors"
              >
                Claim Airdrop
              </Link>
              
              <Link 
                href="/transfer"
                className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-center transition-colors"
              >
                Transfer Tokens
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/50 rounded-full animate-float"></div>
      <div className="absolute top-3/4 left-1/2 w-3 h-3 bg-purple-500/50 rounded-full animate-float animation-delay-1000"></div>
      <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-pink-500/50 rounded-full animate-float animation-delay-2000"></div>
    </div>
  );
}
