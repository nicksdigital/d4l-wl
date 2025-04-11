"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { baseSepolia } from "@/utils/chains";
import { formatAddress } from "@/utils/contractUtils";
import { useAppKit } from "@reown/appkit/react";
import NetworkSwitcher from "./NetworkSwitcher";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <button 
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
          onClick={() => {
            // Open the Reown AppKit modal
            open();
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // If connected, show network switcher if needed
  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <NetworkSwitcher />
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            onClick={toggleDropdown}
          >
            <span className="font-medium">{formatAddress(address || "")}</span>
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
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    disconnect();
                    closeDropdown();
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If not connected, show connect button
  return (
    <button 
      className="btn bg-primary-600 hover:bg-primary-700 text-white"
      onClick={() => {
        // Open the Reown AppKit modal
        open();
      }}
    >
      Connect Wallet
    </button>
  );
}
