// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./D4LMessagePropagationRegistry.sol";
import "./interfaces/ID4LSoulStreamRegistry.sol";
import "./interfaces/ID4LAsset.sol";

/**
 * @title D4LOnChainPropagationBridgeAdapter
 * @dev Bridge adapter that uses on-chain DNS-like propagation for cross-chain messaging
 */
contract D4LOnChainPropagationBridgeAdapter {
    // Source chain registry
    ID4LSoulStreamRegistry public sourceRegistry;
    
    // Message propagation registry
    D4LMessagePropagationRegistry public propagationRegistry;
    
    // Source chain ID
    uint256 public sourceChainId;
    
    // Destination chain ID
    uint256 public destinationChainId;
    
    // Destination registry address
    address public destinationRegistry;
    
    // Owner of the contract
    address public owner;
    
    // Relayer address
    address public relayer;
    
    // Events
    event MessageSent(
        bytes32 indexed messageId,
        uint256 indexed destinationChainId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount
    );
    
    event MessageReceived(
        bytes32 indexed messageId,
        uint256 indexed sourceChainId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount
    );
    
    event CrossChainRouteInitiated(
        bytes32 indexed routeId,
        address indexed fromSoul,
        address indexed toSoul,
        address asset,
        uint256 amount,
        uint256 destinationChainId
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this function");
        _;
    }
    
    // Constructor
    constructor(
        address _sourceRegistry,
        uint256 _sourceChainId,
        uint256 _destinationChainId,
        address _propagationRegistry
    ) {
        sourceRegistry = ID4LSoulStreamRegistry(_sourceRegistry);
        sourceChainId = _sourceChainId;
        destinationChainId = _destinationChainId;
        propagationRegistry = D4LMessagePropagationRegistry(_propagationRegistry);
        owner = msg.sender;
        relayer = msg.sender;
    }
    
    /**
     * @dev Set the destination chain ID
     * @param _destinationChainId New destination chain ID
     */
    function setDestinationChainId(uint256 _destinationChainId) external onlyOwner {
        destinationChainId = _destinationChainId;
    }
    
    /**
     * @dev Set the destination registry address
     * @param _destinationRegistry New destination registry address
     */
    function setDestinationRegistry(address _destinationRegistry) external onlyOwner {
        destinationRegistry = _destinationRegistry;
    }
    
    /**
     * @dev Set the relayer address
     * @param _relayer New relayer address
     */
    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
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
     * @dev Route reputation across chains
     * @param fromSoul Source soul identity
     * @param toSoul Destination soul identity
     * @param amount Amount to transfer
     * @param targetDestinationChainId Destination chain ID
     * @return messageId The message ID for tracking
     */
    function routeReputationCrossChain(
        address fromSoul,
        address toSoul,
        uint256 amount,
        uint256 targetDestinationChainId
    ) external payable returns (bytes32) {
        require(targetDestinationChainId == destinationChainId, "Invalid destination chain ID");
        require(destinationRegistry != address(0), "Destination registry not set");
        
        // Get reputation asset address
        address reputationAsset = sourceRegistry.getAssetAddress("REPUTATION");
        require(reputationAsset != address(0), "Reputation asset not found");
        
        // Create a unique message ID
        bytes32 messageId = keccak256(
            abi.encodePacked(
                fromSoul,
                toSoul,
                reputationAsset,
                amount,
                block.timestamp,
                sourceChainId,
                destinationChainId
            )
        );
        
        // Lock the reputation on source chain
        ID4LAsset(reputationAsset).burnFromSoul(fromSoul, amount);
        
        // Register the outgoing message in the propagation registry
        propagationRegistry.registerOutgoingMessage(
            messageId,
            destinationChainId,
            fromSoul,
            toSoul,
            reputationAsset,
            amount,
            "Reputation cross-chain transfer"
        );
        
        // Emit events
        emit MessageSent(
            messageId,
            destinationChainId,
            fromSoul,
            toSoul,
            reputationAsset,
            amount
        );
        
        emit CrossChainRouteInitiated(
            messageId,
            fromSoul,
            toSoul,
            reputationAsset,
            amount,
            destinationChainId
        );
        
        return messageId;
    }
    
    /**
     * @dev Route rewards across chains
     * @param fromSoul Source soul identity
     * @param toSoul Destination soul identity
     * @param amount Amount to transfer
     * @param targetDestinationChainId Destination chain ID
     * @return messageId The message ID for tracking
     */
    function routeRewardsCrossChain(
        address fromSoul,
        address toSoul,
        uint256 amount,
        uint256 targetDestinationChainId
    ) external payable returns (bytes32) {
        require(targetDestinationChainId == destinationChainId, "Invalid destination chain ID");
        require(destinationRegistry != address(0), "Destination registry not set");
        
        // Get rewards asset address
        address rewardsAsset = sourceRegistry.getAssetAddress("REWARDS");
        require(rewardsAsset != address(0), "Rewards asset not found");
        
        // Create a unique message ID
        bytes32 messageId = keccak256(
            abi.encodePacked(
                fromSoul,
                toSoul,
                rewardsAsset,
                amount,
                block.timestamp,
                sourceChainId,
                destinationChainId
            )
        );
        
        // Lock the rewards on source chain
        ID4LAsset(rewardsAsset).burnFromSoul(fromSoul, amount);
        
        // Register the outgoing message in the propagation registry
        propagationRegistry.registerOutgoingMessage(
            messageId,
            destinationChainId,
            fromSoul,
            toSoul,
            rewardsAsset,
            amount,
            "Rewards cross-chain transfer"
        );
        
        // Emit events
        emit MessageSent(
            messageId,
            destinationChainId,
            fromSoul,
            toSoul,
            rewardsAsset,
            amount
        );
        
        emit CrossChainRouteInitiated(
            messageId,
            fromSoul,
            toSoul,
            rewardsAsset,
            amount,
            destinationChainId
        );
        
        return messageId;
    }
    
    /**
     * @dev Receive a message from another chain
     * @param messageId Message identifier
     * @param fromSoul Source soul identity
     * @param toSoul Destination soul identity
     * @param asset Asset being transferred
     * @param amount Amount being transferred
     * @param data Additional data
     */
    function receiveMessage(
        bytes32 messageId,
        address fromSoul,
        address toSoul,
        address asset,
        uint256 amount,
        bytes calldata data
    ) external onlyRelayer {
        // Register the incoming message in the propagation registry
        propagationRegistry.registerIncomingMessage(
            messageId,
            sourceChainId,
            msg.sender,
            fromSoul,
            toSoul,
            asset,
            amount,
            "Received cross-chain transfer"
        );
        
        // Determine the asset type
        string memory assetType;
        if (asset == sourceRegistry.getAssetAddress("REPUTATION")) {
            assetType = "REPUTATION";
        } else if (asset == sourceRegistry.getAssetAddress("REWARDS")) {
            assetType = "REWARDS";
        } else {
            revert("Unsupported asset type");
        }
        
        // Get the corresponding asset on the destination chain
        address destinationAsset = sourceRegistry.getAssetAddress(assetType);
        require(destinationAsset != address(0), "Destination asset not found");
        
        // Mint the asset on the destination chain
        ID4LAsset(destinationAsset).mintToSoul(toSoul, amount);
        
        // Update the message status to completed
        propagationRegistry.updateMessageStatus(messageId, D4LMessagePropagationRegistry.MessageStatus.COMPLETED);
        
        // Emit event
        emit MessageReceived(
            messageId,
            sourceChainId,
            fromSoul,
            toSoul,
            destinationAsset,
            amount
        );
    }
    
    /**
     * @dev Get pending messages count for a chain
     * @param targetChainId Chain ID to get pending messages for
     * @return Count of pending messages
     */
    function getPendingMessages(uint256 targetChainId) external view returns (uint256) {
        return propagationRegistry.getPendingMessagesCount(targetChainId);
    }
    
    /**
     * @dev Get the status of a message
     * @param messageId Message identifier
     * @return Message status
     */
    function getMessageStatus(bytes32 messageId) external view returns (D4LMessagePropagationRegistry.MessageStatus) {
        return propagationRegistry.getMessageStatus(messageId);
    }
    
    /**
     * @dev Get the source chain ID
     * @return Source chain ID
     */
    function getSourceChainId() external view returns (uint256) {
        return sourceChainId;
    }
    
    /**
     * @dev Get the destination chain ID
     * @return Destination chain ID
     */
    function getDestinationChainId() external view returns (uint256) {
        return destinationChainId;
    }
    
    /**
     * @dev Get the source registry address
     * @return Source registry address
     */
    function getSourceRegistry() external view returns (address) {
        return address(sourceRegistry);
    }
    
    /**
     * @dev Get the destination registry address
     * @return Destination registry address
     */
    function getDestinationRegistry() external view returns (address) {
        return destinationRegistry;
    }
}
