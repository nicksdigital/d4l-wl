"use client";

import { useState, useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import UserProfile from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const web3 = useWeb3();
  const params = useParams();
  // @ts-ignore
  const addressParam = params.address as string;
  
  const [profileData, setProfileData] = useState({
    tokenId: 0,
    baseAmount: 0,
    bonusAmount: 0,
    claimed: false,
    claimTimestamp: 0,
    email: '',
    social: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if the address is valid
  const isValidAddress = ethers.isAddress(addressParam);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isValidAddress || !web3.contracts.soulboundProfile) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if user has profile
        const hasProfileResult = await web3.contracts.soulboundProfile.read("hasProfile", [addressParam]);
        setHasProfile(hasProfileResult);
        
        if (!hasProfileResult) {
          setIsLoading(false);
          return;
        }

        // Get profile token ID
        const tokenId = await web3.contracts.soulboundProfile.read("getProfileId", [addressParam]);
        
        // Get airdrop info
        const airdropInfo = await web3.contracts.soulboundProfile.read("getAirdropInfo", [tokenId]);
        
        // Get registration details if available
        let email = '';
        let social = '';
        
        try {
          if (web3.contracts.wishlistRegistry) {
            const registrationDetails = await web3.contracts.wishlistRegistry.read("registrationDetails", [addressParam]);
            email = registrationDetails.email || '';
            social = registrationDetails.social || '';
          }
        } catch (err) {
          console.error("Error fetching registration details:", err);
        }
        
        setProfileData({
          tokenId: Number(tokenId),
          baseAmount: Number(airdropInfo.baseAmount),
          bonusAmount: Number(airdropInfo.bonusAmount),
          claimed: airdropInfo.claimed,
          claimTimestamp: Number(airdropInfo.claimTimestamp),
          email,
          social,
        });
      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Error fetching profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [web3.contracts.soulboundProfile, web3.contracts.wishlistRegistry, addressParam, isValidAddress]);

  if (!isValidAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Address</h1>
            <p className="mb-6">The provided address is not valid.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>
          
          <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
                User Profile
              </h1>
              <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 transition-all duration-200 text-white text-sm">
                Return Home
              </Link>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-white/10 rounded-lg w-1/3"></div>
                <div className="h-8 bg-white/10 rounded-lg w-1/2"></div>
                <div className="h-8 bg-white/10 rounded-lg w-1/4"></div>
                <div className="h-32 bg-white/10 rounded-lg"></div>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30 text-center">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
              </div>
            ) : !hasProfile ? (
              <div className="p-6 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/30 text-center">
                <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
                <p className="mb-4">This address does not have a profile yet.</p>
                {web3.address?.toLowerCase() === addressParam.toLowerCase() && (
                  <Link href="/register" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Register Now
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="font-mono text-sm break-all">{addressParam}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Token ID</p>
                        <p>{profileData.tokenId}</p>
                      </div>
                      {profileData.email && (
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p>{profileData.email}</p>
                        </div>
                      )}
                      {profileData.social && (
                        <div>
                          <p className="text-sm text-gray-400">Social</p>
                          <p>{profileData.social}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                    <h2 className="text-xl font-semibold mb-4">Airdrop Information</h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Base Amount</p>
                        <p>{profileData.baseAmount} D4L</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Bonus Amount</p>
                        <p>{profileData.bonusAmount} D4L</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Amount</p>
                        <p className="text-xl font-bold">{profileData.baseAmount + profileData.bonusAmount} D4L</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Claimed</p>
                        <p>{profileData.claimed ? 'Yes' : 'No'}</p>
                      </div>
                      {profileData.claimed && profileData.claimTimestamp > 0 && (
                        <div>
                          <p className="text-sm text-gray-400">Claim Date</p>
                          <p>{new Date(profileData.claimTimestamp * 1000).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {web3.address?.toLowerCase() === addressParam.toLowerCase() && !profileData.claimed && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">Claim Your Tokens</h2>
                    <p className="mb-4">You have {profileData.baseAmount + profileData.bonusAmount} D4L tokens available to claim.</p>
                    <button 
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors"
                      onClick={() => {/* Implement claim functionality */}}
                    >
                      Claim Tokens
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
