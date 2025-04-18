// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRewardPoints.sol";

/**
 * @title RewardPoints
 * @dev Contract for managing user reward points for the airdrop
 */
contract RewardPoints is AccessControl, Ownable, IRewardPoints {
    // Role definitions
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");
    
    // Mapping from user address to their reward points
    mapping(address => uint256) public userPoints;
    
    // Total points across all users
    uint256 public totalPoints;
    
    /**
     * @dev Constructor that sets up roles
     */
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARDER_ROLE, msg.sender);
    }
    
    /**
     * @dev Awards points to a user
     * @param user The address of the user to award points to
     * @param amount The amount of points to award
     * @param reason A string describing why the points were awarded
     */
    function awardPoints(address user, uint256 amount, string memory reason) external onlyRole(REWARDER_ROLE) {
        require(user != address(0), "RewardPoints: user cannot be zero address");
        require(amount > 0, "RewardPoints: amount must be greater than zero");
        
        userPoints[user] += amount;
        totalPoints += amount;
        
        emit PointsAwarded(user, amount, reason);
    }
    
    /**
     * @dev Redeems points from a user
     * @param user The address of the user to redeem points from
     * @param amount The amount of points to redeem
     */
    function redeemPoints(address user, uint256 amount) external onlyRole(REWARDER_ROLE) {
        require(user != address(0), "RewardPoints: user cannot be zero address");
        require(amount > 0, "RewardPoints: amount must be greater than zero");
        require(userPoints[user] >= amount, "RewardPoints: insufficient points");
        
        userPoints[user] -= amount;
        totalPoints -= amount;
        
        emit PointsRedeemed(user, amount);
    }
    
    /**
     * @dev Sets the exact number of points for a user (administrative function)
     * @param user The address of the user
     * @param amount The new amount of points
     */
    function setUserPoints(address user, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(user != address(0), "RewardPoints: user cannot be zero address");
        
        uint256 oldPoints = userPoints[user];
        userPoints[user] = amount;
        
        // Update total points
        if (amount > oldPoints) {
            totalPoints += (amount - oldPoints);
        } else if (amount < oldPoints) {
            totalPoints -= (oldPoints - amount);
        }
    }
    
    /**
     * @dev Returns the reward points for a user
     * @param user The address of the user
     * @return The number of reward points
     */
    function getPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }
    
    /**
     * @dev Returns the total reward points across all users
     * @return The total number of reward points
     */
    function getTotalPoints() external view returns (uint256) {
        return totalPoints;
    }
    
    /**
     * @dev Adds a new rewarder
     * @param rewarder The address of the new rewarder
     */
    function addRewarder(address rewarder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(rewarder != address(0), "RewardPoints: rewarder cannot be zero address");
        _grantRole(REWARDER_ROLE, rewarder);
    }
    
    /**
     * @dev Removes a rewarder
     * @param rewarder The address of the rewarder to remove
     */
    function removeRewarder(address rewarder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REWARDER_ROLE, rewarder);
    }
}
