# Cross-Chain Testing Guide for SoulStream Protocol

This guide provides step-by-step instructions for setting up and testing the cross-chain functionality of the SoulStream Protocol.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

## Quick Start

The easiest way to set up the cross-chain testing environment is to use the provided setup script:

```bash
# For macOS/Linux
npm run setup:crosschain

# For Windows
npm run setup:crosschain:win
```

This script will:
1. Start two Hardhat networks on different ports
2. Deploy the SoulStream contracts to both networks
3. Configure the bridge adapters to point to each other
4. Create a `.env.local` file with the correct configuration

Once the setup is complete, you can start the Next.js application:

```bash
npm run dev
```

Then navigate to http://localhost:3000/crosschain to test the cross-chain functionality.

## Manual Setup

If you prefer to set up the environment manually, follow these steps:

### 1. Start Hardhat Networks

Start two Hardhat networks on different ports:

```bash
# Terminal 1 - Chain A (Ethereum)
cd ../../solidity
npx hardhat node --port 8545

# Terminal 2 - Chain B (Polygon)
cd ../../solidity
npx hardhat node --port 8546
```

### 2. Update Hardhat Config

Add the following network configurations to `solidity/hardhat.config.js`:

```javascript
networks: {
  hardhat: {
    chainId: 31337,
  },
  chainA: {
    url: "http://localhost:8545",
    chainId: 31337
  },
  chainB: {
    url: "http://localhost:8546",
    chainId: 31338
  }
},
```

### 3. Deploy Contracts

Deploy the SoulStream contracts to both networks:

```bash
# Deploy to Chain A
cd ../../solidity
npx hardhat run scripts/deploy-crosschain.js --network chainA

# Deploy to Chain B
npx hardhat run scripts/deploy-crosschain.js --network chainB
```

### 4. Configure Bridge Adapters

Create a `configure-bridge.js` script in the `solidity/scripts` directory:

```javascript
// configure-bridge.js
const { ethers } = require("hardhat");

async function main() {
  // Get command line arguments
  const destinationChainId = process.argv.find(arg => arg.startsWith('--destination-chain-id'))?.split('=')[1] ||
                            process.argv[process.argv.indexOf('--destination-chain-id') + 1];

  const destinationRegistry = process.argv.find(arg => arg.startsWith('--destination-registry'))?.split('=')[1] ||
                             process.argv[process.argv.indexOf('--destination-registry') + 1];

  if (!destinationChainId || !destinationRegistry) {
    console.error("Missing required arguments. Usage: npx hardhat run scripts/configure-bridge.js --network <network> --destination-chain-id <chainId> --destination-registry <address>");
    process.exit(1);
  }

  // Get the bridge adapter address
  const bridgeAdapterAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get the bridge adapter contract
  const bridgeAdapter = await ethers.getContractAt(
    "D4LSoulStreamBridgeAdapter",
    bridgeAdapterAddress
  );

  // Set destination chain ID
  await bridgeAdapter.setDestinationChainId(destinationChainId);

  // Set destination registry
  await bridgeAdapter.setDestinationRegistry(destinationRegistry);

  console.log("Bridge adapter configured successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Then run the script for both chains:

```bash
# Configure Chain A bridge adapter
npx hardhat run scripts/configure-bridge.js --network chainA --destination-chain-id 31338 --destination-registry 0x5FbDB2315678afecb367f032d93F642f64180aa3

# Configure Chain B bridge adapter
npx hardhat run scripts/configure-bridge.js --network chainB --destination-chain-id 31337 --destination-registry 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 5. Create .env.local File

Create a `.env.local` file in the `example/nextjs` directory:

