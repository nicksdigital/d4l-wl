// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LRewardsAsset.sol";

/**
 * @title D4LRewardsAssetFactory
 * @dev Factory for deploying rewards assets
 */
contract D4LRewardsAssetFactory is Ownable {
    // The soul manager contract
    address public soulManager;

    // Events
    event RewardsAssetDeployed(string name, address indexed asset, address owner);

    /**
     * @dev Constructor
     * @param soulManager_ The address of the soul manager contract
     * @param initialOwner The initial owner of the contract
     */
    constructor(address soulManager_, address initialOwner) Ownable(initialOwner) {
        soulManager = soulManager_;
    }

    /**
     * @dev Deploys a new rewards asset
     * @param rewardToken The address of the reward token
     * @param name The name of the rewards asset
     * @param symbol The symbol of the rewards asset
     * @param transferable Whether the asset is transferable
     * @param divisible Whether the asset is divisible
     * @param consumable Whether the asset is consumable
     * @param owner The owner of the rewards asset
     * @return asset The address of the deployed rewards asset
     */
    function deployRewardsAsset(
        address rewardToken,
        string memory name,
        string memory symbol,
        bool transferable,
        bool divisible,
        bool consumable,
        address owner
    ) external onlyOwner returns (address asset) {
        // Deploy the rewards asset
        D4LRewardsAsset rewardsAsset = new D4LRewardsAsset(
            rewardToken,
            name,
            symbol,
            transferable,
            divisible,
            consumable,
            soulManager,
            owner
        );

        asset = address(rewardsAsset);

        emit RewardsAssetDeployed(name, asset, owner);

        return asset;
    }
}
