// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/ID4LMultichainRouter.sol";
import "../interfaces/ID4LRouteImplementation.sol";
import "../interfaces/ID4LBridgeAdapter.sol";

/**
 * @title D4LMultichainRouter
 * @dev Implementation of the D4L Multichain Router that supports dynamic route registration
 */
contract D4LMultichainRouter is ID4LMultichainRouter, AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ROUTE_MANAGER_ROLE = keccak256("ROUTE_MANAGER_ROLE");
    bytes32 public constant CHAIN_MANAGER_ROLE = keccak256("CHAIN_MANAGER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    // Mappings for chains
    mapping(uint256 => Chain) private _chains;
    uint256[] private _chainIds;

    // Mappings for routes
    mapping(bytes32 => Route) private _routes;
    bytes32[] private _routeIds;
    mapping(uint8 => bytes32[]) private _routesByType;
    mapping(uint256 => bytes32[]) private _routesByChain;

    // Mapping for cross-chain transactions
    mapping(bytes32 => bool) private _processedTransactions;

    // Current chain ID
    uint256 private immutable _currentChainId;

    // Transient storage keys
    bytes32 private constant TS_CURRENT_ROUTE_ID = keccak256("D4L_CURRENT_ROUTE_ID");
    bytes32 private constant TS_CURRENT_CALLER = keccak256("D4L_CURRENT_CALLER");
    bytes32 private constant TS_CURRENT_SELECTOR = keccak256("D4L_CURRENT_SELECTOR");
    bytes32 private constant TS_CURRENT_SOURCE_CHAIN = keccak256("D4L_CURRENT_SOURCE_CHAIN");
    bytes32 private constant TS_EXECUTION_SUCCESS = keccak256("D4L_EXECUTION_SUCCESS");
    bytes32 private constant TS_PERMISSION_LEVEL = keccak256("D4L_PERMISSION_LEVEL");
    bytes32 private constant TS_PERMISSION_REASON = keccak256("D4L_PERMISSION_REASON");

    /**
     * @dev Constructor
     * @param admin Address of the admin
     */
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(ROUTE_MANAGER_ROLE, admin);
        _grantRole(CHAIN_MANAGER_ROLE, admin);
        
        // Get the current chain ID
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        _currentChainId = chainId;
    }

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
    ) external override onlyRole(CHAIN_MANAGER_ROLE) {
        require(chainId != 0, "D4LMultichainRouter: chain ID cannot be zero");
        require(bytes(name).length > 0, "D4LMultichainRouter: name cannot be empty");
        require(bridgeAdapter != address(0), "D4LMultichainRouter: bridge adapter cannot be zero address");
        require(_chains[chainId].chainId == 0, "D4LMultichainRouter: chain already registered");

        // Register the chain
        _chains[chainId] = Chain({
            chainId: chainId,
            name: name,
            active: true,
            bridgeAdapter: bridgeAdapter
        });

        // Add to the list of chain IDs
        _chainIds.push(chainId);

        // Grant bridge role to the adapter
        _grantRole(BRIDGE_ROLE, bridgeAdapter);

        emit ChainRegistered(chainId, name, bridgeAdapter);
    }

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
    ) external override onlyRole(CHAIN_MANAGER_ROLE) {
        require(_chains[chainId].chainId != 0, "D4LMultichainRouter: chain not registered");

        Chain storage chain = _chains[chainId];

        // Update bridge adapter if provided
        if (bridgeAdapter != address(0) && bridgeAdapter != chain.bridgeAdapter) {
            // Revoke bridge role from the old adapter
            _revokeRole(BRIDGE_ROLE, chain.bridgeAdapter);
            
            // Update the adapter
            chain.bridgeAdapter = bridgeAdapter;
            
            // Grant bridge role to the new adapter
            _grantRole(BRIDGE_ROLE, bridgeAdapter);
        }

        // Update active status
        chain.active = active;

        emit ChainUpdated(chainId, chain.bridgeAdapter, active);
    }

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
    ) external override onlyRole(ROUTE_MANAGER_ROLE) returns (bytes32 routeId) {
        require(bytes(name).length > 0, "D4LMultichainRouter: name cannot be empty");
        require(implementation != address(0), "D4LMultichainRouter: implementation cannot be zero address");
        
        // Validate the implementation
        require(
            ID4LRouteImplementation(implementation).validateSelector(selector),
            "D4LMultichainRouter: invalid selector for implementation"
        );

        // Calculate the route ID
        routeId = calculateRouteId(name, implementation, routeType, selector);
        
        // Check if the route already exists
        require(_routes[routeId].implementation == address(0), "D4LMultichainRouter: route already registered");

        // Validate supported chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            require(_chains[supportedChains[i]].chainId != 0, "D4LMultichainRouter: unsupported chain");
        }

        // Register the route
        _routes[routeId] = Route({
            name: name,
            implementation: implementation,
            active: true,
            routeType: routeType,
            selector: selector,
            permissionLevel: permissionLevel,
            supportedChains: supportedChains
        });

        // Add to the list of route IDs
        _routeIds.push(routeId);
        
        // Add to the list of routes by type
        _routesByType[routeType].push(routeId);
        
        // Add to the list of routes by chain
        for (uint256 i = 0; i < supportedChains.length; i++) {
            _routesByChain[supportedChains[i]].push(routeId);
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
    ) external override onlyRole(ROUTE_MANAGER_ROLE) {
        require(_routes[routeId].implementation != address(0), "D4LMultichainRouter: route not registered");

        Route storage route = _routes[routeId];

        // Update implementation if provided
        if (implementation != address(0) && implementation != route.implementation) {
            // Validate the implementation
            require(
                ID4LRouteImplementation(implementation).validateSelector(route.selector),
                "D4LMultichainRouter: invalid selector for implementation"
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
            // Validate supported chains
            for (uint256 i = 0; i < supportedChains.length; i++) {
                require(_chains[supportedChains[i]].chainId != 0, "D4LMultichainRouter: unsupported chain");
            }
            
            // Remove from the old chain lists
            for (uint256 i = 0; i < route.supportedChains.length; i++) {
                uint256 chainId = route.supportedChains[i];
                bytes32[] storage chainRoutes = _routesByChain[chainId];
                
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
                _routesByChain[supportedChains[i]].push(routeId);
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
     * @dev Executes a route on the current chain
     * @param routeId ID of the route to execute
     * @param data Calldata to pass to the route implementation
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeRoute(
        bytes32 routeId,
        bytes calldata data
    ) external payable override nonReentrant whenNotPaused returns (bool success, bytes memory result) {
        // Check if the route exists and is active
        require(routeExists(routeId), "D4LMultichainRouter: route does not exist or is not active");
        
        Route storage route = _routes[routeId];
        
        // Check if the route supports the current chain
        require(
            routeSupportsChain(routeId, _currentChainId),
            "D4LMultichainRouter: route does not support the current chain"
        );

        // Store route information in transient storage
        assembly {
            tstore(TS_CURRENT_ROUTE_ID, routeId)
            tstore(TS_CURRENT_CALLER, caller())
            tstore(TS_CURRENT_SELECTOR, route.slot)
            tstore(TS_CURRENT_SOURCE_CHAIN, sload(_currentChainId.slot))
        }

        // Check permissions
        (PermissionLevel permissionLevel, string memory reason) = ID4LRouteImplementation(route.implementation).checkPermissions(
            route.selector,
            data,
            msg.sender,
            _currentChainId
        );

        // Store permission level in transient storage
        assembly {
            tstore(TS_PERMISSION_LEVEL, permissionLevel)
            // We can't store strings directly in transient storage, so we'll skip storing the reason
        }

        // Verify permission level
        require(
            _hasPermission(msg.sender, permissionLevel),
            string(abi.encodePacked("D4LMultichainRouter: insufficient permissions - ", reason))
        );

        // Execute the route
        (success, result) = ID4LRouteImplementation(route.implementation).execute{value: msg.value}(
            data,
            msg.sender,
            _currentChainId
        );

        // Store execution success in transient storage
        assembly {
            tstore(TS_EXECUTION_SUCCESS, success)
        }

        emit RouteExecuted(routeId, msg.sender, route.selector, _currentChainId, success);

        return (success, result);
    }

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
    ) external payable override nonReentrant whenNotPaused returns (bytes32 transactionId) {
        // Check if the route exists and is active
        require(routeExists(routeId), "D4LMultichainRouter: route does not exist or is not active");
        
        Route storage route = _routes[routeId];
        
        // Check if the route supports the destination chain
        require(
            routeSupportsChain(routeId, destinationChainId),
            "D4LMultichainRouter: route does not support the destination chain"
        );
        
        // Check if the destination chain is registered and active
        require(
            _chains[destinationChainId].chainId != 0 && _chains[destinationChainId].active,
            "D4LMultichainRouter: destination chain not registered or not active"
        );

        // Store route information in transient storage
        assembly {
            tstore(TS_CURRENT_ROUTE_ID, routeId)
            tstore(TS_CURRENT_CALLER, caller())
            tstore(TS_CURRENT_SELECTOR, route.slot)
            tstore(TS_CURRENT_SOURCE_CHAIN, sload(_currentChainId.slot))
        }

        // Check permissions
        (PermissionLevel permissionLevel, string memory reason) = ID4LRouteImplementation(route.implementation).checkPermissions(
            route.selector,
            data,
            msg.sender,
            _currentChainId
        );

        // Store permission level in transient storage
        assembly {
            tstore(TS_PERMISSION_LEVEL, permissionLevel)
            // We can't store strings directly in transient storage, so we'll skip storing the reason
        }

        // Verify permission level
        require(
            _hasPermission(msg.sender, permissionLevel),
            string(abi.encodePacked("D4LMultichainRouter: insufficient permissions - ", reason))
        );

        // Get the bridge adapter for the destination chain
        address bridgeAdapter = _chains[destinationChainId].bridgeAdapter;
        
        // Prepare the message
        bytes memory message = abi.encode(
            routeId,
            msg.sender,
            data
        );
        
        // Get the message fee
        uint256 fee = ID4LBridgeAdapter(bridgeAdapter).getMessageFee(
            destinationChainId,
            message.length,
            gasLimit
        );
        
        // Check if enough value was sent
        require(msg.value >= fee, "D4LMultichainRouter: insufficient fee");
        
        // Send the message
        transactionId = ID4LBridgeAdapter(bridgeAdapter).sendMessage{value: fee}(
            destinationChainId,
            message,
            gasLimit
        );
        
        // Refund excess value
        if (msg.value > fee) {
            (bool sent, ) = msg.sender.call{value: msg.value - fee}("");
            require(sent, "D4LMultichainRouter: failed to refund excess fee");
        }

        emit CrossChainRouteInitiated(
            routeId,
            msg.sender,
            _currentChainId,
            destinationChainId,
            transactionId
        );

        return transactionId;
    }

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
    ) external override onlyRole(BRIDGE_ROLE) nonReentrant whenNotPaused returns (bool success) {
        // Check if the transaction has already been processed
        require(!_processedTransactions[transactionId], "D4LMultichainRouter: transaction already processed");
        
        // Mark the transaction as processed
        _processedTransactions[transactionId] = true;
        
        // Check if the route exists and is active
        require(routeExists(routeId), "D4LMultichainRouter: route does not exist or is not active");
        
        Route storage route = _routes[routeId];
        
        // Check if the route supports the current chain
        require(
            routeSupportsChain(routeId, _currentChainId),
            "D4LMultichainRouter: route does not support the current chain"
        );

        // Store route information in transient storage
        assembly {
            tstore(TS_CURRENT_ROUTE_ID, routeId)
            tstore(TS_CURRENT_CALLER, sender)
            tstore(TS_CURRENT_SELECTOR, route.slot)
            tstore(TS_CURRENT_SOURCE_CHAIN, sourceChainId)
        }

        // Check permissions
        (PermissionLevel permissionLevel, string memory reason) = ID4LRouteImplementation(route.implementation).checkPermissions(
            route.selector,
            data,
            sender,
            sourceChainId
        );

        // Store permission level in transient storage
        assembly {
            tstore(TS_PERMISSION_LEVEL, permissionLevel)
            // We can't store strings directly in transient storage, so we'll skip storing the reason
        }

        // Verify permission level
        require(
            _hasPermission(sender, permissionLevel),
            string(abi.encodePacked("D4LMultichainRouter: insufficient permissions - ", reason))
        );

        // Execute the route
        bytes memory result;
        (success, result) = ID4LRouteImplementation(route.implementation).execute(
            data,
            sender,
            sourceChainId
        );

        // Store execution success in transient storage
        assembly {
            tstore(TS_EXECUTION_SUCCESS, success)
        }

        emit CrossChainRouteCompleted(
            routeId,
            sourceChainId,
            _currentChainId,
            transactionId,
            success
        );

        return success;
    }

    /**
     * @dev Gets information about a chain
     * @param chainId ID of the chain
     * @return chain The chain information
     */
    function getChain(uint256 chainId) external view override returns (Chain memory) {
        return _chains[chainId];
    }

    /**
     * @dev Gets all registered chain IDs
     * @return chainIds Array of all registered chain IDs
     */
    function getAllChainIds() external view override returns (uint256[] memory) {
        return _chainIds;
    }

    /**
     * @dev Gets information about a route
     * @param routeId ID of the route
     * @return route The route information
     */
    function getRoute(bytes32 routeId) external view override returns (Route memory) {
        return _routes[routeId];
    }

    /**
     * @dev Gets all registered route IDs
     * @return routeIds Array of all registered route IDs
     */
    function getAllRouteIds() external view override returns (bytes32[] memory) {
        return _routeIds;
    }

    /**
     * @dev Gets all routes of a specific type
     * @param routeType Type of routes to get
     * @return routeIds Array of route IDs of the specified type
     */
    function getRoutesByType(uint8 routeType) external view override returns (bytes32[] memory) {
        return _routesByType[routeType];
    }

    /**
     * @dev Gets all routes supported on a specific chain
     * @param chainId ID of the chain
     * @return routeIds Array of route IDs supported on the chain
     */
    function getRoutesByChain(uint256 chainId) external view override returns (bytes32[] memory) {
        return _routesByChain[chainId];
    }

    /**
     * @dev Checks if a route exists, is active, and supports the current chain
     * @param routeId ID of the route
     * @return exists Whether the route exists, is active, and supports the current chain
     */
    function routeExists(bytes32 routeId) public view override returns (bool) {
        Route storage route = _routes[routeId];
        
        if (route.implementation == address(0) || !route.active) {
            return false;
        }
        
        return routeSupportsChain(routeId, _currentChainId);
    }

    /**
     * @dev Checks if a route supports a specific chain
     * @param routeId ID of the route
     * @param chainId ID of the chain
     * @return supported Whether the route supports the chain
     */
    function routeSupportsChain(bytes32 routeId, uint256 chainId) public view override returns (bool) {
        Route storage route = _routes[routeId];
        
        for (uint256 i = 0; i < route.supportedChains.length; i++) {
            if (route.supportedChains[i] == chainId) {
                return true;
            }
        }
        
        return false;
    }

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
    ) public pure override returns (bytes32) {
        return keccak256(abi.encodePacked(name, implementation, routeType, selector));
    }

    /**
     * @dev Gets the current chain ID
     * @return chainId The current chain ID
     */
    function getCurrentChainId() external view override returns (uint256) {
        return _currentChainId;
    }

    /**
     * @dev Pauses the router
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the router
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Checks if an address has the required permission level
     * @param account The address to check
     * @param level The required permission level
     * @return hasPermission Whether the address has the required permission level
     */
    function _hasPermission(address account, PermissionLevel level) internal view returns (bool) {
        if (level == PermissionLevel.NONE) {
            return true;
        } else if (level == PermissionLevel.USER) {
            // In a real implementation, you might check if the user is registered or has a token
            return true; // For simplicity, we'll allow all users
        } else if (level == PermissionLevel.ADMIN) {
            return hasRole(ADMIN_ROLE, account);
        } else if (level == PermissionLevel.SYSTEM) {
            return hasRole(DEFAULT_ADMIN_ROLE, account);
        }
        
        return false;
    }
}
