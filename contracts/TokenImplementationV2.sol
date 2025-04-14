// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenImplementation.sol";

/**
 * @title TokenImplementationV2
 * @dev Improved version of the token implementation with additional features
 */
contract TokenImplementationV2 is TokenImplementation {
    // New state variables for V2
    bool public paused;
    mapping(address => bool) public blacklisted;
    uint256 public maxTransferAmount;
    
    /**
     * @dev Initializes the V2 specific variables
     * @param _maxTransferAmount The maximum amount that can be transferred in a single transaction
     */
    function initializeV2(uint256 _maxTransferAmount) public reinitializer(2) {
        maxTransferAmount = _maxTransferAmount;
        paused = false;
    }
    
    /**
     * @dev Pauses all token transfers
     */
    function pause() public onlyOwner {
        paused = true;
    }
    
    /**
     * @dev Unpauses all token transfers
     */
    function unpause() public onlyOwner {
        paused = false;
    }
    
    /**
     * @dev Adds an address to the blacklist
     * @param account The address to blacklist
     */
    function blacklist(address account) public onlyOwner {
        blacklisted[account] = true;
    }
    
    /**
     * @dev Removes an address from the blacklist
     * @param account The address to remove from the blacklist
     */
    function unblacklist(address account) public onlyOwner {
        blacklisted[account] = false;
    }
    
    /**
     * @dev Sets the maximum transfer amount
     * @param amount The new maximum transfer amount
     */
    function setMaxTransferAmount(uint256 amount) public onlyOwner {
        maxTransferAmount = amount;
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!paused, "TokenImplementationV2: token transfer while paused");
        require(!blacklisted[from], "TokenImplementationV2: sender is blacklisted");
        require(!blacklisted[to], "TokenImplementationV2: recipient is blacklisted");
        
        if (maxTransferAmount > 0) {
            require(amount <= maxTransferAmount, "TokenImplementationV2: transfer amount exceeds maximum");
        }
        
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[47] private __gap;
}
