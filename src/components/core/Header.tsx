"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import WalletButton from "@/components/wallet/WalletButton";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Navigation links
  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Register", path: "/register" },
    { title: "Token", path: "/token" },
    { title: "Profile", path: "/profile" },
    { title: "Claim", path: "/claim" },
    { title: "Rewards", path: "/rewards" },
    { title: "Whitepaper", path: "/whitepaper" },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-md" 
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 mr-3">
                <Image 
                  src="/logo.png" 
                  alt="D4L Logo" 
                  fill
                  sizes="(max-width: 768px) 100vw, 40px"
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                D4L
              </span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  pathname === link.path
                    ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>
          
          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletButton />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col space-y-1 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    pathname === link.path
                      ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
