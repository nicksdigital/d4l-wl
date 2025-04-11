"use client";

import { ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/config";
import { baseSepolia as baseSepoliaNetwork } from "@reown/appkit/networks";
import { baseSepolia } from "@/utils/chains";
import { WagmiProvider, type Config } from "wagmi";

// Set up queryClient with default options that won't cause hydration issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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

// ClientOnly wrapper component to prevent hydration issues
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return null on first render to avoid SSR hydration issues
  return mounted ? <>{children}</> : null;
}

// Create a client component to prevent hydration issues
export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  // Using double-layered approach to prevent state updates during hydration
  // This completely eliminates the "Cannot update component while rendering" error
  return (
    <ClientOnly>
      <WagmiProviderWrapper>
        {children}
      </WagmiProviderWrapper>
    </ClientOnly>
  );
}

// Separate component for WagmiProvider to avoid state updates during initial render
function WagmiProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
