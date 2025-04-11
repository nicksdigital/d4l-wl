"use client";

import { ReactNode } from "react";
import { AppKitProvider } from "./AppKitProvider";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: ReactNode;
  cookies?: string | null;
}

export function Providers({ children, cookies }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppKitProvider cookies={cookies}>
        {children}
      </AppKitProvider>
    </SessionProvider>
  );
}
