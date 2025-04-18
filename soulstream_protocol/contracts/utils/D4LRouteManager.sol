// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "../interfaces/ID4LMultichainRouter.sol";
import "../interfaces/ID4LRouteImplementation.sol";
import "./D4LPacker.sol";
import "./D4LTransientStorage.sol";

/**
 * @title D4LRouteManager
 * @dev Library for managing routes in the D4L Router
 */
library D4LRouteManager {
    using D4LPacker for *;
    using D4LTransientStorage for *;

    // Events
    event RouteRegistered(
        bytes32 indexed routeId,
        string name,
        address implementation,
        uint8 routeType,
        bytes4 selector,
        ID4LMultichainRouter.PermissionLevel permissionLevel,
        uint256[] supportedChains
    );

    event RouteUpdated(
        bytes32 indexed routeId,
        address implementation,
        bool active,
        ID4LMultichainRouter.PermissionLevel permissionLevel,
        uint256[] supportedChains
    );

    event RouteExecuted(
        bytes32 indexed routeId,
        address indexed caller,
        bytes4 selector,
        uint256 chainId,
        bool success
    );

    /**
     * @dev Calculates the route ID from its components
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param routeType Type of the route
     * @param selector Function selector for the route
     * @return routeId The calculated route ID
     */
    function calculateRouteId(
        string memory name,
        address implementation,
        uint8 routeType,
        bytes4 selector
    ) internal pure returns (bytes32 routeId) {
        return keccak256(abi.encodePacked(name, implementation, routeType, selector));
    }

    /**
     * @dev Registers a new route
     * @param routes Mapping of route IDs to routes
     * @param routeIds Array of all route IDs
     * @param routesByType Mapping of route types to route IDs
     * @param routesByChain Mapping of chain IDs to route IDs
     * @param name Name of the route
     * @param implementation Address of the route implementation
     * @param routeType Type of the route
     * @param selector Function selector for the route
     * @param permissionLevel Required permission level for this route
     * @param supportedChains Array of chain IDs this route supports
     * @return routeId Unique identifier for the route
     */
    function registerRoute(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        bytes32[] storage routeIds,
        mapping(uint8 => bytes32[]) storage routesByType,
        mapping(uint256 => bytes32[]) storage routesByChain,
        string memory name,
        address implementation,
        uint8 routeType,
        bytes4 selector,
        ID4LMultichainRouter.PermissionLevel permissionLevel,
        uint256[] memory supportedChains
    ) internal returns (bytes32 routeId) {
        require(bytes(name).length > 0, "D4LRouteManager: name cannot be empty");
        require(implementation != address(0), "D4LRouteManager: implementation cannot be zero address");
        
        // Validate the implementation
        require(
            ID4LRouteImplementation(implementation).validateSelector(selector),
            "D4LRouteManager: invalid selector for implementation"
        );

        // Calculate the route ID
        routeId = calculateRouteId(name, implementation, routeType, selector);
        
        // Check if the route already exists
        require(routes[routeId].implementation == address(0), "D4LRouteManager: route already registered");

        // Store route metadata in transient storage for gas optimization
        D4LTransientStorage.storeRouteMetadata(
            name,
            implementation,
            routeType,
            true,
            uint8(permissionLevel)
        );

        // Register the route
        routes[routeId] = ID4LMultichainRouter.Route({
            name: name,
            implementation: implementation,
            active: true,
            routeType: routeType,
            selector: selector,
            permissionLevel: permissionLevel,
            supportedChains: supportedChains
        });

        // Add to the list of route IDs
        routeIds.push(routeId);
        
        // Add to the list of routes by type
        routesByType[routeType].push(routeId);
        
        // Add to the list of routes by chain
        for (uint256 i = 0; i < supportedChains.length; i++) {
            routesByChain[supportedChains[i]].push(routeId);
        }

        emit RouteRegistered(
            routeId,
            name,
            implementation,
            routeType,
            selector,
            permissionLevel,
            supportedChains
        );

        return routeId;
    }

    /**
     * @dev Updates an existing route
     * @param routes Mapping of route IDs to routes
     * @param routesByChain Mapping of chain IDs to route IDs
     * @param routeId ID of the route to update
     * @param implementation New implementation address (or zero address to keep current)
     * @param active Whether the route should be active
     * @param permissionLevel New permission level (or current if unchanged)
     * @param supportedChains New array of supported chains (or empty to keep current)
     */
    function updateRoute(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        mapping(uint256 => bytes32[]) storage routesByChain,
        bytes32 routeId,
        address implementation,
        bool active,
        ID4LMultichainRouter.PermissionLevel permissionLevel,
        uint256[] memory supportedChains
    ) internal {
        require(routes[routeId].implementation != address(0), "D4LRouteManager: route not registered");

        ID4LMultichainRouter.Route storage route = routes[routeId];

        // Update implementation if provided
        if (implementation != address(0) && implementation != route.implementation) {
            // Validate the implementation
            require(
                ID4LRouteImplementation(implementation).validateSelector(route.selector),
                "D4LRouteManager: invalid selector for implementation"
            );
            
            route.implementation = implementation;
        }

        // Update active status
        route.active = active;

        // Update permission level if changed
        if (permissionLevel != route.permissionLevel) {
            route.permissionLevel = permissionLevel;
        }

        // Update supported chains if provided
        if (supportedChains.length > 0) {
            // Remove from the old chain lists
            for (uint256 i = 0; i < route.supportedChains.length; i++) {
                uint256 chainId = route.supportedChains[i];
                bytes32[] storage chainRoutes = routesByChain[chainId];
                
                for (uint256 j = 0; j < chainRoutes.length; j++) {
                    if (chainRoutes[j] == routeId) {
                        // Replace with the last element and pop
                        chainRoutes[j] = chainRoutes[chainRoutes.length - 1];
                        chainRoutes.pop();
                        break;
                    }
                }
            }
            
            // Update the supported chains
            route.supportedChains = supportedChains;
            
            // Add to the new chain lists
            for (uint256 i = 0; i < supportedChains.length; i++) {
                routesByChain[supportedChains[i]].push(routeId);
            }
        }

        emit RouteUpdated(
            routeId,
            route.implementation,
            active,
            route.permissionLevel,
            route.supportedChains
        );
    }

    /**
     * @dev Executes a route
     * @param routes Mapping of route IDs to routes
     * @param routeId ID of the route to execute
     * @param data Calldata to pass to the route implementation
     * @param caller Address of the caller
     * @param sourceChainId ID of the source chain
     * @param value Value to send with the call
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeRoute(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        bytes32 routeId,
        bytes memory data,
        address caller,
        uint256 sourceChainId,
        uint256 value
    ) internal returns (bool success, bytes memory result) {
        ID4LMultichainRouter.Route storage route = routes[routeId];
        
        // Store route information in transient storage
        D4LTransientStorage.storeRouteContext(
            routeId,
            caller,
            uint64(sourceChainId),
            route.selector
        );

        // Check permissions
        (ID4LMultichainRouter.PermissionLevel permissionLevel, string memory reason) = ID4LRouteImplementation(route.implementation).checkPermissions(
            route.selector,
            data,
            caller,
            sourceChainId
        );

        // Store permission level in transient storage
        D4LTransientStorage.storeUint8(
            D4LTransientStorage.TS_PERMISSION_LEVEL,
            uint8(permissionLevel)
        );

        // Execute the route
        uint256 gasStart = gasleft();
        (success, result) = ID4LRouteImplementation(route.implementation).execute{value: value}(
            data,
            caller,
            uint64(sourceChainId)
        );
        uint256 gasUsed = gasStart - gasleft();

        // Store execution result in transient storage
        D4LTransientStorage.storeExecutionResult(
            success,
            gasUsed,
            success ? "" : string(result)
        );

        emit RouteExecuted(routeId, caller, route.selector, sourceChainId, success);

        return (success, result);
    }

    /**
     * @dev Checks if a route exists, is active, and supports a specific chain
     * @param routes Mapping of route IDs to routes
     * @param routeId ID of the route
     * @param chainId ID of the chain
     * @return exists Whether the route exists, is active, and supports the chain
     */
    function routeExistsForChain(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        bytes32 routeId,
        uint256 chainId
    ) internal view returns (bool) {
        ID4LMultichainRouter.Route storage route = routes[routeId];
        
        if (route.implementation == address(0) || !route.active) {
            return false;
        }
        
        for (uint256 i = 0; i < route.supportedChains.length; i++) {
            if (route.supportedChains[i] == chainId) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @dev Gets all routes supported on a specific chain
     * @param routes Mapping of route IDs to routes
     * @param routesByChain Mapping of chain IDs to route IDs
     * @param chainId ID of the chain
     * @return activeRouteIds Array of active route IDs supported on the chain
     */
    function getActiveRoutesByChain(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        mapping(uint256 => bytes32[]) storage routesByChain,
        uint256 chainId
    ) internal view returns (bytes32[] memory activeRouteIds) {
        bytes32[] storage allRouteIds = routesByChain[chainId];
        
        // First, count active routes
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allRouteIds.length; i++) {
            if (routes[allRouteIds[i]].active) {
                activeCount++;
            }
        }
        
        // Then, create the array of active route IDs
        activeRouteIds = new bytes32[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allRouteIds.length; i++) {
            if (routes[allRouteIds[i]].active) {
                activeRouteIds[index] = allRouteIds[i];
                index++;
            }
        }
        
        return activeRouteIds;
    }

    /**
     * @dev Gets all routes of a specific type that are active
     * @param routes Mapping of route IDs to routes
     * @param routesByType Mapping of route types to route IDs
     * @param routeType Type of routes to get
     * @return activeRouteIds Array of active route IDs of the specified type
     */
    function getActiveRoutesByType(
        mapping(bytes32 => ID4LMultichainRouter.Route) storage routes,
        mapping(uint8 => bytes32[]) storage routesByType,
        uint8 routeType
    ) internal view returns (bytes32[] memory activeRouteIds) {
        bytes32[] storage allRouteIds = routesByType[routeType];
        
        // First, count active routes
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allRouteIds.length; i++) {
            if (routes[allRouteIds[i]].active) {
                activeCount++;
            }
        }
        
        // Then, create the array of active route IDs
        activeRouteIds = new bytes32[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allRouteIds.length; i++) {
            if (routes[allRouteIds[i]].active) {
                activeRouteIds[index] = allRouteIds[i];
                index++;
            }
        }
        
        return activeRouteIds;
    }
}
