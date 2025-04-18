# Reputation Score Card Component

## Description
A card component that displays a user's reputation score, tier, and progress to the next tier.

## Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `showProgress`: Boolean to toggle progress display
- `showTier`: Boolean to toggle tier display
- `variant`: Visual style variant (default, compact, detailed)

## Example Implementation
```jsx
import React, { useState, useEffect } from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const ReputationScoreCard = ({ 
  soulId, 
  assetAddress, 
  showProgress = true,
  showTier = true,
  variant = 'default'
}) => {
  const { score, tier, nextTierThreshold, loading, error } = useReputationScore(soulId, assetAddress);
  
  if (loading) return <div className="reputation-card reputation-card--loading">Loading reputation data...</div>;
  if (error) return <div className="reputation-card reputation-card--error">Error loading reputation: {error.message}</div>;
  
  const progress = nextTierThreshold ? (score / nextTierThreshold) * 100 : 100;
  
  return (
    <div className={`reputation-card reputation-card--${variant}`}>
      <div className="reputation-card__header">
        <h3 className="reputation-card__title">Reputation Score</h3>
        {showTier && (
          <div className="reputation-card__tier">
            <span className="reputation-card__tier-label">Tier</span>
            <span className="reputation-card__tier-value">{tier}</span>
          </div>
        )}
      </div>
      
      <div className="reputation-card__score">
        <span className="reputation-card__score-value">{score}</span>
        <span className="reputation-card__score-label">points</span>
      </div>
      
      {showProgress && nextTierThreshold && (
        <div className="reputation-card__progress">
          <div className="reputation-card__progress-bar">
            <div 
              className="reputation-card__progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="reputation-card__progress-text">
            {nextTierThreshold - score} points to next tier
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationScoreCard;
```

## Styling
```css
.reputation-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
  max-width: 360px;
}

.reputation-card--compact {
  padding: 16px;
  max-width: 280px;
}

.reputation-card--detailed {
  padding: 32px;
  max-width: 480px;
}

.reputation-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reputation-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.reputation-card__tier {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reputation-card__tier-label {
  font-size: 12px;
  color: #666;
}

.reputation-card__tier-value {
  font-size: 24px;
  font-weight: 700;
  color: #2a5bd7;
}

.reputation-card__score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
}

.reputation-card__score-value {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
}

.reputation-card__score-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.reputation-card__progress {
  margin-top: 16px;
}

.reputation-card__progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.reputation-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a5bd7, #5d8efa);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.reputation-card__progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: right;
}

.reputation-card--loading,
.reputation-card--error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.reputation-card--error {
  color: #d32f2f;
}
```

## Usage Example
```jsx
// In a profile page
import ReputationScoreCard from '../components/ReputationScoreCard';

const ProfilePage = ({ user }) => {
  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1>{user.username}</h1>
      </div>
      
      <div className="profile-page__content">
        <div className="profile-page__sidebar">
          <ReputationScoreCard 
            soulId={user.soulId}
            assetAddress={REPUTATION_ASSET_ADDRESS}
            showProgress={true}
            showTier={true}
            variant="default"
          />
        </div>
        
        <div className="profile-page__main">
          {/* Other profile content */}
        </div>
      </div>
    </div>
  );
};
```

## Hook Implementation
```jsx
// useReputationScore.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { D4LReputationAsset_ABI } from '../constants/abis';

export const useReputationScore = (soulId, assetAddress) => {
  const [data, setData] = useState({
    score: 0,
    tier: 1,
    nextTierThreshold: 0,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchReputationData = async () => {
      if (!soulId || !assetAddress) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const reputationAsset = new ethers.Contract(
          assetAddress,
          D4LReputationAsset_ABI,
          provider
        );
        
        // Get the reputation score
        const score = await reputationAsset.balanceOfSoul(soulId);
        
        // Get the current tier
        const tier = await reputationAsset.getReputationTier(soulId);
        
        // Get the next tier threshold
        let nextTierThreshold = 0;
        try {
          nextTierThreshold = await reputationAsset.getReputationTierThreshold(Number(tier) + 1);
        } catch (e) {
          // If there's no next tier, set to 0
          nextTierThreshold = 0;
        }
        
        setData({
          score: Number(score),
          tier: Number(tier),
          nextTierThreshold: Number(nextTierThreshold),
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
  }, [soulId, assetAddress]);
  
  return data;
};
```

## Accessibility Considerations
- Use semantic HTML elements for proper screen reader support
- Ensure color contrast meets WCAG standards
- Include appropriate ARIA attributes for dynamic content
- Provide keyboard navigation support
- Include focus states for interactive elements

## Responsive Design
The component adapts to different screen sizes:
- On mobile, the card takes full width
- On tablet and desktop, the card maintains its max-width
- The compact variant is useful for sidebar or dashboard widgets
- The detailed variant provides more information for dedicated reputation pages
