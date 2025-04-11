import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'
import { baseSepolia } from '@/utils/chains'

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.PROJECT_ID

if (!projectId) {
  console.warn('Reown Project ID is not defined. Please set NEXT_PUBLIC_REOWN_PROJECT_ID in your environment variables.')
}

// Create a custom networks array with our Base Sepolia configuration
// For now, we'll just use Base Sepolia for simplicity
export const networks = [{
  id: baseSepolia.id,
  name: baseSepolia.name,
  rpcUrls: {
    default: {
      http: [baseSepolia.rpcUrl],
      webSocket: baseSepolia.wsUrl ? [baseSepolia.wsUrl] : undefined
    }
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: baseSepolia.explorerUrl
    }
  },
  nativeCurrency: baseSepolia.nativeCurrency
}]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: false,
  projectId: projectId || 'development-project-id', // Fallback for development
  networks
})

export const config = wagmiAdapter.wagmiConfig
