# Implementing Reputation Decay Over Time

## Overview

Reputation decay is a mechanism that gradually reduces a user's reputation score over time if they are inactive. This feature encourages continuous participation and ensures that reputation scores reflect recent activity rather than historical contributions.

## Benefits of Reputation Decay

1. **Encourages Active Participation**: Users must remain active to maintain their reputation level
2. **Reflects Current Engagement**: Reputation scores better represent a user's current engagement
3. **Prevents Reputation Hoarding**: Users can't accumulate reputation and then become inactive
4. **Creates Dynamism**: The community hierarchy remains dynamic and competitive
5. **Rewards Consistency**: Consistent participation is valued over sporadic high contributions

## Implementation Approaches

### 1. Time-Based Linear Decay

The simplest approach is to implement a linear decay where reputation points decrease by a fixed amount after a certain period of inactivity.

```solidity
// In D4LReputationAsset.sol

// Decay configuration
uint256 public decayRate = 5; // Points to decay per period
uint256 public decayPeriod = 7 days; // Time period for decay
mapping(address => uint256) private _lastActivityTimestamp;

// Track activity
function recordActivity(address soulId) public onlyAuthorized {
    _lastActivityTimestamp[soulId] = block.timestamp;
}

// Apply decay when checking balance
function balanceOfSoul(address soul) public view override returns (uint256) {
    uint256 rawBalance = _soulBalances[soul];
    uint256 lastActivity = _lastActivityTimestamp[soul];
    
    // If no activity recorded, return raw balance
    if (lastActivity == 0) return rawBalance;
    
    // Calculate periods of inactivity
    uint256 inactivityTime = block.timestamp - lastActivity;
    uint256 inactivityPeriods = inactivityTime / decayPeriod;
    
    // Calculate decay amount
    uint256 decayAmount = inactivityPeriods * decayRate;
    
    // Return decayed balance (never below zero)
    return decayAmount >= rawBalance ? 0 : rawBalance - decayAmount;
}
```

### 2. Percentage-Based Decay

A more sophisticated approach is to decay reputation by a percentage of the current score, which affects higher-reputation users more significantly.

```solidity
// In D4LReputationAsset.sol

// Decay configuration
uint256 public decayPercentage = 5; // 5% decay per period
uint256 public decayPeriod = 30 days; // Time period for decay
mapping(address => uint256) private _lastActivityTimestamp;

// Apply decay when checking balance
function balanceOfSoul(address soul) public view override returns (uint256) {
    uint256 rawBalance = _soulBalances[soul];
    uint256 lastActivity = _lastActivityTimestamp[soul];
    
    // If no activity recorded, return raw balance
    if (lastActivity == 0) return rawBalance;
    
    // Calculate periods of inactivity
    uint256 inactivityTime = block.timestamp - lastActivity;
    uint256 inactivityPeriods = inactivityTime / decayPeriod;
    
    // Calculate decayed balance
    uint256 decayedBalance = rawBalance;
    for (uint256 i = 0; i < inactivityPeriods; i++) {
        decayedBalance = decayedBalance * (100 - decayPercentage) / 100;
    }
    
    return decayedBalance;
}
```

### 3. Tier-Based Decay

This approach applies different decay rates based on the user's reputation tier, allowing for more nuanced decay mechanics.

```solidity
// In D4LReputationAsset.sol

// Decay configuration per tier
mapping(uint8 => uint256) public tierDecayRates;
uint256 public decayPeriod = 14 days; // Time period for decay
mapping(address => uint256) private _lastActivityTimestamp;

// Set decay rates for different tiers
function setTierDecayRate(uint8 tier, uint256 rate) external onlyOwner {
    tierDecayRates[tier] = rate;
}

// Apply decay when checking balance
function balanceOfSoul(address soul) public view override returns (uint256) {
    uint256 rawBalance = _soulBalances[soul];
    uint256 lastActivity = _lastActivityTimestamp[soul];
    
    // If no activity recorded, return raw balance
    if (lastActivity == 0) return rawBalance;
    
    // Calculate periods of inactivity
    uint256 inactivityTime = block.timestamp - lastActivity;
    uint256 inactivityPeriods = inactivityTime / decayPeriod;
    
    if (inactivityPeriods == 0) return rawBalance;
    
    // Get the user's tier
    uint8 tier = getReputationTier(soul);
    
    // Get the decay rate for this tier
    uint256 decayRate = tierDecayRates[tier];
    
    // Calculate decay amount
    uint256 decayAmount = inactivityPeriods * decayRate;
    
    // Return decayed balance (never below zero)
    return decayAmount >= rawBalance ? 0 : rawBalance - decayAmount;
}
```

