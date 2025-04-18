// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC1967.sol";
import "./interfaces/ITokenImplementation.sol";
import "./interfaces/ITokenUpgrader.sol";

/**
 * @title TokenUpgrader
 * @dev Contract for upgrading individual token instances
 */
contract TokenUpgrader is Ownable, ITokenUpgrader {
    /**
     * @dev Constructor that sets the owner of the upgrader
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Upgrades a specific token to a new implementation
     * @param tokenAddress The address of the token to upgrade
     * @param newImplementation The address of the new implementation
     */
    function upgradeToken(address tokenAddress, address newImplementation) external onlyOwner {
        require(tokenAddress != address(0), "TokenUpgrader: token address cannot be zero");
        require(newImplementation != address(0), "TokenUpgrader: new implementation cannot be zero");
        
        // Ensure the token owner is this contract before upgrading
        try ITokenImplementation(tokenAddress).owner() returns (address tokenOwner) {
            require(tokenOwner == address(this), "TokenUpgrader: not the owner of the token");
        } catch {
            revert("TokenUpgrader: failed to check token ownership");
        }
        
        // Get the UUPSUpgradeable interface and call upgradeTo
        // We use a low-level call to handle the function call
        (bool success, ) = tokenAddress.call(
            abi.encodeWithSignature("upgradeTo(address)", newImplementation)
        );
        require(success, "TokenUpgrader: upgrade failed");
        
        emit TokenUpgraded(tokenAddress, newImplementation);
    }
    
    /**
     * @dev Transfers ownership of a token to a new owner
     * @param tokenAddress The address of the token
     * @param newOwner The address of the new owner
     */
    function transferTokenOwnership(address tokenAddress, address newOwner) external onlyOwner {
        require(tokenAddress != address(0), "TokenUpgrader: token address cannot be zero");
        require(newOwner != address(0), "TokenUpgrader: new owner cannot be zero");
        
        ITokenImplementation token = ITokenImplementation(tokenAddress);
        
        // Ensure the token owner is this contract before transferring ownership
        try token.owner() returns (address tokenOwner) {
            require(tokenOwner == address(this), "TokenUpgrader: not the owner of the token");
        } catch {
            revert("TokenUpgrader: failed to check token ownership");
        }
        
        // Transfer ownership
        token.transferOwnership(newOwner);
    }
}
