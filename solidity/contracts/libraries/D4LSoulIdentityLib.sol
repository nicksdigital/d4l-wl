// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * @title D4LSoulIdentityLib
 * @dev Library for managing soul identities
 */
library D4LSoulIdentityLib {
    /**
     * @dev Computes the address of a soul identity without deploying it
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @param creationCode The creation code of the soul identity contract
     * @param zkProofKey Optional zkProof verification key
     * @param registry The registry address
     * @return soulId The computed address of the soul identity
     */
    function computeSoulIdentityAddress(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash,
        bytes memory creationCode,
        bytes32 zkProofKey,
        address registry
    ) internal view returns (address soulId) {
        // Calculate the salt for Create2
        bytes32 salt = keccak256(abi.encode(user, appSalt, routingIntentHash));

        // Calculate the initialization code hash
        bytes32 initCodeHash = keccak256(
            abi.encodePacked(
                creationCode,
                abi.encode(user, appSalt, routingIntentHash, zkProofKey, registry)
            )
        );

        // Compute the address
        return Create2.computeAddress(salt, initCodeHash);
    }

    /**
     * @dev Deploys a soul identity
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @param creationCode The creation code of the soul identity contract
     * @param zkProofKey Optional zkProof verification key
     * @param registry The registry address
     * @return soulId The address of the deployed soul identity
     */
    function deploySoulIdentity(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash,
        bytes memory creationCode,
        bytes32 zkProofKey,
        address registry
    ) internal returns (address soulId) {
        // Calculate the salt for Create2
        bytes32 salt = keccak256(abi.encode(user, appSalt, routingIntentHash));

        // Calculate the initialization code
        bytes memory initCode = abi.encodePacked(
            creationCode,
            abi.encode(user, appSalt, routingIntentHash, zkProofKey, registry)
        );

        // Deploy the soul identity using Create2
        return Create2.deploy(0, salt, initCode);
    }
}
