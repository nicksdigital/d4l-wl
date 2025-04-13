"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function MobileNavBar() {
  const pathname = usePathname();
  const [isAirdropOpen, setIsAirdropOpen] = useState(false);

  // Navigation items with icons
  const navItems = [
    {
      title: "Home",
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      title: "Register",
      path: "/register",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: "Token",
      path: "/token",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Airdrop",
      path: "#",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      dropdown: [
        {
          title: "Profile",
          path: "/profile",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          title: "Claim",
          path: "/claim",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: "Rewards",
          path: "/rewards",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    },
    {
      title: "Launch Token",
      path: "/launch-token",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Fixed bottom navigation bar for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-white/10 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <div key={item.title} className="relative">
              {item.dropdown ? (
                <button
                  onClick={() => setIsAirdropOpen(!isAirdropOpen)}
                  className={`flex flex-col items-center justify-center py-3 px-2 ${
                    isAirdropOpen
                      ? "text-primary-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="inline-block">{item.icon}</span>
                  <span className="text-xs mt-1">{item.title}</span>
                  {isAirdropOpen && (
                    <span className="absolute -top-1 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={`flex flex-col items-center justify-center py-3 px-2 ${
                    pathname === item.path
                      ? "text-primary-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="inline-block">{item.icon}</span>
                  <span className="text-xs mt-1">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Dropdown for Airdrop */}
        {isAirdropOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-gray-800/95 backdrop-blur-md rounded-lg border border-white/10 shadow-lg overflow-hidden">
            <div className="p-2">
              {navItems
                .find(item => item.title === "Airdrop")
                ?.dropdown?.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.path}
                    href={dropdownItem.path}
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      pathname === dropdownItem.path
                        ? "bg-primary-900/30 text-primary-400"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`}
                    onClick={() => setIsAirdropOpen(false)}
                  >
                    <span className="mr-3">{dropdownItem.icon}</span>
                    {dropdownItem.title}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add padding to the bottom of the page to prevent content from being hidden behind the navbar */}
      <div className="md:hidden h-20"></div>
    </>
  );
}