```
# Chain A (Ethereum)
NEXT_PUBLIC_CHAIN_A_ID=31337
NEXT_PUBLIC_CHAIN_A_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Chain B (Polygon)
NEXT_PUBLIC_CHAIN_B_ID=31338
NEXT_PUBLIC_CHAIN_B_RPC_URL=http://localhost:8546
NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# For script testing
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 6. Start the Next.js Application

```bash
cd example/nextjs
npm run dev
```

## Testing Cross-Chain Functionality

### UI Testing

1. Navigate to http://localhost:3000/crosschain
2. Connect your wallet (MetaMask)
3. Create Soul Identities on both chains
4. Transfer reputation or rewards between chains
5. Verify that the assets are transferred correctly

### Automated Testing

Run the automated cross-chain test:

```bash
npm run test:crosschain
```

This script will:
1. Connect to both chains
2. Create Soul Identities if they don't exist
3. Mint reputation on Chain A
4. Initiate a cross-chain transfer
5. Simulate the message relay
6. Verify the reputation on Chain B

### DNS Propagation-like Monitoring

For a more realistic testing approach, you can use the DNS propagation-like monitoring script:

```bash
npm run monitor:crosschain
```

This script simulates how cross-chain messages propagate in real-world scenarios:

1. Initiates a cross-chain transfer on the source chain
2. Polls the destination chain at regular intervals to check if the message has been received
3. Monitors multiple indicators of message propagation:
   - Event listeners for MessageReceived events
   - Message status checks
   - Pending message count changes
   - Balance changes on the destination chain
4. Times out after a configurable period if the message hasn't propagated
5. Simulates message relay if propagation times out (for testing purposes)
6. Verifies the final state on both chains

This approach more accurately reflects the asynchronous nature of cross-chain communication, where messages can take minutes or hours to propagate between chains.

### On-Chain DNS-like Propagation

For the most realistic testing approach, you can use the on-chain DNS-like propagation system:

```bash
# Deploy the on-chain propagation contracts to Chain A
npx hardhat run scripts/deploy-on-chain-propagation.js --network chainA

# Deploy the on-chain propagation contracts to Chain B
npx hardhat run scripts/deploy-on-chain-propagation.js --network chainB

# Start the relayer service
npm run relayer:start
```

This approach implements a true on-chain DNS-like propagation system:

1. **On-Chain Message Registry**: Deploys a `D4LMessagePropagationRegistry` contract on each chain that tracks the status of cross-chain messages, similar to how DNS records are stored across DNS servers.

2. **Bridge Adapter with Registry Integration**: Deploys a `D4LOnChainPropagationBridgeAdapter` contract that integrates with the registry to track message propagation.

3. **Relayer Service**: Runs a relayer service that monitors the registries on both chains for pending messages and relays them to the destination chain.

4. **Message Status Tracking**: Messages go through multiple states (PENDING, PROCESSING, COMPLETED, FAILED) as they propagate through the system, similar to how DNS records propagate.

5. **Retry Mechanism**: The relayer includes a retry mechanism for failed message deliveries, ensuring reliable message propagation.

This approach provides the most accurate simulation of real-world cross-chain communication, where messages are tracked on-chain and relayed by dedicated services.

## Testing with Public Testnets

To test with public testnets (Goerli and Mumbai), update your `.env.local` file:

```
# Chain A (Goerli)
NEXT_PUBLIC_CHAIN_A_ID=5
NEXT_PUBLIC_CHAIN_A_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS=0x...

# Chain B (Mumbai)
NEXT_PUBLIC_CHAIN_B_ID=80001
NEXT_PUBLIC_CHAIN_B_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS=0x...
```

Then start the application with testnet support:

```bash
npm run dev:testnet
```

## Troubleshooting

### Common Issues

1. **MetaMask Network Configuration**
   - Make sure you've added both networks to MetaMask
   - For local networks, use the following configuration:
     - Chain A: RPC URL = http://localhost:8545, Chain ID = 31337
     - Chain B: RPC URL = http://localhost:8546, Chain ID = 31338

2. **Contract Deployment Failures**
   - Check that the Hardhat networks are running
   - Verify that the network configurations in hardhat.config.js are correct

3. **Bridge Adapter Configuration**
   - Ensure that the bridge adapters are correctly configured with the right destination chain IDs and registry addresses
   - Check that the bridge adapter addresses in the .env.local file are correct

4. **Cross-Chain Transfer Failures**
   - Verify that you have Soul Identities on both chains
   - Check that you have sufficient assets on the source chain
   - Ensure that the bridge adapters are correctly configured

### Logs and Debugging

To view detailed logs:

1. Check the Hardhat network logs in the terminal
2. Check the browser console for frontend errors
3. Enable verbose logging in the bridge adapter contract

## Advanced Configuration

### Custom Chain IDs

To use custom chain IDs, update the following files:

1. `scripts/setup-crosschain-env.js`
2. `hardhat.config.js`
3. `.env.local`

### Custom Contract Addresses

If your contracts are deployed at different addresses, update the following files:

1. `scripts/configure-bridge.js`
2. `.env.local`

### Custom Bridge Implementation

To use a different bridge implementation (e.g., LayerZero, Axelar), update the following files:

1. `contexts/CrossChainContext.js`
2. `scripts/configure-bridge.js`
3. The bridge adapter contract in the Solidity code

## Additional Resources

- [SoulStream Protocol Documentation](../../docs/SoulStreamProtocol.md)
- [Cross-Chain Testing Documentation](../../docs/CrossChainTesting.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/getting-started)
- [MetaMask Documentation](https://docs.metamask.io)
