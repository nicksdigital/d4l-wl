'use client';

import { useState, useEffect } from 'react';
import { useAirdropWithFallback } from '@/hooks/useAirdropWithFallback';
import useWeb3 from '@/hooks/useWeb3';
import Link from 'next/link';

export default function AirdropClaimWithFallback() {
  const web3 = useWeb3();
  const { 
    isLoading, 
    error, 
    claimResult, 
    airdropStatus, 
    getAirdropStatus, 
    claimAirdrop,
    checkClaimStatus
  } = useAirdropWithFallback();
  
  const [claimAmount, setClaimAmount] = useState<string>('0');
  const [merkleProof, setMerkleProof] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [pendingClaim, setPendingClaim] = useState<any>(null);

  // Check airdrop status on mount and when wallet changes
  useEffect(() => {
    if (web3.isConnected && web3.address) {
      getAirdropStatus();
      checkEligibility();
      checkPendingClaim();
    }
  }, [web3.isConnected, web3.address]);

  // Check if user is eligible for airdrop
  const checkEligibility = async () => {
    if (!web3.isConnected || !web3.address) return;
    
    setIsCheckingEligibility(true);
    
    try {
      // Call the merkle proof API to check eligibility
      const response = await fetch(`/api/merkle/proof?address=${web3.address}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        if (data.data.isWhitelisted) {
          setIsEligible(true);
          setClaimAmount(data.data.amount);
          setMerkleProof(data.data.proof);
        } else {
          setIsEligible(false);
        }
      } else {
        setIsEligible(false);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setIsEligible(false);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Check if user has a pending claim in the database
  const checkPendingClaim = async () => {
    if (!web3.isConnected || !web3.address) return;
    
    try {
      const claimStatus = await checkClaimStatus();
      if (claimStatus && claimStatus.hasClaim && claimStatus.status === 'pending') {
        setPendingClaim(claimStatus);
      } else {
        setPendingClaim(null);
      }
    } catch (error) {
      console.error('Error checking pending claim:', error);
    }
  };

  // Handle claim button click
  const handleClaim = async () => {
    if (!isEligible || !merkleProof.length || !claimAmount) return;
    
    await claimAirdrop(claimAmount, merkleProof);
    
    // Check for pending claim after attempting to claim
    await checkPendingClaim();
  };

  // Format amount for display
  const formatAmount = (amount: string) => {
    try {
      // Convert wei to ether for display
      const etherValue = parseFloat(amount) / 1e18;
      return etherValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } catch (error) {
      return '0';
    }
  };

  // Render loading state
  if (isLoading || isCheckingEligibility) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Loading airdrop information...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render not connected state
  if (!web3.isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="mb-6">Please connect your wallet to check your airdrop eligibility.</p>
        </div>
      </div>
    );
  }

  // Render claimed state
  if (airdropStatus?.hasClaimed) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2">Tokens Claimed</h2>
          <p className="mb-4">You have successfully claimed your D4L tokens!</p>
          <Link href="/profile" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block">
            View Profile
          </Link>
        </div>
      </div>
    );
  }

  // Render pending claim state
  if (pendingClaim) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">Claim Pending</h2>
          <p className="mb-4">
            Your claim for {formatAmount(pendingClaim.amount)} D4L tokens is being processed.
            Please check back later for confirmation.
          </p>
          <div className="mt-6">
            <button
              onClick={checkPendingClaim}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mr-2"
            >
              Check Status
            </button>
            <Link href="/profile" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg inline-block">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render claim result
  if (claimResult) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          {claimResult.success ? (
            <>
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold mb-2">Claim Successful</h2>
              <p className="mb-4">{claimResult.message}</p>
              {claimResult.txHash && (
                <p className="mb-4">
                  Transaction: <a 
                    href={`https://sepolia.basescan.org/tx/${claimResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View on BaseScan
                  </a>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Claim Failed</h2>
              <p className="mb-4">{claimResult.message}</p>
              {claimResult.error && (
                <p className="text-sm text-red-400 mb-4">{claimResult.error}</p>
              )}
            </>
          )}
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mr-2"
            >
              Refresh
            </button>
            <Link href="/profile" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg inline-block">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render not eligible state
  if (!isEligible) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <div className="text-center py-6">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Not Eligible</h2>
          <p className="mb-4">
            Sorry, your wallet is not eligible for the D4L airdrop.
            Please check that you're connected with the correct wallet address.
          </p>
          <div className="mt-6">
            <button
              onClick={checkEligibility}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render eligible state
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
      <div className="text-center py-6">
        <div className="text-green-500 text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold mb-2">You're Eligible!</h2>
        <p className="mb-2">
          You can claim <span className="font-bold text-xl">{formatAmount(claimAmount)} D4L</span> tokens.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Connected: {web3.address?.substring(0, 6)}...{web3.address?.substring(web3.address.length - 4)}
        </p>
        
        <div className="mt-6">
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            {isLoading ? 'Processing...' : 'Claim Tokens'}
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>
            Note: If the blockchain transaction fails, your claim will be processed through our fallback system.
          </p>
        </div>
      </div>
    </div>
  );
}
