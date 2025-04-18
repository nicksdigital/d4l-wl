import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '../contexts/Web3Context';
import { useSoulStream } from '../contexts/SoulStreamContext';

const Navbar = () => {
  const router = useRouter();
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const { soulId } = useSoulStream();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/reputation', label: 'Reputation' },
    { href: '/rewards', label: 'Rewards' },
    { href: '/routes', label: 'Routes' },
    { href: '/crosschain', label: 'Cross-Chain' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">SoulStream</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === link.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {account ? (
              <div className="flex items-center space-x-4">
                {soulId && (
                  <div className="text-sm text-gray-600">
                    Soul ID: {formatAddress(soulId)}
                  </div>
                )}
                <div className="text-sm font-medium text-gray-700">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-outline text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary text-sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  router.pathname === link.href
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 py-2">
              {account ? (
                <div className="space-y-2">
                  {soulId && (
                    <div className="text-sm text-gray-600">
                      Soul ID: {formatAddress(soulId)}
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-700">
                    {formatAddress(account)}
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-outline text-sm w-full"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="btn btn-primary text-sm w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
