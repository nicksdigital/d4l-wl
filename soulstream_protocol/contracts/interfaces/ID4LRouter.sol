// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LRouter
 * @dev Interface for the D4L Router that supports dynamic route registration
 */
interface ID4LRouter {
    /**
     * @dev Struct to define a route
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param active Whether the route is active
     * @param routeType Type of the route (0 = swap, 1 = liquidity, etc.)
     * @param selector Function selector for the route
     */
    struct Route {
        string name;
        address implementation;
        bool active;
        uint8 routeType;
        bytes4 selector;
    }

    /**
     * @dev Event emitted when a new route is registered
     */
    event RouteRegistered(
        bytes32 indexed routeId,
        string name,
        address implementation,
        uint8 routeType,
        bytes4 selector
    );

    /**
     * @dev Event emitted when a route is updated
     */
    event RouteUpdated(
        bytes32 indexed routeId,
        address implementation,
        bool active
    );

    /**
     * @dev Event emitted when a route is executed
     */
    event RouteExecuted(
        bytes32 indexed routeId,
        address indexed caller,
        bytes4 selector,
        bool success
    );

    /**
     * @dev Registers a new route
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param routeType Type of the route
     * @param selector Function selector for the route
     * @return routeId Unique identifier for the route
     */
    function registerRoute(
        string calldata name,
        address implementation,
        uint8 routeType,
        bytes4 selector
    ) external returns (bytes32 routeId);

    /**
     * @dev Updates an existing route
     * @param routeId ID of the route to update
     * @param implementation New implementation address (or zero address to keep current)
     * @param active Whether the route should be active
     */
    function updateRoute(
        bytes32 routeId,
        address implementation,
        bool active
    ) external;

    /**
     * @dev Executes a route
     * @param routeId ID of the route to execute
     * @param data Calldata to pass to the route implementation
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeRoute(
        bytes32 routeId,
        bytes calldata data
    ) external payable returns (bool success, bytes memory result);

    /**
     * @dev Gets information about a route
     * @param routeId ID of the route
     * @return route The route information
     */
    function getRoute(bytes32 routeId) external view returns (Route memory);

    /**
     * @dev Gets all registered route IDs
     * @return routeIds Array of all registered route IDs
     */
    function getAllRouteIds() external view returns (bytes32[] memory);

    /**
     * @dev Gets all routes of a specific type
     * @param routeType Type of routes to get
     * @return routeIds Array of route IDs of the specified type
     */
    function getRoutesByType(uint8 routeType) external view returns (bytes32[] memory);

    /**
     * @dev Checks if a route exists and is active
     * @param routeId ID of the route
     * @return exists Whether the route exists and is active
     */
    function routeExists(bytes32 routeId) external view returns (bool);

    /**
     * @dev Calculates the route ID from its components
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param routeType Type of the route
     * @param selector Function selector for the route
     * @return routeId The calculated route ID
     */
    function calculateRouteId(
        string calldata name,
        address implementation,
        uint8 routeType,
        bytes4 selector
    ) external pure returns (bytes32);
}
