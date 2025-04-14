// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "../interfaces/ID4LSoulflowRoute.sol";

/**
 * @title D4LSoulflowRouteLib
 * @dev Library for managing Soulflow routes
 */
library D4LSoulflowRouteLib {
    /**
     * @dev Calculates the route ID from its components
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param action The action code
     * @param constraintHash The constraint hash
     * @return routeId The calculated route ID
     */
    function calculateRouteId(
        address fromSoul,
        address toSoul,
        address asset,
        uint8 action,
        bytes32 constraintHash
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(fromSoul, toSoul, asset, action, constraintHash));
    }
    
    /**
     * @dev Validates route parameters
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param router The router address
     * @param isSoulIdentity Function to check if an address is a soul identity
     * @return isValid Whether the parameters are valid
     * @return errorMessage Error message if invalid
     */
    function validateRouteParams(
        address fromSoul,
        address toSoul,
        address router,
        function(address) view returns (bool) isSoulIdentity
    ) internal view returns (bool isValid, string memory errorMessage) {
        if (!isSoulIdentity(fromSoul)) {
            return (false, "D4LSoulflowRouteLib: fromSoul is not a soul identity");
        }
        
        if (toSoul != address(0) && !isSoulIdentity(toSoul)) {
            return (false, "D4LSoulflowRouteLib: toSoul is not a soul identity");
        }
        
        if (router == address(0)) {
            return (false, "D4LSoulflowRouteLib: router cannot be zero address");
        }
        
        return (true, "");
    }
    
    /**
     * @dev Creates a new route
     * @param routes Mapping of route IDs to routes
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param action The action code
     * @param constraintHash The constraint hash
     * @param router The router address
     * @return routeId The ID of the created route
     */
    function createRoute(
        mapping(bytes32 => ID4LSoulflowRoute.SoulflowRoute) storage routes,
        address fromSoul,
        address toSoul,
        address asset,
        uint8 action,
        bytes32 constraintHash,
        address router
    ) internal returns (bytes32 routeId) {
        // Calculate the route ID
        routeId = calculateRouteId(fromSoul, toSoul, asset, action, constraintHash);
        
        // Check if the route already exists
        require(routes[routeId].router == address(0), "D4LSoulflowRouteLib: route already registered");
        
        // Register the route
        routes[routeId] = ID4LSoulflowRoute.SoulflowRoute({
            fromSoul: fromSoul,
            toSoul: toSoul,
            asset: asset,
            action: action,
            constraintHash: constraintHash,
            router: router,
            active: true
        });
        
        return routeId;
    }
    
    /**
     * @dev Updates a route
     * @param routes Mapping of route IDs to routes
     * @param routeId The ID of the route to update
     * @param router The new router address (or zero address to keep current)
     * @param active Whether the route should be active
     */
    function updateRoute(
        mapping(bytes32 => ID4LSoulflowRoute.SoulflowRoute) storage routes,
        bytes32 routeId,
        address router,
        bool active
    ) internal {
        require(routes[routeId].router != address(0), "D4LSoulflowRouteLib: route not registered");
        
        ID4LSoulflowRoute.SoulflowRoute storage route = routes[routeId];
        
        // Update router if provided
        if (router != address(0)) {
            route.router = router;
        }
        
        // Update active status
        route.active = active;
    }
}
