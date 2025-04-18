// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LMultichainRouter
 * @dev Interface for the D4L Multichain Router that supports dynamic route registration
 */
interface ID4LMultichainRouter {
    /**
     * @dev Enum for permission levels
     */
    enum PermissionLevel {
        NONE,
        USER,
        ADMIN,
        SYSTEM
    }

    /**
     * @dev Struct to define a chain
     * @param chainId The ID of the chain
     * @param name The name of the chain
     * @param active Whether the chain is active
     * @param bridgeAdapter The address of the bridge adapter for this chain
     */
    struct Chain {
        uint256 chainId;
        string name;
        bool active;
        address bridgeAdapter;
    }

    /**
     * @dev Struct to define a route
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param active Whether the route is active
     * @param routeType Type of the route (0 = swap, 1 = liquidity, etc.)
     * @param selector Function selector for the route
     * @param permissionLevel Required permission level for this route
     * @param supportedChains Array of chain IDs this route supports
     */
    struct Route {
        string name;
        address implementation;
        bool active;
        uint8 routeType;
        bytes4 selector;
        PermissionLevel permissionLevel;
        uint256[] supportedChains;
    }

    /**
     * @dev Event emitted when a new chain is registered
     */
    event ChainRegistered(
        uint256 indexed chainId,
        string name,
        address bridgeAdapter
    );

    /**
     * @dev Event emitted when a chain is updated
     */
    event ChainUpdated(
        uint256 indexed chainId,
        address bridgeAdapter,
        bool active
    );

    /**
     * @dev Event emitted when a new route is registered
     */
    event RouteRegistered(
        bytes32 indexed routeId,
        string name,
        address implementation,
        uint8 routeType,
        bytes4 selector,
        PermissionLevel permissionLevel,
        uint256[] supportedChains
    );

    /**
     * @dev Event emitted when a route is updated
     */
    event RouteUpdated(
        bytes32 indexed routeId,
        address implementation,
        bool active,
        PermissionLevel permissionLevel,
        uint256[] supportedChains
    );

    /**
     * @dev Event emitted when a route is executed
     */
    event RouteExecuted(
        bytes32 indexed routeId,
        address indexed caller,
        bytes4 selector,
        uint256 chainId,
        bool success
    );

    /**
     * @dev Event emitted when a cross-chain route is initiated
     */
    event CrossChainRouteInitiated(
        bytes32 indexed routeId,
        address indexed caller,
        uint256 sourceChainId,
        uint256 destinationChainId,
        bytes32 transactionId
    );

    /**
     * @dev Event emitted when a cross-chain route is completed
     */
    event CrossChainRouteCompleted(
        bytes32 indexed routeId,
        uint256 sourceChainId,
        uint256 destinationChainId,
        bytes32 transactionId,
        bool success
    );

    /**
     * @dev Registers a new chain
     * @param chainId ID of the chain
     * @param name Name of the chain
     * @param bridgeAdapter Address of the bridge adapter for this chain
     */
    function registerChain(
        uint256 chainId,
        string calldata name,
        address bridgeAdapter
    ) external;

    /**
     * @dev Updates an existing chain
     * @param chainId ID of the chain to update
     * @param bridgeAdapter New bridge adapter address (or zero address to keep current)
     * @param active Whether the chain should be active
     */
    function updateChain(
        uint256 chainId,
        address bridgeAdapter,
        bool active
    ) external;

    /**
     * @dev Registers a new route
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param routeType Type of the route
     * @param selector Function selector for the route
     * @param permissionLevel Required permission level for this route
     * @param supportedChains Array of chain IDs this route supports
     * @return routeId Unique identifier for the route
     */
    function registerRoute(
        string calldata name,
        address implementation,
        uint8 routeType,
        bytes4 selector,
        PermissionLevel permissionLevel,
        uint256[] calldata supportedChains
    ) external returns (bytes32 routeId);

    /**
     * @dev Updates an existing route
     * @param routeId ID of the route to update
     * @param implementation New implementation address (or zero address to keep current)
     * @param active Whether the route should be active
     * @param permissionLevel New permission level (or current if unchanged)
     * @param supportedChains New array of supported chains (or empty to keep current)
     */
    function updateRoute(
        bytes32 routeId,
        address implementation,
        bool active,
        PermissionLevel permissionLevel,
        uint256[] calldata supportedChains
    ) external;

    /**
     * @dev Executes a route on the current chain
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
     * @dev Initiates a cross-chain route execution
     * @param routeId ID of the route to execute
     * @param destinationChainId ID of the destination chain
     * @param data Calldata to pass to the route implementation
     * @param gasLimit Gas limit for the execution on the destination chain
     * @return transactionId Unique identifier for the cross-chain transaction
     */
    function executeCrossChainRoute(
        bytes32 routeId,
        uint256 destinationChainId,
        bytes calldata data,
        uint256 gasLimit
    ) external payable returns (bytes32 transactionId);

    /**
     * @dev Receives a cross-chain route execution from another chain
     * @param sourceChainId ID of the source chain
     * @param routeId ID of the route to execute
     * @param sender Address of the sender on the source chain
     * @param data Calldata to pass to the route implementation
     * @param transactionId Unique identifier for the cross-chain transaction
     * @return success Whether the execution was successful
     */
    function receiveCrossChainRoute(
        uint256 sourceChainId,
        bytes32 routeId,
        address sender,
        bytes calldata data,
        bytes32 transactionId
    ) external returns (bool success);

    /**
     * @dev Gets information about a chain
     * @param chainId ID of the chain
     * @return chain The chain information
     */
    function getChain(uint256 chainId) external view returns (Chain memory);

    /**
     * @dev Gets all registered chain IDs
     * @return chainIds Array of all registered chain IDs
     */
    function getAllChainIds() external view returns (uint256[] memory);

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
     * @dev Gets all routes supported on a specific chain
     * @param chainId ID of the chain
     * @return routeIds Array of route IDs supported on the chain
     */
    function getRoutesByChain(uint256 chainId) external view returns (bytes32[] memory);

    /**
     * @dev Checks if a route exists, is active, and supports the current chain
     * @param routeId ID of the route
     * @return exists Whether the route exists, is active, and supports the current chain
     */
    function routeExists(bytes32 routeId) external view returns (bool);

    /**
     * @dev Checks if a route supports a specific chain
     * @param routeId ID of the route
     * @param chainId ID of the chain
     * @return supported Whether the route supports the chain
     */
    function routeSupportsChain(bytes32 routeId, uint256 chainId) external view returns (bool);

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

    /**
     * @dev Gets the current chain ID
     * @return chainId The current chain ID
     */
    function getCurrentChainId() external view returns (uint256);
}
