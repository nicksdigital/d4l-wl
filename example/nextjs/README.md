# SoulStream Protocol Next.js Example

This is a simple Next.js application demonstrating how to integrate with the SoulStream Protocol.

## Features

- Connect wallet and display Soul Identity
- View reputation scores and tiers
- Claim rewards from reward programs
- Visualize reputation history
- Manage Soul Identity authorizations
- Cross-chain reputation and rewards transfers

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your configuration:
   ```
   NEXT_PUBLIC_CHAIN_ID=31337
   NEXT_PUBLIC_RPC_URL=http://localhost:8545
   NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_REPUTATION_ASSET_ADDRESS=0x...
   NEXT_PUBLIC_REWARDS_ASSET_ADDRESS=0x...
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing Cross-Chain Features

### Local Testing with Hardhat

1. Start multiple Hardhat networks on different ports:
   ```bash
   # Terminal 1 - Chain A (Ethereum)
   npx hardhat node --port 8545

   # Terminal 2 - Chain B (Polygon)
   npx hardhat node --port 8546
   ```

2. Deploy the SoulStream contracts on both chains:
   ```bash
   # Deploy to Chain A
   npx hardhat run scripts/deploy-crosschain.js --network chainA

   # Deploy to Chain B
   npx hardhat run scripts/deploy-crosschain.js --network chainB
   ```

3. Configure the `.env.local` file with both chain configurations:
   ```
   # Chain A (Ethereum)
   NEXT_PUBLIC_CHAIN_A_ID=31337
   NEXT_PUBLIC_CHAIN_A_RPC_URL=http://localhost:8545
   NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS=0x...

   # Chain B (Polygon)
   NEXT_PUBLIC_CHAIN_B_ID=31338
   NEXT_PUBLIC_CHAIN_B_RPC_URL=http://localhost:8546
   NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS=0x...
   ```

4. Run the cross-chain testing script:
   ```bash
   npm run test:crosschain
   ```

### Testing with Public Testnets

1. Configure the `.env.local` file with testnet configurations:
   ```
   # Goerli (Ethereum Testnet)
   NEXT_PUBLIC_CHAIN_A_ID=5
   NEXT_PUBLIC_CHAIN_A_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS=0x...

   # Mumbai (Polygon Testnet)
   NEXT_PUBLIC_CHAIN_B_ID=80001
   NEXT_PUBLIC_CHAIN_B_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS=0x...
   ```

2. Run the application with testnet support:
   ```bash
   npm run dev:testnet
   ```

3. Use the cross-chain UI to test reputation and rewards transfers between testnets

## Project Structure

- `pages/` - Next.js pages
- `components/` - React components
- `hooks/` - Custom React hooks
- `contexts/` - React context providers
- `utils/` - Utility functions
- `constants/` - Constants and ABIs
- `styles/` - CSS styles
- `public/` - Static assets

## Technologies Used

- Next.js 15
- ethers.js
- Tailwind CSS
- React Query
- SWR
