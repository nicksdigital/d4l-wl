// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC721
 * @dev Mock ERC721 token for testing
 */
contract MockERC721 is ERC721, Ownable {
    /**
     * @dev Constructor
     * @param name The name of the token
     * @param symbol The symbol of the token
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {}
    
    /**
     * @dev Mints a new token
     * @param to The address to mint the token to
     * @param tokenId The ID of the token to mint
     */
    function mint(address to, uint256 tokenId) external onlyOwner {
        _mint(to, tokenId);
    }
    
    /**
     * @dev Burns a token
     * @param tokenId The ID of the token to burn
     */
    function burn(uint256 tokenId) external {
        require(isApprovedForAll(ownerOf(tokenId), msg.sender), "MockERC721: caller is not owner nor approved");
        _burn(tokenId);
    }
}