### 4. Activity-Based Decay Immunity

This approach provides immunity from decay for users who perform specific activities, creating incentives for desired behaviors.

```solidity
// In D4LReputationAsset.sol

// Decay configuration
uint256 public decayRate = 10; // Points to decay per period
uint256 public decayPeriod = 7 days; // Time period for decay
uint256 public immunityPeriod = 30 days; // Period of immunity after activity
mapping(address => uint256) private _lastActivityTimestamp;
mapping(address => bool) private _decayImmunity;

// Grant immunity from decay
function grantDecayImmunity(address soulId, bool immune) external onlyAuthorized {
    _decayImmunity[soulId] = immune;
}

// Apply decay when checking balance
function balanceOfSoul(address soul) public view override returns (uint256) {
    uint256 rawBalance = _soulBalances[soul];
    
    // Check if user has immunity
    if (_decayImmunity[soul]) return rawBalance;
    
    uint256 lastActivity = _lastActivityTimestamp[soul];
    
    // If no activity recorded, return raw balance
    if (lastActivity == 0) return rawBalance;
    
    // Check if user is in immunity period
    if (block.timestamp - lastActivity <= immunityPeriod) {
        return rawBalance;
    }
    
    // Calculate periods of inactivity (after immunity period)
    uint256 inactivityTime = block.timestamp - lastActivity - immunityPeriod;
    uint256 inactivityPeriods = inactivityTime / decayPeriod;
    
    // Calculate decay amount
    uint256 decayAmount = inactivityPeriods * decayRate;
    
    // Return decayed balance (never below zero)
    return decayAmount >= rawBalance ? 0 : rawBalance - decayAmount;
}
```

## Optimized Implementation

For production use, we need to consider gas costs and storage efficiency. Here's an optimized implementation that applies decay only when needed:

```solidity
// In D4LReputationAsset.sol

// Decay configuration
uint256 public decayRate; // Points to decay per period
uint256 public decayPeriod; // Time period for decay
mapping(address => uint256) private _lastActivityTimestamp;
mapping(address => uint256) private _lastDecayTimestamp;

// Set decay parameters
function setDecayParameters(uint256 rate, uint256 period) external onlyOwner {
    decayRate = rate;
    decayPeriod = period;
}

// Record user activity
function recordActivity(address soulId) public onlyAuthorized {
    _lastActivityTimestamp[soulId] = block.timestamp;
}

// Apply decay (called before balance changes)
function applyDecay(address soulId) internal {
    if (decayRate == 0 || decayPeriod == 0) return; // Decay disabled
    
    uint256 lastActivity = _lastActivityTimestamp[soulId];
    if (lastActivity == 0) {
        _lastActivityTimestamp[soulId] = block.timestamp;
        _lastDecayTimestamp[soulId] = block.timestamp;
        return;
    }
    
    uint256 lastDecay = _lastDecayTimestamp[soulId];
    uint256 timeElapsed = block.timestamp - lastDecay;
    uint256 periods = timeElapsed / decayPeriod;
    
    if (periods == 0) return; // No decay needed
    
    uint256 decayAmount = periods * decayRate;
    uint256 currentBalance = _soulBalances[soulId];
    
    // Apply decay (never below zero)
    _soulBalances[soulId] = decayAmount >= currentBalance ? 0 : currentBalance - decayAmount;
    
    // Update last decay timestamp
    _lastDecayTimestamp[soulId] = block.timestamp;
    
    emit ReputationDecayed(soulId, decayAmount);
}

// Override balance-changing functions to apply decay first
function mintToSoul(address soul, uint256 amount) external override onlyOwner {
    applyDecay(soul);
    super.mintToSoul(soul, amount);
    _lastActivityTimestamp[soul] = block.timestamp;
}

function burnFromSoul(address soul, uint256 amount) external override onlyOwner {
    applyDecay(soul);
    super.burnFromSoul(soul, amount);
    _lastActivityTimestamp[soul] = block.timestamp;
}

function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) 
    external 
    override 
    onlyOwner 
    returns (bool success) 
{
    applyDecay(fromSoul);
    applyDecay(toSoul);
    bool result = super.transferBetweenSouls(fromSoul, toSoul, amount);
    _lastActivityTimestamp[fromSoul] = block.timestamp;
    _lastActivityTimestamp[toSoul] = block.timestamp;
    return result;
}

// Get actual balance (with decay applied)
function balanceOfSoul(address soul) public view override returns (uint256) {
    if (decayRate == 0 || decayPeriod == 0) {
        return _soulBalances[soul]; // Decay disabled
    }
    
    uint256 lastDecay = _lastDecayTimestamp[soul];
    if (lastDecay == 0) return _soulBalances[soul]; // No decay yet
    
    uint256 timeElapsed = block.timestamp - lastDecay;
    uint256 periods = timeElapsed / decayPeriod;
    
    if (periods == 0) return _soulBalances[soul]; // No decay needed
    
    uint256 decayAmount = periods * decayRate;
    uint256 currentBalance = _soulBalances[soul];
    
    // Calculate decayed balance (never below zero)
    return decayAmount >= currentBalance ? 0 : currentBalance - decayAmount;
}
```

