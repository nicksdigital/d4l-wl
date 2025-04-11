"use client";

import { useAccount } from "wagmi";
import TokenBalance from "@/components/wallet/TokenBalance";
import AirdropClaimWithFallback from "@/components/airdrop/AirdropClaimWithFallback";
import AirdropStatus from "@/components/airdrop/AirdropStatus";
import WalletButton from "@/components/wallet/WalletButton";

export default function AirdropPage() {
  const { isConnected } = useAccount();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">D4L Token Airdrop</h1>
        <p className="text-lg">
          Connect your wallet to check eligibility and claim your D4L tokens.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Wallet Connection</h2>
          <WalletButton />
        </div>
        
        {isConnected && <TokenBalance />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <AirdropStatus />
        <AirdropClaimWithFallback />
      </div>
      
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-4">About D4L Token</h2>
        <p className="mb-4">
          D4L is a community-driven token on Base that rewards early adopters and active community members.
          This airdrop is designed to distribute tokens to eligible community members who have supported the project.
        </p>
        <p className="mb-4">
          The airdrop is conducted using a Merkle tree to efficiently verify eligibility while maintaining privacy.
          Each eligible address can claim a specific amount of tokens based on their contribution to the ecosystem.
        </p>
        <div className="p-4 bg-blue-900/30 rounded-lg mt-4">
          <h3 className="font-semibold mb-2">Fallback System</h3>
          <p className="text-sm">
            Our airdrop system includes a fallback mechanism that stores your claim in a database if the blockchain transaction fails.
            Admin will periodically process these pending claims and sync them to the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
