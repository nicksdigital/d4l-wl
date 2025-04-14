// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title D4LTransientStorage
 * @dev Library for working with transient storage (EIP-1153)
 */
library D4LTransientStorage {
    // Common transient storage keys
    bytes32 internal constant TS_ROUTE_ID = keccak256("D4L_TS_ROUTE_ID");
    bytes32 internal constant TS_CALLER = keccak256("D4L_TS_CALLER");
    bytes32 internal constant TS_SOURCE_CHAIN_ID = keccak256("D4L_TS_SOURCE_CHAIN_ID");
    bytes32 internal constant TS_SELECTOR = keccak256("D4L_TS_SELECTOR");
    bytes32 internal constant TS_PERMISSION_LEVEL = keccak256("D4L_TS_PERMISSION_LEVEL");
    bytes32 internal constant TS_SUCCESS = keccak256("D4L_TS_SUCCESS");
    bytes32 internal constant TS_GAS_USED = keccak256("D4L_TS_GAS_USED");
    bytes32 internal constant TS_EXECUTION_DATA = keccak256("D4L_TS_EXECUTION_DATA");
    bytes32 internal constant TS_DESTINATION_CHAIN_ID = keccak256("D4L_TS_DESTINATION_CHAIN_ID");
    bytes32 internal constant TS_TRANSACTION_ID = keccak256("D4L_TS_TRANSACTION_ID");
    bytes32 internal constant TS_BRIDGE_ADAPTER = keccak256("D4L_TS_BRIDGE_ADAPTER");
    bytes32 internal constant TS_MESSAGE_FEE = keccak256("D4L_TS_MESSAGE_FEE");
    bytes32 internal constant TS_GAS_LIMIT = keccak256("D4L_TS_GAS_LIMIT");
    bytes32 internal constant TS_REFUND_AMOUNT = keccak256("D4L_TS_REFUND_AMOUNT");
    bytes32 internal constant TS_ROUTE_TYPE = keccak256("D4L_TS_ROUTE_TYPE");
    bytes32 internal constant TS_IMPLEMENTATION = keccak256("D4L_TS_IMPLEMENTATION");
    bytes32 internal constant TS_ACTIVE = keccak256("D4L_TS_ACTIVE");
    bytes32 internal constant TS_SUPPORTED_CHAINS = keccak256("D4L_TS_SUPPORTED_CHAINS");
    bytes32 internal constant TS_CHAIN_COUNT = keccak256("D4L_TS_CHAIN_COUNT");
    bytes32 internal constant TS_ROUTE_NAME = keccak256("D4L_TS_ROUTE_NAME");
    bytes32 internal constant TS_REASON = keccak256("D4L_TS_REASON");

    /**
     * @dev Stores a bytes32 value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeBytes32(bytes32 key, bytes32 value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a bytes32 value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadBytes32(bytes32 key) internal view returns (bytes32 value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores a uint256 value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeUint256(bytes32 key, uint256 value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a uint256 value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadUint256(bytes32 key) internal view returns (uint256 value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores an address value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeAddress(bytes32 key, address value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads an address value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadAddress(bytes32 key) internal view returns (address value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores a boolean value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeBool(bytes32 key, bool value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a boolean value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadBool(bytes32 key) internal view returns (bool value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores a uint8 value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeUint8(bytes32 key, uint8 value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a uint8 value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadUint8(bytes32 key) internal view returns (uint8 value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores a uint64 value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeUint64(bytes32 key, uint64 value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a uint64 value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadUint64(bytes32 key) internal view returns (uint64 value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores a bytes4 value in transient storage
     * @param key The storage key
     * @param value The value to store
     */
    function storeBytes4(bytes32 key, bytes4 value) internal {
        assembly {
            tstore(key, value)
        }
    }

    /**
     * @dev Loads a bytes4 value from transient storage
     * @param key The storage key
     * @return value The loaded value
     */
    function loadBytes4(bytes32 key) internal view returns (bytes4 value) {
        assembly {
            value := tload(key)
        }
    }

    /**
     * @dev Stores route execution context in transient storage
     * @param routeId The route ID
     * @param caller The caller address
     * @param sourceChainId The source chain ID
     * @param selector The function selector
     */
    function storeRouteContext(
        bytes32 routeId,
        address caller,
        uint64 sourceChainId,
        bytes4 selector
    ) internal {
        storeBytes32(TS_ROUTE_ID, routeId);
        storeAddress(TS_CALLER, caller);
        storeUint64(TS_SOURCE_CHAIN_ID, sourceChainId);
        storeBytes4(TS_SELECTOR, selector);
    }

    /**
     * @dev Loads route execution context from transient storage
     * @return routeId The route ID
     * @return caller The caller address
     * @return sourceChainId The source chain ID
     * @return selector The function selector
     */
    function loadRouteContext() internal view returns (
        bytes32 routeId,
        address caller,
        uint64 sourceChainId,
        bytes4 selector
    ) {
        routeId = loadBytes32(TS_ROUTE_ID);
        caller = loadAddress(TS_CALLER);
        sourceChainId = loadUint64(TS_SOURCE_CHAIN_ID);
        selector = loadBytes4(TS_SELECTOR);
    }

    /**
     * @dev Stores cross-chain execution context in transient storage
     * @param destinationChainId The destination chain ID
     * @param gasLimit The gas limit for execution
     * @param bridgeAdapter The bridge adapter address
     * @param messageFee The message fee
     * @param transactionId The transaction ID
     */
    function storeCrossChainContext(
        uint64 destinationChainId,
        uint256 gasLimit,
        address bridgeAdapter,
        uint256 messageFee,
        bytes32 transactionId
    ) internal {
        storeUint64(TS_DESTINATION_CHAIN_ID, destinationChainId);
        storeUint256(TS_GAS_LIMIT, gasLimit);
        storeAddress(TS_BRIDGE_ADAPTER, bridgeAdapter);
        storeUint256(TS_MESSAGE_FEE, messageFee);
        storeBytes32(TS_TRANSACTION_ID, transactionId);
    }

    /**
     * @dev Loads cross-chain execution context from transient storage
     * @return destinationChainId The destination chain ID
     * @return gasLimit The gas limit for execution
     * @return bridgeAdapter The bridge adapter address
     * @return messageFee The message fee
     * @return transactionId The transaction ID
     */
    function loadCrossChainContext() internal view returns (
        uint64 destinationChainId,
        uint256 gasLimit,
        address bridgeAdapter,
        uint256 messageFee,
        bytes32 transactionId
    ) {
        destinationChainId = loadUint64(TS_DESTINATION_CHAIN_ID);
        gasLimit = loadUint256(TS_GAS_LIMIT);
        bridgeAdapter = loadAddress(TS_BRIDGE_ADAPTER);
        messageFee = loadUint256(TS_MESSAGE_FEE);
        transactionId = loadBytes32(TS_TRANSACTION_ID);
    }

    /**
     * @dev Stores route metadata in transient storage
     * @param name The route name
     * @param implementation The implementation address
     * @param routeType The route type
     * @param active Whether the route is active
     * @param permissionLevel The permission level
     */
    function storeRouteMetadata(
        string memory name,
        address implementation,
        uint8 routeType,
        bool active,
        uint8 permissionLevel
    ) internal {
        // We can't store strings directly in transient storage
        // So we'll store the hash of the name
        storeBytes32(TS_ROUTE_NAME, keccak256(bytes(name)));
        storeAddress(TS_IMPLEMENTATION, implementation);
        storeUint8(TS_ROUTE_TYPE, routeType);
        storeBool(TS_ACTIVE, active);
        storeUint8(TS_PERMISSION_LEVEL, permissionLevel);
    }

    /**
     * @dev Stores execution result in transient storage
     * @param success Whether the execution was successful
     * @param gasUsed The gas used for execution
     * @param reason The reason for failure (if any)
     */
    function storeExecutionResult(
        bool success,
        uint256 gasUsed,
        string memory reason
    ) internal {
        storeBool(TS_SUCCESS, success);
        storeUint256(TS_GAS_USED, gasUsed);
        // We can't store strings directly in transient storage
        // So we'll store the hash of the reason
        if (bytes(reason).length > 0) {
            storeBytes32(TS_REASON, keccak256(bytes(reason)));
        }
    }

    /**
     * @dev Loads execution result from transient storage
     * @return success Whether the execution was successful
     * @return gasUsed The gas used for execution
     */
    function loadExecutionResult() internal view returns (
        bool success,
        uint256 gasUsed
    ) {
        success = loadBool(TS_SUCCESS);
        gasUsed = loadUint256(TS_GAS_USED);
    }

    /**
     * @dev Clears all transient storage used by the router
     */
    function clearAll() internal {
        assembly {
            tstore(TS_ROUTE_ID, 0)
            tstore(TS_CALLER, 0)
            tstore(TS_SOURCE_CHAIN_ID, 0)
            tstore(TS_SELECTOR, 0)
            tstore(TS_PERMISSION_LEVEL, 0)
            tstore(TS_SUCCESS, 0)
            tstore(TS_GAS_USED, 0)
            tstore(TS_EXECUTION_DATA, 0)
            tstore(TS_DESTINATION_CHAIN_ID, 0)
            tstore(TS_TRANSACTION_ID, 0)
            tstore(TS_BRIDGE_ADAPTER, 0)
            tstore(TS_MESSAGE_FEE, 0)
            tstore(TS_GAS_LIMIT, 0)
            tstore(TS_REFUND_AMOUNT, 0)
            tstore(TS_ROUTE_TYPE, 0)
            tstore(TS_IMPLEMENTATION, 0)
            tstore(TS_ACTIVE, 0)
            tstore(TS_SUPPORTED_CHAINS, 0)
            tstore(TS_CHAIN_COUNT, 0)
            tstore(TS_ROUTE_NAME, 0)
            tstore(TS_REASON, 0)
        }
    }
}
