// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";
import "./ID4LAuth.sol";
import "./D4LSignatureVerifier.sol";
import "../utils/D4LErrors.sol";

/**
 * @title D4LAuth
 * @dev Implementation of the D4L authentication system with signature-based login and registration
 */
contract D4LAuth is ID4LAuth, AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant AUTH_ADMIN_ROLE = keccak256("AUTH_ADMIN_ROLE");
    bytes32 public constant USER_MANAGER_ROLE = keccak256("USER_MANAGER_ROLE");

    // Domain separator for EIP-712 signatures
    bytes32 public immutable DOMAIN_SEPARATOR;

    // The SoulStream registry
    ID4LSoulStreamRegistry public immutable registry;

    // Session duration in seconds (default: 1 day)
    uint256 public sessionDuration;

    // Mapping of wallet address to user registration
    mapping(address => UserRegistration) private _users;

    // Mapping of username hash to wallet address
    mapping(bytes32 => address) private _usernameToWallet;

    // Mapping of email hash to wallet address
    mapping(bytes32 => address) private _emailToWallet;

    // Mapping of session ID to session
    mapping(bytes32 => AuthSession) private _sessions;

    // Mapping of wallet address to active session IDs
    mapping(address => bytes32[]) private _userSessions;

    /**
     * @dev Constructor
     * @param admin The admin address
     * @param _registry The SoulStream registry address
     * @param _sessionDuration The session duration in seconds
     */
    constructor(
        address admin,
        address _registry,
        uint256 _sessionDuration
    ) {
        if (admin == address(0)) revert ZeroAddress();
        if (_registry == address(0)) revert ZeroAddressWithMessage("registry cannot be zero address");
        if (_sessionDuration == 0) revert InvalidSessionDuration("session duration must be positive");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUTH_ADMIN_ROLE, admin);
        _grantRole(USER_MANAGER_ROLE, admin);

        registry = ID4LSoulStreamRegistry(_registry);
        sessionDuration = _sessionDuration;

        // Compute the domain separator for EIP-712 signatures
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        DOMAIN_SEPARATOR = D4LSignatureVerifier.computeDomainSeparator(
            "D4LAuth",
            "1",
            chainId,
            address(this)
        );
    }

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
    ) external override nonReentrant whenNotPaused returns (bool success) {
        // Verify the signature
        address wallet = D4LSignatureVerifier.verifyRegistrationSignature(
            msg.sender,
            username,
            email,
            deadline,
            signature,
            DOMAIN_SEPARATOR
        );

        // Check if the user already exists
        require(_users[wallet].wallet == address(0), "D4LAuth: user already registered");

        // Hash the username and email
        bytes32 usernameHash = keccak256(bytes(username));
        bytes32 emailHash = keccak256(bytes(email));

        // Check if the username or email is already taken
        require(_usernameToWallet[usernameHash] == address(0), "D4LAuth: username already taken");
        require(_emailToWallet[emailHash] == address(0), "D4LAuth: email already taken");

        // Register the user
        _users[wallet] = UserRegistration({
            wallet: wallet,
            username: usernameHash,
            email: emailHash,
            registeredAt: block.timestamp,
            active: true
        });

        // Update the mappings
        _usernameToWallet[usernameHash] = wallet;
        _emailToWallet[emailHash] = wallet;

        // Create a soul identity for the user if they don't have one
        if (registry.getUserSoulIdentities(wallet).length == 0) {
            // Generate a salt based on the username and email
            bytes32 appSalt = keccak256(abi.encodePacked("D4LAuth", username, email));

            // Generate a routing intent hash
            bytes32 routingIntentHash = keccak256(abi.encodePacked("D4LAuth", wallet, block.timestamp));

            // Create the soul identity
            registry.createSoulIdentity(
                wallet,
                appSalt,
                routingIntentHash,
                bytes32(0) // No zkProof key
            );
        }

        emit UserRegistered(wallet, usernameHash, emailHash, block.timestamp);

        return true;
    }

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
    ) external override nonReentrant whenNotPaused returns (bytes32 sessionId, uint256 expiresAt) {
        // Verify the signature
        address wallet = D4LSignatureVerifier.verifyLoginSignature(
            msg.sender,
            deadline,
            signature,
            DOMAIN_SEPARATOR
        );

        // Check if the user exists and is active
        require(_users[wallet].wallet != address(0), "D4LAuth: user not registered");
        require(_users[wallet].active, "D4LAuth: user is not active");

        // Generate a session ID
        bytes32 salt = keccak256(abi.encodePacked(block.prevrandao, block.timestamp, wallet));
        sessionId = D4LSignatureVerifier.generateSessionId(wallet, block.timestamp, salt);

        // Calculate the expiration timestamp
        expiresAt = block.timestamp + sessionDuration;

        // Create the session
        _sessions[sessionId] = AuthSession({
            wallet: wallet,
            sessionId: sessionId,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        // Add the session to the user's sessions
        _userSessions[wallet].push(sessionId);

        emit UserLoggedIn(wallet, sessionId, block.timestamp, expiresAt);

        return (sessionId, expiresAt);
    }

    /**
     * @dev Logs out a user
     * @param sessionId The session ID to log out
     * @return success Whether the logout was successful
     */
    function logout(bytes32 sessionId) external override nonReentrant returns (bool success) {
        // Get the session
        AuthSession storage session = _sessions[sessionId];

        // Check if the session exists and is active
        require(session.wallet != address(0), "D4LAuth: session not found");
        require(session.active, "D4LAuth: session already inactive");

        // Check if the caller is the session owner
        require(session.wallet == msg.sender, "D4LAuth: not session owner");

        // Deactivate the session
        session.active = false;

        emit UserLoggedOut(session.wallet, sessionId, block.timestamp);

        return true;
    }

    /**
     * @dev Validates a session
     * @param wallet The wallet address
     * @param sessionId The session ID to validate
     * @return valid Whether the session is valid
     */
    function validateSession(address wallet, bytes32 sessionId) external view override returns (bool valid) {
        // Get the session
        AuthSession storage session = _sessions[sessionId];

        // Check if the session exists, is active, and belongs to the wallet
        if (session.wallet == address(0) || !session.active || session.wallet != wallet) {
            return false;
        }

        // Check if the session has expired
        if (block.timestamp > session.expiresAt) {
            return false;
        }

        return true;
    }

    /**
     * @dev Gets user registration data
     * @param wallet The wallet address
     * @return user The user registration data
     */
    function getUser(address wallet) external view override returns (UserRegistration memory user) {
        return _users[wallet];
    }

    /**
     * @dev Gets session data
     * @param sessionId The session ID
     * @return session The session data
     */
    function getSession(bytes32 sessionId) external view override returns (AuthSession memory session) {
        return _sessions[sessionId];
    }

    /**
     * @dev Deactivates a user
     * @param wallet The wallet address to deactivate
     * @return success Whether the deactivation was successful
     */
    function deactivateUser(address wallet) external override onlyRole(USER_MANAGER_ROLE) returns (bool success) {
        // Check if the user exists and is active
        require(_users[wallet].wallet != address(0), "D4LAuth: user not registered");
        require(_users[wallet].active, "D4LAuth: user already inactive");

        // Deactivate the user
        _users[wallet].active = false;

        // Deactivate all active sessions for the user
        bytes32[] storage sessions = _userSessions[wallet];
        for (uint256 i = 0; i < sessions.length; i++) {
            if (_sessions[sessions[i]].active) {
                _sessions[sessions[i]].active = false;
                emit UserLoggedOut(wallet, sessions[i], block.timestamp);
            }
        }

        emit UserDeactivated(wallet, block.timestamp);

        return true;
    }

    /**
     * @dev Reactivates a user
     * @param wallet The wallet address to reactivate
     * @return success Whether the reactivation was successful
     */
    function reactivateUser(address wallet) external override onlyRole(USER_MANAGER_ROLE) returns (bool success) {
        // Check if the user exists and is inactive
        require(_users[wallet].wallet != address(0), "D4LAuth: user not registered");
        require(!_users[wallet].active, "D4LAuth: user already active");

        // Reactivate the user
        _users[wallet].active = true;

        emit UserReactivated(wallet, block.timestamp);

        return true;
    }

    /**
     * @dev Sets the session duration
     * @param _sessionDuration The new session duration in seconds
     */
    function setSessionDuration(uint256 _sessionDuration) external onlyRole(AUTH_ADMIN_ROLE) {
        require(_sessionDuration > 0, "D4LAuth: session duration must be positive");
        sessionDuration = _sessionDuration;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(AUTH_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(AUTH_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Gets the wallet address for a username
     * @param username The username (plaintext)
     * @return wallet The wallet address
     */
    function getWalletByUsername(string calldata username) external view returns (address) {
        bytes32 usernameHash = keccak256(bytes(username));
        return _usernameToWallet[usernameHash];
    }

    /**
     * @dev Gets the wallet address for an email
     * @param email The email (plaintext)
     * @return wallet The wallet address
     */
    function getWalletByEmail(string calldata email) external view returns (address) {
        bytes32 emailHash = keccak256(bytes(email));
        return _emailToWallet[emailHash];
    }

    /**
     * @dev Gets all active sessions for a wallet
     * @param wallet The wallet address
     * @return sessionIds Array of active session IDs
     */
    function getActiveSessions(address wallet) external view returns (bytes32[] memory) {
        bytes32[] storage allSessions = _userSessions[wallet];

        // Count active sessions
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allSessions.length; i++) {
            if (_sessions[allSessions[i]].active && block.timestamp <= _sessions[allSessions[i]].expiresAt) {
                activeCount++;
            }
        }

        // Create array of active sessions
        bytes32[] memory activeSessions = new bytes32[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allSessions.length; i++) {
            if (_sessions[allSessions[i]].active && block.timestamp <= _sessions[allSessions[i]].expiresAt) {
                activeSessions[index] = allSessions[i];
                index++;
            }
        }

        return activeSessions;
    }

    /**
     * @dev Checks if a username is available
     * @param username The username (plaintext)
     * @return available Whether the username is available
     */
    function isUsernameAvailable(string calldata username) external view returns (bool) {
        bytes32 usernameHash = keccak256(bytes(username));
        return _usernameToWallet[usernameHash] == address(0);
    }

    /**
     * @dev Checks if an email is available
     * @param email The email (plaintext)
     * @return available Whether the email is available
     */
    function isEmailAvailable(string calldata email) external view returns (bool) {
        bytes32 emailHash = keccak256(bytes(email));
        return _emailToWallet[emailHash] == address(0);
    }
}
