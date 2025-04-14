// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../utils/D4LPacker.sol";
import "../utils/D4LTransientStorage.sol";
import "../interfaces/ID4LMultichainRouter.sol";
import "../interfaces/ID4LSoulflowRoute.sol";
import "../interfaces/ID4LBridgeAdapter.sol";
import "../interfaces/ID4LAsset.sol";
import "../router/D4LBaseRouteImplementation.sol";

/**
 * @title D4LSoulflowRouter
 * @dev Router for Soulflow routes
 */
contract D4LSoulflowRouter is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using D4LPacker for *;
    using D4LTransientStorage for *;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant ROUTE_MANAGER_ROLE = keccak256("ROUTE_MANAGER_ROLE");

    // The registry contract
    address public immutable registry;

    // Action codes
    uint8 public constant ACTION_READ = 0;
    uint8 public constant ACTION_STAKE = 1;
    uint8 public constant ACTION_FORWARD = 2;
    uint8 public constant ACTION_SPLIT = 3;
    uint8 public constant ACTION_LOCK = 4;
    uint8 public constant ACTION_UNLOCK = 5;

    // Mapping of route implementations
    mapping(bytes32 => address) public routeImplementations;

    // The bridge adapter for cross-chain communication
    address public bridgeAdapter;

    // Mapping of supported chains
    mapping(uint256 => bool) public supportedChains;

    // Mapping of processed cross-chain transactions
    mapping(bytes32 => bool) public processedTransactions;

    // Events
    event RouteImplementationRegistered(bytes32 indexed routeId, address implementation);
    event RouteExecuted(bytes32 indexed routeId, address indexed fromSoul, address indexed toSoul, uint8 action, bool success);
    event AssetRouted(address indexed asset, address indexed fromSoul, address indexed toSoul, uint256 amount, uint8 action);
    event CrossChainRouteInitiated(bytes32 indexed routeId, address indexed fromSoul, uint256 sourceChainId, uint256 destinationChainId, bytes32 transactionId);
    event CrossChainRouteCompleted(bytes32 indexed routeId, uint256 sourceChainId, uint256 destinationChainId, bytes32 transactionId, bool success);
    event ChainSupported(uint256 indexed chainId, bool supported);
    event BridgeAdapterSet(address indexed bridgeAdapter);

    // Role for bridge operations
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    /**
     * @dev Constructor
     * @param admin The admin address
     * @param _registry The registry address
     */
    constructor(address admin, address _registry) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, admin);
        _grantRole(ROUTE_MANAGER_ROLE, admin);
        _grantRole(BRIDGE_ROLE, admin);

        registry = _registry;

        // Add current chain as supported
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        supportedChains[chainId] = true;
        emit ChainSupported(chainId, true);
    }

    /**
     * @dev Sets the bridge adapter
     * @param _bridgeAdapter The bridge adapter address
     */
    function setBridgeAdapter(address _bridgeAdapter) external onlyRole(ADMIN_ROLE) {
        require(_bridgeAdapter != address(0), "D4LSoulflowRouter: bridge adapter cannot be zero address");
        bridgeAdapter = _bridgeAdapter;
        _grantRole(BRIDGE_ROLE, _bridgeAdapter);
        emit BridgeAdapterSet(_bridgeAdapter);
    }

    /**
     * @dev Sets whether a chain is supported
     * @param chainId The chain ID
     * @param supported Whether the chain is supported
     */
    function setSupportedChain(uint256 chainId, bool supported) external onlyRole(ADMIN_ROLE) {
        require(chainId != 0, "D4LSoulflowRouter: chain ID cannot be zero");
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }

    /**
     * @dev Registers a route implementation
     * @param routeId The ID of the route
     * @param implementation The implementation address
     */
    function registerRouteImplementation(
        bytes32 routeId,
        address implementation
    ) external onlyRole(ROUTE_MANAGER_ROLE) {
        require(implementation != address(0), "D4LSoulflowRouter: implementation cannot be zero address");

        routeImplementations[routeId] = implementation;

        emit RouteImplementationRegistered(routeId, implementation);
    }

    /**
     * @dev Executes a route
     * @param routeId The ID of the route to execute
     * @param data The data to pass to the route
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeRoute(
        bytes32 routeId,
        bytes calldata data
    ) external nonReentrant returns (bool success, bytes memory result) {
        // Get the route from the registry
        ID4LSoulflowRoute.SoulflowRoute memory route = D4LSoulStreamRegistry(registry).getRoute(routeId);

        // Check if the route is active and this router is responsible for it
        require(route.active, "D4LSoulflowRouter: route not active");
        require(route.router == address(this), "D4LSoulflowRouter: wrong router");

        // Check if the caller is the fromSoul or has the EXECUTOR_ROLE
        require(
            msg.sender == route.fromSoul || hasRole(EXECUTOR_ROLE, msg.sender),
            "D4LSoulflowRouter: caller is not authorized"
        );

        // Get the route implementation
        address implementation = routeImplementations[routeId];
        require(implementation != address(0), "D4LSoulflowRouter: implementation not found");

        // Store execution context in transient storage
        D4LTransientStorage.storeBytes32(D4LTransientStorage.TS_ROUTE_ID, routeId);
        D4LTransientStorage.storeAddress(D4LTransientStorage.TS_CALLER, msg.sender);
        D4LTransientStorage.storeUint8(D4LTransientStorage.TS_ROUTE_TYPE, route.action);

        // Execute the route implementation
        (success, result) = implementation.delegatecall(
            abi.encodeWithSignature("execute(bytes32,bytes)", routeId, data)
        );

        // Store execution result in transient storage
        D4LTransientStorage.storeBool(D4LTransientStorage.TS_SUCCESS, success);

        emit RouteExecuted(routeId, route.fromSoul, route.toSoul, route.action, success);

        return (success, result);
    }

    /**
     * @dev Routes an asset
     * @param routeId The ID of the route
     * @param amount The amount to route
     * @return success Whether the routing was successful
     */
    function routeAsset(
        bytes32 routeId,
        uint256 amount
    ) external nonReentrant returns (bool success) {
        // Get the route from the registry
        ID4LSoulflowRoute.SoulflowRoute memory route = D4LSoulStreamRegistry(registry).getRoute(routeId);

        // Check if the route is active and this router is responsible for it
        require(route.active, "D4LSoulflowRouter: route not active");
        require(route.router == address(this), "D4LSoulflowRouter: wrong router");

        // Check if the caller is the fromSoul or has the EXECUTOR_ROLE
        require(
            msg.sender == route.fromSoul || hasRole(EXECUTOR_ROLE, msg.sender),
            "D4LSoulflowRouter: caller is not authorized"
        );

        // Route the asset based on the action
        if (route.action == ACTION_READ) {
            // Read-only action, no asset movement
            success = true;
        } else if (route.action == ACTION_STAKE) {
            // Stake the asset
            success = _stakeAsset(route.fromSoul, route.toSoul, route.asset, amount);
        } else if (route.action == ACTION_FORWARD) {
            // Forward the asset
            success = _forwardAsset(route.fromSoul, route.toSoul, route.asset, amount);
        } else if (route.action == ACTION_SPLIT) {
            // Split the asset
            success = _splitAsset(route.fromSoul, route.toSoul, route.asset, amount, route.constraintHash);
        } else if (route.action == ACTION_LOCK) {
            // Lock the asset
            success = _lockAsset(route.fromSoul, route.asset, amount);
        } else if (route.action == ACTION_UNLOCK) {
            // Unlock the asset
            success = _unlockAsset(route.fromSoul, route.asset, amount);
        } else {
            revert("D4LSoulflowRouter: unsupported action");
        }

        emit AssetRouted(route.asset, route.fromSoul, route.toSoul, amount, route.action);

        return success;
    }

    /**
     * @dev Stakes an asset
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity (staking contract)
     * @param asset The asset address
     * @param amount The amount to stake
     * @return success Whether the staking was successful
     */
    function _stakeAsset(
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount
    ) internal returns (bool) {
        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            return ID4LAsset(asset).transferBetweenSouls(fromSoul, toSoul, amount);
        } else {
            // Use standard ERC20 for regular tokens
            // Transfer the asset from the fromSoul to the staking contract
            IERC20(asset).safeTransferFrom(fromSoul, toSoul, amount);

            // Call the stake function on the staking contract
            (bool success, ) = toSoul.call(
                abi.encodeWithSignature("stake(address,address,uint256)", fromSoul, asset, amount)
            );

            return success;
        }
    }

    /**
     * @dev Forwards an asset
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param amount The amount to forward
     * @return success Whether the forwarding was successful
     */
    function _forwardAsset(
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount
    ) internal returns (bool) {
        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            return ID4LAsset(asset).transferBetweenSouls(fromSoul, toSoul, amount);
        } else {
            // Use standard ERC20 for regular tokens
            // Transfer the asset from the fromSoul to the toSoul
            IERC20(asset).safeTransferFrom(fromSoul, toSoul, amount);
            return true;
        }
    }

    /**
     * @dev Splits an asset
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity (unused in split)
     * @param asset The asset address
     * @param amount The amount to split
     * @param constraintHash The constraint hash containing split information
     * @return success Whether the splitting was successful
     */
    function _splitAsset(
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        bytes32 constraintHash
    ) internal returns (bool) {
        // In a real implementation, we would decode the constraintHash to get the split recipients and percentages
        // For this example, we'll just split 50/50 between fromSoul and toSoul

        uint256 halfAmount = amount / 2;

        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            // For soulbound assets, we need to check if the asset is divisible
            (bool transferable, bool divisible, bool consumable) = ID4LAsset(asset).assetConstraints();
            require(divisible, "D4LSoulflowRouter: asset is not divisible");

            // Transfer half to toSoul
            return ID4LAsset(asset).transferBetweenSouls(fromSoul, toSoul, halfAmount);
        } else {
            // Use standard ERC20 for regular tokens
            // Transfer half to toSoul
            IERC20(asset).safeTransferFrom(fromSoul, toSoul, halfAmount);
            return true;
        }
    }

    /**
     * @dev Locks an asset
     * @param fromSoul The source soul identity
     * @param asset The asset address
     * @param amount The amount to lock
     * @return success Whether the locking was successful
     */
    function _lockAsset(
        address fromSoul,
        address asset,
        uint256 amount
    ) internal returns (bool) {
        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            return ID4LAsset(asset).linkToSoul(fromSoul, amount);
        } else {
            // Use standard ERC20 for regular tokens
            // Transfer the asset from the fromSoul to this contract
            IERC20(asset).safeTransferFrom(fromSoul, address(this), amount);

            // In a real implementation, we would record the locked amount
            return true;
        }
    }

    /**
     * @dev Unlocks an asset
     * @param fromSoul The source soul identity
     * @param asset The asset address
     * @param amount The amount to unlock
     * @return success Whether the unlocking was successful
     */
    function _unlockAsset(
        address fromSoul,
        address asset,
        uint256 amount
    ) internal returns (bool) {
        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            return ID4LAsset(asset).unlinkFromSoul(fromSoul, amount);
        } else {
            // Use standard ERC20 for regular tokens
            // In a real implementation, we would check if the amount is locked

            // Transfer the asset from this contract to the fromSoul
            IERC20(asset).safeTransfer(fromSoul, amount);
            return true;
        }
    }

    /**
     * @dev Executes a cross-chain route
     * @param routeId The ID of the route to execute
     * @param destinationChainId The destination chain ID
     * @param data The data to pass to the route
     * @param gasLimit The gas limit for execution on the destination chain
     * @return transactionId The ID of the cross-chain transaction
     */
    function executeCrossChainRoute(
        bytes32 routeId,
        uint256 destinationChainId,
        bytes calldata data,
        uint256 gasLimit
    ) external payable nonReentrant returns (bytes32 transactionId) {
        // Check if the bridge adapter is set
        require(bridgeAdapter != address(0), "D4LSoulflowRouter: bridge adapter not set");

        // Check if the destination chain is supported
        require(supportedChains[destinationChainId], "D4LSoulflowRouter: destination chain not supported");

        // Get the route from the registry
        ID4LSoulflowRoute.SoulflowRoute memory route = D4LSoulStreamRegistry(registry).getRoute(routeId);

        // Check if the route is active and this router is responsible for it
        require(route.active, "D4LSoulflowRouter: route not active");
        require(route.router == address(this), "D4LSoulflowRouter: wrong router");

        // Check if the caller is the fromSoul or has the EXECUTOR_ROLE
        require(
            msg.sender == route.fromSoul || hasRole(EXECUTOR_ROLE, msg.sender),
            "D4LSoulflowRouter: caller is not authorized"
        );

        // Get the current chain ID
        uint256 sourceChainId;
        assembly {
            sourceChainId := chainid()
        }

        // Prepare the message
        bytes memory message = abi.encode(
            routeId,
            route.fromSoul,
            data
        );

        // Get the message fee from the bridge adapter
        uint256 fee = ID4LBridgeAdapter(bridgeAdapter).getMessageFee(
            destinationChainId,
            message.length,
            gasLimit
        );

        // Check if enough value was sent
        require(msg.value >= fee, "D4LSoulflowRouter: insufficient fee");

        // Send the message
        transactionId = ID4LBridgeAdapter(bridgeAdapter).sendMessage{
            value: fee
        }(
            destinationChainId,
            message,
            gasLimit
        );

        // Refund excess value
        if (msg.value > fee) {
            (bool sent, ) = msg.sender.call{value: msg.value - fee}("");
            require(sent, "D4LSoulflowRouter: failed to refund excess fee");
        }

        emit CrossChainRouteInitiated(
            routeId,
            route.fromSoul,
            sourceChainId,
            destinationChainId,
            transactionId
        );

        return transactionId;
    }

    /**
     * @dev Receives a cross-chain route execution
     * @param sourceChainId The source chain ID
     * @param sender The sender address on the source chain
     * @param message The message received
     * @param messageId The ID of the message
     * @return success Whether the execution was successful
     */
    function receiveCrossChainRoute(
        uint256 sourceChainId,
        address sender,
        bytes calldata message,
        bytes32 messageId
    ) external onlyRole(BRIDGE_ROLE) nonReentrant returns (bool success) {
        // Check if the message has already been processed
        require(!processedTransactions[messageId], "D4LSoulflowRouter: message already processed");

        // Mark the message as processed
        processedTransactions[messageId] = true;

        // Decode the message
        (bytes32 routeId, address fromSoul, bytes memory data) = abi.decode(
            message,
            (bytes32, address, bytes)
        );

        // Get the route from the registry
        ID4LSoulflowRoute.SoulflowRoute memory route = D4LSoulStreamRegistry(registry).getRoute(routeId);

        // Check if the route is active and this router is responsible for it
        require(route.active, "D4LSoulflowRouter: route not active");
        require(route.router == address(this), "D4LSoulflowRouter: wrong router");

        // Check if the fromSoul matches
        require(route.fromSoul == fromSoul, "D4LSoulflowRouter: fromSoul mismatch");

        // Get the route implementation
        address implementation = routeImplementations[routeId];
        require(implementation != address(0), "D4LSoulflowRouter: implementation not found");

        // Store execution context in transient storage
        D4LTransientStorage.storeBytes32(D4LTransientStorage.TS_ROUTE_ID, routeId);
        D4LTransientStorage.storeAddress(D4LTransientStorage.TS_CALLER, fromSoul);
        D4LTransientStorage.storeUint8(D4LTransientStorage.TS_ROUTE_TYPE, route.action);
        D4LTransientStorage.storeUint64(D4LTransientStorage.TS_SOURCE_CHAIN_ID, uint64(sourceChainId));

        // Execute the route implementation
        bytes memory result;
        (success, result) = implementation.delegatecall(
            abi.encodeWithSignature("execute(bytes32,bytes)", routeId, data)
        );

        // Store execution result in transient storage
        D4LTransientStorage.storeBool(D4LTransientStorage.TS_SUCCESS, success);

        // Get the current chain ID
        uint256 destinationChainId;
        assembly {
            destinationChainId := chainid()
        }

        emit CrossChainRouteCompleted(
            routeId,
            sourceChainId,
            destinationChainId,
            messageId,
            success
        );

        return success;
    }

    /**
     * @dev Gets the current chain ID
     * @return chainId The current chain ID
     */
    function getCurrentChainId() external view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    /**
     * @dev Checks if an asset implements the ID4LAsset interface
     * @param asset The asset address to check
     * @return isD4LAsset Whether the asset implements the ID4LAsset interface
     */
    function _isD4LAsset(address asset) internal view returns (bool) {
        // Check if the asset implements the ID4LAsset interface using ERC165
        // First, check if the contract exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(asset)
        }
        if (codeSize == 0) return false;

        // Try to call the assetType function to check if it's a D4L asset
        try ID4LAsset(asset).assetType() returns (uint8) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Checks if an asset can be routed through a specific route
     * @param routeId The ID of the route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param amount The amount of the asset to route
     * @return canRoute Whether the asset can be routed
     */
    function canRouteAsset(
        bytes32 routeId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount
    ) external view returns (bool canRoute) {
        // Check if the asset implements the ID4LAsset interface
        if (_isD4LAsset(asset)) {
            // Use the ID4LAsset interface for soulbound assets
            return ID4LAsset(asset).canRoute(routeId, fromSoul, toSoul, amount);
        } else {
            // For regular ERC20 tokens, check if the fromSoul has enough balance and allowance
            try IERC20(asset).balanceOf(fromSoul) returns (uint256 balance) {
                if (balance < amount) return false;

                try IERC20(asset).allowance(fromSoul, address(this)) returns (uint256 allowance) {
                    return allowance >= amount;
                } catch {
                    return false;
                }
            } catch {
                return false;
            }
        }
    }

    /**
     * @dev Checks if a chain is supported
     * @param chainId The chain ID to check
     * @return supported Whether the chain is supported
     */
    function isChainSupported(uint256 chainId) external view returns (bool) {
        return supportedChains[chainId];
    }

    /**
     * @dev Receives ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}

/**
 * @dev Interface for the D4LSoulStreamRegistry
 */
interface D4LSoulStreamRegistry {
    function getRoute(bytes32 routeId) external view returns (ID4LSoulflowRoute.SoulflowRoute memory);
}
