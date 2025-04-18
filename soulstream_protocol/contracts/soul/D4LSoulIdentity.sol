// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../utils/D4LPacker.sol";
import "../utils/D4LTransientStorage.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";

/**
 * @title D4LSoulIdentity
 * @dev A minimal proxy implementation for soulbound identity
 * This contract is deployed deterministically using Create2 and cannot be upgraded
 */
contract D4LSoulIdentity is Initializable, ReentrancyGuard {
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;
    using D4LPacker for *;
    using D4LTransientStorage for *;

    // The owner of this soul identity
    address public immutable owner;

    // The app salt used to create this identity
    bytes32 public immutable appSalt;

    // The routing intent hash
    bytes32 public immutable routingIntentHash;

    // Optional zkProof verification key
    bytes32 public immutable zkProofKey;

    // The registry contract
    address public immutable registry;

    // Mapping of authorized routes
    mapping(bytes32 => bool) public authorizedRoutes;

    // Mapping of executed intents (to prevent replay)
    mapping(bytes32 => bool) public executedIntents;

    // Events
    event IntentExecuted(bytes32 indexed intentId, bytes32 indexed routeId, address indexed executor);
    event RouteAuthorized(bytes32 indexed routeId, bool authorized);

    /**
     * @dev Constructor that sets the immutable parameters
     * @param _owner The owner of this soul identity
     * @param _appSalt The app salt used to create this identity
     * @param _routingIntentHash The routing intent hash
     * @param _zkProofKey Optional zkProof verification key
     * @param _registry The registry address
     */
    constructor(
        address _owner,
        bytes32 _appSalt,
        bytes32 _routingIntentHash,
        bytes32 _zkProofKey,
        address _registry
    ) {
        owner = _owner;
        appSalt = _appSalt;
        routingIntentHash = _routingIntentHash;
        zkProofKey = _zkProofKey;
        registry = _registry;

        // Disable initializers to prevent re-initialization
        _disableInitializers();
    }

    /**
     * @dev Authorizes a route
     * @param routeId The ID of the route to authorize
     * @param authorized Whether the route is authorized
     */
    function authorizeRoute(bytes32 routeId, bool authorized) external {
        // Input validation
        require(msg.sender == owner, "D4LSoulIdentity: caller is not the owner");
        require(routeId != bytes32(0), "D4LSoulIdentity: routeId cannot be zero");

        // Update authorization status
        authorizedRoutes[routeId] = authorized;

        // Emit event
        emit RouteAuthorized(routeId, authorized);
    }

    /**
     * @dev Executes an intent
     * @param intentId The ID of the intent to execute
     * @param routeId The ID of the route to execute
     * @param data The data to pass to the route
     * @param signature The signature of the intent
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeIntent(
        bytes32 intentId,
        bytes32 routeId,
        bytes calldata data,
        bytes calldata signature
    ) external nonReentrant returns (bool success, bytes memory result) {
        // Input validation
        require(intentId != bytes32(0), "D4LSoulIdentity: intentId cannot be zero");
        require(routeId != bytes32(0), "D4LSoulIdentity: routeId cannot be zero");
        require(signature.length > 0, "D4LSoulIdentity: signature cannot be empty");

        // Check if the intent has already been executed
        require(!executedIntents[intentId], "D4LSoulIdentity: intent already executed");

        // Check if the route is authorized
        require(authorizedRoutes[routeId], "D4LSoulIdentity: route not authorized");

        // Verify the signature
        bytes32 messageHash = keccak256(abi.encodePacked(intentId, routeId, data));
        bytes32 signedHash = messageHash.toEthSignedMessageHash();
        (address signer, ECDSA.RecoverError errors, bytes32 errorsCode) = signedHash.tryRecover(signature);

        require(errors == ECDSA.RecoverError.NoError, "D4LSoulIdentity: invalid signature");
        require(signer == owner, "D4LSoulIdentity: invalid signature");

        // Mark the intent as executed (CEI pattern - effects before interactions)
        executedIntents[intentId] = true;

        // Store execution context in transient storage
        D4LTransientStorage.storeBytes32(D4LTransientStorage.TS_ROUTE_ID, routeId);
        D4LTransientStorage.storeAddress(D4LTransientStorage.TS_CALLER, owner);

        // Execute the route via the router (external interaction)
        (success, result) = _executeRoute(routeId, data);

        // Store execution result in transient storage
        D4LTransientStorage.storeBool(D4LTransientStorage.TS_SUCCESS, success);

        emit IntentExecuted(intentId, routeId, msg.sender);

        return (success, result);
    }

    /**
     * @dev Executes an intent with zkProof
     * @param intentId The ID of the intent to execute
     * @param routeId The ID of the route to execute
     * @param data The data to pass to the route
     * @param zkProof The zkProof to verify
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function executeIntentWithZkProof(
        bytes32 intentId,
        bytes32 routeId,
        bytes calldata data,
        bytes calldata zkProof
    ) external nonReentrant returns (bool success, bytes memory result) {
        // Input validation
        require(intentId != bytes32(0), "D4LSoulIdentity: intentId cannot be zero");
        require(routeId != bytes32(0), "D4LSoulIdentity: routeId cannot be zero");
        require(zkProof.length > 0, "D4LSoulIdentity: zkProof cannot be empty");

        // Check if the intent has already been executed
        require(!executedIntents[intentId], "D4LSoulIdentity: intent already executed");

        // Check if the route is authorized
        require(authorizedRoutes[routeId], "D4LSoulIdentity: route not authorized");

        // Verify the zkProof
        require(zkProofKey != bytes32(0), "D4LSoulIdentity: zkProof not supported");
        require(_verifyZkProof(zkProof, routeId, data), "D4LSoulIdentity: invalid zkProof");

        // Mark the intent as executed (CEI pattern - effects before interactions)
        executedIntents[intentId] = true;

        // Store execution context in transient storage
        D4LTransientStorage.storeBytes32(D4LTransientStorage.TS_ROUTE_ID, routeId);
        D4LTransientStorage.storeAddress(D4LTransientStorage.TS_CALLER, owner);

        // Execute the route via the router (external interaction)
        (success, result) = _executeRoute(routeId, data);

        // Store execution result in transient storage
        D4LTransientStorage.storeBool(D4LTransientStorage.TS_SUCCESS, success);

        emit IntentExecuted(intentId, routeId, msg.sender);

        return (success, result);
    }

    /**
     * @dev Executes a route
     * @param routeId The ID of the route to execute
     * @param data The data to pass to the route
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function _executeRoute(
        bytes32 routeId,
        bytes calldata data
    ) internal returns (bool success, bytes memory result) {
        // Input validation
        require(routeId != bytes32(0), "D4LSoulIdentity: routeId cannot be zero");

        // Get the router address from the route registry
        address router = ID4LSoulStreamRegistry(registry).getRouterForRoute(routeId);
        require(router != address(0), "D4LSoulIdentity: router not found");
        require(router.code.length > 0, "D4LSoulIdentity: router has no code");

        // Execute the route with proper error handling
        (success, result) = router.call(abi.encodeWithSignature(
            "executeRoute(bytes32,bytes)",
            routeId,
            data
        ));

        // If the call failed but returned data, try to extract the revert reason
        if (!success && result.length > 0) {
            // Check if the result contains a revert reason
            // The format is: 0x08c379a0 (selector) + 32 bytes offset + 32 bytes length + error string
            if (result.length >= 68) {
                bytes4 selector;
                assembly {
                    selector := mload(add(result, 32))
                }

                // Check if this is a standard error string (Error(string))
                if (selector == 0x08c379a0) {
                    // Skip the selector and offset, then decode the error string
                    bytes memory errorMsg;
                    assembly {
                        errorMsg := add(result, 68)
                    }
                    // Return the error with context
                    revert(string(abi.encodePacked("D4LSoulIdentity: router execution failed: ", errorMsg)));
                }
            }
        }

        return (success, result);
    }

    /**
     * @dev Verifies a zkProof
     * @param zkProof The zkProof to verify
     * @param routeId The ID of the route
     * @param data The data to verify
     * @return valid Whether the zkProof is valid
     */
    function _verifyZkProof(
        bytes calldata zkProof,
        bytes32 routeId,
        bytes calldata data
    ) internal view returns (bool) {
        // Input validation
        require(zkProof.length > 0, "D4LSoulIdentity: zkProof cannot be empty");
        require(routeId != bytes32(0), "D4LSoulIdentity: routeId cannot be zero");
        require(zkProofKey != bytes32(0), "D4LSoulIdentity: zkProofKey not set");

        // This is a placeholder for actual zkProof verification
        // In a real implementation, this would call a zkProof verifier contract
        // using the zkProofKey as a reference to the verification key

        // For a production implementation, you would:
        // 1. Use a trusted zkProof verifier contract
        // 2. Verify the proof against the zkProofKey
        // 3. Ensure the proof contains the correct routeId and data hash
        // 4. Check for replay protection

        // For now, we'll just check if the zkProof is not empty and contains valid data
        // This should be replaced with actual verification in production
        bool hasValidFormat = zkProof.length >= 64; // Minimum size for a valid proof
        bool containsRouteId = false;

        // Check if the proof contains the routeId (simplified check)
        if (hasValidFormat) {
            bytes32 extractedRouteId;
            assembly {
                // Extract the first 32 bytes as a potential routeId
                extractedRouteId := calldataload(zkProof.offset)
            }
            containsRouteId = (extractedRouteId == routeId);
        }

        return hasValidFormat && containsRouteId;
    }

    /**
     * @dev Prevents sending ETH to this contract
     */
    receive() external payable {
        revert("D4LSoulIdentity: cannot receive ETH");
    }

    /**
     * @dev Prevents calling unknown functions
     */
    fallback() external {
        revert("D4LSoulIdentity: function not found");
    }
}


