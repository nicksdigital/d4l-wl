// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./ID4LMultichainRouter.sol";

/**
 * @title ID4LRouteImplementation
 * @dev Interface for route implementations that can be registered with the D4L Router
 */
interface ID4LRouteImplementation {
    /**
     * @dev Returns the name of the route implementation
     * @return name The name of the route implementation
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the type of the route implementation
     * @return routeType The type of the route (0 = swap, 1 = liquidity, etc.)
     */
    function routeType() external view returns (uint8);

    /**
     * @dev Returns the function selectors supported by this implementation
     * @return selectors Array of function selectors
     */
    function getSupportedSelectors() external view returns (bytes4[] memory);

    /**
     * @dev Executes the route with the given data
     * @param data The calldata to execute
     * @param caller The address that initiated the route execution
     * @param sourceChainId The chain ID where the transaction originated (current chain for local calls)
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function execute(
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) external payable returns (bool success, bytes memory result);

    /**
     * @dev Validates if the implementation can handle the given selector
     * @param selector The function selector to validate
     * @return valid Whether the selector is valid for this implementation
     */
    function validateSelector(bytes4 selector) external view returns (bool);

    /**
     * @dev Pre-check to determine if the route requires special permissions
     * @param selector The function selector to check
     * @param data The calldata to be executed
     * @param caller The address that will initiate the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return permissionLevel The required permission level
     * @return reason Optional reason string if permission is denied (empty if allowed)
     */
    function checkPermissions(
        bytes4 selector,
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) external view returns (ID4LMultichainRouter.PermissionLevel permissionLevel, string memory reason);

    /**
     * @dev Estimates gas cost for executing the route
     * @param selector The function selector
     * @param data The calldata to be executed
     * @param destinationChainId The chain ID where the execution will happen
     * @return gasEstimate Estimated gas cost
     */
    function estimateGas(
        bytes4 selector,
        bytes calldata data,
        uint256 destinationChainId
    ) external view returns (uint256 gasEstimate);

    /**
     * @dev Checks if this implementation supports a specific chain
     * @param chainId The chain ID to check
     * @return supported Whether the chain is supported
     */
    function supportsChain(uint256 chainId) external view returns (bool);

    /**
     * @dev Gets all chains supported by this implementation
     * @return chainIds Array of supported chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory);
