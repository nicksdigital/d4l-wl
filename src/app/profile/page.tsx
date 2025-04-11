"use client";

import { useState, useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';
import Link from 'next/link';
import UserProfile from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const web3 = useWeb3();
  const [profileData, setProfileData] = useState({
    tokenId: 0,
    baseAmount: 0,
    bonusAmount: 0,
    claimed: false,
    claimTimestamp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSecureApiMode, setUseSecureApiMode] = useState(true);

  // Toggle between using the secure API and direct contract calls
  const toggleApiMode = () => {
    setUseSecureApiMode(!useSecureApiMode);
  };
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!web3.isConnected || !web3.address || !web3.contracts.soulboundProfile) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user has profile
        const hasProfile = await web3.contracts.soulboundProfile.read("hasProfile", [web3.address]);
        
        if (!hasProfile) {
          setIsLoading(false);
          return;
        }

        // Get profile token ID
        const tokenId = await web3.contracts.soulboundProfile.read("getProfileId", [web3.address]);
        
        // Get airdrop info
        const airdropInfo = await web3.contracts.soulboundProfile.read("getAirdropInfo", [tokenId]);
        
        setProfileData({
          tokenId: Number(tokenId),
          baseAmount: Number(airdropInfo.baseAmount),
          bonusAmount: Number(airdropInfo.bonusAmount),
          claimed: airdropInfo.claimed,
          claimTimestamp: Number(airdropInfo.claimTimestamp),
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error fetching profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [web3.isConnected, web3.address, web3.contracts.soulboundProfile]);

  if (!web3.isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 relative">
        {/* Glassmorphism Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Your Profile</h1>
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-8 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mb-6 text-lg text-center text-white">Please connect your wallet to view your profile.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 font-medium">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
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
      
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Your Profile</h1>
      
      <div className="mb-6 flex justify-end">
        <button 
          onClick={toggleApiMode}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/20 transition-all duration-300 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
        >
          <span className="absolute inset-0 overflow-hidden rounded-lg">
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/0 via-blue-400/40 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
          </span>
          <span className="relative z-10">{useSecureApiMode ? 'Switch to Direct Contract Calls' : 'Switch to Secure API'}</span>
        </button>
      </div>
      
      {useSecureApiMode ? (
        // New secure API-based profile component
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10 p-6">
            <UserProfile />
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-8 shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
              <div className="flex justify-center items-center h-40 relative z-10">
                <div className="relative">
                  <div className="animate-ping absolute h-16 w-16 rounded-full bg-blue-400/20"></div>
                  <div className="animate-spin relative rounded-full h-12 w-12 border-2 border-transparent border-t-blue-500 border-b-purple-500 shadow-lg"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : profileData.tokenId === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
              <div className="text-center">
                <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
                <p className="mb-4">
                  You don't have a profile yet. Please register for the airdrop first.
                </p>
                <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block">
                  Register Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
                <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400">Wallet Address</p>
                    <p className="font-mono text-sm break-all">{web3.address}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Token ID</p>
                    <p>{profileData.tokenId}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-2">Airdrop Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Base Amount</p>
                        <p>{profileData.baseAmount} D4L</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Bonus Amount</p>
                        <p>{profileData.bonusAmount} D4L</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Claimed</p>
                        <p>{profileData.claimed ? 'Yes' : 'No'}</p>
                      </div>
                      {profileData.claimTimestamp > 0 && (
                        <div>
                          <p className="text-gray-400">Claim Date</p>
                          <p>{new Date(profileData.claimTimestamp * 1000).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
                <h2 className="text-2xl font-semibold mb-4">Actions</h2>
                <div className="space-y-4">
                  <div>
                    <Link href="/airdrop" className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition-colors">
                      Claim Airdrop
                    </Link>
                  </div>
                  <div>
                    <button 
                      className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-center transition-colors"
                      onClick={() => alert('Update profile functionality coming soon!')}
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
