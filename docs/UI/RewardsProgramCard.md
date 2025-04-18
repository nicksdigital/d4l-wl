# Rewards Program Card Component

## Description
A card component that displays information about a rewards program, including its name, description, allocation, and duration.

## Properties
- `programId`: The ID of the rewards program
- `assetAddress`: The rewards asset address
- `showProgress`: Boolean to toggle progress display
- `showTimeRemaining`: Boolean to toggle time remaining display
- `variant`: Visual style variant (default, compact, detailed)

## Example Implementation
```jsx
import React from 'react';
import { useRewardsProgram } from '../hooks/useRewardsProgram';
import { ethers } from 'ethers';

const RewardsProgramCard = ({ 
  programId, 
  assetAddress, 
  showProgress = true,
  showTimeRemaining = true,
  variant = 'default'
}) => {
  const { 
    program, 
    loading, 
    error 
  } = useRewardsProgram(programId, assetAddress);
  
  if (loading) return <div className="program-card program-card--loading">Loading program data...</div>;
  if (error) return <div className="program-card program-card--error">Error loading program: {error.message}</div>;
  
  const {
    name,
    description,
    totalAllocation,
    remainingAllocation,
    startTime,
    endTime,
    active
  } = program;
  
  const allocationUsed = totalAllocation.sub(remainingAllocation);
  const percentUsed = totalAllocation.gt(0) 
    ? allocationUsed.mul(100).div(totalAllocation).toNumber() 
    : 0;
  
  const now = Date.now();
  const programEndTime = endTime.toNumber() * 1000;
  const timeRemaining = Math.max(0, programEndTime - now);
  
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Ended';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
  };
  
  return (
    <div className={`program-card program-card--${variant} ${!active ? 'program-card--inactive' : ''}`}>
      <div className="program-card__header">
        <h3 className="program-card__title">{name}</h3>
        {!active && (
          <div className="program-card__status">Inactive</div>
        )}
      </div>
      
      <div className="program-card__description">
        {description}
      </div>
      
      <div className="program-card__allocation">
        <div className="program-card__allocation-label">Allocation</div>
        <div className="program-card__allocation-value">
          {ethers.utils.formatEther(remainingAllocation)} / {ethers.utils.formatEther(totalAllocation)} tokens
        </div>
      </div>
      
      {showProgress && (
        <div className="program-card__progress">
          <div className="program-card__progress-bar">
            <div 
              className="program-card__progress-fill" 
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className="program-card__progress-text">
            {percentUsed}% allocated
          </div>
        </div>
      )}
      
      {showTimeRemaining && (
        <div className="program-card__time">
          <div className="program-card__time-label">Time Remaining</div>
          <div className="program-card__time-value">
            {formatTimeRemaining(timeRemaining)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsProgramCard;
```

## Styling
```css
.program-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.program-card--compact {
  padding: 16px;
  max-width: 320px;
}

.program-card--detailed {
  padding: 32px;
  max-width: 480px;
}

.program-card--inactive {
  opacity: 0.7;
  background-color: #f9f9f9;
}

.program-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.program-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.program-card__status {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-color: #9e9e9e;
  padding: 4px 8px;
  border-radius: 4px;
}

.program-card__description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.program-card__allocation {
  margin-bottom: 12px;
}

.program-card__allocation-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.program-card__allocation-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.program-card__progress {
  margin-bottom: 16px;
}

.program-card__progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.program-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a5bd7, #5d8efa);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.program-card__progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.program-card__time {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.program-card__time-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.program-card__time-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.program-card--loading,
.program-card--error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.program-card--error {
  color: #d32f2f;
}
```

## Usage Example
```jsx
// In a rewards page
import RewardsProgramCard from '../components/RewardsProgramCard';

const RewardsPage = () => {
  const [activePrograms, setActivePrograms] = useState([]);
  
  useEffect(() => {
    // Fetch active programs
    const fetchPrograms = async () => {
      const programs = await getActiveRewardsPrograms(REWARDS_ASSET_ADDRESS);
      setActivePrograms(programs);
    };
    
    fetchPrograms();
  }, []);
  
  return (
    <div className="rewards-page">
      <div className="rewards-page__header">
        <h1>Rewards Programs</h1>
      </div>
      
      <div className="rewards-page__programs">
        {activePrograms.map(program => (
          <RewardsProgramCard 
            key={program.id}
            programId={program.id}
            assetAddress={REWARDS_ASSET_ADDRESS}
            showProgress={true}
            showTimeRemaining={true}
            variant="default"
          />
        ))}
        
        {activePrograms.length === 0 && (
          <div className="rewards-page__empty">
            No active rewards programs at the moment.
          </div>
        )}
      </div>
    </div>
  );
};
```

## Hook Implementation
```jsx
// useRewardsProgram.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { D4LRewardsAsset_ABI } from '../constants/abis';

export const useRewardsProgram = (programId, assetAddress) => {
  const [data, setData] = useState({
    program: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchProgramData = async () => {
      if (!programId || !assetAddress) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const rewardsAsset = new ethers.Contract(
          assetAddress,
          D4LRewardsAsset_ABI,
          provider
        );
        
        // Get the program details
        const program = await rewardsAsset.getRewardProgram(programId);
        
        setData({
          program: {
            id: programId,
            name: program.name,
            description: program.description,
            totalAllocation: program.totalAllocation,
            remainingAllocation: program.remainingAllocation,
            startTime: program.startTime,
            endTime: program.endTime,
            active: program.active
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching program data:', error);
        setData({
          program: null,
          loading: false,
          error
        });
      }
    };
    
    fetchProgramData();
  }, [programId, assetAddress]);
  
  return data;
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
- The detailed variant provides more information for dedicated program pages

## Customization Options

### Status Indicators
You can add more status indicators for different program states:

```jsx
// Add to the component
const getStatusIndicator = () => {
  if (!active) return { text: 'Inactive', color: '#9e9e9e' };
  
  const now = Date.now();
  const programStartTime = startTime.toNumber() * 1000;
  const programEndTime = endTime.toNumber() * 1000;
  
  if (now < programStartTime) {
    return { text: 'Upcoming', color: '#ff9800' };
  } else if (now > programEndTime) {
    return { text: 'Ended', color: '#9e9e9e' };
  } else if (remainingAllocation.eq(0)) {
    return { text: 'Fully Allocated', color: '#4caf50' };
  } else {
    return { text: 'Active', color: '#4caf50' };
  }
};

const status = getStatusIndicator();

// In the JSX
<div 
  className="program-card__status"
  style={{ backgroundColor: status.color }}
>
  {status.text}
</div>
```

### Time Display Options
You can customize how time is displayed:

```jsx
// Add to the component
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// In the JSX
<div className="program-card__dates">
  <div>
    <span className="program-card__date-label">Start:</span>
    <span className="program-card__date-value">{formatDate(startTime)}</span>
  </div>
  <div>
    <span className="program-card__date-label">End:</span>
    <span className="program-card__date-value">{formatDate(endTime)}</span>
  </div>
</div>
```

## Integration with Other Components
The Rewards Program Card works well with:
- Rewards dashboards
- Program listings
- User profiles
- Activity feeds

It provides a clear and informative overview of rewards programs, helping users understand what rewards are available and how to earn them.
