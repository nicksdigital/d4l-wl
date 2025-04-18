# Integrating Reputation and Rewards Assets with SoulStream Protocol

This document outlines the steps to integrate the D4LReputationAsset and D4LRewardsAsset with the SoulStream Protocol.

## 1. Connecting Assets to SoulStream Protocol

### 1.1 Registry Integration

The first step is to ensure that the assets are properly registered with the SoulStream Registry:

```solidity
// Register the reputation asset with the SoulStream Registry
bytes32 reputationAssetId = soulStreamRegistry.registerAsset(
    reputationAsset.address,
    "Community Reputation",
    "CREP",
    3 // Asset type for reputation
);

// Register the rewards asset with the SoulStream Registry
bytes32 rewardsAssetId = soulStreamRegistry.registerAsset(
    rewardsAsset.address,
    "Community Rewards",
    "CRWD",
    4 // Asset type for rewards
);
```

### 1.2 Asset Factory Updates

Update the asset factories to automatically register newly created assets with the SoulStream Registry:

```solidity
// In D4LReputationAssetFactory.sol
function deployReputationAsset(
    string memory name,
    string memory symbol,
    bool transferable,
    bool divisible,
    bool consumable,
    address owner
) external onlyOwner returns (address asset) {
    // Deploy the reputation asset
    D4LReputationAsset reputationAsset = new D4LReputationAsset(
        name,
        symbol,
        transferable,
        divisible,
        consumable,
        soulManager,
        owner
    );

    asset = address(reputationAsset);

    // Register the asset with the SoulStream Registry
    ID4LSoulStreamRegistry(soulManager).registerAsset(
        asset,
        name,
        symbol,
        3 // Asset type for reputation
    );

    emit ReputationAssetDeployed(name, asset, owner);

    return asset;
}
```

Apply similar updates to the D4LRewardsAssetFactory.

## 2. Implementing Routing for Reputation and Rewards

### 2.1 Route Registration

Define standard routes for reputation and rewards assets:

```solidity
// Register a reputation transfer route
bytes32 reputationRouteId = soulStreamRegistry.registerRoute(
    sourceSoulId,
    destinationSoulId,
    reputationAsset.address,
    1, // Action: Transfer
    constraintHash,
    router.address
);

// Register a reward claim route
bytes32 rewardClaimRouteId = soulStreamRegistry.registerRoute(
    userSoulId,
    ethers.ZeroAddress, // No destination for claiming
    rewardsAsset.address,
    2, // Action: Claim
    constraintHash,
    router.address
);
```

### 2.2 Route Constraints

Implement constraint handlers for reputation and rewards routes:

```solidity
// Reputation transfer constraints
contract ReputationConstraintHandler is IConstraintHandler {
    function validateConstraint(
        bytes32 routeId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        bytes memory constraintData
    ) external view override returns (bool) {
        // Parse constraint data
        (uint256 minReputation, uint256 maxTransferAmount) = abi.decode(
            constraintData,
            (uint256, uint256)
        );
        
        // Check if source has minimum reputation
        ID4LReputationAsset reputationAsset = ID4LReputationAsset(asset);
        if (reputationAsset.balanceOfSoul(fromSoul) < minReputation) {
            return false;
        }
        
        // Check if transfer amount is within limits
        if (amount > maxTransferAmount) {
            return false;
        }
        
        return true;
    }
}

// Reward claim constraints
contract RewardClaimConstraintHandler is IConstraintHandler {
    function validateConstraint(
        bytes32 routeId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        bytes memory constraintData
    ) external view override returns (bool) {
        // Parse constraint data
        uint256 minClaimAmount = abi.decode(constraintData, (uint256));
        
        // Check if claim amount meets minimum
        if (amount < minClaimAmount) {
            return false;
        }
        
        // Check if user has enough pending rewards
        ID4LRewardsAsset rewardsAsset = ID4LRewardsAsset(asset);
        if (rewardsAsset.getPendingRewards(fromSoul) < amount) {
            return false;
        }
        
        return true;
    }
}
```

### 2.3 Router Implementation

Extend the Soulflow Router to handle reputation and rewards routing:

```solidity
// In D4LSoulflowRouter.sol
function routeReputationAsset(
    bytes32 routeId,
    address fromSoul,
    address toSoul,
    uint256 amount
) external returns (bool) {
    // Get the route
    SoulflowRoute memory route = soulStreamRegistry.getRoute(routeId);
    
    // Verify route is valid
    require(route.active, "Route is not active");
    require(route.asset != address(0), "Invalid asset");
    require(route.action == 1, "Invalid action"); // 1 = Transfer
    
    // Verify caller is authorized
    require(
        ID4LSoulIdentity(fromSoul).isAuthorizedCaller(msg.sender),
        "Caller not authorized"
    );
    
    // Verify route is authorized by the source soul
    require(
        ID4LSoulIdentity(fromSoul).authorizedRoutes(routeId),
        "Route not authorized"
    );
    
    // Validate constraints
    require(
        validateConstraints(routeId, fromSoul, toSoul, route.asset, amount),
        "Constraints not satisfied"
    );
    
    // Execute the transfer
    ID4LReputationAsset(route.asset).transferBetweenSouls(
        fromSoul,
        toSoul,
        amount
    );
    
    emit AssetRouted(routeId, fromSoul, toSoul, route.asset, amount);
    
    return true;
}

function routeRewardClaim(
    bytes32 routeId,
    address fromSoul,
    uint256 amount
) external returns (bool) {
    // Get the route
    SoulflowRoute memory route = soulStreamRegistry.getRoute(routeId);
    
    // Verify route is valid
    require(route.active, "Route is not active");
    require(route.asset != address(0), "Invalid asset");
    require(route.action == 2, "Invalid action"); // 2 = Claim
    
    // Verify caller is authorized
    require(
        ID4LSoulIdentity(fromSoul).isAuthorizedCaller(msg.sender),
        "Caller not authorized"
    );
    
    // Verify route is authorized by the source soul
    require(
        ID4LSoulIdentity(fromSoul).authorizedRoutes(routeId),
        "Route not authorized"
    );
    
    // Validate constraints
    require(
        validateConstraints(routeId, fromSoul, address(0), route.asset, amount),
        "Constraints not satisfied"
    );
    
    // Execute the claim
    ID4LRewardsAsset(route.asset).claimRewards(fromSoul);
    
    emit RewardsClaimed(routeId, fromSoul, route.asset, amount);
    
    return true;
}
```

## 3. Cross-Chain Routing

For cross-chain routing of reputation and rewards:

```solidity
// In D4LSoulflowBridgeAdapter.sol
function routeReputationCrossChain(
    bytes32 routeId,
    address fromSoul,
    address toSoul,
    uint256 amount,
    uint256 destinationChainId
) external payable returns (bool) {
    // Get the route
    SoulflowRoute memory route = soulStreamRegistry.getRoute(routeId);
    
    // Verify route is valid for cross-chain
    require(route.active, "Route is not active");
    require(route.asset != address(0), "Invalid asset");
    require(route.action == 3, "Invalid action"); // 3 = Cross-chain transfer
    
    // Verify caller is authorized
    require(
        ID4LSoulIdentity(fromSoul).isAuthorizedCaller(msg.sender),
        "Caller not authorized"
    );
    
    // Verify route is authorized by the source soul
    require(
        ID4LSoulIdentity(fromSoul).authorizedRoutes(routeId),
        "Route not authorized"
    );
    
    // Validate constraints
    require(
        validateConstraints(routeId, fromSoul, toSoul, route.asset, amount),
        "Constraints not satisfied"
    );
    
    // Lock the reputation on source chain
    ID4LReputationAsset(route.asset).lockForCrossChain(
        fromSoul,
        amount
    );
    
    // Send cross-chain message
    bytes memory payload = abi.encode(
        routeId,
        fromSoul,
        toSoul,
        route.asset,
        amount
    );
    
    lzEndpoint.send{value: msg.value}(
        destinationChainId,
        abi.encodePacked(remoteAddress, address(this)),
        payload,
        payable(msg.sender),
        address(0),
        bytes("")
    );
    
    emit CrossChainRouteInitiated(
        routeId,
        fromSoul,
        toSoul,
        route.asset,
        amount,
        destinationChainId
    );
    
    return true;
}
```

## 4. Asset-Specific Route Actions

Define specialized route actions for reputation and rewards assets:

### 4.1 Reputation Actions

```solidity
// Action types for reputation assets
uint8 constant REPUTATION_TRANSFER = 1;
uint8 constant REPUTATION_MINT = 2;
uint8 constant REPUTATION_BURN = 3;
uint8 constant REPUTATION_DECAY = 4;
```

### 4.2 Rewards Actions

```solidity
// Action types for rewards assets
uint8 constant REWARDS_TRANSFER = 1;
uint8 constant REWARDS_CLAIM = 2;
uint8 constant REWARDS_DISTRIBUTE = 3;
uint8 constant REWARDS_EXPIRE = 4;
```

## 5. Integration Testing

Create comprehensive tests for the integration:

```javascript
describe("Reputation and Rewards Integration with SoulStream", function() {
  it("Should register reputation asset with SoulStream Registry", async function() {
    // Test code
  });
  
  it("Should register rewards asset with SoulStream Registry", async function() {
    // Test code
  });
  
  it("Should create and authorize reputation transfer route", async function() {
    // Test code
  });
  
  it("Should create and authorize reward claim route", async function() {
    // Test code
  });
  
  it("Should route reputation between souls", async function() {
    // Test code
  });
  
  it("Should route reward claims", async function() {
    // Test code
  });
  
  it("Should enforce constraints on reputation routes", async function() {
    // Test code
  });
  
  it("Should enforce constraints on reward routes", async function() {
    // Test code
  });
});
```

## 6. Conclusion

By following these integration steps, the reputation and rewards assets will be fully integrated with the SoulStream Protocol, enabling:

- Routing of reputation scores between Soul Identities
- Routing of reward claims and distributions
- Cross-chain reputation and rewards management
- Constraint-based routing for reputation and rewards
- Specialized actions for different asset types

This integration creates a powerful framework for building reputation and rewards systems that leverage the full capabilities of the SoulStream Protocol.
