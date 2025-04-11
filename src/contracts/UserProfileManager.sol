// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title UserProfileManager
 * @dev Contract for managing user profiles and data in the D4L ecosystem
 */
contract UserProfileManager is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event ProfileCreated(address indexed user, uint256 profileId);
    event ProfileUpdated(address indexed user, uint256 profileId);
    event DataAdded(address indexed user, string dataType);
    event RewardClaimed(address indexed user, uint256 amount);
    event ReferralAdded(address indexed referrer, address indexed referee);

    // Structs
    struct UserProfile {
        uint256 profileId;
        string username;
        string email;
        string socialHandle;
        string[] dataTypes;
        uint256 reputation;
        uint256 lastUpdated;
        bool exists;
    }

    struct ReferralInfo {
        address[] referrals;
        uint256 totalRewards;
        uint256 pendingRewards;
    }

    // State variables
    mapping(address => UserProfile) public profiles;
    mapping(address => ReferralInfo) public referrals;
    mapping(address => mapping(string => string)) public userData;
    mapping(string => bool) public validDataTypes;
    mapping(bytes32 => bool) public usedSignatures;

    uint256 public profileCounter;
    uint256 public referralReward;
    address public tokenAddress;
    address public signerAddress;

    // Constructor
    constructor(address _tokenAddress, address _signerAddress) {
        tokenAddress = _tokenAddress;
        signerAddress = _signerAddress;
        referralReward = 10 * 10**18; // 10 tokens

        // Initialize valid data types
        validDataTypes["profile"] = true;
        validDataTypes["preferences"] = true;
        validDataTypes["activity"] = true;
        validDataTypes["achievements"] = true;
    }

    // Modifiers
    modifier onlyProfileOwner(uint256 profileId) {
        require(profiles[msg.sender].profileId == profileId, "Not profile owner");
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].exists, "Profile does not exist");
        _;
    }

    // Functions
    function createProfile(string memory username, string memory email, string memory socialHandle) 
        external 
        returns (uint256) 
    {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(username).length > 0, "Username cannot be empty");

        profileCounter++;
        
        UserProfile storage profile = profiles[msg.sender];
        profile.profileId = profileCounter;
        profile.username = username;
        profile.email = email;
        profile.socialHandle = socialHandle;
        profile.lastUpdated = block.timestamp;
        profile.exists = true;

        // Initialize with profile data type
        profile.dataTypes.push("profile");
        
        emit ProfileCreated(msg.sender, profileCounter);
        return profileCounter;
    }

    function updateProfile(string memory username, string memory email, string memory socialHandle) 
        external 
        profileExists(msg.sender) 
        returns (bool) 
    {
        UserProfile storage profile = profiles[msg.sender];
        
        profile.username = username;
        profile.email = email;
        profile.socialHandle = socialHandle;
        profile.lastUpdated = block.timestamp;
        
        emit ProfileUpdated(msg.sender, profile.profileId);
        return true;
    }

    function addUserData(string memory dataType, string memory data) 
        external 
        profileExists(msg.sender) 
        returns (bool) 
    {
        require(validDataTypes[dataType], "Invalid data type");
        
        UserProfile storage profile = profiles[msg.sender];
        
        // Check if data type already exists
        bool dataTypeExists = false;
        for (uint i = 0; i < profile.dataTypes.length; i++) {
            if (keccak256(bytes(profile.dataTypes[i])) == keccak256(bytes(dataType))) {
                dataTypeExists = true;
                break;
            }
        }
        
        // Add data type if it doesn't exist
        if (!dataTypeExists) {
            profile.dataTypes.push(dataType);
        }
        
        // Store the data
        userData[msg.sender][dataType] = data;
        profile.lastUpdated = block.timestamp;
        
        emit DataAdded(msg.sender, dataType);
        return true;
    }

    function getUserData(address user, string memory dataType) 
        external 
        view 
        profileExists(user) 
        returns (string memory) 
    {
        require(validDataTypes[dataType], "Invalid data type");
        return userData[user][dataType];
    }

    function getProfile(address user) 
        external 
        view 
        returns (
            uint256 profileId,
            string memory username,
            string memory email,
            string memory socialHandle,
            uint256 reputation,
            uint256 lastUpdated,
            string[] memory dataTypes
        ) 
    {
        UserProfile storage profile = profiles[user];
        return (
            profile.profileId,
            profile.username,
            profile.email,
            profile.socialHandle,
            profile.reputation,
            profile.lastUpdated,
            profile.dataTypes
        );
    }

    function addReferral(address referee) 
        external 
        profileExists(msg.sender) 
        returns (bool) 
    {
        require(referee != msg.sender, "Cannot refer yourself");
        require(!profiles[referee].exists, "Referee already has a profile");
        
        referrals[msg.sender].referrals.push(referee);
        referrals[msg.sender].pendingRewards += referralReward;
        
        emit ReferralAdded(msg.sender, referee);
        return true;
    }

    function claimReferralRewards() 
        external 
        nonReentrant 
        profileExists(msg.sender) 
        returns (uint256) 
    {
        uint256 pendingRewards = referrals[msg.sender].pendingRewards;
        require(pendingRewards > 0, "No rewards to claim");
        
        referrals[msg.sender].pendingRewards = 0;
        referrals[msg.sender].totalRewards += pendingRewards;
        
        IERC20(tokenAddress).transfer(msg.sender, pendingRewards);
        
        emit RewardClaimed(msg.sender, pendingRewards);
        return pendingRewards;
    }

    function verifyAndExecute(
        bytes32 messageHash,
        bytes memory signature,
        string memory functionName,
        bytes memory functionData
    ) external nonReentrant returns (bool) {
        // Verify the signature
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        
        require(signer == signerAddress, "Invalid signature");
        require(!usedSignatures[messageHash], "Signature already used");
        
        // Mark signature as used
        usedSignatures[messageHash] = true;
        
        // Execute the function
        if (keccak256(bytes(functionName)) == keccak256(bytes("createProfile"))) {
            (string memory username, string memory email, string memory socialHandle) = 
                abi.decode(functionData, (string, string, string));
            createProfile(username, email, socialHandle);
            return true;
        } else if (keccak256(bytes(functionName)) == keccak256(bytes("updateProfile"))) {
            (string memory username, string memory email, string memory socialHandle) = 
                abi.decode(functionData, (string, string, string));
            updateProfile(username, email, socialHandle);
            return true;
        } else if (keccak256(bytes(functionName)) == keccak256(bytes("addUserData"))) {
            (string memory dataType, string memory data) = 
                abi.decode(functionData, (string, string));
            addUserData(dataType, data);
            return true;
        }
        
        revert("Unknown function");
    }

    // Admin functions
    function setReferralReward(uint256 _referralReward) external onlyOwner {
        referralReward = _referralReward;
    }
    
    function setSignerAddress(address _signerAddress) external onlyOwner {
        signerAddress = _signerAddress;
    }
    
    function addValidDataType(string memory dataType) external onlyOwner {
        validDataTypes[dataType] = true;
    }
    
    function removeValidDataType(string memory dataType) external onlyOwner {
        validDataTypes[dataType] = false;
    }
    
    function updateTokenAddress(address _tokenAddress) external onlyOwner {
        tokenAddress = _tokenAddress;
    }
    
    function increaseReputation(address user, uint256 amount) external onlyOwner profileExists(user) {
        profiles[user].reputation += amount;
    }
}
