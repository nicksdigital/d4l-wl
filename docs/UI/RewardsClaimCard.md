# Rewards Claim Card Component

## Description
A card component that displays a user's pending rewards and allows them to claim those rewards.

## Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The rewards asset address
- `onClaim`: Callback function when rewards are claimed
- `showHistory`: Boolean to toggle claim history display
- `variant`: Visual style variant (default, compact, detailed)

## Example Implementation
```jsx
import React, { useState } from 'react';
import { useRewards } from '../hooks/useRewards';
import { ethers } from 'ethers';

const RewardsClaimCard = ({ 
  soulId, 
  assetAddress, 
  onClaim,
  showHistory = false,
  variant = 'default'
}) => {
  const { 
    pendingRewards, 
    claimHistory, 
    claimRewards, 
    loading, 
    error 
  } = useRewards(soulId, assetAddress);
  
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);
  
  const handleClaim = async () => {
    if (claiming || pendingRewards === 0) return;
    
    setClaiming(true);
    setClaimError(null);
    
    try {
      await claimRewards();
      if (onClaim) onClaim();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setClaimError(error.message || 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };
  
  if (loading) return <div className="rewards-card rewards-card--loading">Loading rewards data...</div>;
  if (error) return <div className="rewards-card rewards-card--error">Error loading rewards: {error.message}</div>;
  
  const formattedRewards = ethers.utils.formatEther(pendingRewards.toString());
  const hasRewards = parseFloat(formattedRewards) > 0;
  
  return (
    <div className={`rewards-card rewards-card--${variant}`}>
      <div className="rewards-card__header">
        <h3 className="rewards-card__title">Pending Rewards</h3>
      </div>
      
      <div className="rewards-card__amount">
        <span className="rewards-card__amount-value">{formattedRewards}</span>
        <span className="rewards-card__amount-label">tokens</span>
      </div>
      
      <button 
        className={`rewards-card__claim-btn ${!hasRewards ? 'rewards-card__claim-btn--disabled' : ''}`}
        onClick={handleClaim}
        disabled={!hasRewards || claiming}
      >
        {claiming ? 'Claiming...' : 'Claim Rewards'}
      </button>
      
      {claimError && (
        <div className="rewards-card__error">
          {claimError}
        </div>
      )}
      
      {showHistory && claimHistory.length > 0 && (
        <div className="rewards-card__history">
          <h4 className="rewards-card__history-title">Claim History</h4>
          <ul className="rewards-card__history-list">
            {claimHistory.map((claim) => (
              <li key={claim.id} className="rewards-card__history-item">
                <div className="rewards-card__history-amount">
                  {ethers.utils.formatEther(claim.amount.toString())} tokens
                </div>
                <div className="rewards-card__history-date">
                  {new Date(claim.timestamp).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RewardsClaimCard;
```

## Styling
```css
.rewards-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
  max-width: 360px;
}

.rewards-card--compact {
  padding: 16px;
  max-width: 280px;
}

.rewards-card--detailed {
  padding: 32px;
  max-width: 480px;
}

.rewards-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rewards-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.rewards-card__amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
}

.rewards-card__amount-value {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
}

.rewards-card__amount-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.rewards-card__claim-btn {
  width: 100%;
  padding: 12px;
  background-color: #2a5bd7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.rewards-card__claim-btn:hover {
  background-color: #1e48b2;
}

.rewards-card__claim-btn:active {
  background-color: #15368c;
}

.rewards-card__claim-btn--disabled {
  background-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

.rewards-card__claim-btn--disabled:hover {
  background-color: #e0e0e0;
}

.rewards-card__error {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 14px;
}

.rewards-card__history {
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.rewards-card__history-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.rewards-card__history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rewards-card__history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.rewards-card__history-item:last-child {
  border-bottom: none;
}

.rewards-card__history-amount {
  font-weight: 600;
  color: #333;
}

.rewards-card__history-date {
  font-size: 12px;
  color: #666;
}

.rewards-card--loading,
.rewards-card--error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.rewards-card--error {
  color: #d32f2f;
}
```