## Configurable Decay Parameters

To make the decay system flexible, we can add configuration options:

```solidity
// Decay configuration struct
struct DecayConfig {
    bool enabled;
    uint256 rate;
    uint256 period;
    uint256 immunityPeriod;
    bool percentageBased;
}

// Global decay configuration
DecayConfig public decayConfig;

// Set decay configuration
function setDecayConfig(
    bool enabled,
    uint256 rate,
    uint256 period,
    uint256 immunityPeriod,
    bool percentageBased
) external onlyOwner {
    decayConfig = DecayConfig({
        enabled: enabled,
        rate: rate,
        period: period,
        immunityPeriod: immunityPeriod,
        percentageBased: percentageBased
    });
    
    emit DecayConfigUpdated(enabled, rate, period, immunityPeriod, percentageBased);
}
```

## Activity Tracking

To implement decay effectively, we need to track user activity. Here are some approaches:

### 1. Explicit Activity Recording

```solidity
// Record specific activities
function recordActivity(address soulId, uint8 activityType) external onlyAuthorized {
    _lastActivityTimestamp[soulId] = block.timestamp;
    emit ActivityRecorded(soulId, activityType, block.timestamp);
}
```

### 2. Automatic Activity Tracking

```solidity
// Automatically track activity on reputation changes
function _beforeReputationChange(address soulId) internal {
    _lastActivityTimestamp[soulId] = block.timestamp;
}

// Hook into all reputation-changing functions
function mintToSoul(address soul, uint256 amount) external override onlyOwner {
    _beforeReputationChange(soul);
    super.mintToSoul(soul, amount);
}
```

### 3. Weighted Activity Tracking

```solidity
// Activity weights for different actions
mapping(uint8 => uint256) public activityWeights;

// Record weighted activity
function recordWeightedActivity(address soulId, uint8 activityType) external onlyAuthorized {
    uint256 weight = activityWeights[activityType];
    if (weight == 0) weight = 1; // Default weight
    
    // Extend activity timestamp based on weight
    uint256 currentTimestamp = _lastActivityTimestamp[soulId];
    uint256 extension = weight * 1 days; // 1 day per weight unit
    
    _lastActivityTimestamp[soulId] = currentTimestamp > block.timestamp 
        ? currentTimestamp + extension 
        : block.timestamp + extension;
        
    emit WeightedActivityRecorded(soulId, activityType, weight, _lastActivityTimestamp[soulId]);
}
```

## UI Integration

To make reputation decay transparent to users, we should integrate it into the UI:

### 1. Decay Status Indicator

