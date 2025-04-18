// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LSoulflowStakingRoute.sol";

/**
 * @title D4LSoulflowStakingRouteFactory
 * @dev Factory for deploying SoulStream Staking Routes
 */
contract D4LSoulflowStakingRouteFactory is Ownable {
    // Events
    event RouteImplementationDeployed(address indexed implementation, string name, uint8 routeType);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys a staking route implementation
     * @param name The name of the route
     * @param router The router address
     * @param registry The registry address
     * @param supportedChains Array of supported chain IDs
     * @param owner The owner of the route implementation
     * @param lockDuration The lock duration in seconds
     * @param rewardRate The reward rate
     * @return implementation The address of the deployed implementation
     */
    function deployStakingRouteImplementation(
        string memory name,
        address router,
        address registry,
        uint256[] memory supportedChains,
        address owner,
        uint256 lockDuration,
        uint256 rewardRate
    ) external onlyOwner returns (address implementation) {
        require(router != address(0), "D4LSoulflowStakingRouteFactory: router cannot be zero address");
        require(registry != address(0), "D4LSoulflowStakingRouteFactory: registry cannot be zero address");
        
        // Deploy the staking route implementation
        D4LSoulflowStakingRoute stakingRoute = new D4LSoulflowStakingRoute(
            name,
            router,
            registry,
            supportedChains,
            owner,
            lockDuration,
            rewardRate
        );
        
        implementation = address(stakingRoute);
        
        emit RouteImplementationDeployed(implementation, name, 1);
        
        return implementation;
    }
}
