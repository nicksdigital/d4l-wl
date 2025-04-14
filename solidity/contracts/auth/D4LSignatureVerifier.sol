// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title D4LSignatureVerifier
 * @dev Library for verifying signatures in the D4L authentication system
 */
library D4LSignatureVerifier {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    /**
     * @dev Domain separator for EIP-712 signatures
     */
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    /**
     * @dev Type hash for registration
     */
    bytes32 private constant REGISTRATION_TYPEHASH = keccak256(
        "Registration(address wallet,string username,string email,uint256 deadline)"
    );
    
    /**
     * @dev Type hash for login
     */
    bytes32 private constant LOGIN_TYPEHASH = keccak256(
        "Login(address wallet,uint256 deadline)"
    );
    
    /**
     * @dev Computes the domain separator for EIP-712 signatures
     * @param name The name of the contract
     * @param version The version of the contract
     * @param chainId The chain ID
     * @param verifyingContract The address of the contract
     * @return domainSeparator The domain separator
     */
    function computeDomainSeparator(
        string memory name,
        string memory version,
        uint256 chainId,
        address verifyingContract
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                verifyingContract
            )
        );
    }
    
    /**
     * @dev Verifies a registration signature
     * @param wallet The wallet address
     * @param username The username
     * @param email The email
     * @param deadline The deadline for the signature validity
     * @param signature The signature to verify
     * @param domainSeparator The domain separator
     * @return signer The signer of the signature
     */
    function verifyRegistrationSignature(
        address wallet,
        string memory username,
        string memory email,
        uint256 deadline,
        bytes memory signature,
        bytes32 domainSeparator
    ) internal view returns (address) {
        // Check deadline
        require(block.timestamp <= deadline, "D4LSignatureVerifier: expired signature");
        
        // Compute the hash of the registration data
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTRATION_TYPEHASH,
                wallet,
                keccak256(bytes(username)),
                keccak256(bytes(email)),
                deadline
            )
        );
        
        // Compute the EIP-712 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                structHash
            )
        );
        
        // Recover the signer
        address signer = digest.recover(signature);
        
        // Verify that the signer is the wallet
        require(signer == wallet, "D4LSignatureVerifier: invalid signature");
        
        return signer;
    }
    
    /**
     * @dev Verifies a login signature
     * @param wallet The wallet address
     * @param deadline The deadline for the signature validity
     * @param signature The signature to verify
     * @param domainSeparator The domain separator
     * @return signer The signer of the signature
     */
    function verifyLoginSignature(
        address wallet,
        uint256 deadline,
        bytes memory signature,
        bytes32 domainSeparator
    ) internal view returns (address) {
        // Check deadline
        require(block.timestamp <= deadline, "D4LSignatureVerifier: expired signature");
        
        // Compute the hash of the login data
        bytes32 structHash = keccak256(
            abi.encode(
                LOGIN_TYPEHASH,
                wallet,
                deadline
            )
        );
        
        // Compute the EIP-712 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                structHash
            )
        );
        
        // Recover the signer
        address signer = digest.recover(signature);
        
        // Verify that the signer is the wallet
        require(signer == wallet, "D4LSignatureVerifier: invalid signature");
        
        return signer;
    }
    
    /**
     * @dev Verifies a personal signature (EIP-191)
     * @param wallet The wallet address
     * @param message The message that was signed
     * @param signature The signature to verify
     * @return signer The signer of the signature
     */
    function verifyPersonalSignature(
        address wallet,
        bytes memory message,
        bytes memory signature
    ) internal pure returns (address) {
        // Compute the EIP-191 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                bytes(message).length,
                message
            )
        ).toEthSignedMessageHash();
        
        // Recover the signer
        address signer = digest.recover(signature);
        
        // Verify that the signer is the wallet
        require(signer == wallet, "D4LSignatureVerifier: invalid signature");
        
        return signer;
    }
    
    /**
     * @dev Generates a random session ID
     * @param wallet The wallet address
     * @param timestamp The current timestamp
     * @param salt A random salt
     * @return sessionId The generated session ID
     */
    function generateSessionId(
        address wallet,
        uint256 timestamp,
        bytes32 salt
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                wallet,
                timestamp,
                salt
            )
        );
    }
}
