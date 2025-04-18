// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../utils/D4LPacker.sol";
import "../utils/D4LTransientStorage.sol";
import "../router/D4LBaseRouteImplementation.sol";
import "../interfaces/ID4LMultichainRouter.sol";

/**
 * @title D4LSoulflowStakingRoute
 * @dev Implementation for staking routes
 */
contract D4LSoulflowStakingRoute is D4LBaseRouteImplementation {
    using SafeERC20 for IERC20;
    using D4LPacker for *;
    using D4LTransientStorage for *;

    // The registry contract
    address public immutable registry;

    // Staking parameters
    uint256 public lockDuration;
    uint256 public rewardRate;

    // Mapping of staked amounts
    mapping(address => mapping(address => uint256)) public stakedAmount; // user => token => amount

    // Mapping of stake timestamps
    mapping(address => mapping(address => uint256)) public stakeTimestamp; // user => token => timestamp

    // Mapping of rewards
    mapping(address => mapping(address => uint256)) public rewards; // user => token => reward

    // Events
    event Staked(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);

    /**
     * @dev Constructor
     * @param name_ The name of the route
     * @param router_ The address of the router contract
     * @param registry_ The address of the registry contract
     * @param supportedChains Array of supported chain IDs
     * @param owner_ The owner of the route implementation
     * @param _lockDuration The lock duration in seconds
     * @param _rewardRate The reward rate (tokens per second per token staked, scaled by 1e18)
     */
    constructor(
        string memory name_,
        address router_,
        address registry_,
        uint256[] memory supportedChains,
        address owner_,
        uint256 _lockDuration,
        uint256 _rewardRate
    ) D4LBaseRouteImplementation(name_, 1, router_, supportedChains, owner_) {
        registry = registry_;
        lockDuration = _lockDuration;
        rewardRate = _rewardRate;
    }

    /**
     * @dev Registers supported selectors
     */
    function _registerSelectors() internal override {
        _registerSelector(this.stake.selector);
        _registerSelector(this.unstake.selector);
        _registerSelector(this.claimRewards.selector);
        _registerSelector(this.getStakedAmount.selector);
        _registerSelector(this.getRewards.selector);
    }

    /**
     * @dev Stakes tokens
     * @param user The user address
     * @param token The token address
     * @param amount The amount to stake
     */
    function stake(
        address user,
        address token,
        uint256 amount
    ) external {
        // Update rewards before modifying stake
        _updateRewards(user, token);

        // Transfer tokens from the user to this contract
        IERC20(token).safeTransferFrom(user, address(this), amount);

        // Update staked amount
        stakedAmount[user][token] += amount;

        // Update stake timestamp
        stakeTimestamp[user][token] = block.timestamp;

        emit Staked(user, token, amount, block.timestamp);
    }

    /**
     * @dev Unstakes tokens
     * @param token The token address
     * @param amount The amount to unstake
     */
    function unstake(
        address token,
        uint256 amount
    ) external {
        address user = msg.sender;

        // Check if the user has staked enough
        require(stakedAmount[user][token] >= amount, "D4LSoulflowStakingRoute: insufficient staked amount");

        // Check if the lock duration has passed
        require(
            block.timestamp >= stakeTimestamp[user][token] + lockDuration,
            "D4LSoulflowStakingRoute: lock duration not passed"
        );

        // Update rewards before modifying stake
        _updateRewards(user, token);

        // Update staked amount
        stakedAmount[user][token] -= amount;

        // Transfer tokens back to the user
        IERC20(token).safeTransfer(user, amount);

        emit Unstaked(user, token, amount, block.timestamp);
    }

    /**
     * @dev Claims rewards
     * @param token The token address
     */
    function claimRewards(
        address token
    ) external {
        address user = msg.sender;

        // Update rewards
        _updateRewards(user, token);

        // Get the reward amount
        uint256 rewardAmount = rewards[user][token];
        require(rewardAmount > 0, "D4LSoulflowStakingRoute: no rewards to claim");

        // Reset rewards
        rewards[user][token] = 0;

        // Transfer rewards to the user
        // In a real implementation, we would need to have a reward token
        // For simplicity, we'll use the same token as the staked token
        IERC20(token).safeTransfer(user, rewardAmount);

        emit RewardClaimed(user, token, rewardAmount);
    }

    /**
     * @dev Gets the staked amount for a user and token
     * @param user The user address
     * @param token The token address
     * @return amount The staked amount
     */
    function getStakedAmount(
        address user,
        address token
    ) external view returns (uint256) {
        return stakedAmount[user][token];
    }

    /**
     * @dev Gets the rewards for a user and token
     * @param user The user address
     * @param token The token address
     * @return amount The reward amount
     */
    function getRewards(
        address user,
        address token
    ) external view returns (uint256) {
        // Calculate pending rewards
        uint256 pendingRewards = 0;

        if (stakedAmount[user][token] > 0) {
            uint256 timeElapsed = block.timestamp - stakeTimestamp[user][token];
            pendingRewards = (stakedAmount[user][token] * timeElapsed * rewardRate) / 1e18;
        }

        return rewards[user][token] + pendingRewards;
    }

    /**
     * @dev Updates rewards for a user and token
     * @param user The user address
     * @param token The token address
     */
    function _updateRewards(
        address user,
        address token
    ) internal {
        if (stakedAmount[user][token] > 0) {
            uint256 timeElapsed = block.timestamp - stakeTimestamp[user][token];
            uint256 pendingRewards = (stakedAmount[user][token] * timeElapsed * rewardRate) / 1e18;

            rewards[user][token] += pendingRewards;
            stakeTimestamp[user][token] = block.timestamp;
        }
    }

    /**
     * @dev Executes the route with the given data
     * @param data The calldata to execute
     * @param caller The address that initiated the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return success Whether the execution was successful
     * @return result The result of the execution
     */
    function _execute(
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) internal override returns (bool success, bytes memory result) {
        // Extract the selector from the data
        bytes4 selector = bytes4(data[:4]);

        // Execute the function
        if (selector == this.stake.selector) {
            // Decode the parameters
            (address user, address token, uint256 amount) = abi.decode(data[4:], (address, address, uint256));

            // Execute the stake function
            this.stake(user, token, amount);

            return (true, abi.encode(true));
        } else if (selector == this.unstake.selector) {
            // Decode the parameters
            (address token, uint256 amount) = abi.decode(data[4:], (address, uint256));

            // Execute the unstake function
            this.unstake(token, amount);

            return (true, abi.encode(true));
        } else if (selector == this.claimRewards.selector) {
            // Decode the parameters
            address token = abi.decode(data[4:], (address));

            // Execute the claimRewards function
            this.claimRewards(token);

            return (true, abi.encode(true));
        } else if (selector == this.getStakedAmount.selector) {
            // Decode the parameters
            (address user, address token) = abi.decode(data[4:], (address, address));

            // Execute the getStakedAmount function
            uint256 amount = this.getStakedAmount(user, token);

            return (true, abi.encode(amount));
        } else if (selector == this.getRewards.selector) {
            // Decode the parameters
            (address user, address token) = abi.decode(data[4:], (address, address));

            // Execute the getRewards function
            uint256 amount = this.getRewards(user, token);

            return (true, abi.encode(amount));
        } else {
            return (false, abi.encode("D4LSoulflowStakingRoute: unsupported selector"));
        }
    }

    /**
     * @dev Checks permissions for the route
     * @param selector The function selector to check
     * @param data The calldata to be executed
     * @param caller The address that will initiate the route execution
     * @param sourceChainId The chain ID where the transaction originated
     * @return permissionLevel The required permission level
     * @return reason Optional reason string if permission is denied (empty if allowed)
     */
    function _checkPermissions(
        bytes4 selector,
        bytes calldata data,
        address caller,
        uint256 sourceChainId
    ) internal override view returns (ID4LMultichainRouter.PermissionLevel permissionLevel, string memory reason) {
        // For simplicity, we'll allow all calls
        return (ID4LMultichainRouter.PermissionLevel.NONE, "");
    }

    /**
     * @dev Estimates gas cost for executing the route
     * @param selector The function selector
     * @param data The calldata to be executed
     * @param destinationChainId The chain ID where the execution will happen
     * @return gasEstimate Estimated gas cost
     */
    function _estimateGas(
        bytes4 selector,
        bytes calldata data,
        uint256 destinationChainId
    ) internal override view returns (uint256 gasEstimate) {
        // Provide gas estimates based on the selector
        if (selector == this.stake.selector) {
            return 100000;
        } else if (selector == this.unstake.selector) {
            return 100000;
        } else if (selector == this.claimRewards.selector) {
            return 100000;
        } else if (selector == this.getStakedAmount.selector) {
            return 50000;
        } else if (selector == this.getRewards.selector) {
            return 50000;
        } else {
            return 50000;
        }
    }
}
