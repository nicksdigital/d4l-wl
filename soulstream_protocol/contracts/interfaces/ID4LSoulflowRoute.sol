// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LSoulflowRoute
 * @dev Interface for Soulflow routes
 */
interface ID4LSoulflowRoute {
    /**
     * @dev Struct for SoulflowRoute
     */
    struct SoulflowRoute {
        address fromSoul;
        address toSoul;
        address asset;
        uint8 action; // e.g., 0 = read, 1 = stake, 2 = forward
        bytes32 constraintHash; // e.g., merkle root of constraints
        address router; // The router that handles this route
        bool active; // Whether the route is active
    }
    
    /**
     * @dev Event emitted when a route is registered
     */
    event RouteRegistered(
        bytes32 indexed routeId,
        address indexed fromSoul,
        address indexed toSoul,
        address asset,
        uint8 action,
        bytes32 constraintHash,
        address router
    );
    
    /**
     * @dev Event emitted when a route is updated
     */
    event RouteUpdated(
        bytes32 indexed routeId,
        address router,
        bool active
    );
    
    /**
     * @dev Registers a new route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param action The action code
     * @param constraintHash The constraint hash
     * @param router The router address
     * @return routeId The ID of the registered route
     */
    function registerRoute(
        address fromSoul,
        address toSoul,
        address asset,
        uint8 action,
        bytes32 constraintHash,
        address router
    ) external returns (bytes32 routeId);
    
    /**
     * @dev Updates a route
     * @param routeId The ID of the route to update
     * @param router The new router address (or zero address to keep current)
     * @param active Whether the route should be active
     */
    function updateRoute(
        bytes32 routeId,
        address router,
        bool active
    ) external;
    
    /**
     * @dev Gets the router for a route
     * @param routeId The ID of the route
     * @return router The router address
     */
    function getRouterForRoute(bytes32 routeId) external view returns (address);
    
    /**
     * @dev Gets a route by ID
     * @param routeId The ID of the route
     * @return route The route information
     */
    function getRoute(bytes32 routeId) external view returns (SoulflowRoute memory route);
}
