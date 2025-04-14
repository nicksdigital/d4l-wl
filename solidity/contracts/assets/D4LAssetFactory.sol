// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ID4LAsset.sol";
import "./D4LERC20Asset.sol";
import "./D4LERC721Asset.sol";

/**
 * @title D4LAssetFactory
 * @dev Factory for deploying D4L asset wrappers
 */
contract D4LAssetFactory is Ownable, ReentrancyGuard {
    // Mapping of deployed assets
    mapping(address => address[]) private _deployedAssets; // token => [asset1, asset2, ...]

    // Registry of all deployed assets
    address[] public allAssets;

    // The soul identity manager
    address public immutable soulManager;

    // Events
    event ERC20AssetDeployed(
        address indexed token,
        address indexed asset,
        bool transferable,
        bool divisible,
        bool consumable,
        address owner
    );

    event ERC721AssetDeployed(
        address indexed token,
        address indexed asset,
        bool transferable,
        bool consumable,
        address owner
    );

    /**
     * @dev Constructor
     * @param _soulManager The address of the soul identity manager
     * @param _owner The owner of the factory
     */
    constructor(address _soulManager, address _owner) Ownable(_owner) {
        require(_soulManager != address(0), "D4LAssetFactory: soul manager cannot be zero address");
        soulManager = _soulManager;
    }

    /**
     * @dev Deploys a new ERC20 asset wrapper
     * @param token The address of the ERC20 token to wrap
     * @param transferable Whether the asset is transferable between souls
     * @param divisible Whether the asset is divisible
     * @param consumable Whether the asset is consumable
     * @param assetOwner The owner of the deployed asset
     * @return asset The address of the deployed asset
     */
    function deployERC20Asset(
        address token,
        bool transferable,
        bool divisible,
        bool consumable,
        address assetOwner
    ) external nonReentrant returns (address asset) {
        // Validate parameters
        require(token != address(0), "D4LAssetFactory: token cannot be zero address");
        require(assetOwner != address(0), "D4LAssetFactory: asset owner cannot be zero address");

        // Deploy the asset
        D4LERC20Asset erc20Asset = new D4LERC20Asset(
            token,
            soulManager,
            transferable,
            divisible,
            consumable,
            assetOwner
        );

        asset = address(erc20Asset);

        // Register the asset
        _deployedAssets[token].push(asset);
        allAssets.push(asset);

        emit ERC20AssetDeployed(
            token,
            asset,
            transferable,
            divisible,
            consumable,
            assetOwner
        );

        return asset;
    }

    /**
     * @dev Gets all assets deployed for a token
     * @param token The address of the token
     * @return assets Array of deployed asset addresses
     */
    function getAssetsForToken(address token) external view returns (address[] memory) {
        return _deployedAssets[token];
    }

    /**
     * @dev Gets the total number of deployed assets
     * @return count The total number of deployed assets
     */
    function getAssetCount() external view returns (uint256) {
        return allAssets.length;
    }

    /**
     * @dev Deploys a new ERC721 asset wrapper
     * @param token The address of the ERC721 token to wrap
     * @param transferable Whether the asset is transferable between souls
     * @param consumable Whether the asset is consumable
     * @param assetOwner The owner of the deployed asset
     * @return asset The address of the deployed asset
     */
    function deployERC721Asset(
        address token,
        bool transferable,
        bool consumable,
        address assetOwner
    ) external nonReentrant returns (address asset) {
        // Validate parameters
        require(token != address(0), "D4LAssetFactory: token cannot be zero address");
        require(assetOwner != address(0), "D4LAssetFactory: asset owner cannot be zero address");

        // Deploy the asset
        D4LERC721Asset erc721Asset = new D4LERC721Asset(
            token,
            soulManager,
            transferable,
            consumable,
            assetOwner
        );

        asset = address(erc721Asset);

        // Register the asset
        _deployedAssets[token].push(asset);
        allAssets.push(asset);

        emit ERC721AssetDeployed(
            token,
            asset,
            transferable,
            consumable,
            assetOwner
        );

        return asset;
    }

    /**
     * @dev Gets a batch of deployed assets
     * @param startIndex The starting index
     * @param count The number of assets to retrieve
     * @return assets Array of deployed asset addresses
     */
    function getAssetBatch(uint256 startIndex, uint256 count) external view returns (address[] memory) {
        require(startIndex < allAssets.length, "D4LAssetFactory: start index out of bounds");

        // Adjust count if it exceeds the array bounds
        if (startIndex + count > allAssets.length) {
            count = allAssets.length - startIndex;
        }

        address[] memory assets = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            assets[i] = allAssets[startIndex + i];
        }

        return assets;
    }
}