## Usage Example
```jsx
// In a dashboard page
import RewardsClaimCard from '../components/RewardsClaimCard';

const DashboardPage = ({ user }) => {
  const handleRewardsClaimed = () => {
    // Update user balance or show notification
    toast.success('Rewards claimed successfully!');
  };
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-page__content">
        <div className="dashboard-page__sidebar">
          <RewardsClaimCard 
            soulId={user.soulId}
            assetAddress={REWARDS_ASSET_ADDRESS}
            onClaim={handleRewardsClaimed}
            showHistory={true}
            variant="default"
          />
        </div>
        
        <div className="dashboard-page__main">
          {/* Other dashboard content */}
        </div>
      </div>
    </div>
  );
};
```

## Hook Implementation
```jsx
// useRewards.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { D4LRewardsAsset_ABI } from '../constants/abis';

export const useRewards = (soulId, assetAddress) => {
  const [data, setData] = useState({
    pendingRewards: ethers.BigNumber.from(0),
    claimHistory: [],
    loading: true,
    error: null
  });
  
  const fetchRewardsData = async () => {
    if (!soulId || !assetAddress) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rewardsAsset = new ethers.Contract(
        assetAddress,
        D4LRewardsAsset_ABI,
        signer
      );
      
      // Get pending rewards
      const pendingRewards = await rewardsAsset.getPendingRewards(soulId);
      
      // Get claim history (if the contract supports it)
      let claimHistory = [];
      try {
        const historyCount = await rewardsAsset.getClaimHistoryCount(soulId);
        
        if (historyCount > 0) {
          const historyPromises = [];
          for (let i = 0; i < Math.min(historyCount, 5); i++) {
            historyPromises.push(rewardsAsset.getClaimHistoryItem(soulId, i));
          }
          
          const historyResults = await Promise.all(historyPromises);
          claimHistory = historyResults.map((item, index) => ({
            id: index,
            amount: item.amount,
            timestamp: item.timestamp.toNumber() * 1000
          }));
        }
      } catch (e) {
        // If the contract doesn't support claim history, just ignore
        console.warn('Claim history not supported:', e);
      }
      
      setData({
        pendingRewards,
        claimHistory,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      setData({
        pendingRewards: ethers.BigNumber.from(0),
        claimHistory: [],
        loading: false,
        error
      });
    }
  };
  
  useEffect(() => {
    fetchRewardsData();
  }, [soulId, assetAddress]);
  
  const claimRewards = async () => {
    if (!soulId || !assetAddress) {
      throw new Error('Soul ID or asset address not provided');
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const rewardsAsset = new ethers.Contract(
      assetAddress,
      D4LRewardsAsset_ABI,
      signer
    );
    
    const tx = await rewardsAsset.claimRewards(soulId);
    await tx.wait();
    
    // Refresh data after claiming
    await fetchRewardsData();
  };
  
  return {
    ...data,
    claimRewards,
    refreshData: fetchRewardsData
  };
};
```

## Accessibility Considerations
- Use semantic HTML elements for proper screen reader support
- Ensure color contrast meets WCAG standards
- Include appropriate ARIA attributes for dynamic content
- Provide keyboard navigation support
- Include focus states for interactive elements
- Add loading and error states with clear messaging

## Responsive Design
The component adapts to different screen sizes:
- On mobile, the card takes full width
- On tablet and desktop, the card maintains its max-width
- The compact variant is useful for sidebar or dashboard widgets
- The detailed variant provides more information for dedicated rewards pages

## Animation Options
You can add animations to make the claiming process more engaging:

```css
/* Add to the CSS */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.rewards-card__claim-btn:not(.rewards-card__claim-btn--disabled):hover {
  animation: pulse 1s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rewards-card__history {
  animation: fadeIn 0.5s ease-in-out;
}
```

## Integration with Other Components
The Rewards Claim Card works well with:
- User dashboards
- Reward program pages
- Activity feeds
- Notification systems

It provides a clear and intuitive way for users to claim their rewards and track their claim history.
