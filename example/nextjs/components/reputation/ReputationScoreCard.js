import React, { useState, useEffect } from 'react';
import { useSoulStream } from '../../contexts/SoulStreamContext';

const ReputationScoreCard = ({ 
  soulId: propSoulId, 
  showProgress = true,
  showTier = true,
  variant = 'default'
}) => {
  const { soulId: contextSoulId, reputationAsset } = useSoulStream();
  const [data, setData] = useState({
    score: 0,
    tier: 1,
    nextTierThreshold: 0,
    loading: true,
    error: null
  });
  
  // Use provided soulId or fall back to context soulId
  const soulId = propSoulId || contextSoulId;

  useEffect(() => {
    const fetchReputationData = async () => {
      if (!reputationAsset || !soulId) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        // Get the reputation score
        const score = await reputationAsset.balanceOfSoul(soulId);
        
        // Get the current tier
        const tier = await reputationAsset.getReputationTier(soulId);
        
        // Get the next tier threshold
        let nextTierThreshold = 0;
        try {
          // This is a simplified approach - in a real implementation,
          // you would need to get the threshold for the next tier
          const nextTier = Number(tier) + 1;
          // Assuming there's a function to get tier thresholds
          // This might not exist in your actual contract
          nextTierThreshold = 100 * nextTier; // Placeholder logic
        } catch (e) {
          // If there's no next tier, set to 0
          nextTierThreshold = 0;
        }
        
        setData({
          score: Number(score),
          tier: Number(tier),
          nextTierThreshold,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching reputation data:', error);
        setData({
          score: 0,
          tier: 1,
          nextTierThreshold: 0,
          loading: false,
          error
        });
      }
    };
    
    fetchReputationData();
  }, [reputationAsset, soulId]);
  
  if (data.loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  if (data.error) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <div className="text-red-500">
          Error loading reputation: {data.error.message}
        </div>
      </div>
    );
  }
  
  const progress = data.nextTierThreshold ? (data.score / data.nextTierThreshold) * 100 : 100;
  
  return (
    <div className={`card ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Reputation Score</h3>
        {showTier && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Tier</span>
            <span className="text-xl font-bold text-primary-600">{data.tier}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center my-6">
        <span className="text-4xl font-bold text-gray-900">{data.score}</span>
        <span className="text-sm text-gray-500 mt-1">points</span>
      </div>
      
      {showProgress && data.nextTierThreshold > 0 && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {data.nextTierThreshold - data.score} points to next tier
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationScoreCard;
