// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ITokenImplementation.sol";

/**
 * @title ITokenImplementationV2
 * @dev Interface for the TokenImplementationV2 contract
 */
interface ITokenImplementationV2 is ITokenImplementation {
    /**
     * @dev Initializes the V2 specific variables
     * @param _maxTransferAmount The maximum amount that can be transferred in a single transaction
     */
    function initializeV2(uint256 _maxTransferAmount) external;
    
    /**
     * @dev Returns if the token is paused
     */
    function paused() external view returns (bool);
    
    /**
     * @dev Pauses all token transfers
     */
    function pause() external;
    
    /**
     * @dev Unpauses all token transfers
     */
    function unpause() external;
    
    /**
     * @dev Checks if an address is blacklisted
     * @param account The address to check
     */
    function blacklisted(address account) external view returns (bool);
    
    /**
     * @dev Adds an address to the blacklist
     * @param account The address to blacklist
     */
    function blacklist(address account) external;
    
    /**
     * @dev Removes an address from the blacklist
     * @param account The address to remove from the blacklist
     */
    function unblacklist(address account) external;
    
    /**
     * @dev Returns the maximum transfer amount
     */
    function maxTransferAmount() external view returns (uint256);
    
    /**
     * @dev Sets the maximum transfer amount
     * @param amount The new maximum transfer amount
     */
    function setMaxTransferAmount(uint256 amount) external;
}
