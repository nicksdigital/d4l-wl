import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSoulStream } from '../../contexts/SoulStreamContext';

const RewardsClaimCard = ({ 
  soulId: propSoulId, 
  onClaim,
  showHistory = false,
  variant = 'default'
}) => {
  const { soulId: contextSoulId, rewardsAsset, claimRewards } = useSoulStream();
  const [data, setData] = useState({
    pendingRewards: ethers.parseEther("0"),
    claimHistory: [],
    loading: true,
    error: null
  });
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);
  
  // Use provided soulId or fall back to context soulId
  const soulId = propSoulId || contextSoulId;

  const fetchRewardsData = async () => {
    if (!rewardsAsset || !soulId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      // Get pending rewards
      const pendingRewards = await rewardsAsset.getPendingRewards(soulId);
      
      // Get claim history (simplified - in a real implementation, you would
      // need to fetch this from events or a dedicated endpoint)
      const claimHistory = [];
      
      setData({
        pendingRewards,
        claimHistory,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      setData({
        pendingRewards: ethers.parseEther("0"),
        claimHistory: [],
        loading: false,
        error
      });
    }
  };
  
  useEffect(() => {
    fetchRewardsData();
  }, [rewardsAsset, soulId]);
  
  const handleClaim = async () => {
    if (claiming || data.pendingRewards === ethers.parseEther("0")) return;
    
    setClaiming(true);
    setClaimError(null);
    
    try {
      await claimRewards();
      await fetchRewardsData();
      if (onClaim) onClaim();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setClaimError(error.message || 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };
  
  if (data.loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  if (data.error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <div className="text-red-500">
          Error loading rewards: {data.error.message}
        </div>
      </div>
    );
  }
  
  const formattedRewards = ethers.formatEther(data.pendingRewards);
  const hasRewards = parseFloat(formattedRewards) > 0;
  
  return (
    <div className={`card ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Pending Rewards</h3>
      </div>
      
      <div className="flex flex-col items-center my-6">
        <span className="text-4xl font-bold text-gray-900">{formattedRewards}</span>
        <span className="text-sm text-gray-500 mt-1">tokens</span>
      </div>
      
      <button 
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          hasRewards 
            ? 'bg-primary-600 text-white hover:bg-primary-700' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        onClick={handleClaim}
        disabled={!hasRewards || claiming}
      >
        {claiming ? 'Claiming...' : 'Claim Rewards'}
      </button>
      
      {claimError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-500 text-sm">
          {claimError}
        </div>
      )}
      
      {showHistory && data.claimHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-700 mb-3">Claim History</h4>
          <ul className="space-y-2">
            {data.claimHistory.map((claim) => (
              <li key={claim.id} className="flex justify-between text-sm">
                <span className="font-medium">
                  {ethers.formatEther(claim.amount)} tokens
                </span>
                <span className="text-gray-500">
                  {new Date(claim.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RewardsClaimCard;
