// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LSoulIdentityManager
 * @dev Interface for managing soul identities
 */
interface ID4LSoulIdentityManager {
    /**
     * @dev Event emitted when a soul identity is created
     */
    event SoulIdentityCreated(
        address indexed user,
        address indexed soulId,
        bytes32 appSalt,
        bytes32 routingIntentHash
    );
    
    /**
     * @dev Creates a new soul identity
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @param zkProofKey Optional zkProof verification key
     * @return soulId The address of the created soul identity
     */
    function createSoulIdentity(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash,
        bytes32 zkProofKey
    ) external returns (address soulId);
    
    /**
     * @dev Computes the address of a soul identity without deploying it
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @return soulId The computed address of the soul identity
     */
    function computeSoulIdentityAddress(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash
    ) external view returns (address soulId);
    
    /**
     * @dev Gets all soul identities for a user
     * @param user The user address
     * @return soulIds Array of soul identity addresses
     */
    function getUserSoulIdentities(address user) external view returns (address[] memory);
    
    /**
     * @dev Checks if an address is a soul identity
     * @param addr The address to check
     * @return isSoul Whether the address is a soul identity
     */
    function isSoul(address addr) external view returns (bool);
}
