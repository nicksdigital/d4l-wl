# Reputation-Based Access Control

## Overview

Reputation-based access control is a system that grants or restricts access to features, content, or actions based on a user's reputation score. This creates a meritocratic system where privileges are earned through positive contributions and engagement.

## Benefits

1. **Incentivizes Positive Behavior**: Users are motivated to contribute positively to earn access to exclusive features
2. **Reduces Spam and Abuse**: Restricts sensitive actions to users who have demonstrated trustworthiness
3. **Creates Progression**: Provides a clear path for users to unlock new capabilities
4. **Community Self-Regulation**: Empowers the community to regulate itself through reputation
5. **Gamification**: Adds an element of achievement and progression to the platform

## Implementation Approaches

### 1. Threshold-Based Access Control

The simplest approach is to implement access control based on reputation thresholds.

```solidity
// In D4LReputationAsset.sol

// Check if a soul meets a reputation threshold
function meetsThreshold(address soul, uint256 threshold) public view returns (bool) {
    return balanceOfSoul(soul) >= threshold;
}
```

This function can then be used in other contracts to gate access:

```solidity
// In a contract that requires reputation-based access
function restrictedAction() external {
    require(
        reputationAsset.meetsThreshold(msg.sender, REQUIRED_REPUTATION),
        "Insufficient reputation"
    );
    
    // Perform the restricted action
    // ...
}
```

### 2. Tier-Based Access Control

A more structured approach is to use reputation tiers to determine access levels.

```solidity
// In D4LReputationAsset.sol

// Get the reputation tier for a soul
function getReputationTier(address soul) public view returns (uint8) {
    uint256 reputation = balanceOfSoul(soul);
    
    if (reputation >= tierThresholds[5]) return 5;
    if (reputation >= tierThresholds[4]) return 4;
    if (reputation >= tierThresholds[3]) return 3;
    if (reputation >= tierThresholds[2]) return 2;
    return 1;
}

// Check if a soul meets a minimum tier requirement
function meetsTierRequirement(address soul, uint8 requiredTier) public view returns (bool) {
    return getReputationTier(soul) >= requiredTier;
}
```

This can be used to gate access based on tiers:

```solidity
// In a contract that requires tier-based access
function tierRestrictedAction() external {
    require(
        reputationAsset.meetsTierRequirement(msg.sender, REQUIRED_TIER),
        "Insufficient reputation tier"
    );
    
    // Perform the restricted action
    // ...
}
```

### 3. Role-Based Access Control with Reputation

Combine reputation with role-based access control for more flexibility:

```solidity
// In an access control contract
contract ReputationAccessControl {
    D4LReputationAsset public reputationAsset;
    mapping(bytes32 => uint256) public roleReputationRequirements;
    mapping(bytes32 => mapping(address => bool)) public roleOverrides;
    
    constructor(address _reputationAsset) {
        reputationAsset = D4LReputationAsset(_reputationAsset);
    }
    
    // Set reputation requirement for a role
    function setRoleReputationRequirement(bytes32 role, uint256 requirement) external onlyAdmin {
        roleReputationRequirements[role] = requirement;
    }
    
    // Override role assignment for specific addresses
    function setRoleOverride(bytes32 role, address account, bool hasRole) external onlyAdmin {
        roleOverrides[role][account] = hasRole;
    }
    
    // Check if an account has a role
    function hasRole(bytes32 role, address account) public view returns (bool) {
        // Check for explicit override
        if (roleOverrides[role][account]) {
            return true;
        }
        
        // Check reputation requirement
        uint256 requirement = roleReputationRequirements[role];
        if (requirement > 0) {
            return reputationAsset.balanceOfSoul(account) >= requirement;
        }
        
        return false;
    }
    
    // Modifier for role-based access control
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "Access denied: insufficient reputation or role");
        _;
    }
    
    // Admin-only functions
    modifier onlyAdmin() {
        // Admin logic here
        _;
    }
}
```

### 4. Weighted Voting with Reputation

Use reputation to weight votes in governance or decision-making processes:

