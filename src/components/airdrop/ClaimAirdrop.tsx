"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useMerkleDistributor } from "@/hooks/useMerkleDistributor";

// Mock signature for testing
// In a real application, this would be generated by the backend
const MOCK_SIGNATURE = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";

export default function ClaimAirdrop() {
  const { address, isConnected } = useAccount();
  const { isClaimed, isLoading, airdropInfo, profileId, isRegistered, claimAirdrop, checkIfClaimed } = useMerkleDistributor();
  const [claimStatus, setClaimStatus] = useState<"unclaimed" | "claimed" | "claiming" | "unregistered">("unclaimed");
  const [error, setError] = useState<string | null>(null);

  // Check claim status when component mounts or address changes
  useEffect(() => {
    if (isConnected && address) {
      if (!isRegistered) {
        setClaimStatus("unregistered");
      } else {
        updateClaimStatus();
      }
    }
  }, [isConnected, address, isRegistered]);

  // Update claim status based on contract data
  useEffect(() => {
    if (!isRegistered && isConnected && address) {
      setClaimStatus("unregistered");
    } else if (isClaimed) {
      setClaimStatus("claimed");
    } else if (isConnected && address) {
      setClaimStatus("unclaimed");
    }
  }, [isClaimed, isConnected, address, isRegistered]);

  // Update loading state
  useEffect(() => {
    if (isLoading) {
      setClaimStatus("claiming");
    }
  }, [isLoading]);

  // Update claim status from contract
  const updateClaimStatus = async () => {
    try {
      const claimed = await checkIfClaimed();
      setClaimStatus(claimed ? "claimed" : "unclaimed");
      setError(null);
    } catch (err) {
      console.error("Error checking claim status:", err);
      setError("Error checking claim status");
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !address || isLoading || claimStatus === "claimed" || profileId === "0") return;
    
    // Check if user is registered
    if (!isRegistered) {
      setError("You must register before claiming rewards");
      setClaimStatus("unregistered");
      return;
    }

    setClaimStatus("claiming");
    setError(null);
    
    try {
      // In a real application, you would fetch the signature from your backend
      // based on the user's address and eligibility
      await claimAirdrop(MOCK_SIGNATURE);
      
      // Check if claim was successful
      await updateClaimStatus();
    } catch (error) {
      console.error("Error claiming airdrop:", error);
      setError("Error claiming tokens");
      setClaimStatus("unclaimed");
    }
  };

  // Calculate total amount
  const getTotalAmount = () => {
    if (!airdropInfo) return "0";
    
    const baseAmount = parseFloat(airdropInfo.baseAmount) || 0;
    const bonusAmount = parseFloat(airdropInfo.bonusAmount) || 0;
    const total = (baseAmount + bonusAmount) / 10**18; // Convert from wei to tokens
    
    return total.toString();
  };

  if (!isConnected) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">D4L Airdrop</h2>
        <p className="text-gray-600 mb-4">Connect your wallet to check eligibility and claim your D4L tokens.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">D4L Airdrop</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {claimStatus === "claimed" ? (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-700">
            You have successfully claimed your D4L tokens! Check your wallet balance.
          </p>
        </div>
      ) : claimStatus === "unregistered" ? (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <p className="text-yellow-700 font-medium mb-2">
            Registration Required
          </p>
          <p className="text-yellow-600 mb-2">
            You need to register first to be eligible for the airdrop and access your profile.
          </p>
          <a 
            href="/register" 
            className="inline-block mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Register Now
          </a>
        </div>
      ) : profileId !== "0" && airdropInfo ? (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-blue-700 mb-2">
            You are eligible to claim D4L tokens.
          </p>
          <p className="text-sm text-blue-600">Base Amount: {parseFloat(airdropInfo.baseAmount) / 10**18} D4L</p>
          <p className="text-sm text-blue-600">Bonus Amount: {parseFloat(airdropInfo.bonusAmount) / 10**18} D4L</p>
          <p className="font-semibold text-blue-800">Total Amount: {getTotalAmount()} D4L</p>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <p className="text-yellow-700">
            You need to register first to be eligible for the airdrop.
          </p>
        </div>
      )}
      
      <button
        onClick={handleClaim}
        disabled={isLoading || claimStatus === "claimed" || claimStatus === "claiming" || profileId === "0" || claimStatus === "unregistered"}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          claimStatus === "claimed"
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : claimStatus === "claiming" || isLoading
            ? "bg-indigo-300 text-white cursor-wait"
            : claimStatus === "unregistered"
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : profileId === "0"
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {claimStatus === "claimed"
          ? "Already Claimed"
          : claimStatus === "claiming" || isLoading
          ? "Claiming..."
          : claimStatus === "unregistered"
          ? "Registration Required"
          : profileId === "0"
          ? "Not Eligible"
          : "Claim D4L Tokens"}
      </button>
      
      <button
        onClick={updateClaimStatus}
        className="mt-2 w-full py-2 px-4 bg-gray-200 rounded-md font-medium hover:bg-gray-300"
      >
        Refresh Status
      </button>
      
      <p className="mt-4 text-sm text-gray-500">
        Note: You will need to approve the transaction in your wallet to complete the claim.
      </p>
    </div>
  );
}
