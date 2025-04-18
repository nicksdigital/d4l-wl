// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenUpgrader
 * @dev Interface for the TokenUpgrader contract
 */
interface ITokenUpgrader {
    /**
     * @dev Event emitted when a token is upgraded
     */
    event TokenUpgraded(address indexed tokenAddress, address indexed newImplementation);
    
    /**
     * @dev Upgrades a specific token to a new implementation
     * @param tokenAddress The address of the token to upgrade
     * @param newImplementation The address of the new implementation
     */
    function upgradeToken(address tokenAddress, address newImplementation) external;
    
    /**
     * @dev Transfers ownership of a token to a new owner
     * @param tokenAddress The address of the token
     * @param newOwner The address of the new owner
     */
    function transferTokenOwnership(address tokenAddress, address newOwner) external;
}
