// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenFactory
 * @dev Interface for the TokenFactory contract
 */
interface ITokenFactory {
    /**
     * @dev Structure to store token metadata
     */
    struct TokenMetadata {
        string name;
        string symbol;
        uint8 decimals;
        address owner;
        bool exists;
    }
    
    /**
     * @dev Event emitted when a token is created
     */
    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint8 decimals, address owner);
    
    /**
     * @dev Event emitted when the token implementation is upgraded
     */
    event ImplementationUpgraded(address indexed oldImplementation, address indexed newImplementation);
    
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
    ) external returns (address tokenAddress);
    
    /**
     * @dev Upgrades the token implementation contract
     * @param newImplementation The address of the new implementation contract
     */
    function upgradeImplementation(address newImplementation) external;
    
    /**
     * @dev Returns the address of the token implementation contract
     */
    function tokenImplementation() external view returns (address);
    
    /**
     * @dev Returns metadata for a specific token
     * @param tokenAddress The address of the token
     */
    function tokens(address tokenAddress) external view returns (TokenMetadata memory);
    
    /**
     * @dev Returns the token at the specified index
     * @param index The index of the token
     */
    function allTokens(uint256 index) external view returns (address);
    
    /**
     * @dev Returns the total number of tokens created by this factory
     * @return The number of tokens
     */
    function getTokenCount() external view returns (uint256);
    
    /**
     * @dev Checks if an address is a token created by this factory
     * @param tokenAddress The address to check
     * @return True if the address is a token created by this factory
     */
    function isTokenFromFactory(address tokenAddress) external view returns (bool);
}
