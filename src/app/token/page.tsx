'use client';

import { useAccount } from 'wagmi';
import D4LTokenInfo from '@/components/token/D4LTokenInfo';
import SecureBlockchainInfo from '@/components/blockchain/SecureBlockchainInfo';
import WalletButton from '@/components/wallet/WalletButton';

export default function TokenPage() {
  const { isConnected } = useAccount();

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Glassmorphism Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping"></div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          D4L Token Dashboard
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          View your D4L token balance and interact with the token contract.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
        <div className="relative z-10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Wallet Connection</h2>
          <WalletButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg border border-white/10 shadow-xl p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-blue-900/20 hover:border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-800/5 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <D4LTokenInfo />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg border border-white/10 shadow-xl p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-purple-800/5 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10">
            <SecureBlockchainInfo />
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg border border-white/10 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-cyan-600/5 opacity-30"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-cyan-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-semibold mb-4 text-white">About D4L Token</h2>
          <p className="mb-4 text-gray-300">
            D4L is a community-driven token on Base that rewards early adopters and active community members.
            This token is used for governance, rewards, and accessing premium features in the D4L ecosystem.
          </p>
          
          <div className="p-5 bg-blue-900/30 backdrop-blur-sm rounded-lg mt-4 border border-blue-500/20 shadow-inner">
            <h3 className="font-semibold mb-3 text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Token Utility
            </h3>
            <ul className="list-none space-y-3 text-gray-300">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Governance voting rights
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Access to premium features
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Staking rewards
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Community rewards for contributions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