```solidity
// In a governance contract
contract ReputationGovernance {
    D4LReputationAsset public reputationAsset;
    
    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    constructor(address _reputationAsset) {
        reputationAsset = D4LReputationAsset(_reputationAsset);
    }
    
    // Create a new proposal
    function createProposal(string calldata description, uint256 duration) external returns (uint256) {
        require(
            reputationAsset.balanceOfSoul(msg.sender) >= 100,
            "Insufficient reputation to create proposal"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + duration;
        
        return proposalId;
    }
    
    // Vote on a proposal
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        // Get voter's reputation
        uint256 reputation = reputationAsset.balanceOfSoul(msg.sender);
        require(reputation > 0, "No reputation");
        
        // Record vote with reputation weight
        if (support) {
            proposal.forVotes += reputation;
        } else {
            proposal.againstVotes += reputation;
        }
        
        proposal.hasVoted[msg.sender] = true;
    }
    
    // Execute a proposal
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute proposal logic
        // ...
    }
}
```

## Implementing in Smart Contracts

### 1. Access Control Modifier

Create a modifier that can be used across contracts:

```solidity
// In a base contract
contract ReputationGated {
    D4LReputationAsset public reputationAsset;
    
    constructor(address _reputationAsset) {
        reputationAsset = D4LReputationAsset(_reputationAsset);
    }
    
    modifier requiresReputation(uint256 threshold) {
        require(
            reputationAsset.balanceOfSoul(msg.sender) >= threshold,
            "Insufficient reputation"
        );
        _;
    }
    
    modifier requiresTier(uint8 tier) {
        require(
            reputationAsset.getReputationTier(msg.sender) >= tier,
            "Insufficient reputation tier"
        );
        _;
    }
}
```

### 2. Feature Unlocking

Implement feature unlocking based on reputation:

```solidity
// In a feature contract
contract FeatureManager is ReputationGated {
    mapping(bytes32 => uint256) public featureReputationRequirements;
    
    constructor(address _reputationAsset) ReputationGated(_reputationAsset) {}
    
    // Set reputation requirement for a feature
    function setFeatureRequirement(bytes32 featureId, uint256 requirement) external onlyOwner {
        featureReputationRequirements[featureId] = requirement;
    }
    
    // Check if a user has access to a feature
    function hasFeatureAccess(bytes32 featureId, address user) public view returns (bool) {
        uint256 requirement = featureReputationRequirements[featureId];
        return reputationAsset.balanceOfSoul(user) >= requirement;
    }
    
    // Use a feature
    function useFeature(bytes32 featureId) external {
        require(
            hasFeatureAccess(featureId, msg.sender),
            "Feature not unlocked: insufficient reputation"
        );
        
        // Feature logic
        // ...
    }
}
```

### 3. Tiered Pricing

Implement tiered pricing based on reputation:

```solidity
// In a pricing contract
contract ReputationPricing is ReputationGated {
    struct PriceTier {
        uint8 minTier;
        uint256 price;
    }
    
    mapping(bytes32 => PriceTier[]) public productPriceTiers;
    
    constructor(address _reputationAsset) ReputationGated(_reputationAsset) {}
    
    // Set price tiers for a product
    function setPriceTiers(bytes32 productId, PriceTier[] calldata tiers) external onlyOwner {
        delete productPriceTiers[productId];
        
        for (uint256 i = 0; i < tiers.length; i++) {
            productPriceTiers[productId].push(tiers[i]);
        }
    }
    
    // Get price for a user
    function getPriceForUser(bytes32 productId, address user) public view returns (uint256) {
        uint8 userTier = reputationAsset.getReputationTier(user);
        uint256 price = type(uint256).max; // Default to max price
        
        PriceTier[] storage tiers = productPriceTiers[productId];
        for (uint256 i = 0; i < tiers.length; i++) {
            if (userTier >= tiers[i].minTier && tiers[i].price < price) {
                price = tiers[i].price;
            }
        }
        
        require(price != type(uint256).max, "No price tier available");
        return price;
    }
    
    // Purchase a product
    function purchase(bytes32 productId) external payable {
        uint256 price = getPriceForUser(productId, msg.sender);
        require(msg.value >= price, "Insufficient payment");
        
        // Process purchase
        // ...
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
}
```

## Frontend Implementation

### 1. Feature Gating Component

Create a component that conditionally renders content based on reputation:

