// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title TokenImplementation
 * @dev Implementation of an upgradeable ERC20 token
 */
contract TokenImplementation is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint8 private _decimals;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
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
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
        
        _decimals = decimals_;
        
        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }
    
    /**
     * @dev Returns the number of decimals used for token
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mints new tokens
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burns tokens from the caller
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
    
    /**
     * @dev Burns tokens from a specific account (with allowance)
     * @param account The account to burn from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
    
    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract.
     * Called by {upgradeTo} and {upgradeToAndCall}.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[49] private __gap;
}
