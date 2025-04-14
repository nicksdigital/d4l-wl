// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LAuth
 * @dev Interface for the D4L authentication system
 */
interface ID4LAuth {
    /**
     * @dev Struct for user registration data
     */
    struct UserRegistration {
        address wallet;           // User's wallet address
        bytes32 username;         // Hashed username
        bytes32 email;            // Hashed email
        uint256 registeredAt;     // Registration timestamp
        bool active;              // Whether the account is active
    }
    
    /**
     * @dev Struct for authentication session
     */
    struct AuthSession {
        address wallet;           // User's wallet address
        bytes32 sessionId;        // Unique session identifier
        uint256 createdAt;        // Session creation timestamp
        uint256 expiresAt;        // Session expiration timestamp
        bool active;              // Whether the session is active
    }
    
    /**
     * @dev Event emitted when a user registers
     */
    event UserRegistered(
        address indexed wallet,
        bytes32 indexed usernameHash,
        bytes32 indexed emailHash,
        uint256 timestamp
    );
    
    /**
     * @dev Event emitted when a user logs in
     */
    event UserLoggedIn(
        address indexed wallet,
        bytes32 indexed sessionId,
        uint256 timestamp,
        uint256 expiresAt
    );
    
    /**
     * @dev Event emitted when a user logs out
     */
    event UserLoggedOut(
        address indexed wallet,
        bytes32 indexed sessionId,
        uint256 timestamp
    );
    
    /**
     * @dev Event emitted when a user is deactivated
     */
    event UserDeactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    /**
     * @dev Event emitted when a user is reactivated
     */
    event UserReactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    /**
     * @dev Registers a new user with signature verification
     * @param username The username (plaintext)
     * @param email The email (plaintext)
     * @param deadline The deadline for the signature validity
     * @param signature The signature of the registration data
     * @return success Whether the registration was successful
     */
    function registerWithSignature(
        string calldata username,
        string calldata email,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bool success);
    
    /**
     * @dev Logs in a user with signature verification
     * @param deadline The deadline for the signature validity
     * @param signature The signature of the login data
     * @return sessionId The session ID for the login
     * @return expiresAt The expiration timestamp for the session
     */
    function loginWithSignature(
        uint256 deadline,
        bytes calldata signature
    ) external returns (bytes32 sessionId, uint256 expiresAt);
    
    /**
     * @dev Logs out a user
     * @param sessionId The session ID to log out
     * @return success Whether the logout was successful
     */
    function logout(bytes32 sessionId) external returns (bool success);
    
    /**
     * @dev Validates a session
     * @param wallet The wallet address
     * @param sessionId The session ID to validate
     * @return valid Whether the session is valid
     */
    function validateSession(address wallet, bytes32 sessionId) external view returns (bool valid);
    
    /**
     * @dev Gets user registration data
     * @param wallet The wallet address
     * @return user The user registration data
     */
    function getUser(address wallet) external view returns (UserRegistration memory user);
    
    /**
     * @dev Gets session data
     * @param sessionId The session ID
     * @return session The session data
     */
    function getSession(bytes32 sessionId) external view returns (AuthSession memory session);
    
    /**
     * @dev Deactivates a user
     * @param wallet The wallet address to deactivate
     * @return success Whether the deactivation was successful
     */
    function deactivateUser(address wallet) external returns (bool success);
    
    /**
     * @dev Reactivates a user
     * @param wallet The wallet address to reactivate
     * @return success Whether the reactivation was successful
     */
    function reactivateUser(address wallet) external returns (bool success);
}
