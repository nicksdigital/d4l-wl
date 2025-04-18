import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useSoulStream } from '../contexts/SoulStreamContext';
import ReputationScoreCard from '../components/reputation/ReputationScoreCard';
import RewardsClaimCard from '../components/rewards/RewardsClaimCard';

export default function Home() {
  const { account, connectWallet } = useWeb3();
  const { soulId, createSoulIdentity } = useSoulStream();
  const [isCreatingSoul, setIsCreatingSoul] = useState(false);
  const [createSoulError, setCreateSoulError] = useState(null);

  const handleCreateSoulIdentity = async () => {
    if (!account || isCreatingSoul) return;
    
    setIsCreatingSoul(true);
    setCreateSoulError(null);
    
    try {
      // Create a random app salt
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes(`soulstream-${Date.now()}`));
      
      // Create soul identity
      await createSoulIdentity(appSalt, ethers.ZeroHash);
    } catch (error) {
      console.error('Error creating soul identity:', error);
      setCreateSoulError(error.message || 'Failed to create soul identity');
    } finally {
      setIsCreatingSoul(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to SoulStream Protocol
            </h1>
            <p className="text-xl mb-8">
              A comprehensive framework for creating, managing, and routing non-transferable assets and identities on blockchain networks.
            </p>
            {!account ? (
              <button 
                onClick={connectWallet} 
                className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 text-lg"
              >
                Connect Wallet to Get Started
              </button>
            ) : !soulId ? (
              <div>
                <button 
                  onClick={handleCreateSoulIdentity} 
                  disabled={isCreatingSoul}
                  className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 text-lg"
                >
                  {isCreatingSoul ? 'Creating Soul Identity...' : 'Create Soul Identity'}
                </button>
                {createSoulError && (
                  <div className="mt-4 p-3 bg-red-800 bg-opacity-50 rounded-md text-white text-sm">
                    {createSoulError}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-lg">
                Soul Identity: {`${soulId.substring(0, 6)}...${soulId.substring(soulId.length - 4)}`}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-primary-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Soul Identity</h3>
              <p className="text-gray-600">
                Create and manage non-transferable digital identities that persist across interactions.
              </p>
            </div>
            
            <div className="card">
              <div className="text-primary-600 text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Reputation System</h3>
              <p className="text-gray-600">
                Build and track reputation scores that reflect user contributions and engagement.
              </p>
            </div>
            
            <div className="card">
              <div className="text-primary-600 text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold mb-2">Rewards Distribution</h3>
              <p className="text-gray-600">
                Distribute and manage rewards based on user actions and achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview (if connected and has soul) */}
      {account && soulId && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Your Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ReputationScoreCard />
              <RewardsClaimCard />
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold mb-2">Create Soul Identity</h3>
                <p className="text-gray-600">
                  Create your unique Soul Identity that represents you in the SoulStream ecosystem.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold mb-2">Earn Reputation</h3>
                <p className="text-gray-600">
                  Participate in the community and earn reputation points that reflect your contributions.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold mb-2">Claim Rewards</h3>
                <p className="text-gray-600">
                  Receive and claim rewards based on your reputation and participation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
