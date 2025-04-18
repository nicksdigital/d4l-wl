// Registry ABI
export const REGISTRY_ABI = [
  // View functions
  "function getUserSoulIdentities(address user) view returns (address[])",
  "function isSoul(address addr) view returns (bool)",
  "function getRoute(bytes32 routeId) view returns (tuple(address fromSoul, address toSoul, address asset, uint8 action, bytes32 constraintHash, address router, bool active))",
  "function getRouterForRoute(bytes32 routeId) view returns (address)",
  "function getAssetAddress(string assetType) view returns (address)",

  // Write functions
  "function createSoulIdentity(address user, bytes32 appSalt, bytes32 routingIntentHash, bytes32 zkProofKey) returns (address)",
  "function registerRoute(address fromSoul, address toSoul, address asset, uint8 action, bytes32 constraintHash, address router) returns (bytes32)",
  "function updateRoute(bytes32 routeId, address router, bool active)",
  "function registerAsset(address asset, string assetType, string name, string symbol)",
  "function registerRouter(address router, string routerType, bool active)",

  // Events
  "event SoulIdentityCreated(address indexed user, address indexed soulId, bytes32 appSalt, bytes32 routingIntentHash)",
  "event RouteRegistered(bytes32 indexed routeId, address indexed fromSoul, address indexed toSoul, address asset, uint8 action, bytes32 constraintHash, address router)",
  "event RouteUpdated(bytes32 indexed routeId, address router, bool active)",
  "event AssetRegistered(address indexed asset, string assetType, string name, string symbol)",
  "event RouterRegistered(address indexed router, string routerType, bool active)"
];

// Reputation Asset ABI
export const REPUTATION_ASSET_ABI = [
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function assetMetadata() view returns (string, string, uint8)",
  "function assetConstraints() view returns (bool, bool, bool)",
  "function assetType() view returns (uint8)",
  "function balanceOfSoul(address soul) view returns (uint256)",
  "function getReputationTier(address soul) view returns (uint8)",
  "function meetsThreshold(address soul, uint256 threshold) view returns (bool)",
  "function totalLinkedAmount() view returns (uint256)",
  "function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) view returns (bool)",

  // Write functions
  "function mintToSoul(address soul, uint256 amount)",
  "function burnFromSoul(address soul, uint256 amount)",
  "function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) returns (bool)",
  "function linkToSoul(address soulId, uint256 amount) returns (bool)",
  "function unlinkFromSoul(address soulId, uint256 amount) returns (bool)",
  "function setReputationTier(uint8 tier, uint256 threshold)",

  // Events
  "event ReputationMinted(address indexed soul, uint256 amount)",
  "event ReputationBurned(address indexed soul, uint256 amount)",
  "event ReputationTierSet(uint8 tier, uint256 threshold)",
  "event AssetLinked(address indexed asset, address indexed soul, uint256 amount)",
  "event AssetUnlinked(address indexed asset, address indexed soul, uint256 amount)",
  "event AssetTransferred(address indexed asset, address indexed fromSoul, address indexed toSoul, uint256 amount)"
];

// Rewards Asset ABI
export const REWARDS_ASSET_ABI = [
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function rewardToken() view returns (address)",
  "function assetMetadata() view returns (string, string, uint8)",
  "function assetConstraints() view returns (bool, bool, bool)",
  "function assetType() view returns (uint8)",
  "function balanceOfSoul(address soul) view returns (uint256)",
  "function getPendingRewards(address soul) view returns (uint256)",
  "function getExpiredRewards(address soul) view returns (uint256)",
  "function isDistributor(address distributor) view returns (bool)",
  "function getRewardProgram(uint256 programId) view returns (tuple(string name, uint256 totalAllocation, uint256 remainingAllocation, uint256 startTime, uint256 endTime, string description, bool active))",
  "function totalLinkedAmount() view returns (uint256)",
  "function canRoute(bytes32 routeId, address fromSoul, address toSoul, uint256 amount) view returns (bool)",

  // Write functions
  "function distributeRewards(address[] souls, uint256[] amounts, string reason)",
  "function claimRewards(address soul)",
  "function processExpiredRewards()",
  "function depositAndTransferToSoul(address soul, uint256 amount)",
  "function withdrawFromSoul(address soul, uint256 amount)",
  "function createRewardProgram(string programName, uint256 totalAllocation, uint256 duration, string description) returns (uint256)",
  "function setRewardProgramActive(uint256 programId, bool active)",
  "function distributeRewardsFromProgram(uint256 programId, address[] souls, uint256[] amounts, string reason)",
  "function linkToSoul(address soulId, uint256 amount) returns (bool)",
  "function unlinkFromSoul(address soulId, uint256 amount) returns (bool)",
  "function transferBetweenSouls(address fromSoul, address toSoul, uint256 amount) returns (bool)",

  // Events
  "event RewardsDistributed(address indexed distributor, address[] souls, uint256[] amounts, string reason)",
  "event RewardsClaimed(address indexed soul, address indexed claimer, uint256 amount)",
  "event RewardsExpired(address indexed soul, uint256 amount)",
  "event RewardProgramCreated(uint256 indexed programId, string name, uint256 totalAllocation)",
  "event RewardProgramUpdated(uint256 indexed programId, bool active)",
  "event DistributorSet(address indexed distributor, bool authorized)",
  "event AssetLinked(address indexed asset, address indexed soul, uint256 amount)",
  "event AssetUnlinked(address indexed asset, address indexed soul, uint256 amount)",
  "event AssetTransferred(address indexed asset, address indexed fromSoul, address indexed toSoul, uint256 amount)"
];

// Soul Identity ABI
export const SOUL_IDENTITY_ABI = [
  // View functions
  "function owner() view returns (address)",
  "function authorizedRoutes(bytes32) view returns (bool)",
  "function isAuthorizedCaller(address caller) view returns (bool)",

  // Write functions
  "function authorizeRoute(bytes32 routeId, bool authorized)",
  "function authorizeCaller(address caller, bool authorized)",

  // Events
  "event RouteAuthorized(bytes32 indexed routeId, bool authorized)",
  "event CallerAuthorized(address indexed caller, bool authorized)"
];

// Bridge Adapter ABI
export const BRIDGE_ADAPTER_ABI = [
  // View functions
  "function getSourceChainId() view returns (uint256)",
  "function getDestinationChainId() view returns (uint256)",
  "function getSourceRegistry() view returns (address)",
  "function getDestinationRegistry() view returns (address)",
  "function getPendingMessages(uint256 destinationChainId) view returns (uint256)",

  // Write functions
  "function routeReputationCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
  "function routeRewardsCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
  "function receiveMessage(bytes32 messageId, address fromSoul, address toSoul, address asset, uint256 amount, bytes data) external",
  "function setDestinationChainId(uint256 destinationChainId)",
  "function setDestinationRegistry(address destinationRegistry)",

  // Events
  "event MessageSent(bytes32 indexed messageId, uint256 indexed destinationChainId, address fromSoul, address toSoul, address asset, uint256 amount)",
  "event MessageReceived(bytes32 indexed messageId, uint256 indexed sourceChainId, address fromSoul, address toSoul, address asset, uint256 amount)",
  "event CrossChainRouteInitiated(bytes32 indexed routeId, address indexed fromSoul, address indexed toSoul, address asset, uint256 amount, uint256 destinationChainId)"
];
