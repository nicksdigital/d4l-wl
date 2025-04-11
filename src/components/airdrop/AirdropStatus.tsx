'use client';

import { useState, useEffect } from 'react';
import { useAirdropWithFallback } from '@/hooks/useAirdropWithFallback';
import useWeb3 from '@/hooks/useWeb3';

export default function AirdropStatus() {
  const web3 = useWeb3();
  const { airdropStatus, getAirdropStatus, isLoading, error } = useAirdropWithFallback();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (web3.isConnected) {
      getAirdropStatus();
    }
  }, [web3.isConnected, getAirdropStatus]);

  // Update countdown timer
  useEffect(() => {
    if (!airdropStatus || !airdropStatus.isActive) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const startTime = airdropStatus.startTime;
      const endTime = startTime + (60 * 60 * 24 * 30); // 30 days from start
      
      if (now > endTime) {
        setTimeLeft('Airdrop has ended');
        return;
      }
      
      const secondsLeft = endTime - now;
      const days = Math.floor(secondsLeft / (60 * 60 * 24));
      const hours = Math.floor((secondsLeft % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);
      const seconds = Math.floor(secondsLeft % 60);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [airdropStatus]);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!airdropStatus) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <p>Unable to fetch airdrop status. Please connect your wallet and try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold mb-4">Airdrop Status</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400">Status</p>
          <p>
            {airdropStatus.isPaused ? (
              <span className="text-yellow-500">Paused</span>
            ) : airdropStatus.isActive ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </p>
        </div>
        
        <div>
          <p className="text-gray-400">Your Claim</p>
          <p>
            {airdropStatus.hasClaimed ? (
              <span className="text-green-500">Claimed</span>
            ) : (
              <span className="text-yellow-500">Not Claimed</span>
            )}
          </p>
        </div>
      </div>
      
      {airdropStatus.isActive && !airdropStatus.isPaused && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
          <p className="text-sm font-medium">Time Remaining</p>
          <p className="text-xl font-mono">{timeLeft}</p>
        </div>
      )}
      
      {airdropStatus.isPaused && (
        <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
          <p className="text-sm">The airdrop is currently paused. Please check back later.</p>
        </div>
      )}
      
      {!airdropStatus.isActive && !airdropStatus.isPaused && (
        <div className="mt-4 p-3 bg-red-900/30 rounded-lg">
          <p className="text-sm">The airdrop has not started yet or has already ended.</p>
        </div>
      )}
    </div>
  );
}
