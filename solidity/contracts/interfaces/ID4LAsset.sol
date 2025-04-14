// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LAsset
 * @dev Interface for assets that can be routed through the D4L SoulStream protocol
 * and linked to soulbound identities
 */
interface ID4LAsset {
    /**
     * @dev Event emitted when an asset is linked to a soul identity
     */
    event AssetLinked(address indexed asset, address indexed soulId, uint256 amount);
    
    /**
     * @dev Event emitted when an asset is unlinked from a soul identity
     */
    event AssetUnlinked(address indexed asset, address indexed soulId, uint256 amount);
    
    /**
     * @dev Event emitted when an asset is transferred between soul identities
     */
    event AssetTransferred(address indexed asset, address indexed fromSoul, address indexed toSoul, uint256 amount);
    
    /**
     * @dev Links an asset to a soul identity
     * @param soulId The soul identity to link the asset to
     * @param amount The amount of the asset to link
     * @return success Whether the linking was successful
     */
    function linkToSoul(address soulId, uint256 amount) external returns (bool success);
    
    /**
     * @dev Unlinks an asset from a soul identity
     * @param soulId The soul identity to unlink the asset from
     * @param amount The amount of the asset to unlink
     * @return success Whether the unlinking was successful
     */
    function unlinkFromSoul(address soulId, uint256 amount) external returns (bool success);
    
    /**
     * @dev Transfers an asset between soul identities
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The amount of the asset to transfer
     * @return success Whether the transfer was successful
     */
    function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) external returns (bool success);
    
    /**
     * @dev Gets the amount of an asset linked to a soul identity
     * @param soulId The soul identity to check
     * @return amount The amount of the asset linked to the soul identity
     */
    function balanceOfSoul(address soulId) external view returns (uint256 amount);
    
    /**
     * @dev Gets the total amount of the asset linked to all soul identities
     * @return amount The total amount of the asset linked to all soul identities
     */
    function totalLinkedAmount() external view returns (uint256 amount);
    
    /**
     * @dev Checks if an asset can be routed through a specific route
     * @param routeId The ID of the route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The amount of the asset to route
     * @return canRoute Whether the asset can be routed
     */
    function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) external view returns (bool canRoute);
    
    /**
     * @dev Gets the asset type
     * @return assetType The type of the asset (1 = ERC20, 2 = ERC721, 3 = ERC1155, 4 = Native, 5 = Custom)
     */
    function assetType() external view returns (uint8 assetType);
    
    /**
     * @dev Gets the asset metadata
     * @return name The name of the asset
     * @return symbol The symbol of the asset
     * @return decimals The number of decimals for the asset
     */
    function assetMetadata() external view returns (string memory name, string memory symbol, uint8 decimals);
    
    /**
     * @dev Gets the asset constraints
     * @return transferable Whether the asset is transferable between souls
     * @return divisible Whether the asset is divisible
     * @return consumable Whether the asset is consumable
     */
    function assetConstraints() external view returns (bool transferable, bool divisible, bool consumable);
}
