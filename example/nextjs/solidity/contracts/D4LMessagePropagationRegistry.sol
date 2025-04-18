// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title D4LMessagePropagationRegistry
 * @dev A registry for tracking cross-chain message propagation, similar to DNS propagation
 * This contract should be deployed on each chain in the cross-chain network
 */
contract D4LMessagePropagationRegistry {
    // Message status enum
    enum MessageStatus {
        NONE,       // Message doesn't exist
        PENDING,    // Message has been sent but not yet received
        PROCESSING, // Message is being processed
        COMPLETED,  // Message has been successfully processed
        FAILED      // Message processing failed
    }
    
    // Message record struct
    struct MessageRecord {
        bytes32 messageId;        // Unique message identifier
        uint256 sourceChainId;    // Chain ID where the message originated
        uint256 destinationChainId; // Chain ID where the message is headed
        address sender;           // Address that sent the message
        address fromSoul;         // Source soul identity
        address toSoul;           // Destination soul identity
        address asset;            // Asset being transferred
        uint256 amount;           // Amount being transferred
        uint256 timestamp;        // When the message was recorded
        MessageStatus status;     // Current status of the message
        string metadata;          // Additional metadata
    }
    
    // Mapping from message ID to message record
    mapping(bytes32 => MessageRecord) public messages;
    
    // Mapping from chain ID to array of message IDs
    mapping(uint256 => bytes32[]) public chainMessages;
    
    // Mapping from address to array of message IDs (for sender)
    mapping(address => bytes32[]) public senderMessages;
    
    // Mapping from address to array of message IDs (for recipient soul)
    mapping(address => bytes32[]) public recipientMessages;
    
    // Events
    event MessageRegistered(
        bytes32 indexed messageId,
        uint256 indexed sourceChainId,
        uint256 indexed destinationChainId,
        address sender,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        MessageStatus status
    );
    
    event MessageStatusUpdated(
        bytes32 indexed messageId,
        MessageStatus oldStatus,
        MessageStatus newStatus
    );
    
    // Authorized relayers that can update message status
    mapping(address => bool) public authorizedRelayers;
    
    // Chain ID of this contract
    uint256 public immutable chainId;
    
    // Owner of the contract
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedRelayer() {
        require(authorizedRelayers[msg.sender], "Only authorized relayers can call this function");
        _;
    }
    
    // Constructor
    constructor(uint256 _chainId) {
        chainId = _chainId;
        owner = msg.sender;
        authorizedRelayers[msg.sender] = true;
    }
    
    /**
     * @dev Set an address as an authorized relayer
     * @param relayer Address to authorize
     * @param authorized Whether the address should be authorized
     */
    function setAuthorizedRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
    
    /**
     * @dev Register a new outgoing message
     * @param messageId Unique message identifier
     * @param destinationChainId Chain ID where the message is headed
     * @param fromSoul Source soul identity
     * @param toSoul Destination soul identity
     * @param asset Asset being transferred
     * @param amount Amount being transferred
     * @param metadata Additional metadata
     */
    function registerOutgoingMessage(
        bytes32 messageId,
        uint256 destinationChainId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        string calldata metadata
    ) external {
        require(messages[messageId].status == MessageStatus.NONE, "Message already exists");
        
        MessageRecord memory record = MessageRecord({
            messageId: messageId,
            sourceChainId: chainId,
            destinationChainId: destinationChainId,
            sender: msg.sender,
            fromSoul: fromSoul,
            toSoul: toSoul,
            asset: asset,
            amount: amount,
            timestamp: block.timestamp,
            status: MessageStatus.PENDING,
            metadata: metadata
        });
        
        messages[messageId] = record;
        chainMessages[destinationChainId].push(messageId);
        senderMessages[msg.sender].push(messageId);
        
        emit MessageRegistered(
            messageId,
            chainId,
            destinationChainId,
            msg.sender,
            fromSoul,
            toSoul,
            asset,
            amount,
            MessageStatus.PENDING
        );
    }
    
    /**
     * @dev Register a new incoming message
     * @param messageId Unique message identifier
     * @param sourceChainId Chain ID where the message originated
     * @param sender Address that sent the message
     * @param fromSoul Source soul identity
     * @param toSoul Destination soul identity
     * @param asset Asset being transferred
     * @param amount Amount being transferred
     * @param metadata Additional metadata
     */
    function registerIncomingMessage(
        bytes32 messageId,
        uint256 sourceChainId,
        address sender,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        string calldata metadata
    ) external onlyAuthorizedRelayer {
        require(messages[messageId].status == MessageStatus.NONE, "Message already exists");
        
        MessageRecord memory record = MessageRecord({
            messageId: messageId,
            sourceChainId: sourceChainId,
            destinationChainId: chainId,
            sender: sender,
            fromSoul: fromSoul,
            toSoul: toSoul,
            asset: asset,
            amount: amount,
            timestamp: block.timestamp,
            status: MessageStatus.PROCESSING,
            metadata: metadata
        });
        
        messages[messageId] = record;
        chainMessages[sourceChainId].push(messageId);
        recipientMessages[toSoul].push(messageId);
        
        emit MessageRegistered(
            messageId,
            sourceChainId,
            chainId,
            sender,
            fromSoul,
            toSoul,
            asset,
            amount,
            MessageStatus.PROCESSING
        );
    }
    
    /**
     * @dev Update the status of a message
     * @param messageId Message identifier
     * @param status New status
     */
    function updateMessageStatus(bytes32 messageId, MessageStatus status) external onlyAuthorizedRelayer {
        require(messages[messageId].status != MessageStatus.NONE, "Message does not exist");
        require(messages[messageId].status != status, "Status already set");
        
        MessageStatus oldStatus = messages[messageId].status;
        messages[messageId].status = status;
        
        emit MessageStatusUpdated(messageId, oldStatus, status);
    }
    
    /**
     * @dev Get a message record
     * @param messageId Message identifier
     * @return Message record
     */
    function getMessage(bytes32 messageId) external view returns (MessageRecord memory) {
        return messages[messageId];
    }
    
    /**
     * @dev Get the status of a message
     * @param messageId Message identifier
     * @return Message status
     */
    function getMessageStatus(bytes32 messageId) external view returns (MessageStatus) {
        return messages[messageId].status;
    }
    
    /**
     * @dev Get all messages for a chain
     * @param targetChainId Chain ID to get messages for
     * @return Array of message IDs
     */
    function getChainMessages(uint256 targetChainId) external view returns (bytes32[] memory) {
        return chainMessages[targetChainId];
    }
    
    /**
     * @dev Get all messages sent by an address
     * @param sender Sender address
     * @return Array of message IDs
     */
    function getSenderMessages(address sender) external view returns (bytes32[] memory) {
        return senderMessages[sender];
    }
    
    /**
     * @dev Get all messages received by a soul
     * @param soul Soul identity address
     * @return Array of message IDs
     */
    function getRecipientMessages(address soul) external view returns (bytes32[] memory) {
        return recipientMessages[soul];
    }
    
    /**
     * @dev Get pending messages count for a chain
     * @param targetChainId Chain ID to get pending messages for
     * @return Count of pending messages
     */
    function getPendingMessagesCount(uint256 targetChainId) external view returns (uint256) {
        bytes32[] memory messageIds = chainMessages[targetChainId];
        uint256 count = 0;
        
        for (uint256 i = 0; i < messageIds.length; i++) {
            if (messages[messageIds[i]].status == MessageStatus.PENDING) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @dev Get messages by status
     * @param status Status to filter by
     * @return Array of message IDs
     */
    function getMessagesByStatus(MessageStatus status) external view returns (bytes32[] memory) {
        // First, count messages with the given status
        uint256 count = 0;
        for (uint256 i = 0; i < chainMessages[chainId].length; i++) {
            bytes32 messageId = chainMessages[chainId][i];
            if (messages[messageId].status == status) {
                count++;
            }
        }
        
        // Then, create and populate the result array
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < chainMessages[chainId].length; i++) {
            bytes32 messageId = chainMessages[chainId][i];
            if (messages[messageId].status == status) {
                result[index] = messageId;
                index++;
            }
        }
        
        return result;
    }
}
