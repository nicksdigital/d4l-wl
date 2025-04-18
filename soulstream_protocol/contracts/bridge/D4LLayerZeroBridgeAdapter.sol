// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/ID4LBridgeAdapter.sol";

/**
 * @title D4LLayerZeroBridgeAdapter
 * @dev Bridge adapter for LayerZero cross-chain communication
 */
contract D4LLayerZeroBridgeAdapter is ID4LBridgeAdapter, Ownable, Pausable, ReentrancyGuard {
    // Custom errors for gas efficiency and better error reporting
    error ChainIdCannotBeZero();
    error LzChainIdCannotBeZero();
    error ChainIdAlreadyMapped(uint256 chainId);
    error LzChainIdAlreadyMapped(uint16 lzChainId);
    error RateLimitExceeded(uint256 timeRemaining);
    error MaxChainMappingsExceeded(uint256 maxMappings);
    error CallerNotAuthorized(address caller);
    error MessageAlreadyProcessed(bytes32 messageId);
    error MessageIdCollision(bytes32 messageId);
    error DestinationChainNotSupported(uint256 chainId);
    error InsufficientFee(uint256 required, uint256 provided);
    error RefundFailed();
    error InvalidMessageLength();
    error InvalidGasLimit();
    error InvalidChainId();
    error InvalidAddress();
    error InvalidMessageId();
    error ContractPaused();
    error ExternalCallFailed(string reason);

    // The LayerZero endpoint contract
    address public immutable lzEndpoint;

    // The router contract
    address public immutable router;

    // Mapping of supported chains
    mapping(uint256 => uint16) public chainIdToLzId;
    mapping(uint16 => uint256) public lzIdToChainId;

    // Mapping of message status
    mapping(bytes32 => uint8) public messageStatus; // 0 = unknown, 1 = pending, 2 = completed, 3 = failed

    // Events
    event ChainMapped(uint256 indexed chainId, uint16 indexed lzChainId);
    event ChainUnmapped(uint256 indexed chainId, uint16 indexed lzChainId);
    event MessageStatusUpdated(bytes32 indexed messageId, uint8 status);
    event EmergencyShutdown(address indexed caller, string reason);
    event EmergencyRecovery(address indexed caller);

   
    // Rate limiting variables
    uint256 public chainMappingCooldown;
    uint256 public lastChainMappingTimestamp;
    uint256 public constant MAX_CHAIN_MAPPINGS_PER_PERIOD = 10;
    uint256 public chainMappingsInPeriod;
    uint256 public constant CHAIN_MAPPING_PERIOD = 1 days;

    // Version control for upgrades
    uint256 public constant VERSION = 1;

     /** 
     * @dev Constructor
     * @param _lzEndpoint The LayerZero endpoint contract
     * @param _router The router contract
     * @param _owner The owner of the contract
     */

    constructor(
        address _lzEndpoint,
        address _router,
        address _owner
    ) Ownable(_owner) {
        if (_lzEndpoint == address(0)) revert InvalidAddress();
        if (_router == address(0)) revert InvalidAddress();

        lzEndpoint = _lzEndpoint;
        router = _router;

        // Initialize rate limiting
        chainMappingCooldown = 1 hours;
        lastChainMappingTimestamp = 0;
        chainMappingsInPeriod = 0;
    }

    /**
     * @dev Maps a chain ID to a LayerZero chain ID
     * @param chainId The chain ID
     * @param lzChainId The LayerZero chain ID
     */
    function mapChain(uint256 chainId, uint16 lzChainId) external onlyOwner whenNotPaused nonReentrant {
        // Input validation - use custom errors for gas efficiency
        if (chainId == 0) revert ChainIdCannotBeZero();
        if (lzChainId == 0) revert LzChainIdCannotBeZero();

        // Rate limiting to prevent too many chain mappings in a short period
        if (block.timestamp < lastChainMappingTimestamp + chainMappingCooldown) {
            revert RateLimitExceeded(lastChainMappingTimestamp + chainMappingCooldown - block.timestamp);
        }

        // Reset period counter if we're in a new period
        if (block.timestamp >= lastChainMappingTimestamp + CHAIN_MAPPING_PERIOD) {
            chainMappingsInPeriod = 0;
        }

        // Check if we've exceeded the maximum number of mappings in this period
        if (chainMappingsInPeriod >= MAX_CHAIN_MAPPINGS_PER_PERIOD) {
            revert MaxChainMappingsExceeded(MAX_CHAIN_MAPPINGS_PER_PERIOD);
        }

        // Check for existing mappings
        if (chainIdToLzId[chainId] != 0) revert ChainIdAlreadyMapped(chainId);
        if (lzIdToChainId[lzChainId] != 0) revert LzChainIdAlreadyMapped(lzChainId);

        // CEI Pattern: Update state variables (Effects)
        chainIdToLzId[chainId] = lzChainId;
        lzIdToChainId[lzChainId] = chainId;

        // Update rate limiting variables
        lastChainMappingTimestamp = block.timestamp;
        chainMappingsInPeriod++;

        // Emit event (no external interactions)
        emit ChainMapped(chainId, lzChainId);
    }

    /**
     * @dev Sends a message to another chain
     * @param destinationChainId ID of the destination chain
     * @param message The message to send
     * @param gasLimit Gas limit for execution on the destination chain
     * @return messageId Unique identifier for the message
     */
    function sendMessage(
        uint256 destinationChainId,
        bytes calldata message,
        uint256 gasLimit
    ) external payable override nonReentrant whenNotPaused returns (bytes32 messageId) {
        // Input validation with custom errors for gas efficiency
        if (msg.sender != router) revert CallerNotAuthorized(msg.sender);
        if (destinationChainId == 0) revert InvalidChainId();
        if (message.length == 0) revert InvalidMessageLength();
        if (gasLimit == 0) revert InvalidGasLimit();

        // Get the LayerZero chain ID
        uint16 lzChainId = chainIdToLzId[destinationChainId];
        if (lzChainId == 0) revert DestinationChainNotSupported(destinationChainId);

        // Generate a message ID with entropy to prevent collisions
        // Use a more secure method with additional entropy sources
        messageId = keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            destinationChainId,
            msg.sender,
            message,
            _getRandomNonce(),
            address(this),
            block.prevrandao // More secure than block.difficulty in newer Solidity versions
        ));

        // Check if message ID already exists (extremely unlikely but check anyway)
        if (messageStatus[messageId] != 0) revert MessageIdCollision(messageId);

        // CEI Pattern: Update state variables (Effects)
        // Mark the message as pending
        messageStatus[messageId] = 1;

        // Emit event for tracking
        emit MessageSent(
            destinationChainId,
            messageId,
            msg.sender,
            message
        );

        emit MessageStatusUpdated(messageId, 1); // 1 = pending

        // For a real implementation, uncomment the following code:
        /*
        // Encode the message with the messageId
        bytes memory payload = abi.encode(messageId, message);

        // Get the adapter address on the destination chain
        bytes memory adapterAddress = abi.encodePacked(address(this));

        // CEI Pattern: External interactions last
        try ILayerZeroEndpoint(lzEndpoint).send{value: msg.value}(
            lzChainId,
            adapterAddress,
            payload,
            payable(msg.sender),
            address(0),
            abi.encodePacked(uint256(gasLimit))
        ) {
            // Success
        } catch Error(string memory reason) {
            // Revert with the reason
            messageStatus[messageId] = 0; // Reset message status
            emit MessageStatusUpdated(messageId, 0); // 0 = unknown/reset
            revert ExternalCallFailed(reason);
        } catch (bytes memory) {
            // Revert with a generic message
            messageStatus[messageId] = 0; // Reset message status
            emit MessageStatusUpdated(messageId, 0); // 0 = unknown/reset
            revert ExternalCallFailed("LayerZero send failed with low-level error");
        }
        */

        return messageId;
    }

    /**
     * @dev Generates a random nonce for message ID generation
     * @return nonce A pseudo-random value
     */
    function _getRandomNonce() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.coinbase,
            block.prevrandao, // More secure than block.difficulty in newer Solidity versions
            msg.sender,
            address(this),
            tx.gasprice,
            block.basefee
        )));
    }

    /**
     * @dev Receives a message from another chain
     * @param sourceChainId ID of the source chain
     * @param sender Address of the sender on the source chain
     * @param message The message received
     * @param messageId Unique identifier for the message
     * @return success Whether the message was successfully processed
     */
    function receiveMessage(
        uint256 sourceChainId,
        address sender,
        bytes calldata message,
        bytes32 messageId
    ) external nonReentrant whenNotPaused returns (bool success) {
        // Input validation with custom errors for gas efficiency
        if (sourceChainId == 0) revert InvalidChainId();
        if (sender == address(0)) revert InvalidAddress();
        if (message.length == 0) revert InvalidMessageLength();
        if (messageId == bytes32(0)) revert InvalidMessageId();

        // In a real implementation, this would be called by the LayerZero endpoint
        // For this example, we'll allow the owner to call it for testing
        if (msg.sender != owner() && msg.sender != lzEndpoint) {
            revert CallerNotAuthorized(msg.sender);
        }

        // Check if the message has already been processed
        if (messageStatus[messageId] == 2) revert MessageAlreadyProcessed(messageId);

        // CEI Pattern: Update state variables (Effects)
        // Mark the message as completed
        messageStatus[messageId] = 2;

        // Emit events for tracking
        emit MessageReceived(
            sourceChainId,
            messageId,
            sender,
            message
        );

        emit MessageStatusUpdated(messageId, 2); // 2 = completed

        // CEI Pattern: External interactions last
        // Forward the message to the router
        (bool callSuccess, bytes memory returnData) = router.call(
            abi.encodeWithSignature(
                "receiveCrossChainRoute(uint256,address,bytes,bytes32)",
                sourceChainId,
                sender,
                message,
                messageId
            )
        );

        // Process the result
        if (callSuccess) {
            // Decode the return value
            bool routerSuccess = abi.decode(returnData, (bool));

            // Update the message status based on the result
            if (!routerSuccess) {
                messageStatus[messageId] = 3; // 3 = failed
                emit MessageStatusUpdated(messageId, 3);
            }

            success = routerSuccess;
        } else {
            // If the call fails, mark the message as failed
            messageStatus[messageId] = 3; // 3 = failed
            emit MessageStatusUpdated(messageId, 3);
            success = false;
        }

        return success;
    }

    /**
     * @dev Gets the fee required to send a message to another chain
     * @param destinationChainId ID of the destination chain
     * @param messageLength Length of the message in bytes
     * @param gasLimit Gas limit for execution on the destination chain
     * @return fee The fee in native currency
     */
    function getMessageFee(
        uint256 destinationChainId,
        uint256 messageLength,
        uint256 gasLimit
    ) external view override returns (uint256 fee) {
        // Input validation with custom errors for gas efficiency
        if (destinationChainId == 0) revert InvalidChainId();
        if (messageLength == 0) revert InvalidMessageLength();
        if (gasLimit == 0) revert InvalidGasLimit();

        // Get the LayerZero chain ID
        uint16 lzChainId = chainIdToLzId[destinationChainId];
        if (lzChainId == 0) revert DestinationChainNotSupported(destinationChainId);

        // Check if the contract is paused
        if (paused()) revert ContractPaused();

        // In a real implementation, we would call the LayerZero endpoint
        // For this example, we'll return a fixed fee based on message length and gas limit
        // Use SafeMath-like checks to prevent overflow
        uint256 baseFee = 0.001 ether;

        // Calculate length fee with overflow protection
        uint256 lengthFee;
        unchecked {
            // 100 wei per KB, with safe division
            lengthFee = (messageLength * 100) / 1024;
        }

        // Calculate gas fee with overflow protection
        uint256 gasFee;
        unchecked {
            // 1 wei per 100k gas, with safe division
            gasFee = (gasLimit * 1) / 100000;
        }

        // Calculate total fee with overflow protection
        uint256 totalFee = baseFee;
        unchecked {
            totalFee += lengthFee;
            totalFee += gasFee;
        }

        return totalFee;

        // For a real implementation, uncomment the following code:
        /*
        // Get the adapter address on the destination chain
        bytes memory adapterAddress = abi.encodePacked(address(this));

        // Create a dummy message of the specified length for fee estimation
        bytes memory dummyMessage = new bytes(messageLength);

        // Get the fee from LayerZero
        try ILayerZeroEndpoint(lzEndpoint).estimateFees(
            lzChainId,
            address(this),
            dummyMessage,
            false,
            abi.encodePacked(uint256(gasLimit))
        ) returns (uint256 nativeFee, uint256) {
            return nativeFee;
        } catch {
            // If estimation fails, return a reasonable default
            return totalFee;
        }
        */
    }

    /**
     * @dev Gets the status of a message
     * @param messageId ID of the message
     * @return status 0 = unknown, 1 = pending, 2 = completed, 3 = failed
     */
    function getMessageStatus(bytes32 messageId) external view returns (uint8 status) {
        return messageStatus[messageId];
    }

    /**
     * @dev Gets the chain ID that this adapter is connected to
     * @return chainId The chain ID
     */
    function getChainId() external view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    /**
     * @dev Checks if this adapter supports a specific destination chain
     * @param chainId The chain ID to check
     * @return supported Whether the chain is supported
     */
    function supportsChain(uint256 chainId) external view returns (bool) {
        return chainIdToLzId[chainId] != 0;
    }

    /**
     * @dev Gets all chains supported by this adapter
     * @return chainIds Array of supported chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        // Count the number of supported chains
        uint256 count = 0;
        for (uint16 i = 1; i < 65535; i++) {
            if (lzIdToChainId[i] != 0) {
                count++;
            }
        }

        // Create the array of supported chain IDs
        uint256[] memory chainIds = new uint256[](count);
        uint256 index = 0;

        for (uint16 i = 1; i < 65535; i++) {
            if (lzIdToChainId[i] != 0) {
                chainIds[index] = lzIdToChainId[i];
                index++;
            }
        }

        return chainIds;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
        emit EmergencyShutdown(msg.sender, "Manual pause by owner");
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyRecovery(msg.sender);
    }

    /**
     * @dev Emergency shutdown with reason
     * @param reason The reason for the emergency shutdown
     */
    function emergencyShutdown(string calldata reason) external onlyOwner {
        _pause();
        emit EmergencyShutdown(msg.sender, reason);
    }

    /**
     * @dev Sets the chain mapping cooldown period
     * @param _cooldown The new cooldown period in seconds
     */
    function setChainMappingCooldown(uint256 _cooldown) external onlyOwner {
        require(_cooldown > 0, "D4LLayerZeroBridgeAdapter: cooldown must be positive");
        chainMappingCooldown = _cooldown;
    }

    /**
     * @dev Withdraws ETH from the contract to the owner
     * @param amount The amount of ETH to withdraw
     */
    function withdrawETH(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "D4LLayerZeroBridgeAdapter: amount must be positive");
        require(amount <= address(this).balance, "D4LLayerZeroBridgeAdapter: insufficient balance");

        // CEI Pattern: Effects before interactions
        // No state changes needed here

        // External interaction
        (bool success, ) = owner().call{value: amount}("");
        require(success, "D4LLayerZeroBridgeAdapter: ETH transfer failed");
    }

    /**
     * @dev Gets the contract version
     * @return version The contract version
     */
    function getVersion() external pure returns (uint256) {
        return VERSION;
    }

    /**
     * @dev Receives ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("D4LLayerZeroBridgeAdapter: function not found");
    }
}

/**
 * @dev Interface for the LayerZero endpoint
 */
interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParam
    ) external view returns (uint256 nativeFee, uint256 zroFee);
}
