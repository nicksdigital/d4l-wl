// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRewardPoints
 * @dev Interface for the RewardPoints contract
 */
interface IRewardPoints {
    /**
     * @dev Event emitted when points are awarded to a user
     */
    event PointsAwarded(address indexed user, uint256 amount, string reason);
    
    /**
     * @dev Event emitted when points are redeemed from a user
     */
    event PointsRedeemed(address indexed user, uint256 amount);
    
    /**
     * @dev Awards points to a user
     * @param user The address of the user to award points to
     * @param amount The amount of points to award
     * @param reason A string describing why the points were awarded
     */
    function awardPoints(address user, uint256 amount, string memory reason) external;
    
    /**
     * @dev Redeems points from a user
     * @param user The address of the user to redeem points from
     * @param amount The amount of points to redeem
     */
    function redeemPoints(address user, uint256 amount) external;
    
    /**
     * @dev Sets the exact number of points for a user (administrative function)
     * @param user The address of the user
     * @param amount The new amount of points
     */
    function setUserPoints(address user, uint256 amount) external;
    
    /**
     * @dev Returns the reward points for a user
     * @param user The address of the user
     * @return The number of reward points
     */
    function getPoints(address user) external view returns (uint256);
    
    /**
     * @dev Returns the total reward points across all users
     * @return The total number of reward points
     */
    function getTotalPoints() external view returns (uint256);
    
    /**
     * @dev Returns the reward points for a user
     * @param user The address of the user
     * @return The number of reward points
     */
    function userPoints(address user) external view returns (uint256);
    
    /**
     * @dev Returns the total reward points across all users
     * @return The total number of reward points
     */
    function totalPoints() external view returns (uint256);
    
    /**
     * @dev Adds a new rewarder
     * @param rewarder The address of the new rewarder
     */
    function addRewarder(address rewarder) external;
    
    /**
     * @dev Removes a rewarder
     * @param rewarder The address of the rewarder to remove
     */
    function removeRewarder(address rewarder) external;
    
    /**
     * @dev Returns the REWARDER_ROLE constant
     * @return The REWARDER_ROLE constant
     */
    function REWARDER_ROLE() external view returns (bytes32);
}
