// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/ID4LAsset.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";

/**
 * @title D4LReputationAsset
 * @dev Implementation of a reputation score asset that is linked to soul identities
 */
contract D4LReputationAsset is ID4LAsset, Ownable {
    // Total linked amount
    uint256 private _totalLinkedAmount;
    using Strings for uint256;

    // Asset metadata
    string private _name;
    string private _symbol;
    uint8 private constant _decimals = 0; // Reputation scores are non-divisible

    // Asset constraints
    bool private _transferable;
    bool private _divisible;
    bool private _consumable;

    // Soul manager contract
    ID4LSoulStreamRegistry private _soulManager;

    // Mapping from soul identity to reputation score
    mapping(address => uint256) private _soulBalances;

    // Reputation tiers
    mapping(uint8 => uint256) private _reputationTiers;
    uint8 private _maxTier;

    // Events
    event ReputationMinted(address indexed soul, uint256 amount);
    event ReputationBurned(address indexed soul, uint256 amount);
    event ReputationTierSet(uint8 tier, uint256 threshold);

    /**
     * @dev Constructor
     * @param name_ The name of the reputation asset
     * @param symbol_ The symbol of the reputation asset
     * @param transferable_ Whether the asset is transferable
     * @param divisible_ Whether the asset is divisible
     * @param consumable_ Whether the asset is consumable
     * @param soulManager_ The address of the soul manager contract
     * @param initialOwner The initial owner of the contract
     */
    constructor(
        string memory name_,
        string memory symbol_,
        bool transferable_,
        bool divisible_,
        bool consumable_,
        address soulManager_,
        address initialOwner
    ) Ownable(initialOwner) {
        _name = name_;
        _symbol = symbol_;
        _transferable = transferable_;
        _divisible = divisible_;
        _consumable = consumable_;
        _soulManager = ID4LSoulStreamRegistry(soulManager_);

        // Initialize default tiers
        _reputationTiers[1] = 0;     // Tier 1: 0+ points
        _reputationTiers[2] = 100;   // Tier 2: 100+ points
        _reputationTiers[3] = 500;   // Tier 3: 500+ points
        _reputationTiers[4] = 1000;  // Tier 4: 1000+ points
        _maxTier = 4;
    }

    /**
     * @dev Returns the name of the asset
     * @return The name of the asset
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the asset
     * @return The symbol of the asset
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the asset metadata
     * @return name The name of the asset
     * @return symbol The symbol of the asset
     * @return decimals The number of decimals of the asset
     */
    function assetMetadata() external view returns (string memory, string memory, uint8) {
        return (_name, _symbol, _decimals);
    }

    /**
     * @dev Returns the asset constraints
     * @return transferable Whether the asset is transferable
     * @return divisible Whether the asset is divisible
     * @return consumable Whether the asset is consumable
     */
    function assetConstraints() external view returns (bool, bool, bool) {
        return (_transferable, _divisible, _consumable);
    }

    /**
     * @dev Returns the asset type
     * @return The asset type (3 for reputation asset)
     */
    function assetType() external pure returns (uint8) {
        return 3; // Reputation asset
    }

    /**
     * @dev Returns the balance of a soul
     * @param soul The address of the soul
     * @return The balance of the soul
     */
    function balanceOfSoul(address soul) public view returns (uint256) {
        return _soulBalances[soul];
    }

    /**
     * @dev Mints reputation to a soul
     * @param soul The address of the soul
     * @param amount The amount to mint
     */
    function mintToSoul(address soul, uint256 amount) external onlyOwner {
        require(_soulManager.isSoul(soul), "D4LReputationAsset: not a valid soul");

        _soulBalances[soul] += amount;

        emit ReputationMinted(soul, amount);
    }

    /**
     * @dev Burns reputation from a soul
     * @param soul The address of the soul
     * @param amount The amount to burn
     */
    function burnFromSoul(address soul, uint256 amount) external onlyOwner {
        require(_soulManager.isSoul(soul), "D4LReputationAsset: not a valid soul");
        require(_soulBalances[soul] >= amount, "D4LReputationAsset: insufficient balance");

        _soulBalances[soul] -= amount;

        emit ReputationBurned(soul, amount);
    }

    /**
     * @dev Transfers reputation between souls
     * @param fromSoul The address of the source soul
     * @param toSoul The address of the destination soul
     * @param amount The amount to transfer
     * @return success Whether the transfer was successful
     */
    function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) external onlyOwner returns (bool success) {
        require(_transferable, "D4LReputationAsset: asset is not transferable");
        require(_soulManager.isSoul(fromSoul), "D4LReputationAsset: source not a valid soul");
        require(_soulManager.isSoul(toSoul), "D4LReputationAsset: destination not a valid soul");
        require(_soulBalances[fromSoul] >= amount, "D4LReputationAsset: insufficient balance");

        _soulBalances[fromSoul] -= amount;
        _soulBalances[toSoul] += amount;

        return true;
    }

    /**
     * @dev Sets a reputation tier threshold
     * @param tier The tier number
     * @param threshold The threshold for the tier
     */
    function setReputationTier(uint8 tier, uint256 threshold) external onlyOwner {
        require(tier > 0, "D4LReputationAsset: tier must be greater than 0");

        _reputationTiers[tier] = threshold;
        if (tier > _maxTier) {
            _maxTier = tier;
        }

        emit ReputationTierSet(tier, threshold);
    }

    /**
     * @dev Returns the reputation tier of a soul
     * @param soul The address of the soul
     * @return The reputation tier of the soul
     */
    function getReputationTier(address soul) public view returns (uint8) {
        uint256 reputation = _soulBalances[soul];
        uint8 tier = 0;

        for (uint8 i = 1; i <= _maxTier; i++) {
            if (reputation >= _reputationTiers[i]) {
                tier = i;
            } else {
                break;
            }
        }

        return tier;
    }

    /**
     * @dev Checks if a soul meets a reputation threshold
     * @param soul The address of the soul
     * @param threshold The threshold to check
     * @return Whether the soul meets the threshold
     */
    function meetsThreshold(address soul, uint256 threshold) public view returns (bool) {
        return _soulBalances[soul] >= threshold;
    }

    /**
     * @dev Links an asset to a soul
     * @param soulId The soul identity to link the asset to
     * @param amount The amount of the asset to link
     * @return success Whether the linking was successful
     */
    function linkToSoul(address soulId, uint256 amount) external onlyOwner returns (bool success) {
        require(_soulManager.isSoul(soulId), "D4LReputationAsset: not a valid soul");

        _soulBalances[soulId] += amount;
        _totalLinkedAmount += amount;

        emit AssetLinked(address(this), soulId, amount);

        return true;
    }

    /**
     * @dev Unlinks an asset from a soul
     * @param soulId The soul identity to unlink the asset from
     * @param amount The amount of the asset to unlink
     * @return success Whether the unlinking was successful
     */
    function unlinkFromSoul(address soulId, uint256 amount) external onlyOwner returns (bool success) {
        require(_soulManager.isSoul(soulId), "D4LReputationAsset: not a valid soul");
        require(_soulBalances[soulId] >= amount, "D4LReputationAsset: insufficient balance");

        _soulBalances[soulId] -= amount;
        _totalLinkedAmount -= amount;

        emit AssetUnlinked(address(this), soulId, amount);

        return true;
    }

    /**
     * @dev Gets the total amount of the asset linked to all soul identities
     * @return amount The total amount of the asset linked to all soul identities
     */
    function totalLinkedAmount() external view returns (uint256 amount) {
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
    function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) external view returns (bool) {
        // For reputation assets, we only allow routing if the asset is transferable
        if (!_transferable) {
            return false;
        }

        // Check if the source soul has enough balance
        if (_soulBalances[fromSoul] < amount) {
            return false;
        }

        // Additional routing logic can be added here

        return true;
    }
}
