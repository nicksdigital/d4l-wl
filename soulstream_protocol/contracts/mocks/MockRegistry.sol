// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title MockRegistry
 * @dev Mock implementation of the D4LSoulStreamRegistry for testing
 */
contract MockRegistry {
    // Mapping from user address to their soul identities
    mapping(address => address[]) private _userSoulIdentities;
    
    // Mapping from soul identity creation parameters to soul identity address
    mapping(bytes32 => address) private _soulIdentities;
    
    /**
     * @dev Creates a new soul identity for a user
     * @param user The address of the user
     * @param appSalt Application-specific salt
     * @param routingIntentHash Hash of the routing intent
     * @param zkProofKey Zero-knowledge proof key
     * @return The address of the created soul identity
     */
    function createSoulIdentity(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash,
        bytes32 zkProofKey
    ) external returns (address) {
        // Check if a soul identity with these parameters already exists
        bytes32 paramsHash = keccak256(abi.encode(user, appSalt, routingIntentHash, zkProofKey));
        
        if (_soulIdentities[paramsHash] != address(0)) {
            return _soulIdentities[paramsHash];
        }
        
        // Create a new soul identity (in a real implementation, this would deploy a contract)
        // For testing, we'll just use a deterministic address based on the parameters
        address soulId = address(uint160(uint256(paramsHash)));
        
        // Store the soul identity
        _soulIdentities[paramsHash] = soulId;
        _userSoulIdentities[user].push(soulId);
        
        return soulId;
    }
    
    /**
     * @dev Gets all soul identities for a user
     * @param user The address of the user
     * @return An array of soul identity addresses
     */
    function getUserSoulIdentities(address user) external view returns (address[] memory) {
        return _userSoulIdentities[user];
    }
    
    /**
     * @dev Checks if an address is a valid soul identity
     * @param soulId The address to check
     * @return True if the address is a valid soul identity, false otherwise
     */
    function isSoul(address soulId) external view returns (bool) {
        // For testing, we'll consider any non-zero address as a valid soul identity
        return soulId != address(0);
    }
}
