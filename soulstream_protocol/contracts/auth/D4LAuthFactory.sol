// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LAuth.sol";
import "../utils/D4LErrors.sol";

// Custom errors
error AuthAlreadyDeployed();

/**
 * @title D4LAuthFactory
 * @dev Factory for deploying D4LAuth contracts
 */
contract D4LAuthFactory is Ownable {
    // The deployed auth contract
    address public authContract;

    // Events
    event AuthDeployed(address indexed authContract, address admin, address registry, uint256 sessionDuration);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys a new D4LAuth contract
     * @param admin The admin address
     * @param registry The SoulStream registry address
     * @param sessionDuration The session duration in seconds
     * @return authAddress The address of the deployed auth contract
     */
    function deployAuth(
        address admin,
        address registry,
        uint256 sessionDuration
    ) external onlyOwner returns (address authAddress) {
        if (admin == address(0)) revert ZeroAddress();

        if (authContract != address(0)) revert AuthAlreadyDeployed();

        // Deploy the auth contract
        D4LAuth auth = new D4LAuth(
            admin,
            registry,
            sessionDuration
        );

        authContract = address(auth);

        emit AuthDeployed(authContract, admin, registry, sessionDuration);

        return authContract;
    }
}
