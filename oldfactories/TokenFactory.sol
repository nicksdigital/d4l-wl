// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./TokenImplementation.sol";
import "./interfaces/ITokenFactory.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating new upgradeable token instances
 */
contract TokenFactory is Ownable, ITokenFactory {
    // The address of the token implementation contract
    address public tokenImplementation;
    
    // Mapping from token address to token metadata
    mapping(address => TokenMetadata) public tokens;
    
    // Array to keep track of all created tokens
    address[] public allTokens;
    
    /**
     * @dev Constructor that sets the token implementation and the factory owner
     * @param _tokenImplementation The address of the token implementation contract
     */
    constructor(address _tokenImplementation) Ownable(msg.sender) {
        require(_tokenImplementation != address(0), "TokenFactory: implementation cannot be zero address");
        tokenImplementation = _tokenImplementation;
    }
    
    /**
     * @dev Creates a new token instance
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param decimals The number of decimals for the token
     * @param initialSupply The initial supply of tokens
     * @param tokenOwner The owner of the token contract
     * @return tokenAddress The address of the newly created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address tokenOwner
    ) external returns (address tokenAddress) {
        require(bytes(name).length > 0, "TokenFactory: name cannot be empty");
        require(bytes(symbol).length > 0, "TokenFactory: symbol cannot be empty");
        require(tokenOwner != address(0), "TokenFactory: owner cannot be zero address");
        
        // Create initialization data
        bytes memory initData = abi.encodeWithSelector(
            TokenImplementation.initialize.selector,
            name,
            symbol,
            decimals,
            initialSupply,
            tokenOwner
        );
        
        // Deploy proxy contract
        ERC1967Proxy proxy = new ERC1967Proxy(
            tokenImplementation,
            initData
        );
        
        tokenAddress = address(proxy);
        
        // Store token metadata
        tokens[tokenAddress] = TokenMetadata({
            name: name,
            symbol: symbol,
            decimals: decimals,
            owner: tokenOwner,
            exists: true
        });
        
        // Add to the list of all tokens
        allTokens.push(tokenAddress);
        
        // Emit event
        emit TokenCreated(tokenAddress, name, symbol, decimals, tokenOwner);
        
        return tokenAddress;
    }
    
    /**
     * @dev Upgrades the token implementation contract
     * @param newImplementation The address of the new implementation contract
     */
    function upgradeImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "TokenFactory: new implementation cannot be zero address");
        require(newImplementation != tokenImplementation, "TokenFactory: new implementation must be different");
        
        address oldImplementation = tokenImplementation;
        tokenImplementation = newImplementation;
        
        emit ImplementationUpgraded(oldImplementation, newImplementation);
    }
    
    /**
     * @dev Returns the total number of tokens created by this factory
     * @return The number of tokens
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Checks if an address is a token created by this factory
     * @param tokenAddress The address to check
     * @return True if the address is a token created by this factory
     */
    function isTokenFromFactory(address tokenAddress) external view returns (bool) {
        return tokens[tokenAddress].exists;
    }
}
