import { ethers } from 'ethers';

// Cache provider instances to avoid creating new ones for each request
const providerCache: Record<string, ethers.Provider> = {};

/**
 * Get an Ethereum provider for the specified network
 * @param network Optional network name (default: 'base-sepolia')
 * @returns An ethers Provider instance
 */
export function getProvider(network: string = 'base-sepolia'): ethers.Provider {
  // Return cached provider if available
  if (providerCache[network]) {
    return providerCache[network];
  }

  let provider: ethers.Provider;

  // Create provider based on network
  switch (network) {
    case 'base-mainnet':
      provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      break;
    case 'base-sepolia':
      provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
      );
      break;
    case 'ethereum':
      provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
      );
      break;
    case 'optimism':
      provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io'
      );
      break;
    default:
      // Default to Base Sepolia
      provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
      );
  }

  // Cache the provider
  providerCache[network] = provider;

  return provider;
}

/**
 * Get a wallet signer for backend operations
 * @param network Optional network name (default: 'base-sepolia')
 * @returns An ethers Wallet instance
 */
export function getBackendSigner(network: string = 'base-sepolia'): ethers.Wallet {
  const provider = getProvider(network);
  
  // Use the private key from environment variables
  const privateKey = process.env.BACKEND_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('Backend private key not configured');
  }
  
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Create a message hash for signing
 * @param message The message to hash
 * @returns The hashed message
 */
export function createMessageHash(message: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(message));
}

/**
 * Verify a signature
 * @param message The original message
 * @param signature The signature to verify
 * @param expectedSigner The address that should have signed the message
 * @returns True if the signature is valid, false otherwise
 */
export function verifySignature(
  message: string,
  signature: string,
  expectedSigner: string
): boolean {
  try {
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    const messageHashBytes = ethers.getBytes(messageHash);
    const recoveredAddress = ethers.recoverAddress(
      ethers.hashMessage(messageHashBytes),
      signature
    );
    
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
