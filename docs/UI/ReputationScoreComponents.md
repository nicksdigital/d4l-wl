# UI Components for Displaying Reputation Scores

This document outlines the UI components needed to display reputation scores in the D4L SoulStream application.

## 1. Reputation Score Card

### Description
A card component that displays a user's reputation score, tier, and progress to the next tier.

### Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `showProgress`: Boolean to toggle progress display
- `showTier`: Boolean to toggle tier display
- `variant`: Visual style variant (default, compact, detailed)

### Example Implementation
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

### Styling
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

## 2. Reputation Tier Badge

### Description
A badge component that displays a user's reputation tier with appropriate styling based on the tier level.

### Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `size`: Size of the badge (small, medium, large)
- `showLabel`: Boolean to toggle tier label display

### Example Implementation
```jsx
import React from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const tierColors = {
  1: { background: '#E0E0E0', text: '#757575' },
  2: { background: '#BBDEFB', text: '#1976D2' },
  3: { background: '#C8E6C9', text: '#388E3C' },
  4: { background: '#FFECB3', text: '#FFA000' },
  5: { background: '#FFCDD2', text: '#D32F2F' },
};

const tierLabels = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Expert',
  4: 'Master',
  5: 'Legend',
};

const ReputationTierBadge = ({ 
  soulId, 
  assetAddress, 
  size = 'medium',
  showLabel = true 
}) => {
  const { tier, loading, error } = useReputationScore(soulId, assetAddress);
  
  if (loading || error) return null;
  
  const sizeClass = {
    small: 'reputation-badge--small',
    medium: 'reputation-badge--medium',
    large: 'reputation-badge--large',
  }[size];
  
  const colors = tierColors[tier] || tierColors[1];
  const label = tierLabels[tier] || 'Unknown';
  
  return (
    <div 
      className={`reputation-badge ${sizeClass}`}
      style={{ 
        backgroundColor: colors.background,
        color: colors.text
      }}
    >
      <span className="reputation-badge__tier">{tier}</span>
      {showLabel && (
        <span className="reputation-badge__label">{label}</span>
      )}
    </div>
  );
};

export default ReputationTierBadge;
```

### Styling
```css
.reputation-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 16px;
  padding: 4px 12px;
  font-weight: 600;
}

.reputation-badge--small {
  font-size: 12px;
  padding: 2px 8px;
}

.reputation-badge--medium {
  font-size: 14px;
  padding: 4px 12px;
}

.reputation-badge--large {
  font-size: 16px;
  padding: 6px 16px;
}

.reputation-badge__tier {
  margin-right: 4px;
}

.reputation-badge__label {
  font-weight: 500;
}
```

## 3. Reputation History Chart

### Description
A chart component that displays a user's reputation score history over time.

### Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `timeframe`: Time period to display (week, month, year, all)
- `height`: Height of the chart
- `showTierThresholds`: Boolean to toggle tier threshold lines

