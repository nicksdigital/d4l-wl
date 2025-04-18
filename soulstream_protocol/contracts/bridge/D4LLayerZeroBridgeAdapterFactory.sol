// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LLayerZeroBridgeAdapter.sol";

/**
 * @title D4LLayerZeroBridgeAdapterFactory
 * @dev Factory for deploying LayerZero Bridge Adapters
 */
contract D4LLayerZeroBridgeAdapterFactory is Ownable {
    // Events
    event BridgeAdapterDeployed(address indexed bridgeAdapter, address lzEndpoint);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys a bridge adapter
     * @param lzEndpoint The LayerZero endpoint address
     * @param router The router address
     * @param owner The owner of the bridge adapter
     * @return bridgeAdapterAddress The address of the deployed bridge adapter
     */
    function deployBridgeAdapter(
        address lzEndpoint,
        address router,
        address owner
    ) external onlyOwner returns (address bridgeAdapterAddress) {
        require(lzEndpoint != address(0), "D4LLayerZeroBridgeAdapterFactory: lzEndpoint cannot be zero address");
        require(router != address(0), "D4LLayerZeroBridgeAdapterFactory: router cannot be zero address");
        
        // Deploy the bridge adapter
        D4LLayerZeroBridgeAdapter adapter = new D4LLayerZeroBridgeAdapter(
            lzEndpoint,
            router,
            owner
        );
        
        emit BridgeAdapterDeployed(address(adapter), lzEndpoint);
        
        return address(adapter);
    }
}
