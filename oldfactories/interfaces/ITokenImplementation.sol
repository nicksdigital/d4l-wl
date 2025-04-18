// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

/**
 * @title ITokenImplementation
 * @dev Interface for the TokenImplementation contract
 */
interface ITokenImplementation is IERC20Upgradeable {
    /**
     * @dev Initializes the token with a name, symbol, decimals, initial supply, and owner
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param decimals_ The number of decimals for the token
     * @param initialSupply The initial supply of tokens
     * @param owner The owner of the token contract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address owner
    ) external;
    
    /**
     * @dev Returns the number of decimals used for token
     */
    function decimals() external view returns (uint8);
    
    /**
     * @dev Mints new tokens
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external;
    
    /**
     * @dev Burns tokens from the caller
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external;
    
    /**
     * @dev Burns tokens from a specific account (with allowance)
     * @param account The account to burn from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) external;
    
    /**
     * @dev Returns the token owner
     */
    function owner() external view returns (address);
    
    /**
     * @dev Transfers ownership of the contract to a new account
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external;
}
