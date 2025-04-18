# Testing Cross-Chain Features in SoulStream Protocol

This document provides detailed instructions for testing the cross-chain capabilities of the SoulStream Protocol.

## Overview

The SoulStream Protocol supports cross-chain operations, allowing reputation scores and rewards to be transferred between different blockchain networks. This enables users to maintain a consistent identity and reputation across multiple chains.

## Testing Approaches

There are several approaches to testing cross-chain functionality:

1. **Local Testing with Multiple Hardhat Networks**
2. **Testing with Public Testnets**
3. **Testing with Simulated Message Passing**
4. **Testing with Real Bridge Infrastructure**

## 1. Local Testing with Multiple Hardhat Networks

### Setup

1. Start multiple Hardhat networks on different ports:

```bash
# Terminal 1 - Chain A (Ethereum)
npx hardhat node --port 8545

# Terminal 2 - Chain B (Polygon)
npx hardhat node --port 8546
```

2. Configure Hardhat networks in `hardhat.config.js`:

```javascript
module.exports = {
  networks: {
    chainA: {
      url: "http://localhost:8545",
      chainId: 31337
    },
    chainB: {
      url: "http://localhost:8546",
      chainId: 31338
    }
  }
};
```

3. Deploy the SoulStream contracts on both chains:

```bash
# Deploy to Chain A
npx hardhat run scripts/deploy-crosschain.js --network chainA

# Deploy to Chain B
npx hardhat run scripts/deploy-crosschain.js --network chainB
```

4. Configure the bridge adapters to point to each other:

```bash
# Set Chain A bridge adapter to point to Chain B
npx hardhat run scripts/configure-bridge.js --network chainA

# Set Chain B bridge adapter to point to Chain A
npx hardhat run scripts/configure-bridge.js --network chainB
```

### Testing

1. Create Soul Identities on both chains:

```bash
npx hardhat run scripts/create-soul-identities.js --network chainA
npx hardhat run scripts/create-soul-identities.js --network chainB
```

2. Mint reputation and rewards on Chain A:

```bash
npx hardhat run scripts/mint-assets.js --network chainA
```

3. Transfer assets cross-chain:

```bash
npx hardhat run scripts/transfer-cross-chain.js --network chainA
```

4. Simulate message relay:

```bash
npx hardhat run scripts/relay-messages.js
```

5. Verify assets on Chain B:

```bash
npx hardhat run scripts/verify-assets.js --network chainB
```

## 2. Testing with Public Testnets

### Setup

1. Configure environment variables for testnet connections:

```
# Goerli (Ethereum Testnet)
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
GOERLI_PRIVATE_KEY=your_private_key
GOERLI_REGISTRY_ADDRESS=0x...
GOERLI_BRIDGE_ADAPTER_ADDRESS=0x...

# Mumbai (Polygon Testnet)
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_PRIVATE_KEY=your_private_key
MUMBAI_REGISTRY_ADDRESS=0x...
MUMBAI_BRIDGE_ADAPTER_ADDRESS=0x...
```

2. Deploy the SoulStream contracts on both testnets:

```bash
# Deploy to Goerli
npx hardhat run scripts/deploy-crosschain.js --network goerli

# Deploy to Mumbai
npx hardhat run scripts/deploy-crosschain.js --network mumbai
```

3. Configure the bridge adapters to point to each other:

```bash
# Set Goerli bridge adapter to point to Mumbai
npx hardhat run scripts/configure-bridge.js --network goerli

# Set Mumbai bridge adapter to point to Goerli
npx hardhat run scripts/configure-bridge.js --network mumbai
```

### Testing

1. Create Soul Identities on both testnets:

```bash
npx hardhat run scripts/create-soul-identities.js --network goerli
npx hardhat run scripts/create-soul-identities.js --network mumbai
```

2. Mint reputation and rewards on Goerli:

```bash
npx hardhat run scripts/mint-assets.js --network goerli
```

3. Transfer assets cross-chain:

```bash
npx hardhat run scripts/transfer-cross-chain.js --network goerli
```

4. Wait for the message to be relayed by the bridge infrastructure (this may take some time).

5. Verify assets on Mumbai:

```bash
npx hardhat run scripts/verify-assets.js --network mumbai
```

## 3. Testing with Simulated Message Passing

For development and testing purposes, we can simulate the message passing between chains:

```javascript
// In test-crosschain.js

// Initiate cross-chain transfer on Chain A
const tx = await bridgeAdapterA.routeReputationCrossChain(
  soulIdA,
  soulIdB,
  transferAmount,
  networkB.chainId,
  { value: ethers.parseEther("0.01") }
);
await tx.wait();

// Extract the message from the event
const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === 'MessageSent');
const messageId = event.args.messageId;
const fromSoul = event.args.fromSoul;
const toSoul = event.args.toSoul;
const asset = event.args.asset;
const amount = event.args.amount;

// Simulate message relay by directly calling the receive function on Chain B
await bridgeAdapterB.receiveMessage(
  messageId,
  fromSoul,
  toSoul,
  asset,
  amount,
  '0x'
);
```

## 4. Testing with Real Bridge Infrastructure

