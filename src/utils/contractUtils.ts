/**
 * Utility functions for managing contract addresses and interactions
 */
import * as ethers from 'ethers';

export interface ContractAddresses {
  airdropController: string;
  soulboundProfile: string;
  wishlistRegistry: string;
  rewardRegistry: string;
  token: string;
}

interface NetworkConfig {
  [key: number]: {
    name: string;
    contractAddresses: ContractAddresses;
    explorerUrl: string;
    rpcUrl: string;
  };
}

// Network configurations with actual deployed addresses
export const NETWORK_CONFIG: NetworkConfig = {
  // Base Sepolia Testnet
  84531: {
    name: 'Base Sepolia',
    contractAddresses: {
      airdropController: process.env.NEXT_PUBLIC_AIRDROP_CONTROLLER_ADDRESS || '0xC669B4Cc448b8b53f5D5Bcd60198c9c7bf6f346c',
      soulboundProfile: process.env.NEXT_PUBLIC_SOULBOUND_PROFILE_ADDRESS || '0x80AF6A596Ab08AE6C7B2A7fC31d131cf97444Da9',
      wishlistRegistry: process.env.NEXT_PUBLIC_WISHLIST_REGISTRY_ADDRESS || '0x80E5B7b84Ef130908eD78E4EffB6A54De1EabBAf',
      rewardRegistry: process.env.NEXT_PUBLIC_REWARD_REGISTRY_ADDRESS || '0x3F84a5bD492841fa9c9aECFB751129F0f1b7059d',
      token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x4e569c16220c734484BE84430A995A33d3543e0d',
    },
    explorerUrl: 'https://sepolia.basescan.org',
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/FNDX9qdyF7dDyhaIwXF337H9GWnwKhV7',
  },
  
  // Localhost for development
  1337: {
    name: 'Localhost',
    contractAddresses: {
      airdropController: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      soulboundProfile: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      wishlistRegistry: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      rewardRegistry: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      token: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    },
    explorerUrl: 'http://localhost:8545',
    rpcUrl: 'http://localhost:8545',
  },
};

/**
 * Get contract addresses for a specific network
 * @param chainId The network chain ID
 * @returns Contract addresses for the specified network
 */
export const getContractAddresses = (chainId: number): ContractAddresses => {
  // Use the specified chain ID if available, otherwise fall back to Base Sepolia (84531)
  return NETWORK_CONFIG[chainId]?.contractAddresses || NETWORK_CONFIG[84531].contractAddresses;
};

/**
 * Get network name from chain ID
 * @param chainId The network chain ID
 * @returns Network name or 'Unknown Network'
 */
export const getNetworkName = (chainId: number): string => {
  return NETWORK_CONFIG[chainId]?.name || 'Unknown Network';
};

/**
 * Get block explorer URL for a specific network
 * @param chainId The network chain ID
 * @returns Block explorer URL
 */
export const getExplorerUrl = (chainId: number): string => {
  return NETWORK_CONFIG[chainId]?.explorerUrl || '';
};

/**
 * Get transaction URL in the block explorer
 * @param chainId The network chain ID
 * @param txHash Transaction hash
 * @returns Transaction URL
 */
export const getTxUrl = (chainId: number, txHash: string): string => {
  const explorerUrl = getExplorerUrl(chainId);
  return `${explorerUrl}/tx/${txHash}`;
};

/**
 * Get address URL in the block explorer
 * @param chainId The network chain ID
 * @param address Ethereum address
 * @returns Address URL
 */
export const getAddressUrl = (chainId: number, address: string): string => {
  const explorerUrl = getExplorerUrl(chainId);
  return `${explorerUrl}/address/${address}`;
};

/**
 * Format an address for display (0x1234...5678)
 * @param address Ethereum address
 * @returns Formatted address
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format an amount of Ether
 * @param amount Amount in wei
 * @param decimals Number of decimals
 * @returns Formatted amount
 */
export const formatAmount = (amount: string, decimals: number = 18): string => {
  if (!amount) return '0';
  
  try {
    const formattedAmount = ethers.formatUnits(amount, decimals);
    
    // If amount has more than 6 decimals, truncate it
    if (formattedAmount.includes('.')) {
      const [whole, fraction] = formattedAmount.split('.');
      if (fraction.length > 6) {
        return `${whole}.${fraction.substring(0, 6)}`;
      }
    }
    
    return formattedAmount;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
};

/**
 * Check if an address is valid
 * @param address Ethereum address
 * @returns True if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};