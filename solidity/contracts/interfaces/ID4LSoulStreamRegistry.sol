// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./ID4LSoulflowRoute.sol";
import "./ID4LSoulIdentityManager.sol";

/**
 * @title ID4LSoulStreamRegistry
 * @dev Interface for the SoulStream registry that combines route and identity management
 */
interface ID4LSoulStreamRegistry is ID4LSoulflowRoute, ID4LSoulIdentityManager {
    /**
     * @dev Gets the implementation contract for soul identities
     * @return implementation The address of the implementation contract
     */
    function soulIdentityImplementation() external view returns (address);
}
