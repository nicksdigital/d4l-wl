// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/ID4LAsset.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";

/**
 * @title D4LRewardsAsset
 * @dev Implementation of a rewards asset that is linked to soul identities
 */
contract D4LRewardsAsset is ID4LAsset, Ownable {
    // Total linked amount
    uint256 private _totalLinkedAmount;
    using Strings for uint256;
    using SafeERC20 for IERC20;

    // Asset metadata
    string private _name;
    string private _symbol;
    uint8 private constant _decimals = 18; // Same as most ERC20 tokens

    // Asset constraints
    bool private _transferable;
    bool private _divisible;
    bool private _consumable;

    // Soul manager contract
    ID4LSoulStreamRegistry private _soulManager;

    // Reward token
    IERC20 public rewardToken;

    // Mapping from soul identity to reward balance
    mapping(address => uint256) private _soulBalances;

    // Mapping from soul identity to pending rewards
    mapping(address => uint256) private _pendingRewards;

    // Mapping from soul identity to expired rewards
    mapping(address => uint256) private _expiredRewards;

    // Distribution parameters
    uint256 public distributionPeriod = 30 days; // Default: 30 days
    uint256 public claimWindow = 7 days; // Default: 7 days

    // Mapping of authorized distributors
    mapping(address => bool) private _distributors;

    // Reward program struct
    struct RewardProgram {
        string name;
        uint256 totalAllocation;
        uint256 remainingAllocation;
        uint256 startTime;
        uint256 endTime;
        string description;
        bool active;
    }

    // Reward programs
    mapping(uint256 => RewardProgram) private _rewardPrograms;
    uint256 private _nextProgramId = 1;

    // Distribution record struct
    struct DistributionRecord {
        uint256 programId; // 0 for direct distributions
        uint256 amount;
        uint256 timestamp;
        uint256 expiresAt;
        bool claimed;
    }

    // Mapping from soul identity to distribution records
    mapping(address => DistributionRecord[]) private _distributions;

    // Events
    event RewardsDistributed(address indexed distributor, address[] souls, uint256[] amounts, string reason);
    event RewardsClaimed(address indexed soul, address indexed claimer, uint256 amount);
    event RewardsExpired(address indexed soul, uint256 amount);
    event RewardProgramCreated(uint256 indexed programId, string name, uint256 totalAllocation);
    event RewardProgramUpdated(uint256 indexed programId, bool active);
    event DistributorSet(address indexed distributor, bool authorized);

    /**
     * @dev Constructor
     * @param rewardToken_ The address of the reward token
     * @param name_ The name of the rewards asset
     * @param symbol_ The symbol of the rewards asset
     * @param transferable_ Whether the asset is transferable
     * @param divisible_ Whether the asset is divisible
     * @param consumable_ Whether the asset is consumable
     * @param soulManager_ The address of the soul manager contract
     * @param initialOwner The initial owner of the contract
     */
    constructor(
        address rewardToken_,
        string memory name_,
        string memory symbol_,
        bool transferable_,
        bool divisible_,
        bool consumable_,
        address soulManager_,
        address initialOwner
    ) Ownable(initialOwner) {
        rewardToken = IERC20(rewardToken_);
        _name = name_;
        _symbol = symbol_;
        _transferable = transferable_;
        _divisible = divisible_;
        _consumable = consumable_;
        _soulManager = ID4LSoulStreamRegistry(soulManager_);

        // Set the owner as a distributor
        _distributors[initialOwner] = true;
        emit DistributorSet(initialOwner, true);
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
     * @return The asset type (4 for rewards asset)
     */
    function assetType() external pure returns (uint8) {
        return 4; // Rewards asset
    }

    /**
     * @dev Sets the distribution period
     * @param period The distribution period in seconds
     */
    function setDistributionPeriod(uint256 period) external onlyOwner {
        distributionPeriod = period;
    }

    /**
     * @dev Sets the claim window
     * @param window The claim window in seconds
     */
    function setClaimWindow(uint256 window) external onlyOwner {
        claimWindow = window;
    }

    /**
     * @dev Sets a distributor's authorization
     * @param distributor The address of the distributor
     * @param authorized Whether the distributor is authorized
     */
    function setDistributor(address distributor, bool authorized) external onlyOwner {
        _distributors[distributor] = authorized;
        emit DistributorSet(distributor, authorized);
    }

    /**
     * @dev Checks if an address is an authorized distributor
     * @param distributor The address to check
     * @return Whether the address is an authorized distributor
     */
    function isDistributor(address distributor) public view returns (bool) {
        return _distributors[distributor];
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
     * @dev Returns the pending rewards of a soul
     * @param soul The address of the soul
     * @return The pending rewards of the soul
     */
    function getPendingRewards(address soul) public view returns (uint256) {
        return _pendingRewards[soul];
    }

    /**
     * @dev Returns the expired rewards of a soul
     * @param soul The address of the soul
     * @return The expired rewards of the soul
     */
    function getExpiredRewards(address soul) public view returns (uint256) {
        return _expiredRewards[soul];
    }

    /**
     * @dev Distributes rewards to souls
     * @param souls The addresses of the souls
     * @param amounts The amounts to distribute
     * @param reason The reason for the distribution
     */
    function distributeRewards(
        address[] memory souls,
        uint256[] memory amounts,
        string memory reason
    ) external {
        require(isDistributor(msg.sender), "D4LRewardsAsset: not a distributor");
        require(souls.length == amounts.length, "D4LRewardsAsset: arrays length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < souls.length; i++) {
            require(_soulManager.isSoul(souls[i]), "D4LRewardsAsset: not a valid soul");
            totalAmount += amounts[i];
        }

        require(
            rewardToken.balanceOf(address(this)) >= totalAmount,
            "D4LRewardsAsset: insufficient reward token balance"
        );

        uint256 expiresAt = block.timestamp + distributionPeriod;

        for (uint256 i = 0; i < souls.length; i++) {
            _pendingRewards[souls[i]] += amounts[i];

            // Record the distribution
            _distributions[souls[i]].push(
                DistributionRecord({
                    programId: 0, // Direct distribution
                    amount: amounts[i],
                    timestamp: block.timestamp,
                    expiresAt: expiresAt,
                    claimed: false
                })
            );
        }

        emit RewardsDistributed(msg.sender, souls, amounts, reason);
    }

    /**
     * @dev Claims rewards for a soul
     * @param soul The address of the soul
     */
    function claimRewards(address soul) external {
        require(_soulManager.isSoul(soul), "D4LRewardsAsset: not a valid soul");

        // Check if the caller is authorized to claim for this soul
        address[] memory soulIdentities = _soulManager.getUserSoulIdentities(msg.sender);
        bool authorized = false;
        for (uint256 i = 0; i < soulIdentities.length; i++) {
            if (soulIdentities[i] == soul) {
                authorized = true;
                break;
            }
        }
        require(authorized, "D4LRewardsAsset: not authorized to claim");

        uint256 amount = _pendingRewards[soul];
        require(amount > 0, "D4LRewardsAsset: no pending rewards");

        // Mark distributions as claimed
        for (uint256 i = 0; i < _distributions[soul].length; i++) {
            if (!_distributions[soul][i].claimed && block.timestamp <= _distributions[soul][i].expiresAt) {
                _distributions[soul][i].claimed = true;
            }
        }

        // Reset pending rewards
        _pendingRewards[soul] = 0;

        // Transfer the rewards
        rewardToken.safeTransfer(msg.sender, amount);

        emit RewardsClaimed(soul, msg.sender, amount);
    }

    /**
     * @dev Processes expired rewards
     */
    function processExpiredRewards() external onlyOwner {
        // This function would be called periodically to process expired rewards
        // In a real implementation, you might want to use a more efficient approach

        // For demonstration purposes, we'll just check all souls with pending rewards
        address[] memory souls = new address[](100); // Arbitrary limit
        uint256 count = 0;

        // In a real implementation, you would maintain a list of souls with pending rewards
        // For this example, we'll just assume we have a way to get all souls

        for (uint256 i = 0; i < souls.length && i < count; i++) {
            address soul = souls[i];
            if (_pendingRewards[soul] > 0) {
                uint256 expiredAmount = 0;

                // Check each distribution
                for (uint256 j = 0; j < _distributions[soul].length; j++) {
                    if (!_distributions[soul][j].claimed && block.timestamp > _distributions[soul][j].expiresAt) {
                        expiredAmount += _distributions[soul][j].amount;
                        _distributions[soul][j].claimed = true; // Mark as processed
                    }
                }

                if (expiredAmount > 0) {
                    _pendingRewards[soul] -= expiredAmount;
                    _expiredRewards[soul] += expiredAmount;

                    emit RewardsExpired(soul, expiredAmount);
                }
            }
        }
    }

    /**
     * @dev Deposits tokens and transfers them to a soul
     * @param soul The address of the soul
     * @param amount The amount to deposit
     */
    function depositAndTransferToSoul(address soul, uint256 amount) external {
        require(_transferable, "D4LRewardsAsset: asset is not transferable");
        require(_soulManager.isSoul(soul), "D4LRewardsAsset: not a valid soul");

        // Transfer tokens from the sender to this contract
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);

        // Credit the soul
        _soulBalances[soul] += amount;
    }

    /**
     * @dev Withdraws tokens from a soul
     * @param soul The address of the soul
     * @param amount The amount to withdraw
     */
    function withdrawFromSoul(address soul, uint256 amount) external {
        require(_soulManager.isSoul(soul), "D4LRewardsAsset: not a valid soul");

        // Check if the caller is authorized to withdraw for this soul
        address[] memory soulIdentities = _soulManager.getUserSoulIdentities(msg.sender);
        bool authorized = false;
        for (uint256 i = 0; i < soulIdentities.length; i++) {
            if (soulIdentities[i] == soul) {
                authorized = true;
                break;
            }
        }
        require(authorized, "D4LRewardsAsset: not authorized to withdraw");

        require(_soulBalances[soul] >= amount, "D4LRewardsAsset: insufficient balance");

        // Debit the soul
        _soulBalances[soul] -= amount;

        // Transfer tokens to the caller
        rewardToken.safeTransfer(msg.sender, amount);
    }

    /**
     * @dev Creates a reward program
     * @param programName The name of the program
     * @param totalAllocation The total allocation for the program
     * @param duration The duration of the program in seconds
     * @param description The description of the program
     * @return programId The ID of the created program
     */
    function createRewardProgram(
        string memory programName,
        uint256 totalAllocation,
        uint256 duration,
        string memory description
    ) external onlyOwner returns (uint256 programId) {
        require(totalAllocation > 0, "D4LRewardsAsset: allocation must be greater than 0");
        require(
            rewardToken.balanceOf(address(this)) >= totalAllocation,
            "D4LRewardsAsset: insufficient reward token balance"
        );

        programId = _nextProgramId++;

        _rewardPrograms[programId] = RewardProgram({
            name: programName,
            totalAllocation: totalAllocation,
            remainingAllocation: totalAllocation,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            description: description,
            active: true
        });

        emit RewardProgramCreated(programId, programName, totalAllocation);

        return programId;
    }

    /**
     * @dev Sets a reward program's active status
     * @param programId The ID of the program
     * @param active Whether the program is active
     */
    function setRewardProgramActive(uint256 programId, bool active) external onlyOwner {
        require(_rewardPrograms[programId].totalAllocation > 0, "D4LRewardsAsset: program does not exist");

        _rewardPrograms[programId].active = active;

        emit RewardProgramUpdated(programId, active);
    }

    /**
     * @dev Returns a reward program
     * @param programId The ID of the program
     * @return The reward program
     */
    function getRewardProgram(uint256 programId) external view returns (RewardProgram memory) {
        return _rewardPrograms[programId];
    }

    /**
     * @dev Distributes rewards from a program
     * @param programId The ID of the program
     * @param souls The addresses of the souls
     * @param amounts The amounts to distribute
     * @param reason The reason for the distribution
     */
    function distributeRewardsFromProgram(
        uint256 programId,
        address[] memory souls,
        uint256[] memory amounts,
        string memory reason
    ) external {
        require(isDistributor(msg.sender), "D4LRewardsAsset: not a distributor");
        require(souls.length == amounts.length, "D4LRewardsAsset: arrays length mismatch");
        require(_rewardPrograms[programId].totalAllocation > 0, "D4LRewardsAsset: program does not exist");
        require(_rewardPrograms[programId].active, "D4LRewardsAsset: program is not active");
        require(block.timestamp <= _rewardPrograms[programId].endTime, "D4LRewardsAsset: program has ended");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < souls.length; i++) {
            require(_soulManager.isSoul(souls[i]), "D4LRewardsAsset: not a valid soul");
            totalAmount += amounts[i];
        }

        require(
            _rewardPrograms[programId].remainingAllocation >= totalAmount,
            "D4LRewardsAsset: insufficient program allocation"
        );

        // Update the program's remaining allocation
        _rewardPrograms[programId].remainingAllocation -= totalAmount;

        uint256 expiresAt = block.timestamp + claimWindow;

        for (uint256 i = 0; i < souls.length; i++) {
            _pendingRewards[souls[i]] += amounts[i];

            // Record the distribution
            _distributions[souls[i]].push(
                DistributionRecord({
                    programId: programId,
                    amount: amounts[i],
                    timestamp: block.timestamp,
                    expiresAt: expiresAt,
                    claimed: false
                })
            );
        }

        emit RewardsDistributed(msg.sender, souls, amounts, reason);
    }

    /**
     * @dev Links an asset to a soul
     * @param soulId The soul identity to link the asset to
     * @param amount The amount of the asset to link
     * @return success Whether the linking was successful
     */
    function linkToSoul(address soulId, uint256 amount) external returns (bool success) {
        require(_soulManager.isSoul(soulId), "D4LRewardsAsset: not a valid soul");

        // Transfer tokens from the sender to this contract
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);

        // Credit the soul
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
    function unlinkFromSoul(address soulId, uint256 amount) external returns (bool success) {
        require(_soulManager.isSoul(soulId), "D4LRewardsAsset: not a valid soul");

        // Check if the caller is authorized to withdraw for this soul
        address[] memory soulIdentities = _soulManager.getUserSoulIdentities(msg.sender);
        bool authorized = false;
        for (uint256 i = 0; i < soulIdentities.length; i++) {
            if (soulIdentities[i] == soulId) {
                authorized = true;
                break;
            }
        }
        require(authorized, "D4LRewardsAsset: not authorized to unlink");

        require(_soulBalances[soulId] >= amount, "D4LRewardsAsset: insufficient balance");

        // Debit the soul
        _soulBalances[soulId] -= amount;
        _totalLinkedAmount -= amount;

        // Transfer tokens to the caller
        rewardToken.safeTransfer(msg.sender, amount);

        emit AssetUnlinked(address(this), soulId, amount);

        return true;
    }

    /**
     * @dev Transfers an asset between soul identities
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param amount The amount of the asset to transfer
     * @return success Whether the transfer was successful
     */
    function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) external returns (bool success) {
        require(_transferable, "D4LRewardsAsset: asset is not transferable");
        require(_soulManager.isSoul(fromSoul), "D4LRewardsAsset: source not a valid soul");
        require(_soulManager.isSoul(toSoul), "D4LRewardsAsset: destination not a valid soul");

        // Check if the caller is authorized to transfer from this soul
        address[] memory soulIdentities = _soulManager.getUserSoulIdentities(msg.sender);
        bool authorized = false;
        for (uint256 i = 0; i < soulIdentities.length; i++) {
            if (soulIdentities[i] == fromSoul) {
                authorized = true;
                break;
            }
        }
        require(authorized, "D4LRewardsAsset: not authorized to transfer");

        require(_soulBalances[fromSoul] >= amount, "D4LRewardsAsset: insufficient balance");

        // Transfer the tokens
        _soulBalances[fromSoul] -= amount;
        _soulBalances[toSoul] += amount;

        emit AssetTransferred(address(this), fromSoul, toSoul, amount);

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
        // For rewards assets, we only allow routing if the asset is transferable
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
