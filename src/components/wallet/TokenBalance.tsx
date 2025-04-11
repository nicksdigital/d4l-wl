"use client";

import { useD4LToken } from "@/hooks/useD4LToken";
import { useAccount } from "wagmi";

export default function TokenBalance() {
  const { isConnected } = useAccount();
  const { balance, isLoading, refreshBalance } = useD4LToken();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">D4L Token Balance</h3>
        <button
          onClick={refreshBalance}
          className="text-sm text-primary-600 hover:text-primary-700"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{balance} D4L</p>
    </div>
  );
}
