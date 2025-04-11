"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/config";
import { baseSepolia as baseSepoliaNetwork } from "@reown/appkit/networks";
import { baseSepolia } from "@/utils/chains";
import { WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "D4L Airdrop",
  description: "Register and claim your D4L tokens",
  url: "https://d4l-airdrop.com", // Use a fixed URL to avoid hydration mismatch
  icons: ["/logo.png"]
};

// Create a custom Base Sepolia network configuration that matches our chain ID
const customBaseSepolia = {
  ...baseSepoliaNetwork,
  id: baseSepolia.id, // Use our chain ID (84532)
  rpcUrls: {
    default: {
      http: [baseSepolia.rpcUrl],
      webSocket: baseSepolia.wsUrl ? [baseSepolia.wsUrl] : undefined
    },
    public: {
      http: [baseSepolia.rpcUrl],
      webSocket: baseSepolia.wsUrl ? [baseSepolia.wsUrl] : undefined
    }
  }
};

// Create the modal and export it for use in components
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || "development-project-id",
  networks: [customBaseSepolia], // Use our custom Base Sepolia configuration
  defaultNetwork: customBaseSepolia,
  metadata,
  features: {
    analytics: true
  }
});

interface AppKitProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  // Since we've set ssr: false in the wagmiAdapter config, we don't need to parse cookies
  // Just render the providers without initialState
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
