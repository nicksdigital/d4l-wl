// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LBridgeAdapter
 * @dev Interface for bridge adapters that handle cross-chain communication
 */
interface ID4LBridgeAdapter {
    /**
     * @dev Event emitted when a message is sent to another chain
     */
    event MessageSent(
        uint256 indexed destinationChainId,
        bytes32 indexed messageId,
        address sender,
        bytes message
    );

    /**
     * @dev Event emitted when a message is received from another chain
     */
    event MessageReceived(
        uint256 indexed sourceChainId,
        bytes32 indexed messageId,
        address sender,
        bytes message
    );

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
    ) external payable returns (bytes32 messageId);

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
    ) external returns (bool success);

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
    ) external view returns (uint256 fee);

    /**
     * @dev Gets the status of a message
     * @param messageId ID of the message
     * @return status 0 = unknown, 1 = pending, 2 = completed, 3 = failed
     */
    function getMessageStatus(bytes32 messageId) external view returns (uint8 status);

    /**
     * @dev Gets the chain ID that this adapter is connected to
     * @return chainId The chain ID
     */
    function getChainId() external view returns (uint256);

    /**
     * @dev Checks if this adapter supports a specific destination chain
     * @param chainId The chain ID to check
     * @return supported Whether the chain is supported
     */
    function supportsChain(uint256 chainId) external view returns (bool);

    /**
     * @dev Gets all chains supported by this adapter
     * @return chainIds Array of supported chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory);
}
