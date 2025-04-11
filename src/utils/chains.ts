// Define Base Sepolia chain configuration
export const baseSepolia = {
  id: 84532,
  name: "Base Sepolia",
  // Use public RPC URLs for client-side code
  rpcUrl: "https://sepolia.base.org",
  wsUrl: undefined,
  explorerUrl: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  }
};

// Define Base Mainnet chain configuration
export const baseMainnet = {
  id: 8453,
  name: "Base",
  rpcUrl: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
  explorerUrl: "https://basescan.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  }
};
