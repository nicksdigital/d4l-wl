import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useSoulStream } from '../contexts/SoulStreamContext';
import RewardsClaimCard from '../components/rewards/RewardsClaimCard';

export default function Rewards() {
  const { account, connectWallet } = useWeb3();
  const { soulId, rewardsAsset } = useSoulStream();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Fetch reward programs (mock data for demo)
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!soulId || !rewardsAsset) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, you would fetch this from the contract or an API
        // This is mock data for demonstration
        const mockPrograms = [
          {
            id: 1,
            name: 'Community Rewards',
            description: 'Rewards for active community participation',
            totalAllocation: ethers.parseEther('10000'),
            remainingAllocation: ethers.parseEther('7500'),
            startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
            endTime: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days from now
            active: true
          },
          {
            id: 2,
            name: 'Bug Bounty Program',
            description: 'Rewards for finding and reporting bugs',
            totalAllocation: ethers.parseEther('5000'),
            remainingAllocation: ethers.parseEther('4200'),
            startTime: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, // 15 days ago
            endTime: Math.floor(Date.now() / 1000) + 75 * 24 * 60 * 60, // 75 days from now
            active: true
          },
          {
            id: 3,
            name: 'Early Adopter Rewards',
            description: 'Rewards for early platform adopters',
            totalAllocation: ethers.parseEther('2000'),
            remainingAllocation: ethers.parseEther('0'),
            startTime: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60, // 90 days ago
            endTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
            active: false
          }
        ];
        
        setPrograms(mockPrograms);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError(error.message || 'Failed to fetch reward programs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, [soulId, rewardsAsset]);

  const handleClaimSuccess = () => {
    setClaimSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setClaimSuccess(false);
    }, 5000);
  };

  // Format time remaining
  const formatTimeRemaining = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
  };

  if (!account) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to view your rewards.</p>
        <button 
          onClick={connectWallet} 
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!soulId) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>
        <p className="text-gray-600 mb-6">You need to create a Soul Identity first.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="btn btn-primary"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Your Rewards</h1>
      
      {claimSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-md text-green-700">
          Rewards claimed successfully!
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RewardsClaimCard onClaim={handleClaimSuccess} showHistory={true} />
        </div>
        
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Active Reward Programs</h3>
            
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading reward programs...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                {error}
              </div>
            ) : programs.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No reward programs found.
              </div>
            ) : (
              <div className="space-y-6">
                {programs.map((program) => (
                  <div 
                    key={program.id} 
                    className={`p-4 border rounded-md ${program.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-75'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium">{program.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {program.description}
                        </p>
                      </div>
                      
                      {program.active ? (
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Active
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Inactive
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Allocation: {ethers.formatEther(program.remainingAllocation)} / {ethers.formatEther(program.totalAllocation)} tokens
                      </div>
                      
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ 
                            width: `${100 - (Number(program.remainingAllocation) * 100 / Number(program.totalAllocation))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-xs text-gray-500">
                      <div>
                        Started: {new Date(program.startTime * 1000).toLocaleDateString()}
                      </div>
                      <div>
                        {program.active ? (
                          formatTimeRemaining(program.endTime)
                        ) : (
                          `Ended: ${new Date(program.endTime * 1000).toLocaleDateString()}`
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">How to Earn Rewards</h3>
            <p className="text-gray-600 mb-4">
              Participate in the following activities to earn rewards:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Community Participation</div>
                <div className="text-sm text-gray-600">
                  Actively participate in community discussions, answer questions, and provide valuable feedback.
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Bug Reporting</div>
                <div className="text-sm text-gray-600">
                  Find and report bugs in the platform to help improve the user experience.
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Content Creation</div>
                <div className="text-sm text-gray-600">
                  Create tutorials, guides, and other content that helps other users understand the platform.
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Feature Testing</div>
                <div className="text-sm text-gray-600">
                  Participate in beta testing of new features and provide detailed feedback.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
