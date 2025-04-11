'use client';

import { useState } from 'react';
import { useSwitchChain } from 'wagmi';
import { baseSepolia } from '@/utils/chains';
import useWeb3 from '@/hooks/useWeb3';

export default function NetworkSwitcher() {
  const web3 = useWeb3();
  const { switchChain, isPending } = useSwitchChain();
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handleSwitchNetwork = async () => {
    try {
      setSwitchError(null);
      await switchChain({ chainId: baseSepolia.id });
    } catch (error: any) {
      console.error('Error switching network:', error);
      setSwitchError(error.message || 'Failed to switch network');
    }
  };

  if (web3.isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-500">{web3.networkName}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={handleSwitchNetwork}
        disabled={isPending}
        className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
      >
        {isPending ? 'Switching...' : `Switch to ${web3.networkName}`}
      </button>
      
      {switchError && (
        <p className="text-xs text-red-500 mt-1">{switchError}</p>
      )}
    </div>
  );
}
