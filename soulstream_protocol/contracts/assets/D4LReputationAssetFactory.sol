// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LReputationAsset.sol";

/**
 * @title D4LReputationAssetFactory
 * @dev Factory for deploying reputation assets
 */
contract D4LReputationAssetFactory is Ownable {
    // The soul manager contract
    address public soulManager;

    // Events
    event ReputationAssetDeployed(string name, address indexed asset, address owner);

    /**
     * @dev Constructor
     * @param soulManager_ The address of the soul manager contract
     * @param initialOwner The initial owner of the contract
     */
    constructor(address soulManager_, address initialOwner) Ownable(initialOwner) {
        soulManager = soulManager_;
    }

    /**
     * @dev Deploys a new reputation asset
     * @param name The name of the reputation asset
     * @param symbol The symbol of the reputation asset
     * @param transferable Whether the asset is transferable
     * @param divisible Whether the asset is divisible
     * @param consumable Whether the asset is consumable
     * @param owner The owner of the reputation asset
     * @return asset The address of the deployed reputation asset
     */
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

        emit ReputationAssetDeployed(name, asset, owner);

        return asset;
    }
}
