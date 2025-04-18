// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LSoulStreamRegistryImpl.sol";

/**
 * @title D4LSoulStreamRegistryFactory
 * @dev Factory for deploying SoulStream Registry
 */
contract D4LSoulStreamRegistryFactory is Ownable {
    // Events
    event RegistryDeployed(address indexed registry);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys the registry
     * @param admin The admin address
     * @return registryAddress The address of the deployed registry
     */
    function deployRegistry(
        address admin
    ) external onlyOwner returns (address registryAddress) {
        // Deploy the registry
        D4LSoulStreamRegistryImpl registryContract = new D4LSoulStreamRegistryImpl(admin);
        
        emit RegistryDeployed(address(registryContract));
        
        return address(registryContract);
    }
}