```jsx
import React from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const ReputationGate = ({ 
  children, 
  requiredScore, 
  requiredTier,
  fallback 
}) => {
  const { score, tier, loading, error } = useReputationScore();
  
  if (loading) {
    return <div>Loading reputation...</div>;
  }
  
  if (error) {
    return <div>Error checking reputation: {error.message}</div>;
  }
  
  // Check if user meets requirements
  const meetsScoreRequirement = !requiredScore || score >= requiredScore;
  const meetsTierRequirement = !requiredTier || tier >= requiredTier;
  
  if (meetsScoreRequirement && meetsTierRequirement) {
    return children;
  }
  
  // Show fallback content or default message
  return fallback || (
    <div className="reputation-gate">
      <div className="reputation-gate__icon">🔒</div>
      <div className="reputation-gate__title">Feature Locked</div>
      <div className="reputation-gate__message">
        {requiredScore && (
          <div>Required Reputation: {requiredScore} (You have {score})</div>
        )}
        {requiredTier && (
          <div>Required Tier: {requiredTier} (You are Tier {tier})</div>
        )}
      </div>
    </div>
  );
};

export default ReputationGate;
```

### 2. Tiered UI Elements

Show different UI elements based on reputation tier:

```jsx
import React from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const TieredContent = ({ 
  tierContent = {},
  defaultContent
}) => {
  const { tier, loading, error } = useReputationScore();
  
  if (loading) {
    return <div>Loading reputation...</div>;
  }
  
  if (error) {
    return <div>Error checking reputation: {error.message}</div>;
  }
  
  // Find the highest tier content the user can access
  let content = defaultContent;
  for (let i = 1; i <= tier; i++) {
    if (tierContent[i]) {
      content = tierContent[i];
    }
  }
  
  return content;
};

// Usage example
const MyPage = () => {
  return (
    <div>
      <h1>Welcome to the Platform</h1>
      
      <TieredContent 
        tierContent={{
          1: <div>Basic features available</div>,
          3: <div>Advanced features unlocked</div>,
          5: <div>Premium features unlocked</div>
        }}
        defaultContent={<div>Sign in to access features</div>}
      />
    </div>
  );
};
```

### 3. Reputation Progress UI

Show users what they can unlock with higher reputation:

