/**
 * Contract ABIs for the D4L Airdrop system
 */

// AirdropController ABI
export const AirdropControllerABI = [
  // Events
  {
    "type": "event",
    "name": "AirdropStarted",
    "inputs": [
      {
        "type": "uint256",
        "name": "startTime",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AirdropEnded",
    "inputs": [
      {
        "type": "uint256",
        "name": "endTime",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AirdropPaused",
    "inputs": [
      {
        "type": "bool",
        "name": "isPaused",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "NFTMinted",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokensAllocated",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "bonus",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SignerUpdated",
    "inputs": [
      {
        "type": "address",
        "name": "signer",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardRegistryUpdated",
    "inputs": [
      {
        "type": "address",
        "name": "rewardRegistry",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardBonusAdded",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  
  // Functions
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      {
        "type": "address",
        "name": "registry"
      },
      {
        "type": "address",
        "name": "profile"
      },
      {
        "type": "address",
        "name": "token"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setAirdropStartTime",
    "inputs": [
      {
        "type": "uint256",
        "name": "startTime"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "pauseAirdrop",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpauseAirdrop",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAirdropStatus",
    "inputs": [],
    "outputs": [
      {
        "type": "bool",
        "name": "isActive"
      },
      {
        "type": "bool",
        "name": "isPaused"
      },
      {
        "type": "uint256",
        "name": "startTime"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalMinted",
    "inputs": [],
    "outputs": [
      {
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  }
];

// SoulboundProfile ABI
export const SoulboundProfileABI = [
  // Events
  {
    "type": "event",
    "name": "ProfileMinted",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BaseURIUpdated",
    "inputs": [
      {
        "type": "string",
        "name": "baseURI",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProfileURIUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": true
      },
      {
        "type": "string",
        "name": "tokenURI",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AirdropInfoUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "baseAmount",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "bonusAmount",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModuleAdded",
    "inputs": [
      {
        "type": "address",
        "name": "module",
        "indexed": true
      },
      {
        "type": "string",
        "name": "name",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModuleRemoved",
    "inputs": [
      {
        "type": "address",
        "name": "module",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModuleDataUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "module",
        "indexed": true
      },
      {
        "type": "bytes",
        "name": "data",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  
  // Functions
  {
    "type": "function",
    "name": "mintProfile",
    "inputs": [
      {
        "type": "address",
        "name": "user"
      }
    ],
    "outputs": [
      {
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchMintProfiles",
    "inputs": [
      {
        "type": "address[]",
        "name": "users"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setBaseURI",
    "inputs": [
      {
        "type": "string",
        "name": "baseURI"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTokenURI",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      },
      {
        "type": "string",
        "name": "tokenURI"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getProfileId",
    "inputs": [
      {
        "type": "address",
        "name": "user"
      }
    ],
    "outputs": [
      {
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasProfile",
    "inputs": [
      {
        "type": "address",
        "name": "user"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setAirdropInfo",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      },
      {
        "type": "uint256",
        "name": "baseAmount"
      },
      {
        "type": "uint256",
        "name": "bonusAmount"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "markAirdropClaimed",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAirdropInfo",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          {
            "type": "uint256",
            "name": "baseAmount"
          },
          {
            "type": "uint256",
            "name": "bonusAmount"
          },
          {
            "type": "bool",
            "name": "claimed"
          },
          {
            "type": "uint256",
            "name": "claimTimestamp"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addModule",
    "inputs": [
      {
        "type": "address",
        "name": "module"
      },
      {
        "type": "string",
        "name": "name"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeModule",
    "inputs": [
      {
        "type": "address",
        "name": "module"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateModuleData",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      },
      {
        "type": "address",
        "name": "module"
      },
      {
        "type": "bytes",
        "name": "data"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getModuleData",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      },
      {
        "type": "address",
        "name": "module"
      }
    ],
    "outputs": [
      {
        "type": "bytes"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getModules",
    "inputs": [],
    "outputs": [
      {
        "type": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  
  // ERC721 Functions
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "type": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "type": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      }
    ],
    "outputs": [
      {
        "type": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ],
    "outputs": [
      {
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenId"
      }
    ],
    "outputs": [
      {
        "type": "address"
      }
    ],
    "stateMutability": "view"
  }
];

// WishlistRegistry ABI
export const WishlistRegistryABI = [
  {
    "inputs": [],
    "name": "totalRegistered",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "social",
        "type": "string"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": true,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "social",
        "type": "string"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  // Additional functions - we've already defined the critical ones above
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_controller",
        "type": "address"
      }
    ],
    "name": "setController",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registrationOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// RewardRegistry ABI
export const RewardRegistryABI = [
  // Events
  "event ActionCreated(bytes32 indexed actionId, string name, string description, uint256 rewardPoints)",
  "event ActionUpdated(bytes32 indexed actionId, string name, string description, uint256 rewardPoints, bool active)",
  "event ActionCompleted(address indexed user, bytes32 indexed actionId, uint256 timestamp)",
  "event ActionVerified(address indexed user, bytes32 indexed actionId, address verifier, uint256 timestamp)",
  "event WishlistRegistryUpdated(address indexed wishlistRegistry)",
  "event AirdropControllerUpdated(address indexed airdropController)",
  "event VerifierUpdated(address indexed verifier)",
  "event BonusPointsUpdated(address indexed user, uint256 points)",
  "event BonusClaimed(address indexed user, uint256 points)",
  
  // Functions
  "function setWishlistRegistry(address _wishlistRegistry) external",
  "function setAirdropController(address _airdropController) external",
  "function setVerifier(address verifier) external",
  "function createAction(bytes32 actionId, string calldata name, string calldata description, uint256 rewardPoints, uint256 cooldownPeriod, uint256 maxCompletions, bool requiresVerification) external",
  "function updateAction(bytes32 actionId, string calldata name, string calldata description, uint256 rewardPoints, bool active, uint256 cooldownPeriod, uint256 maxCompletions, bool requiresVerification) external",
  "function completeAction(bytes32 actionId) external",
  "function verifyAction(address user, bytes32 actionId) external",
  "function batchVerifyActions(address[] calldata users, bytes32[] calldata actionIds) external",
  "function claimBonusPoints() external",
  "function getAction(bytes32 actionId) external view returns (tuple(string name, string description, uint256 rewardPoints, bool active, uint256 cooldownPeriod, uint256 maxCompletions, bool requiresVerification, uint256 timestamp))",
  "function getUserAction(address user, bytes32 actionId) external view returns (tuple(uint256 completions, uint256 lastCompletedTimestamp, bool verified))",
  "function getActionIds() external view returns (bytes32[] memory)",
  "function getUserRewardPoints(address user) external view returns (uint256)",
  "function getUserBonusPoints(address user) external view returns (uint256)",
  "function hasClaimed(address user) external view returns (bool)",
  
  // State Variables
  "function wishlistRegistry() external view returns (address)",
  "function airdropController() external view returns (address)",
  "function totalBonusPoints() external view returns (uint256)",
  "function totalBonusClaimed() external view returns (uint256)"
];

// ERC20 Token ABI (Simple version)
export const TokenABI = [
  // Functions
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "type": "string",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "type": "string",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "type": "uint8",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "uint256",
        "name": "amount"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      },
      {
        "type": "address",
        "name": "spender"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "amount"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "type": "address",
        "name": "sender"
      },
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "uint256",
        "name": "amount"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ],
    "stateMutability": "nonpayable"
  },
  
  // Events
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "type": "address",
        "name": "from",
        "indexed": true
      },
      {
        "type": "address",
        "name": "to",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "type": "address",
        "name": "owner",
        "indexed": true
      },
      {
        "type": "address",
        "name": "spender",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false
  }
];