### Example Implementation
```jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useReputationHistory } from '../hooks/useReputationHistory';

const ReputationHistoryChart = ({ 
  soulId, 
  assetAddress, 
  timeframe = 'month',
  height = 300,
  showTierThresholds = true
}) => {
  const { history, tierThresholds, loading, error } = useReputationHistory(soulId, assetAddress, timeframe);
  
  if (loading) return <div className="reputation-chart reputation-chart--loading">Loading chart data...</div>;
  if (error) return <div className="reputation-chart reputation-chart--error">Error loading chart: {error.message}</div>;
  
  return (
    <div className="reputation-chart" style={{ height }}>
      <h3 className="reputation-chart__title">Reputation History</h3>
      
      <div className="reputation-chart__container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} points`, 'Reputation']}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#2a5bd7" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            
            {showTierThresholds && tierThresholds.map((threshold, index) => (
              <ReferenceLine 
                key={`tier-${index + 2}`}
                y={threshold.value} 
                stroke={threshold.color}
                strokeDasharray="3 3"
                label={{ 
                  value: `Tier ${index + 2}`, 
                  position: 'right',
                  fill: threshold.color
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="reputation-chart__timeframe">
        <button 
          className={`reputation-chart__timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
          onClick={() => setTimeframe('week')}
        >
          Week
        </button>
        <button 
          className={`reputation-chart__timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
          onClick={() => setTimeframe('month')}
        >
          Month
        </button>
        <button 
          className={`reputation-chart__timeframe-btn ${timeframe === 'year' ? 'active' : ''}`}
          onClick={() => setTimeframe('year')}
        >
          Year
        </button>
        <button 
          className={`reputation-chart__timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
          onClick={() => setTimeframe('all')}
        >
          All
        </button>
      </div>
    </div>
  );
};

export default ReputationHistoryChart;
```

### Styling
```css
.reputation-chart {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
}

.reputation-chart__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.reputation-chart__container {
  height: calc(100% - 80px);
  min-height: 200px;
}

.reputation-chart__timeframe {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.reputation-chart__timeframe-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.reputation-chart__timeframe-btn:hover {
  background: #f5f5f5;
}

.reputation-chart__timeframe-btn.active {
  background: #e3f2fd;
  color: #2a5bd7;
  font-weight: 600;
}

.reputation-chart--loading,
.reputation-chart--error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

.reputation-chart--error {
  color: #d32f2f;
}
```

## 4. Reputation Leaderboard

### Description
A leaderboard component that displays top users ranked by their reputation scores.

### Properties
- `assetAddress`: The reputation asset address
- `limit`: Number of users to display
- `showTier`: Boolean to toggle tier display
- `showAvatar`: Boolean to toggle user avatar display

### Example Implementation
```jsx
import React from 'react';
import { useReputationLeaderboard } from '../hooks/useReputationLeaderboard';
import ReputationTierBadge from './ReputationTierBadge';

const ReputationLeaderboard = ({ 
  assetAddress, 
  limit = 10,
  showTier = true,
  showAvatar = true
}) => {
  const { leaderboard, loading, error } = useReputationLeaderboard(assetAddress, limit);
  
  if (loading) return <div className="leaderboard leaderboard--loading">Loading leaderboard...</div>;
  if (error) return <div className="leaderboard leaderboard--error">Error loading leaderboard: {error.message}</div>;
  
  return (
    <div className="leaderboard">
      <h3 className="leaderboard__title">Reputation Leaderboard</h3>
      
      <div className="leaderboard__list">
        {leaderboard.map((entry, index) => (
          <div key={entry.soulId} className="leaderboard__item">
            <div className="leaderboard__rank">{index + 1}</div>
            
            {showAvatar && (
              <div className="leaderboard__avatar">
                <img src={entry.avatarUrl || '/default-avatar.png'} alt={entry.username} />
              </div>
            )}
            
            <div className="leaderboard__user-info">
              <div className="leaderboard__username">{entry.username}</div>
              <div className="leaderboard__soul-id">{`${entry.soulId.substring(0, 6)}...${entry.soulId.substring(entry.soulId.length - 4)}`}</div>
            </div>
            
            <div className="leaderboard__score">{entry.score}</div>
            
            {showTier && (
              <div className="leaderboard__tier">
                <ReputationTierBadge 
                  soulId={entry.soulId} 
                  assetAddress={assetAddress}
                  size="small"
                  showLabel={false}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReputationLeaderboard;
```

### Styling
```css
.leaderboard {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
}

.leaderboard__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.leaderboard__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaderboard__item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.leaderboard__item:hover {
  background-color: #f5f5f5;
}

.leaderboard__rank {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  background-color: #2a5bd7;
  border-radius: 50%;
  margin-right: 12px;
}

.leaderboard__item:nth-child(1) .leaderboard__rank {
  background-color: #ffd700; /* Gold */
  color: #333;
}

.leaderboard__item:nth-child(2) .leaderboard__rank {
  background-color: #c0c0c0; /* Silver */
  color: #333;
}

.leaderboard__item:nth-child(3) .leaderboard__rank {
  background-color: #cd7f32; /* Bronze */
  color: #fff;
}

.leaderboard__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.leaderboard__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leaderboard__user-info {
  flex: 1;
}

.leaderboard__username {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.leaderboard__soul-id {
  font-size: 12px;
  color: #666;
}

.leaderboard__score {
  font-weight: 700;
  font-size: 16px;
  color: #2a5bd7;
  margin: 0 16px;
}

.leaderboard__tier {
  margin-left: auto;
}

.leaderboard--loading,
.leaderboard--error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.leaderboard--error {
  color: #d32f2f;
}
```

## 5. Reputation Activity Feed

### Description
A feed component that displays recent reputation-changing activities for a user.

### Properties
- `soulId`: The Soul Identity address
- `assetAddress`: The reputation asset address
- `limit`: Number of activities to display
- `showTimestamp`: Boolean to toggle timestamp display

### Example Implementation
```jsx
import React from 'react';
import { useReputationActivity } from '../hooks/useReputationActivity';

const activityIcons = {
  'mint': '⬆️',
  'burn': '⬇️',
  'transfer_in': '⬅️',
  'transfer_out': '➡️',
  'decay': '📉',
};

const ReputationActivityFeed = ({ 
  soulId, 
  assetAddress, 
  limit = 10,
  showTimestamp = true
}) => {
  const { activities, loading, error } = useReputationActivity(soulId, assetAddress, limit);
  
  if (loading) return <div className="activity-feed activity-feed--loading">Loading activities...</div>;
  if (error) return <div className="activity-feed activity-feed--error">Error loading activities: {error.message}</div>;
  
  if (activities.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p>No reputation activities found.</p>
      </div>
    );
  }
  
  return (
    <div className="activity-feed">
      <h3 className="activity-feed__title">Reputation Activity</h3>
      
      <div className="activity-feed__list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-feed__item">
            <div className="activity-feed__icon">
              {activityIcons[activity.type] || '🔄'}
            </div>
            
            <div className="activity-feed__content">
              <div className="activity-feed__description">
                {activity.description}
                <span className="activity-feed__amount" data-positive={activity.amount > 0}>
                  {activity.amount > 0 ? '+' : ''}{activity.amount}
                </span>
              </div>
              
              {showTimestamp && (
                <div className="activity-feed__timestamp">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReputationActivityFeed;
```

### Styling
```css
.activity-feed {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
}

.activity-feed__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.activity-feed__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-feed__item {
  display: flex;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-feed__item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.activity-feed__icon {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  background-color: #f5f5f5;
  border-radius: 50%;
  margin-right: 12px;
}

.activity-feed__content {
  flex: 1;
}

.activity-feed__description {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.activity-feed__amount {
  font-weight: 600;
  margin-left: 4px;
}

.activity-feed__amount[data-positive="true"] {
  color: #4caf50;
}

.activity-feed__amount[data-positive="false"] {
  color: #f44336;
}

.activity-feed__timestamp {
  font-size: 12px;
  color: #666;
}

.activity-feed--loading,
.activity-feed--error,
.activity-feed--empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.activity-feed--error {
  color: #d32f2f;
}
```

## Conclusion

These UI components provide a comprehensive set of tools for displaying reputation scores in the D4L SoulStream application. They can be used individually or combined to create a complete reputation management interface.

The components are designed to be:

- **Reusable**: Each component can be used in multiple contexts
- **Customizable**: Properties allow for different display options
- **Responsive**: Components adapt to different screen sizes
- **Accessible**: Components follow accessibility best practices

By implementing these components, users will be able to easily view and understand their reputation scores, track their progress, and see how they compare to others in the community.