```jsx
import React from 'react';
import { useReputationScore } from '../hooks/useReputationScore';

const ReputationProgressUI = ({ features = [] }) => {
  const { score, tier, loading, error } = useReputationScore();
  
  if (loading) {
    return <div>Loading reputation...</div>;
  }
  
  if (error) {
    return <div>Error checking reputation: {error.message}</div>;
  }
  
  // Sort features by required reputation
  const sortedFeatures = [...features].sort((a, b) => 
    (a.requiredScore || 0) - (b.requiredScore || 0)
  );
  
  return (
    <div className="reputation-progress">
      <h3 className="reputation-progress__title">Your Reputation Journey</h3>
      
      <div className="reputation-progress__score">
        Current Reputation: <strong>{score}</strong> (Tier {tier})
      </div>
      
      <div className="reputation-progress__features">
        {sortedFeatures.map((feature, index) => {
          const isUnlocked = score >= (feature.requiredScore || 0);
          
          return (
            <div 
              key={index}
              className={`reputation-progress__feature ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="reputation-progress__feature-icon">
                {isUnlocked ? '✅' : '🔒'}
              </div>
              <div className="reputation-progress__feature-info">
                <div className="reputation-progress__feature-name">
                  {feature.name}
                </div>
                <div className="reputation-progress__feature-requirement">
                  Required Reputation: {feature.requiredScore || 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Usage example
const FeatureProgressPage = () => {
  const features = [
    { name: 'Basic Posting', requiredScore: 0 },
    { name: 'Comment on Posts', requiredScore: 10 },
    { name: 'Create Polls', requiredScore: 50 },
    { name: 'Access Premium Content', requiredScore: 100 },
    { name: 'Moderation Tools', requiredScore: 200 },
    { name: 'Create Custom Badges', requiredScore: 500 }
  ];
  
  return (
    <div>
      <h1>Feature Progression</h1>
      <ReputationProgressUI features={features} />
    </div>
  );
};
```

## Testing Reputation-Based Access Control

To ensure the access control system works correctly, we need comprehensive tests:

```javascript
describe("Reputation-Based Access Control", function() {
  let reputationAsset;
  let featureManager;
  let owner, user1, user2;
  
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
    
    // Deploy feature manager
    const FeatureManager = await ethers.getContractFactory("FeatureManager");
    featureManager = await FeatureManager.deploy(reputationAsset.address);
    
    // Set feature requirements
    const BASIC_FEATURE = ethers.utils.id("BASIC_FEATURE");
    const ADVANCED_FEATURE = ethers.utils.id("ADVANCED_FEATURE");
    const PREMIUM_FEATURE = ethers.utils.id("PREMIUM_FEATURE");
    
    await featureManager.setFeatureRequirement(BASIC_FEATURE, 10);
    await featureManager.setFeatureRequirement(ADVANCED_FEATURE, 50);
    await featureManager.setFeatureRequirement(PREMIUM_FEATURE, 100);
    
    // Mint reputation to users
    await reputationAsset.mintToSoul(user1SoulId, 75); // Can access basic and advanced
    await reputationAsset.mintToSoul(user2SoulId, 5);  // Cannot access any features
  });
  
  it("Should allow access to features based on reputation", async function() {
    const BASIC_FEATURE = ethers.utils.id("BASIC_FEATURE");
    const ADVANCED_FEATURE = ethers.utils.id("ADVANCED_FEATURE");
    const PREMIUM_FEATURE = ethers.utils.id("PREMIUM_FEATURE");
    
    // Check user1's access
    expect(await featureManager.hasFeatureAccess(BASIC_FEATURE, user1SoulId)).to.be.true;
    expect(await featureManager.hasFeatureAccess(ADVANCED_FEATURE, user1SoulId)).to.be.true;
    expect(await featureManager.hasFeatureAccess(PREMIUM_FEATURE, user1SoulId)).to.be.false;
    
    // Check user2's access
    expect(await featureManager.hasFeatureAccess(BASIC_FEATURE, user2SoulId)).to.be.false;
    expect(await featureManager.hasFeatureAccess(ADVANCED_FEATURE, user2SoulId)).to.be.false;
    expect(await featureManager.hasFeatureAccess(PREMIUM_FEATURE, user2SoulId)).to.be.false;
  });
  
  it("Should update access when reputation changes", async function() {
    const PREMIUM_FEATURE = ethers.utils.id("PREMIUM_FEATURE");
    
    // Initially user1 cannot access premium feature
    expect(await featureManager.hasFeatureAccess(PREMIUM_FEATURE, user1SoulId)).to.be.false;
    
    // Increase user1's reputation
    await reputationAsset.mintToSoul(user1SoulId, 30); // Total: 105
    
    // Now user1 should have access
    expect(await featureManager.hasFeatureAccess(PREMIUM_FEATURE, user1SoulId)).to.be.true;
    
    // Decrease user1's reputation
    await reputationAsset.burnFromSoul(user1SoulId, 10); // Total: 95
    
    // User1 should lose access
    expect(await featureManager.hasFeatureAccess(PREMIUM_FEATURE, user1SoulId)).to.be.false;
  });
  
  it("Should prevent using features without sufficient reputation", async function() {
    const PREMIUM_FEATURE = ethers.utils.id("PREMIUM_FEATURE");
    
    // User1 tries to use premium feature (should fail)
    await expect(
      featureManager.connect(user1).useFeature(PREMIUM_FEATURE)
    ).to.be.revertedWith("Feature not unlocked: insufficient reputation");
    
    // Increase user1's reputation
    await reputationAsset.mintToSoul(user1SoulId, 30); // Total: 105
    
    // Now user1 should be able to use the feature
    await expect(
      featureManager.connect(user1).useFeature(PREMIUM_FEATURE)
    ).to.not.be.reverted;
  });
});
```

## Conclusion

Implementing reputation-based access control creates a dynamic and engaging system that rewards users for positive contributions. By gating features, content, and actions based on reputation, you can create a progression system that encourages continued engagement and high-quality participation.

Key considerations for implementation:
1. Choose the right access control model (threshold, tier, or role-based)
2. Set appropriate reputation requirements for different features
3. Implement clear UI indicators for locked/unlocked features
4. Show users their progress toward unlocking new features
5. Test thoroughly to ensure access control works as expected

With these elements in place, reputation-based access control becomes a powerful tool for creating a self-regulating community with clear incentives for positive behavior.