For production testing, you can integrate with real cross-chain messaging protocols:

### LayerZero Integration

1. Deploy LayerZero endpoints on both chains.

2. Modify the bridge adapter to use LayerZero for message passing:

```solidity
// In D4LSoulStreamBridgeAdapter.sol

ILayerZeroEndpoint public lzEndpoint;

function routeReputationCrossChain(
    address fromSoul,
    address toSoul,
    uint256 amount,
    uint256 destinationChainId
) external payable returns (bytes32) {
    // Lock the reputation on source chain
    reputationAsset.lockForCrossChain(fromSoul, amount);
    
    // Prepare the payload
    bytes memory payload = abi.encode(
        fromSoul,
        toSoul,
        reputationAssetAddress,
        amount
    );
    
    // Send cross-chain message
    lzEndpoint.send{value: msg.value}(
        destinationChainId,
        abi.encodePacked(remoteAddress, address(this)),
        payload,
        payable(msg.sender),
        address(0),
        bytes("")
    );
    
    // Return message ID
    return keccak256(payload);
}
```

3. Implement the message receiver on the destination chain:

```solidity
// In D4LSoulStreamBridgeAdapter.sol

function lzReceive(
    uint16 _srcChainId,
    bytes memory _srcAddress,
    uint64 _nonce,
    bytes memory _payload
) external {
    // Verify sender
    require(msg.sender == address(lzEndpoint), "Invalid endpoint caller");
    
    // Decode the payload
    (address fromSoul, address toSoul, address asset, uint256 amount) = 
        abi.decode(_payload, (address, address, address, uint256));
    
    // Process the message
    _processIncomingMessage(
        keccak256(_payload),
        fromSoul,
        toSoul,
        asset,
        amount,
        bytes("")
    );
}
```

### Axelar Integration

1. Deploy Axelar gateway contracts on both chains.

2. Modify the bridge adapter to use Axelar for message passing:

```solidity
// In D4LSoulStreamBridgeAdapter.sol

IAxelarGateway public gateway;
IAxelarGasService public gasService;

function routeReputationCrossChain(
    address fromSoul,
    address toSoul,
    uint256 amount,
    string calldata destinationChain
) external payable returns (bytes32) {
    // Lock the reputation on source chain
    reputationAsset.lockForCrossChain(fromSoul, amount);
    
    // Prepare the payload
    bytes memory payload = abi.encode(
        fromSoul,
        toSoul,
        reputationAssetAddress,
        amount
    );
    
    // Pay for gas
    gasService.payNativeGasForContractCall{value: msg.value}(
        address(this),
        destinationChain,
        remoteAddress,
        payload,
        msg.sender
    );
    
    // Send cross-chain message
    gateway.callContract(
        destinationChain,
        remoteAddress,
        payload
    );
    
    // Return message ID
    return keccak256(payload);
}
```

## Automated Testing

For automated testing, you can use the provided test script:

```bash
npm run test:crosschain
```

This script:

1. Connects to both chains
2. Creates Soul Identities if they don't exist
3. Mints reputation on Chain A
4. Initiates a cross-chain transfer
5. Simulates the message relay
6. Verifies the reputation on Chain B

## UI Testing

The Next.js example application includes a Cross-Chain page that allows you to:

1. Connect to different chains
2. Create Soul Identities on each chain
3. View your reputation and rewards on each chain
4. Transfer reputation and rewards between chains

To test the UI:

1. Configure your `.env.local` file with the appropriate addresses
2. Run the application:

```bash
npm run dev
```

3. Navigate to the Cross-Chain page
4. Connect your wallet
5. Create Soul Identities on both chains
6. Transfer assets between chains

## Troubleshooting

### Common Issues

1. **Message Not Received**: Check that the bridge adapters are correctly configured with the right destination chain IDs and registry addresses.

2. **Gas Errors**: Ensure you're providing enough gas for the cross-chain message.

3. **Contract Mismatch**: Verify that the contract addresses match between chains.

4. **Network Configuration**: Double-check your network configurations in Hardhat and environment variables.

### Debugging

1. Enable verbose logging in the bridge adapter:

```solidity
event Debug(string message, bytes data);

function routeReputationCrossChain(...) {
    ...
    emit Debug("Sending message", payload);
    ...
}
```

2. Monitor events on both chains:

```javascript
// Listen for MessageSent events on Chain A
bridgeAdapterA.on("MessageSent", (messageId, destinationChainId, fromSoul, toSoul, asset, amount) => {
    console.log("Message sent:", {
        messageId,
        destinationChainId,
        fromSoul,
        toSoul,
        asset,
        amount
    });
});

// Listen for MessageReceived events on Chain B
bridgeAdapterB.on("MessageReceived", (messageId, sourceChainId, fromSoul, toSoul, asset, amount) => {
    console.log("Message received:", {
        messageId,
        sourceChainId,
        fromSoul,
        toSoul,
        asset,
        amount
    });
});
```

## Conclusion

Testing cross-chain functionality requires careful setup and coordination between multiple networks. By following the approaches outlined in this document, you can effectively test the SoulStream Protocol's cross-chain capabilities in various environments, from local development to production-ready testnets.
