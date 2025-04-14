// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ID4LAsset.sol";
import "../interfaces/ID4LSoulIdentityManager.sol";

/**
 * @title D4LERC721Asset
 * @dev Implementation of the ID4LAsset interface for ERC721 tokens
 * This contract wraps an existing ERC721 token and adds soulbound functionality
 */
contract D4LERC721Asset is ID4LAsset, Ownable, ReentrancyGuard, ERC721Holder {
    // The underlying ERC721 token
    IERC721 public immutable token;
    
    // The soul identity manager
    ID4LSoulIdentityManager public immutable soulManager;
    
    // Mapping of soul identity to linked token IDs
    mapping(address => uint256[]) private _soulTokenIds;
    
    // Mapping of token ID to soul identity
    mapping(uint256 => address) private _tokenIdToSoul;
    
    // Total number of linked tokens
    uint256 private _totalLinkedTokens;
    
    // Mapping of authorized routes
    mapping(bytes32 => bool) private _authorizedRoutes;
    
    // Asset constraints
    bool public immutable transferable;
    bool public immutable divisible; // Always false for ERC721
    bool public immutable consumable;
    
    // Events
    event RouteAuthorized(bytes32 indexed routeId, bool authorized);
    event TokenLinked(uint256 indexed tokenId, address indexed soulId);
    event TokenUnlinked(uint256 indexed tokenId, address indexed soulId);
    event TokenTransferred(uint256 indexed tokenId, address indexed fromSoul, address indexed toSoul);
    
    /**
     * @dev Constructor
     * @param _token The address of the underlying ERC721 token
     * @param _soulManager The address of the soul identity manager
     * @param _transferable Whether the asset is transferable between souls
     * @param _consumable Whether the asset is consumable
     * @param _owner The owner of the contract
     */
    constructor(
        address _token,
        address _soulManager,
        bool _transferable,
        bool _consumable,
        address _owner
    ) Ownable(_owner) {
        require(_token != address(0), "D4LERC721Asset: token cannot be zero address");
        require(_soulManager != address(0), "D4LERC721Asset: soul manager cannot be zero address");
        
        token = IERC721(_token);
        soulManager = ID4LSoulIdentityManager(_soulManager);
        transferable = _transferable;
        divisible = false; // ERC721 tokens are not divisible
        consumable = _consumable;
    }
    
    /**
     * @dev Authorizes a route for this asset
     * @param routeId The ID of the route to authorize
     * @param authorized Whether the route is authorized
     */
    function authorizeRoute(bytes32 routeId, bool authorized) external onlyOwner {
        require(routeId != bytes32(0), "D4LERC721Asset: routeId cannot be zero");
        
        _authorizedRoutes[routeId] = authorized;
        
        emit RouteAuthorized(routeId, authorized);
    }
    
    /**
     * @dev Links an asset to a soul identity
     * @param soulId The soul identity to link the asset to
     * @param amount The token ID to link (for ERC721, amount is used as the token ID)
     * @return success Whether the linking was successful
     */
    function linkToSoul(address soulId, uint256 amount) external override nonReentrant returns (bool success) {
        // For ERC721, amount is used as the token ID
        uint256 tokenId = amount;
        
        // Validate parameters
        require(soulId != address(0), "D4LERC721Asset: soulId cannot be zero address");
        require(soulManager.isSoul(soulId), "D4LERC721Asset: not a valid soul identity");
        require(_tokenIdToSoul[tokenId] == address(0), "D4LERC721Asset: token already linked");
        
        // Get the owner of the soul identity
        address owner = _getSoulOwner(soulId);
        
        // Check if the caller is the owner of the soul identity
        require(msg.sender == owner, "D4LERC721Asset: caller is not the soul owner");
        
        // Transfer the token from the owner to this contract
        token.safeTransferFrom(owner, address(this), tokenId);
        
        // Update the mappings
        _soulTokenIds[soulId].push(tokenId);
        _tokenIdToSoul[tokenId] = soulId;
        
        // Update the total linked tokens
        _totalLinkedTokens++;
        
        emit TokenLinked(tokenId, soulId);
        emit AssetLinked(address(token), soulId, tokenId);
        
        return true;
    }
    
    /**
     * @dev Unlinks an asset from a soul identity
     * @param soulId The soul identity to unlink the asset from
     * @param amount The token ID to unlink (for ERC721, amount is used as the token ID)
     * @return success Whether the unlinking was successful
     */
    function unlinkFromSoul(address soulId, uint256 amount) external override nonReentrant returns (bool success) {
        // For ERC721, amount is used as the token ID
        uint256 tokenId = amount;
        
        // Validate parameters
        require(soulId != address(0), "D4LERC721Asset: soulId cannot be zero address");
        require(soulManager.isSoul(soulId), "D4LERC721Asset: not a valid soul identity");
        require(_tokenIdToSoul[tokenId] == soulId, "D4LERC721Asset: token not linked to this soul");
        
        // Get the owner of the soul identity
        address owner = _getSoulOwner(soulId);
        
        // Check if the caller is the owner of the soul identity
        require(msg.sender == owner, "D4LERC721Asset: caller is not the soul owner");
        
        // Update the mappings
        _removeTokenFromSoul(soulId, tokenId);
        _tokenIdToSoul[tokenId] = address(0);
        
        // Update the total linked tokens
        _totalLinkedTokens--;
        
        // Transfer the token from this contract to the owner
        token.safeTransferFrom(address(this), owner, tokenId);
        
        emit TokenUnlinked(tokenId, soulId);
        emit AssetUnlinked(address(token), soulId, tokenId);
        
        return true;
    }
    
    /**
     * @dev Transfers an asset between soul identities
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The token ID to transfer (for ERC721, amount is used as the token ID)
     * @return success Whether the transfer was successful
     */
    function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) external override nonReentrant returns (bool success) {
        // For ERC721, amount is used as the token ID
        uint256 tokenId = amount;
        
        // Validate parameters
        require(fromSoul != address(0), "D4LERC721Asset: fromSoul cannot be zero address");
        require(toSoul != address(0), "D4LERC721Asset: toSoul cannot be zero address");
        require(soulManager.isSoul(fromSoul), "D4LERC721Asset: fromSoul is not a valid soul identity");
        require(soulManager.isSoul(toSoul), "D4LERC721Asset: toSoul is not a valid soul identity");
        require(_tokenIdToSoul[tokenId] == fromSoul, "D4LERC721Asset: token not linked to fromSoul");
        
        // Check if the asset is transferable
        require(transferable, "D4LERC721Asset: asset is not transferable");
        
        // Get the owner of the source soul identity
        address owner = _getSoulOwner(fromSoul);
        
        // Check if the caller is the owner of the source soul identity
        require(msg.sender == owner, "D4LERC721Asset: caller is not the soul owner");
        
        // Update the mappings
        _removeTokenFromSoul(fromSoul, tokenId);
        _soulTokenIds[toSoul].push(tokenId);
        _tokenIdToSoul[tokenId] = toSoul;
        
        emit TokenTransferred(tokenId, fromSoul, toSoul);
        emit AssetTransferred(address(token), fromSoul, toSoul, tokenId);
        
        return true;
    }
    
    /**
     * @dev Gets the amount of an asset linked to a soul identity
     * @param soulId The soul identity to check
     * @return amount The number of tokens linked to the soul identity
     */
    function balanceOfSoul(address soulId) external view override returns (uint256 amount) {
        return _soulTokenIds[soulId].length;
    }
    
    /**
     * @dev Gets the total amount of the asset linked to all soul identities
     * @return amount The total number of tokens linked to all soul identities
     */
    function totalLinkedAmount() external view override returns (uint256 amount) {
        return _totalLinkedTokens;
    }
    
    /**
     * @dev Checks if an asset can be routed through a specific route
     * @param routeId The ID of the route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The token ID to route (for ERC721, amount is used as the token ID)
     * @return canRoute Whether the asset can be routed
     */
    function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) external view override returns (bool canRoute) {
        // For ERC721, amount is used as the token ID
        uint256 tokenId = amount;
        
        // Check if the route is authorized
        if (!_authorizedRoutes[routeId]) {
            return false;
        }
        
        // Check if the souls are valid
        if (!soulManager.isSoul(fromSoul) || !soulManager.isSoul(toSoul)) {
            return false;
        }
        
        // Check if the token is linked to the source soul
        if (_tokenIdToSoul[tokenId] != fromSoul) {
            return false;
        }
        
        // If the asset is not transferable, fromSoul and toSoul must have the same owner
        if (!transferable && _getSoulOwner(fromSoul) != _getSoulOwner(toSoul)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Gets the asset type
     * @return assetType The type of the asset (1 = ERC20, 2 = ERC721, 3 = ERC1155, 4 = Native, 5 = Custom)
     */
    function assetType() external pure override returns (uint8 assetType) {
        return 2; // ERC721
    }
    
    /**
     * @dev Gets the asset metadata
     * @return name The name of the asset
     * @return symbol The symbol of the asset
     * @return decimals The number of decimals for the asset (always 0 for ERC721)
     */
    function assetMetadata() external view override returns (string memory name, string memory symbol, uint8 decimals) {
        // Try to get the name and symbol from the token
        // If the token doesn't implement these functions, return empty values
        try IERC721Metadata(address(token)).name() returns (string memory _name) {
            name = _name;
        } catch {
            name = "";
        }
        
        try IERC721Metadata(address(token)).symbol() returns (string memory _symbol) {
            symbol = _symbol;
        } catch {
            symbol = "";
        }
        
        // ERC721 tokens don't have decimals
        decimals = 0;
    }
    
    /**
     * @dev Gets the asset constraints
     * @return _transferable Whether the asset is transferable between souls
     * @return _divisible Whether the asset is divisible
     * @return _consumable Whether the asset is consumable
     */
    function assetConstraints() external view override returns (bool _transferable, bool _divisible, bool _consumable) {
        return (transferable, divisible, consumable);
    }
    
    /**
     * @dev Gets all token IDs linked to a soul identity
     * @param soulId The soul identity to check
     * @return tokenIds Array of token IDs linked to the soul identity
     */
    function getTokenIdsForSoul(address soulId) external view returns (uint256[] memory) {
        return _soulTokenIds[soulId];
    }
    
    /**
     * @dev Gets the soul identity that a token ID is linked to
     * @param tokenId The token ID to check
     * @return soulId The soul identity that the token ID is linked to
     */
    function getSoulForTokenId(uint256 tokenId) external view returns (address) {
        return _tokenIdToSoul[tokenId];
    }
    
    /**
     * @dev Gets the owner of a soul identity
     * @param soulId The soul identity to check
     * @return owner The owner of the soul identity
     */
    function _getSoulOwner(address soulId) internal view returns (address) {
        // This is a simplified implementation
        // In a real implementation, you would get the owner from the soul identity contract
        try D4LSoulIdentity(soulId).owner() returns (address _owner) {
            return _owner;
        } catch {
            revert("D4LERC721Asset: failed to get soul owner");
        }
    }
    
    /**
     * @dev Removes a token ID from a soul identity's linked tokens
     * @param soulId The soul identity to remove the token from
     * @param tokenId The token ID to remove
     */
    function _removeTokenFromSoul(address soulId, uint256 tokenId) internal {
        uint256[] storage tokenIds = _soulTokenIds[soulId];
        uint256 length = tokenIds.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (tokenIds[i] == tokenId) {
                // Replace the token ID with the last one and pop the last one
                tokenIds[i] = tokenIds[length - 1];
                tokenIds.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Recovers tokens accidentally sent to this contract
     * @param tokenAddress The address of the token to recover
     * @param tokenId The ID of the token to recover (for ERC721)
     */
    function recoverERC721Token(address tokenAddress, uint256 tokenId) external onlyOwner {
        require(tokenAddress != address(token) || _tokenIdToSoul[tokenId] == address(0), 
                "D4LERC721Asset: cannot recover linked token");
        
        IERC721(tokenAddress).safeTransferFrom(address(this), owner(), tokenId);
    }
}

/**
 * @dev Interface for ERC721 metadata
 */
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}

/**
 * @dev Interface for D4LSoulIdentity
 */
interface D4LSoulIdentity {
    function owner() external view returns (address);
}