```jsx
const ReputationDecayIndicator = ({ soulId, assetAddress }) => {
  const { decayInfo, loading, error } = useReputationDecay(soulId, assetAddress);
  
  if (loading || error) return null;
  
  const { 
    lastActivity, 
    nextDecayDate, 
    decayAmount, 
    daysUntilDecay 
  } = decayInfo;
  
  return (
    <div className="decay-indicator">
      <div className="decay-indicator__title">
        Reputation Decay
      </div>
      
      <div className="decay-indicator__info">
        <div className="decay-indicator__last-activity">
          Last activity: {new Date(lastActivity).toLocaleDateString()}
        </div>
        
        {daysUntilDecay > 0 ? (
          <div className="decay-indicator__next-decay">
            Next decay in {daysUntilDecay} days: -{decayAmount} points
          </div>
        ) : (
          <div className="decay-indicator__active-decay">
            Your reputation is currently decaying
          </div>
        )}
      </div>
    </div>
  );
};
```

### 2. Activity Recommendations

```jsx
const ActivityRecommendations = ({ soulId, assetAddress }) => {
  const { decayInfo, loading, error } = useReputationDecay(soulId, assetAddress);
  const { activities } = useAvailableActivities();
  
  if (loading || error) return null;
  
  const { daysUntilDecay } = decayInfo;
  const needsActivity = daysUntilDecay <= 7; // Show recommendations if decay is within a week
  
  if (!needsActivity) return null;
  
  return (
    <div className="activity-recommendations">
      <div className="activity-recommendations__title">
        Recommended Activities
      </div>
      
      <div className="activity-recommendations__subtitle">
        Complete these activities to prevent reputation decay
      </div>
      
      <ul className="activity-recommendations__list">
        {activities.map(activity => (
          <li key={activity.id} className="activity-recommendations__item">
            <div className="activity-recommendations__activity-name">
              {activity.name}
            </div>
            <div className="activity-recommendations__activity-description">
              {activity.description}
            </div>
            <button className="activity-recommendations__activity-button">
              Start Activity
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Testing Decay Implementation

To ensure the decay system works correctly, we need comprehensive tests:

```javascript
describe("Reputation Decay", function() {
  let reputationAsset;
  let owner, user1;
  
  beforeEach(async function() {
    // Deploy reputation asset
    const ReputationAsset = await ethers.getContractFactory("D4LReputationAsset");
    reputationAsset = await ReputationAsset.deploy(
      "Community Reputation",
      "CREP",
      false, // non-transferable
      false, // non-divisible
      false, // non-consumable
      soulManager.address,
      owner.address
    );
    
    // Set decay parameters
    await reputationAsset.setDecayParameters(10, 7 * 24 * 60 * 60); // 10 points per week
    
    // Mint initial reputation
    await reputationAsset.mintToSoul(user1SoulId, 100);
  });
  
  it("Should not decay reputation before decay period", async function() {
    // Fast forward 3 days
    await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Check balance
    expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(100);
  });
  
  it("Should decay reputation after decay period", async function() {
    // Fast forward 10 days (> 1 week)
    await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Check balance (should be 90 after one decay period)
    expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(90);
  });
  
  it("Should decay reputation multiple times over longer periods", async function() {
    // Fast forward 3 weeks
    await ethers.provider.send("evm_increaseTime", [21 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Check balance (should be 70 after three decay periods)
    expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(70);
  });
  
  it("Should reset decay timer on activity", async function() {
    // Fast forward 5 days
    await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Record activity
    await reputationAsset.recordActivity(user1SoulId);
    
    // Fast forward 5 more days (total 10 days, but with activity reset)
    await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Check balance (should still be 100)
    expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(100);
  });
  
  it("Should not decay below zero", async function() {
    // Fast forward 15 weeks (150 points of decay, but only 100 points of reputation)
    await ethers.provider.send("evm_increaseTime", [15 * 7 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    // Check balance (should be 0, not negative)
    expect(await reputationAsset.balanceOfSoul(user1SoulId)).to.equal(0);
  });
});
```

## Conclusion

Implementing reputation decay creates a more dynamic and engaging reputation system that encourages continuous participation. By carefully tuning the decay parameters, you can create the right balance between rewarding historical contributions and encouraging ongoing activity.

Key considerations for implementation:
1. Choose the right decay model (linear, percentage, or tier-based)
2. Set appropriate decay rates and periods for your community
3. Implement activity tracking to reset decay timers
4. Make decay transparent to users through the UI
5. Provide clear recommendations for preventing decay
6. Test thoroughly to ensure decay works as expected

With these elements in place, reputation decay becomes a powerful tool for maintaining an active and engaged community.
