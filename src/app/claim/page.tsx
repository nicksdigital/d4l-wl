"use client";

import { useState, useEffect } from 'react';
import { pageCacheConfig, ContentTags } from '@/lib/cache';
import { useCachedData } from '@/hooks/useCachedData';
import { useRouter } from 'next/navigation';
import useWeb3 from '@/hooks/useWeb3';
import Link from 'next/link';

// Page-specific caching behavior is configured in config.ts

export default function ClaimPage() {
  const router = useRouter();
  const { isConnected, address, contracts } = useWeb3();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [signature, setSignature] = useState<string>('');

  // Use the cached data hook with content tagging for user profile data
  const { data: userData, isLoading } = useCachedData(
    async () => {
      if (!isConnected || !address || !contracts.airdropController || !contracts.soulboundProfile) {
        return {
          airdropState: {
            isActive: false,
            isPaused: true,
            startTime: 0,
          },
          profileData: {
            tokenId: 0,
            baseAmount: 0,
            bonusAmount: 0,
            claimed: false,
            claimTimestamp: 0,
          },
          rewardBonus: 0,
          hasProfile: false
        };
      }

      try {
        // Get airdrop status
        // @ts-ignore
        const status = await contracts.airdropController.getAirdropStatus() || { isActive: false, isPaused: true, startTime: 0 };
        
        // Check if user has profile
        // @ts-ignore
        const hasProfile = await contracts.soulboundProfile.hasProfile(address) || false;
        
        if (!hasProfile) {
          return {
            airdropState: {
              isActive: status.isActive,
              isPaused: status.isPaused,
              startTime: Number(status.startTime),
            },
            profileData: {
              tokenId: 0,
              baseAmount: 0,
              bonusAmount: 0,
              claimed: false,
              claimTimestamp: 0,
            },
            rewardBonus: 0,
            hasProfile: false
          };
        }

        // Get profile token ID
        // @ts-ignore
        const tokenId = await contracts.soulboundProfile.getProfileId(address) || 0;
        
        // Get airdrop info
        // @ts-ignore
        const airdropInfo = await contracts.soulboundProfile.getAirdropInfo(tokenId) || { baseAmount: 0, bonusAmount: 0, claimed: false, claimTimestamp: 0 };
        
        // Get reward bonus
        // @ts-ignore
        const bonusPoints = await contracts.airdropController.getUserRewardBonus(address) || 0;

        // Set mock signature for demonstration purposes
        // In a real application, this would be requested from a backend
        setSignature('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        
        return {
          airdropState: {
            isActive: status.isActive,
            isPaused: status.isPaused,
            startTime: Number(status.startTime),
          },
          profileData: {
            tokenId: Number(tokenId),
            baseAmount: Number(airdropInfo.baseAmount),
            bonusAmount: Number(airdropInfo.bonusAmount),
            claimed: airdropInfo.claimed,
            claimTimestamp: Number(airdropInfo.claimTimestamp),
          },
          rewardBonus: Number(bonusPoints),
          hasProfile: true
        };
      } catch (error) {
        console.error('Error fetching claim data:', error);
        setError('Error fetching claim data. Please try again.');
        return {
          airdropState: {
            isActive: false,
            isPaused: true,
            startTime: 0,
          },
          profileData: {
            tokenId: 0,
            baseAmount: 0,
            bonusAmount: 0,
            claimed: false,
            claimTimestamp: 0,
          },
          rewardBonus: 0,
          hasProfile: false
        };
      }
    },
    'user-profile',
    { address: address || '' },
    [isConnected, address, contracts.airdropController, contracts.soulboundProfile],
    [ContentTags.USER],
    pageCacheConfig.claim.redisExpiration,
    // Generate a version based on the current block number or timestamp for user data
    () => `${Math.floor(Date.now() / 1000)}` // Use seconds precision for user data
  ) || {
    airdropState: {
      isActive: false,
      isPaused: true,
      startTime: 0,
    },
    profileData: {
      tokenId: 0,
      baseAmount: 0,
      bonusAmount: 0,
      claimed: false,
      claimTimestamp: 0,
    },
    rewardBonus: 0,
    hasProfile: false
  };
  
  // Extract the data for easier access in the component
  const airdropState = userData?.airdropState || {
    isActive: false,
    isPaused: true,
    startTime: 0,
  };
  
  const profileData = userData?.profileData || {
    tokenId: 0,
    baseAmount: 0,
    bonusAmount: 0,
    claimed: false,
    claimTimestamp: 0,
  };
  
  const rewardBonus = userData?.rewardBonus || 0;
  const hasProfile = userData?.hasProfile || false;

  const handleClaim = async () => {
    if (!isConnected || !address || !contracts.airdropController || !signature) {
      setError('Unable to claim. Please make sure you have a wallet connected.');
      return;
    }

    if (!hasProfile) {
      setError('You do not have a profile. Please create one first.');
      return;
    }

    if (profileData.claimed) {
      setError('You have already claimed your tokens.');
      return;
    }

    if (!airdropState.isActive || airdropState.isPaused) {
      setError('Airdrop is not active at the moment.');
      return;
    }

    setIsClaiming(true);
    setError(null);
    setTxHash(null);

    try {
      // @ts-ignore
      const tx = await contracts.airdropController.claimAirdrop(address, signature);
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // We don't need to update profileData directly since we're using the cached data hook
      // The next data fetch will show the updated claim status
      // In a real app, you would invalidate the cache or trigger a refetch
      
      // Navigate to profile page after successful claim
      setTimeout(() => {
        router.push('/profile');
      }, 5000);
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      if (error.reason) {
        setError(`Claim failed: ${error.reason}`);
      } else if (error.message) {
        setError(`Claim failed: ${error.message}`);
      } else {
        setError('Claim failed. Please try again.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1>Claim Tokens</h1>
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <p className="mb-4 text-gray-300">Please connect your wallet to claim your tokens.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-white mb-6 text-3xl font-bold">Claim Your Tokens</h1>

      {isLoading ? (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-300">Loading claim data...</p>
          </div>
        </div>
      ) : profileData.tokenId === 0 ? (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <div className="text-warning-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-white">No Profile Found</h2>
            <p className="mb-4 text-gray-300">
              You need to register for the airdrop first.
            </p>
            <Link href="/register" className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium">
              Register Now
            </Link>
          </div>
        </div>
      ) : profileData.claimed ? (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <div className="text-success-600 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2 text-white">Tokens Already Claimed</h2>
            <p className="mb-4 text-gray-300">
              You have already claimed your tokens. Check your wallet balance to see your D4L tokens.
            </p>
            <Link href="/profile" className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium">
              View Profile
            </Link>
          </div>
        </div>
      ) : !airdropState.isActive ? (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <div className="text-warning-600 text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold mb-2 text-white">Airdrop Not Active Yet</h2>
            <p className="mb-4 text-gray-300">
              The airdrop will start on {new Date(airdropState.startTime * 1000).toLocaleString()}.
              Please check back later.
            </p>
            <Link href="/profile" className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium">
              View Profile
            </Link>
          </div>
        </div>
      ) : airdropState.isPaused ? (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <div className="text-warning-600 text-6xl mb-4">⏸️</div>
            <h2 className="text-xl font-semibold mb-2 text-white">Airdrop Paused</h2>
            <p className="mb-4 text-gray-300">
              The airdrop is currently paused. Please check back later.
            </p>
            <Link href="/profile" className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium">
              View Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-header p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Claim Your D4L Tokens</h2>
          </div>
          <div className="card-body p-6">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Base Amount:</span>
                <span className="font-medium text-white">{profileData.baseAmount} D4L</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Email/Social Bonus:</span>
                <span className="font-medium text-white">{profileData.bonusAmount} D4L</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Reward Bonus:</span>
                <span className="font-medium text-white">{rewardBonus} D4L</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Total:</span>
                <span className="font-bold text-lg text-primary-400">{profileData.baseAmount + profileData.bonusAmount + rewardBonus} D4L</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-md border border-red-800">
                {error}
              </div>
            )}

            {/* Transaction Hash */}
            {txHash && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-50 text-green-300 rounded-md border border-green-800">
                <p>Transaction submitted!</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  View on Block Explorer
                </a>
              </div>
            )}

            <div className="mt-6">
              <button
                className="w-full py-3 px-4 bg-gray-700 text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                disabled={true}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Claiming Not Activated Yet</span>
              </button>
              <p className="text-center mt-2 text-sm text-gray-400">Token claiming will be available in Q2 2025</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
        <div className="card-header p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Claim Information</h2>
        </div>
        <div className="card-body p-6">
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>
              You can only claim your tokens once.
            </li>
            <li>
              Tokens will be sent directly to your connected wallet.
            </li>
            <li>
              The claim transaction will require gas on the Base Sepolia network.
            </li>
            <li>
              Make sure you have some ETH in your wallet to cover gas fees.
            </li>
            <li>
              If you encounter any issues, please reach out to our support team.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
