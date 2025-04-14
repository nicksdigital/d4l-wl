// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ID4LRouteImplementation.sol";
import "../interfaces/ID4LMultichainRouter.sol";
import "../utils/D4LTransientStorage.sol";

/**
 * @title D4LBaseRouteImplementation
 * @dev Base contract for route implementations
 */
abstract contract D4LBaseRouteImplementation is ID4LRouteImplementation, Ownable {
    using D4LTransientStorage for *;

    // The router contract
    address public immutable router;
    
    // The route name
    string private _name;
    
    // The route type
    uint8 private immutable _routeType;
    
    // Mapping of supported chains
    mapping(uint256 => bool) private _supportedChains;
    
    // Array of supported chains
    uint256[] private _supportedChainsArray;
    
    // Mapping of supported selectors
    mapping(bytes4 => bool) private _supportedSelectors;
    
    // Array of supported selectors
    bytes4[] private _supportedSelectorsArray;

    /**
     * @dev Modifier to ensure the caller is the router
     */
    modifier onlyRouter() {
        require(msg.sender == router, "D4LBaseRouteImplementation: caller is not the router");
        _;
    }

    /**
     * @dev Constructor
     * @param name_ The name of the route
     * @param routeType_ The type of the route
     * @param router_ The address of the router contract
     * @param supportedChains Array of supported chain IDs
     * @param owner_ The owner of the route implementation
     */
    constructor(
        string memory name_,
        uint8 routeType_,
        address router_,
        uint256[] memory supportedChains,
        address owner_
    ) Ownable(owner_) {
        require(bytes(name_).length > 0, "D4LBaseRouteImplementation: name cannot be empty");
        require(router_ != address(0), "D4LBaseRouteImplementation: router cannot be zero address");
        
        _name = name_;
        _routeType = routeType_;
        router = router_;
        
        // Set supported chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            _supportedChains[supportedChains[i]] = true;
        }
        _supportedChainsArray = supportedChains;
        
        // Register selectors in the implementation contract
        _registerSelectors();
    }

    /**
     * @dev Returns the name of the route implementation
     * @return name The name of the route implementation
     */
    function name() external view override returns (string memory) {
        return _name;
    }
    
    /**
     * @dev Returns the type of the route implementation
     * @return routeType The type of the route
     */
    function routeType() external view override returns (uint8) {
        return _routeType;
    }
    
    /**
     * @dev Returns the function selectors supported by this implementation
     * @return selectors Array of function selectors
     */
    function getSupportedSelectors() external view override returns (bytes4[] memory) {
        return _supportedSelectorsArray;
    }
    
    /**
     * @dev Validates if the implementation can handle the given selector
     * @param selector The function selector to validate
     * @return valid Whether the selector is valid for this implementation
     */
    function validateSelector(bytes4 selector) external view override returns (bool) {
        return _supportedSelectors[selector];
    }
    
    /**
     * @dev Checks if this implementation supports a specific chain
     * @param chainId The chain ID to check
     * @return supported Whether the chain is supported
     */
    function supportsChain(uint256 chainId) external view override returns (bool) {
        return _supportedChains[chainId];
    }
    
    /**
     * @dev Gets all chains supported by this implementation
     * @return chainIds Array of supported chain IDs
     */
    function getSupportedChains() external view override returns (uint256[] memory) {
        return _supportedChainsArray;
    }
    
    /**
     * @dev Executes the route with the given data
     * @param data The calldata to execute
     * @param caller The address that initiated the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function execute(
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) external payable override onlyRouter returns (bool success, bytes memory result) {
        // Store execution context in transient storage
        uint256 gasStart = gasleft();
        
        // Extract the selector from the data
        bytes4 selector;
        if (data.length >= 4) {
            selector = bytes4(data[:4]);
        }
        
        // Validate the selector
        require(_supportedSelectors[selector], "D4LBaseRouteImplementation: unsupported selector");
        
        // Validate the chain
        require(_supportedChains[sourceChainId], "D4LBaseRouteImplementation: unsupported chain");
        
        // Execute the function
        (success, result) = _execute(data, caller, sourceChainId);
        
        // Store execution result in transient storage
        uint256 gasUsed = gasStart - gasleft();
        D4LTransientStorage.storeExecutionResult(
            success,
            gasUsed,
            success ? "" : string(result)
        );
        
        return (success, result);
    }
    
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
    ) external view override returns (ID4LMultichainRouter.PermissionLevel permissionLevel, string memory reason) {
        // Validate the selector
        require(_supportedSelectors[selector], "D4LBaseRouteImplementation: unsupported selector");
        
        // Validate the chain
        require(_supportedChains[sourceChainId], "D4LBaseRouteImplementation: unsupported chain");
        
        // Check permissions
        return _checkPermissions(selector, data, caller, sourceChainId);
    }
    
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
    ) external view override returns (uint256 gasEstimate) {
        // Validate the selector
        require(_supportedSelectors[selector], "D4LBaseRouteImplementation: unsupported selector");
        
        // Validate the chain
        require(_supportedChains[destinationChainId], "D4LBaseRouteImplementation: unsupported chain");
        
        // Estimate gas
        return _estimateGas(selector, data, destinationChainId);
    }
    
    /**
     * @dev Adds a supported chain
     * @param chainId The chain ID to add
     */
    function addSupportedChain(uint256 chainId) external onlyOwner {
        require(!_supportedChains[chainId], "D4LBaseRouteImplementation: chain already supported");
        
        _supportedChains[chainId] = true;
        _supportedChainsArray.push(chainId);
    }
    
    /**
     * @dev Removes a supported chain
     * @param chainId The chain ID to remove
     */
    function removeSupportedChain(uint256 chainId) external onlyOwner {
        require(_supportedChains[chainId], "D4LBaseRouteImplementation: chain not supported");
        
        _supportedChains[chainId] = false;
        
        // Remove from the array
        for (uint256 i = 0; i < _supportedChainsArray.length; i++) {
            if (_supportedChainsArray[i] == chainId) {
                _supportedChainsArray[i] = _supportedChainsArray[_supportedChainsArray.length - 1];
                _supportedChainsArray.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Registers a supported selector
     * @param selector The selector to register
     */
    function _registerSelector(bytes4 selector) internal {
        require(!_supportedSelectors[selector], "D4LBaseRouteImplementation: selector already registered");
        
        _supportedSelectors[selector] = true;
        _supportedSelectorsArray.push(selector);
    }
    
    /**
     * @dev Registers supported selectors
     * This function should be overridden by derived contracts
     */
    function _registerSelectors() internal virtual;
    
    /**
     * @dev Executes the route with the given data
     * This function should be overridden by derived contracts
     * @param data The calldata to execute
     * @param caller The address that initiated the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function _execute(
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) internal virtual returns (bool success, bytes memory result);
    
    /**
     * @dev Checks permissions for the route
     * This function should be overridden by derived contracts
     * @param selector The function selector to check
     * @param data The calldata to be executed
     * @param caller The address that will initiate the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return permissionLevel The required permission level
     * @return reason Optional reason string if permission is denied (empty if allowed)
     */
    function _checkPermissions(
        bytes4 selector,
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) internal virtual view returns (ID4LMultichainRouter.PermissionLevel permissionLevel, string memory reason);
    
    /**
     * @dev Estimates gas cost for executing the route
     * This function should be overridden by derived contracts
     * @param selector The function selector
     * @param data The calldata to be executed
     * @param destinationChainId The chain ID where the execution will happen
     * @return gasEstimate Estimated gas cost
     */
    function _estimateGas(
        bytes4 selector,
        bytes calldata data,
        uint256 destinationChainId
    ) internal virtual view returns (uint256 gasEstimate);
}
