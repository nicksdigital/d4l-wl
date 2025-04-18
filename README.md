# D4L DeFi Platform

## Overview

This is a DeFi platform with the following features:
- Wallet connection
- Token creation
- User profile system
- Reward points for airdrop eligibility

## Project Structure

```
d4l-wl2/
├── abis/                 # JSON ABI files for contract interaction
├── contracts/            # Smart contract source code
│   ├── TokenFactory.sol  # Contract for creating new tokens
│   ├── TokenImplementation.sol  # Base token implementation
│   ├── RewardPoints.sol  # Contract for managing reward points
│   └── ...
├── public/               # Static assets
├── scripts/              # Deployment and testing scripts
├── src/                  # Frontend source code
│   ├── app/              # Next.js app directory
│   │   ├── create-token/ # Token creation page
│   │   ├── profile/      # User profile page
│   │   ├── rewards/      # Rewards page
│   │   └── ...
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── ...
└── test/                 # Contract test files
```

## Features

### 1. Wallet Connection
- Seamless wallet connection using Reown AppKit
- Network switching support
- Account information display

### 2. Token Creation
- Create ERC-20 tokens with custom parameters:
  - Name
  - Symbol
  - Description
  - Initial supply
  - Decimals
  - Token image
- Earn reward points for creating tokens

### 3. User Profile
- View wallet address and profile information
- Only visible when connected to a wallet
- Display token balance and other statistics

### 4. Rewards System
- Earn points through various activities
- Points increase airdrop allocation
- View total points and rewards in the Rewards page

## Getting Started

### Prerequisites
- Node.js (v16+)
- Yarn or npm
- MetaMask or other web3 wallet

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/d4l-wl2.git
cd d4l-wl2
```

2. Install dependencies:
```
yarn install
```

3. Set up environment variables:
```
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

### Running the Development Server

1. Start the local Hardhat node:
```
npx hardhat node
```

2. Deploy contracts to the local network:
```
npx hardhat run scripts/run-local.js --network localhost
```

3. Start the Next.js development server:
```
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```
npx hardhat test
```

## Smart Contracts

### TokenFactory
This contract allows users to create new ERC-20 tokens with customizable parameters. Each token is deployed as a proxy pointing to the implementation contract, allowing for future upgrades.

### TokenImplementation
The base ERC-20 implementation that all created tokens use. Includes standard ERC-20 functionality plus mint and burn capabilities.

### RewardPoints
Manages the reward points system for the platform. Users earn points by creating tokens and performing other actions, which increase their eligibility for the airdrop.

## Hardhat Configuration

The project uses Hardhat for local development and testing. The configuration is in `hardhat.config.js` and includes:
- Local network setup
- Compiler settings
- Test configuration

## Frontend

### Pages
- Home: Platform introduction and overview
- Create Token: Interface for creating new tokens
- Profile: User profile information (only visible when connected)
- Rewards: View and earn reward points (only visible when connected)
- Whitepaper: Platform documentation

### Components
- Header: Navigation and wallet connection
- WalletButton: Connect wallet button with dropdown
- TokenForm: Form for creating new tokens
- UserProfile: Profile information display

## Notes

- The profile and rewards pages are only visible when a wallet is connected
- Creating a token awards random points between 50-500
- All transactions are performed on the Hardhat network for local testing

## License

This project is licensed under the MIT License - see the LICENSE file for details.
