import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SoulStream Protocol</h3>
            <p className="text-gray-300 text-sm">
              A comprehensive framework for creating, managing, and routing non-transferable (soulbound) assets and identities on blockchain networks.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/reputation" className="text-gray-300 hover:text-white">
                  Reputation
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-gray-300 hover:text-white">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/routes" className="text-gray-300 hover:text-white">
                  Routes
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/example/soulstream-protocol" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href="https://example.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://example.com/discord" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  Discord Community
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} SoulStream Protocol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
