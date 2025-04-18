// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LSoulflowRouter.sol";

/**
 * @title D4LSoulflowRouterFactory
 * @dev Factory for deploying SoulStream Router
 */
contract D4LSoulflowRouterFactory is Ownable {
    // Events
    event RouterDeployed(address indexed router);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys the router
     * @param admin The admin address
     * @param registry The registry address
     * @return routerAddress The address of the deployed router
     */
    function deployRouter(
        address admin,
        address registry
    ) external onlyOwner returns (address routerAddress) {
        require(registry != address(0), "D4LSoulflowRouterFactory: registry cannot be zero address");
        
        // Deploy the router
        D4LSoulflowRouter routerContract = new D4LSoulflowRouter(admin, registry);
        
        emit RouterDeployed(address(routerContract));
        
        return address(routerContract);
    }
}
