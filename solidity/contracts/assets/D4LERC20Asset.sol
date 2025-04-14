// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ID4LAsset.sol";
import "../interfaces/ID4LSoulIdentityManager.sol";

/**
 * @title D4LERC20Asset
 * @dev Implementation of the ID4LAsset interface for ERC20 tokens
 * This contract wraps an existing ERC20 token and adds soulbound functionality
 */
contract D4LERC20Asset is ID4LAsset, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // The underlying ERC20 token
    IERC20 public immutable token;
    
    // The soul identity manager
    ID4LSoulIdentityManager public immutable soulManager;
    
    // Mapping of soul identity to linked amount
    mapping(address => uint256) private _soulBalances;
    
    // Total amount linked to all souls
    uint256 private _totalLinkedAmount;
    
    // Mapping of authorized routes
    mapping(bytes32 => bool) private _authorizedRoutes;
    
    // Asset constraints
    bool public immutable transferable;
    bool public immutable divisible;
    bool public immutable consumable;
    
    // Events
    event RouteAuthorized(bytes32 indexed routeId, bool authorized);
    
    /**
     * @dev Constructor
     * @param _token The address of the underlying ERC20 token
     * @param _soulManager The address of the soul identity manager
     * @param _transferable Whether the asset is transferable between souls
     * @param _divisible Whether the asset is divisible
     * @param _consumable Whether the asset is consumable
     * @param _owner The owner of the contract
     */
    constructor(
        address _token,
        address _soulManager,
        bool _transferable,
        bool _divisible,
        bool _consumable,
        address _owner
    ) Ownable(_owner) {
        require(_token != address(0), "D4LERC20Asset: token cannot be zero address");
        require(_soulManager != address(0), "D4LERC20Asset: soul manager cannot be zero address");
        
        token = IERC20(_token);
        soulManager = ID4LSoulIdentityManager(_soulManager);
        transferable = _transferable;
        divisible = _divisible;
        consumable = _consumable;
    }
    
    /**
     * @dev Authorizes a route for this asset
     * @param routeId The ID of the route to authorize
     * @param authorized Whether the route is authorized
     */
    function authorizeRoute(bytes32 routeId, bool authorized) external onlyOwner {
        require(routeId != bytes32(0), "D4LERC20Asset: routeId cannot be zero");
        
        _authorizedRoutes[routeId] = authorized;
        
        emit RouteAuthorized(routeId, authorized);
    }
    
    /**
     * @dev Links an asset to a soul identity
     * @param soulId The soul identity to link the asset to
     * @param amount The amount of the asset to link
     * @return success Whether the linking was successful
     */
    function linkToSoul(address soulId, uint256 amount) external override nonReentrant returns (bool success) {
        // Validate parameters
        require(soulId != address(0), "D4LERC20Asset: soulId cannot be zero address");
        require(amount > 0, "D4LERC20Asset: amount must be positive");
        require(soulManager.isSoul(soulId), "D4LERC20Asset: not a valid soul identity");
        
        // Transfer the tokens from the caller to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update the soul balance
        _soulBalances[soulId] += amount;
        
        // Update the total linked amount
        _totalLinkedAmount += amount;
        
        emit AssetLinked(address(token), soulId, amount);
        
        return true;
    }
    
    /**
     * @dev Unlinks an asset from a soul identity
     * @param soulId The soul identity to unlink the asset from
     * @param amount The amount of the asset to unlink
     * @return success Whether the unlinking was successful
     */
    function unlinkFromSoul(address soulId, uint256 amount) external override nonReentrant returns (bool success) {
        // Validate parameters
        require(soulId != address(0), "D4LERC20Asset: soulId cannot be zero address");
        require(amount > 0, "D4LERC20Asset: amount must be positive");
        require(soulManager.isSoul(soulId), "D4LERC20Asset: not a valid soul identity");
        
        // Check if the soul has enough linked tokens
        require(_soulBalances[soulId] >= amount, "D4LERC20Asset: insufficient linked amount");
        
        // Get the owner of the soul identity
        address owner = _getSoulOwner(soulId);
        
        // Check if the caller is the owner of the soul identity
        require(msg.sender == owner, "D4LERC20Asset: caller is not the soul owner");
        
        // Update the soul balance
        _soulBalances[soulId] -= amount;
        
        // Update the total linked amount
        _totalLinkedAmount -= amount;
        
        // Transfer the tokens from this contract to the owner
        token.safeTransfer(owner, amount);
        
        emit AssetUnlinked(address(token), soulId, amount);
        
        return true;
    }
    
    /**
     * @dev Transfers an asset between soul identities
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The amount of the asset to transfer
     * @return success Whether the transfer was successful
     */
    function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) external override nonReentrant returns (bool success) {
        // Validate parameters
        require(fromSoul != address(0), "D4LERC20Asset: fromSoul cannot be zero address");
        require(toSoul != address(0), "D4LERC20Asset: toSoul cannot be zero address");
        require(amount > 0, "D4LERC20Asset: amount must be positive");
        require(soulManager.isSoul(fromSoul), "D4LERC20Asset: fromSoul is not a valid soul identity");
        require(soulManager.isSoul(toSoul), "D4LERC20Asset: toSoul is not a valid soul identity");
        
        // Check if the asset is transferable
        require(transferable, "D4LERC20Asset: asset is not transferable");
        
        // Check if the soul has enough linked tokens
        require(_soulBalances[fromSoul] >= amount, "D4LERC20Asset: insufficient linked amount");
        
        // Get the owner of the source soul identity
        address owner = _getSoulOwner(fromSoul);
        
        // Check if the caller is the owner of the source soul identity
        require(msg.sender == owner, "D4LERC20Asset: caller is not the soul owner");
        
        // Update the soul balances
        _soulBalances[fromSoul] -= amount;
        _soulBalances[toSoul] += amount;
        
        emit AssetTransferred(address(token), fromSoul, toSoul, amount);
        
        return true;
    }
    
    /**
     * @dev Gets the amount of an asset linked to a soul identity
     * @param soulId The soul identity to check
     * @return amount The amount of the asset linked to the soul identity
     */
    function balanceOfSoul(address soulId) external view override returns (uint256 amount) {
        return _soulBalances[soulId];
    }
    
    /**
     * @dev Gets the total amount of the asset linked to all soul identities
     * @return amount The total amount of the asset linked to all soul identities
     */
    function totalLinkedAmount() external view override returns (uint256 amount) {
        return _totalLinkedAmount;
    }
    
    /**
     * @dev Checks if an asset can be routed through a specific route
     * @param routeId The ID of the route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The amount of the asset to route
     * @return canRoute Whether the asset can be routed
     */
    function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) external view override returns (bool canRoute) {
        // Check if the route is authorized
        if (!_authorizedRoutes[routeId]) {
            return false;
        }
        
        // Check if the souls are valid
        if (!soulManager.isSoul(fromSoul) || !soulManager.isSoul(toSoul)) {
            return false;
        }
        
        // Check if the source soul has enough linked tokens
        if (_soulBalances[fromSoul] < amount) {
            return false;
        }
        
        // If the asset is not transferable, fromSoul and toSoul must have the same owner
        if (!transferable && _getSoulOwner(fromSoul) != _getSoulOwner(toSoul)) {
            return false;
        }
        
        // If the asset is not divisible, amount must be a whole unit
        if (!divisible && amount % 1 ether != 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Gets the asset type
     * @return assetType The type of the asset (1 = ERC20, 2 = ERC721, 3 = ERC1155, 4 = Native, 5 = Custom)
     */
    function assetType() external pure override returns (uint8 assetType) {
        return 1; // ERC20
    }
    
    /**
     * @dev Gets the asset metadata
     * @return name The name of the asset
     * @return symbol The symbol of the asset
     * @return decimals The number of decimals for the asset
     */
    function assetMetadata() external view override returns (string memory name, string memory symbol, uint8 decimals) {
        // Try to get the name, symbol, and decimals from the token
        // If the token doesn't implement these functions, return empty values
        try IERC20Metadata(address(token)).name() returns (string memory _name) {
            name = _name;
        } catch {
            name = "";
        }
        
        try IERC20Metadata(address(token)).symbol() returns (string memory _symbol) {
            symbol = _symbol;
        } catch {
            symbol = "";
        }
        
        try IERC20Metadata(address(token)).decimals() returns (uint8 _decimals) {
            decimals = _decimals;
        } catch {
            decimals = 18; // Default to 18 decimals
        }
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
            revert("D4LERC20Asset: failed to get soul owner");
        }
    }
    
    /**
     * @dev Recovers tokens accidentally sent to this contract
     * @param _token The address of the token to recover
     * @param amount The amount of tokens to recover
     */
    function recoverTokens(address _token, uint256 amount) external onlyOwner {
        require(_token != address(token) || amount <= token.balanceOf(address(this)) - _totalLinkedAmount, 
                "D4LERC20Asset: cannot recover linked tokens");
        
        IERC20(_token).safeTransfer(owner(), amount);
    }
}

/**
 * @dev Interface for ERC20 metadata
 */
interface IERC20Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

/**
 * @dev Interface for D4LSoulIdentity
 */
interface D4LSoulIdentity {
    function owner() external view returns (address);
}
