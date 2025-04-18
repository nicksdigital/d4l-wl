"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { baseSepolia } from "@/utils/chains";
import { formatAddress } from "@/utils/contractUtils";
import { useAppKit } from "@reown/appkit/react";
import NetworkSwitcher from "./NetworkSwitcher";
import useAuth from "@/hooks/useAuth";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticating, isAuthenticated, login, logout, authError } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Get the modal from Reown AppKit
  const { open } = useAppKit();

  // Attempt authentication when wallet is connected
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      // Attempt to authenticate
      login().catch((error) => {
        console.error("Authentication failed:", error);
        setShowAuthError(true);
        
        // Hide error after 5 seconds
        setTimeout(() => {
          setShowAuthError(false);
        }, 5000);
      });
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating, login]);

  // Handle connect wallet
  const handleConnectWallet = async () => {
    open();
  };

  // Handle disconnect wallet
  const handleDisconnectWallet = async () => {
    await logout();
    closeDropdown();
  };

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <button 
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // If connected, show network switcher if needed
  if (isConnected) {
    return (
      <>
        {showAuthError && authError && (
          <div className="fixed top-20 right-4 bg-red-500 text-white p-2 rounded shadow-lg z-50">
            {authError}
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          {isAuthenticating && (
            <div className="text-xs text-yellow-400">Authenticating...</div>
          )}
          
          <NetworkSwitcher />
          <div className="relative">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 ${
                isAuthenticated 
                  ? "bg-green-50 text-green-700 hover:bg-green-100" 
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}
              onClick={toggleDropdown}
            >
              <span className="font-medium">{formatAddress(address || "")}</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10">
                <div className="py-2">
                  <a
                    href={`https://sepolia.basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeDropdown}
                  >
                    View on Explorer
                  </a>
                  {!isAuthenticated && (
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      onClick={() => {
                        login();
                        closeDropdown();
                      }}
                      disabled={isAuthenticating}
                    >
                      {isAuthenticating ? "Authenticating..." : "Authenticate"}
                    </button>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleDisconnectWallet}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // If not connected, show connect button
  return (
    <button 
      className="btn bg-primary-600 hover:bg-primary-700 text-white"
      onClick={handleConnectWallet}
    >
      Connect Wallet
    </button>
  );
}
