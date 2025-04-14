# D4L Asset System

The D4L Asset System provides a flexible framework for linking various types of assets to soulbound identities in the D4L SoulStream protocol. This system allows for the creation of non-transferable or selectively transferable assets that can be routed through the SoulStream protocol.

## Key Components

### ID4LAsset Interface

The `ID4LAsset` interface defines the standard methods that all D4L assets must implement. This interface provides a unified way to interact with different types of assets, regardless of their underlying implementation.

Key features:
- Link assets to soul identities
- Unlink assets from soul identities
- Transfer assets between soul identities
- Query asset balances and metadata
- Define asset constraints (transferability, divisibility, consumability)

### Asset Implementations

#### D4LERC20Asset

The `D4LERC20Asset` contract wraps an existing ERC20 token and adds soulbound functionality. This allows for the creation of fungible soulbound assets that can be linked to soul identities.

Key features:
- Wrap existing ERC20 tokens
- Link tokens to soul identities
- Transfer tokens between soul identities
- Define constraints on token transferability

#### D4LERC721Asset

The `D4LERC721Asset` contract wraps an existing ERC721 token and adds soulbound functionality. This allows for the creation of non-fungible soulbound assets that can be linked to soul identities.

Key features:
- Wrap existing ERC721 tokens
- Link NFTs to soul identities
- Transfer NFTs between soul identities
- Define constraints on NFT transferability

### D4LAssetFactory

The `D4LAssetFactory` contract provides a convenient way to deploy new asset wrappers. It supports the creation of both ERC20 and ERC721 asset wrappers.

## Integration with SoulStream Protocol

The D4L Asset System integrates seamlessly with the SoulStream protocol, allowing assets to be routed through the protocol's flow-based routing system. The `D4LSoulflowRouter` has been updated to support the new asset types, enabling the following operations:

- Stake assets
- Forward assets
- Split assets
- Lock assets
- Unlock assets

## Usage Examples

### Linking ERC20 Tokens to a Soul Identity

```solidity
// Approve the asset contract to spend tokens
await mockERC20.approve(erc20Asset.address, 1000);

// Link tokens to the soul
await erc20Asset.linkToSoul(soulId, 1000);
```

### Transferring Assets Between Soul Identities

```solidity
// Transfer tokens between souls
await erc20Asset.transferBetweenSouls(fromSoulId, toSoulId, 500);
```

### Routing Assets Through the SoulStream Protocol

```solidity
// Register a route
const routeId = await soulStreamRegistry.registerRoute(
    fromSoulId,
    toSoulId,
    erc20Asset.address,
    ACTION_FORWARD,
    constraintHash,
    router.address
);

// Authorize the route for the asset
await erc20Asset.authorizeRoute(routeId, true);

// Route the asset
await router.routeAsset(routeId, 100);
```

## Asset Constraints

Each asset can define its own constraints:

- **Transferable**: Whether the asset can be transferred between soul identities
- **Divisible**: Whether the asset can be divided into smaller units
- **Consumable**: Whether the asset can be consumed (used up)

These constraints are enforced by the asset implementation and can be queried using the `assetConstraints()` method.

## Asset Types

The system supports different asset types, identified by a numeric code:

1. ERC20 (fungible tokens)
2. ERC721 (non-fungible tokens)
3. ERC1155 (semi-fungible tokens)
4. Native (ETH or other native currencies)
5. Custom (other asset types)

## Security Considerations

- All asset implementations follow the Checks-Effects-Interactions (CEI) pattern to prevent reentrancy attacks
- Access control is enforced using OpenZeppelin's Ownable contract
- Input validation is performed on all external functions
- Recovery mechanisms are provided to handle accidentally sent tokens
