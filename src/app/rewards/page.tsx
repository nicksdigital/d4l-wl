"use client";

import { useState, useEffect } from 'react';
import { pageCacheConfig, ContentTags } from '@/lib/cache';
import { useCachedData } from '@/hooks/useCachedData';
import useWeb3 from '@/hooks/useWeb3';
import Link from 'next/link';

interface RewardAction {
  id: string;
  name: string;
  description: string;
  rewardPoints: number;
  completed: boolean;
  active: boolean;
  maxCompletions: number;
  requiresVerification: boolean;
  cooldownPeriod: number;
  lastCompletedTimestamp: number;
  compeletedCount: number;
  verified: boolean;
}

// Page-specific caching behavior is configured in config.ts

export default function RewardsPage() {
  const { isConnected, address, contracts } = useWeb3();
  const [actions, setActions] = useState<RewardAction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<{ [key: string]: boolean }>({});
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock actions for display purposes
  const mockActions = [
    {
      id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      name: 'Follow on Twitter',
      description: 'Follow our official Twitter account @d4l_official',
      rewardPoints: 10,
      completed: false,
      active: true,
      maxCompletions: 1,
      requiresVerification: true,
      cooldownPeriod: 0,
      lastCompletedTimestamp: 0,
      compeletedCount: 0,
      verified: false
    },
    {
      id: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
      name: 'Join Discord',
      description: 'Join our official Discord server',
      rewardPoints: 10,
      completed: false,
      active: true,
      maxCompletions: 1,
      requiresVerification: true,
      cooldownPeriod: 0,
      lastCompletedTimestamp: 0,
      compeletedCount: 0,
      verified: false
    },
    {
      id: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
      name: 'Share on Twitter',
      description: 'Share our announcement tweet',
      rewardPoints: 5,
      completed: false,
      active: true,
      maxCompletions: 5,
      requiresVerification: true,
      cooldownPeriod: 86400, // 1 day
      lastCompletedTimestamp: 0,
      compeletedCount: 0,
      verified: false
    },
    {
      id: '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
      name: 'Refer Friends',
      description: 'Refer a friend to register for the airdrop',
      rewardPoints: 20,
      completed: false,
      active: true,
      maxCompletions: 10,
      requiresVerification: false,
      cooldownPeriod: 0,
      lastCompletedTimestamp: 0,
      compeletedCount: 0,
      verified: true
    },
    {
      id: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
      name: 'Join Telegram',
      description: 'Join our official Telegram group',
      rewardPoints: 10,
      completed: false,
      active: true,
      maxCompletions: 1,
      requiresVerification: true,
      cooldownPeriod: 0,
      lastCompletedTimestamp: 0,
      compeletedCount: 0,
      verified: false
    }
  ];

  useEffect(() => {
    // In a real application, we would fetch action data from the contract
    // For demonstration purposes, we'll use the mock data
    setActions(mockActions);
    setTotalPoints(0);
    setBonusPoints(0);
    setHasClaimed(false);
    setIsLoading(false);
  }, []);

  const handleCompleteAction = async (actionId: string) => {
    setIsCompleting(prev => ({ ...prev, [actionId]: true }));
    setError(null);
    setSuccess(null);

    try {
      // Mock completion - in a real app, this would call the contract
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the action status
      setActions(prev => 
        prev.map(action => 
          action.id === actionId 
            ? { 
                ...action, 
                completed: true, 
                lastCompletedTimestamp: Math.floor(Date.now() / 1000),
                compeletedCount: action.compeletedCount + 1
              } 
            : action
        )
      );

      // Update total points
      const completedAction = actions.find(action => action.id === actionId);
      if (completedAction) {
        setTotalPoints(prev => prev + completedAction.rewardPoints);
        setBonusPoints(prev => prev + completedAction.rewardPoints);
      }

      setSuccess(`Successfully completed action: ${actions.find(a => a.id === actionId)?.name}`);
    } catch (err) {
      console.error('Error completing action:', err);
      setError('Failed to complete action. Please try again.');
    } finally {
      setIsCompleting(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const handleClaimBonusPoints = async () => {
    setIsClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      // Mock claiming - in a real app, this would call the contract
      await new Promise(resolve => setTimeout(resolve, 2000));

      setHasClaimed(true);
      setSuccess('Successfully claimed bonus points! They will be added to your airdrop allocation.');
    } catch (err) {
      console.error('Error claiming bonus points:', err);
      setError('Failed to claim bonus points. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white mb-6 text-3xl font-bold">Rewards</h1>
        <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
          <div className="card-body text-center p-6">
            <p className="mb-4 text-gray-300">Please connect your wallet to view and earn rewards.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-white mb-6 text-3xl font-bold">Rewards & Bonus Points</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card h-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
            <div className="card-header p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Complete Actions to Earn Bonus Tokens</h2>
            </div>
            <div className="card-body p-6">
              <p className="mb-4 text-gray-300">
                Complete the actions below to earn bonus points that will increase your airdrop allocation.
                Each action rewards you with a specific number of points that will be convertible to D4L tokens.
              </p>
              <div className="flex items-center justify-between p-4 bg-primary-900 bg-opacity-50 text-primary-300 rounded-md mb-6 border border-primary-800">
                <div>
                  <span className="font-medium text-primary-200">Your Total Reward Points: </span>
                  <span className="font-bold text-lg text-white">{totalPoints}</span>
                </div>
                <button
                  onClick={handleClaimBonusPoints}
                  className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
                  disabled={totalPoints === 0 || hasClaimed || isClaiming}
                >
                  {isClaiming ? (
                    <div className="flex items-center">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      <span className="ml-2">Claiming...</span>
                    </div>
                  ) : hasClaimed ? (
                    'Claimed'
                  ) : (
                    'Claim Bonus'
                  )}
                </button>
              </div>

              {/* Success or Error Messages */}
              {success && (
                <div className="mb-4 p-3 bg-green-900 bg-opacity-50 text-green-300 rounded-md border border-green-800">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-md border border-red-800">
                  {error}
                </div>
              )}

              {/* Actions List */}
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-700 rounded-md p-4 bg-gray-800">
                      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map(action => (
                    <div key={action.id} className="border border-gray-700 rounded-md p-4 bg-gray-800 bg-opacity-80 backdrop-blur-sm">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold text-white">{action.name}</h3>
                        <span className="bg-primary-900 text-primary-200 px-2 py-1 rounded text-sm border border-primary-800">
                          {action.rewardPoints} Points
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{action.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          {action.maxCompletions > 1 && (
                            <span className="text-sm text-gray-400">
                              {action.compeletedCount}/{action.maxCompletions} completions
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCompleteAction(action.id)}
                          className={`px-4 py-2 rounded-md font-medium ${
                            action.completed
                              ? 'bg-green-900 bg-opacity-50 text-green-300 border border-green-800'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                          disabled={
                            action.completed ||
                            !action.active ||
                            isCompleting[action.id] ||
                            (action.maxCompletions > 0 && action.compeletedCount >= action.maxCompletions)
                          }
                        >
                          {isCompleting[action.id] ? (
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          ) : action.completed ? (
                            'Completed'
                          ) : (
                            'Complete'
                          )}
                        </button>
                      </div>
                      {action.requiresVerification && action.completed && !action.verified && (
                        <div className="mt-2 text-sm text-yellow-500">
                          Waiting for verification
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card mb-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
            <div className="card-header p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Bonus Details</h2>
            </div>
            <div className="card-body p-6">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Earned Points:</span>
                  <span className="font-medium text-white">{totalPoints}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Bonus Tokens:</span>
                  <span className="font-medium text-white">{bonusPoints} D4L</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${hasClaimed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {hasClaimed ? 'Claimed' : 'Not Claimed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gray-800 border border-gray-700 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-80">
            <div className="card-header p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">How It Works</h2>
            </div>
            <div className="card-body p-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                <li>
                  Complete actions to earn reward points.
                </li>
                <li>
                  Some actions require verification by our team.
                </li>
                <li>
                  Once verified, points will be added to your total.
                </li>
                <li>
                  Claim your bonus points to add them to your airdrop allocation.
                </li>
                <li>
                  The more points you earn, the more tokens you'll receive!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Referral Program</h2>
        </div>
        <div className="card-body">
          <p className="mb-4">
            Invite your friends to join D4L and earn additional tokens! Share your unique referral link below.
          </p>
          
          <div className="mb-6">
            <label htmlFor="referralLink" className="label">Your Referral Link</label>
            <div className="flex">
              <input
                id="referralLink"
                type="text"
                readOnly
                className="input rounded-r-none"
                value={`https://d4l.io/register?ref=${address}`}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://d4l.io/register?ref=${address}`);
                  setSuccess('Referral link copied to clipboard!');
                }}
                className="btn btn-primary rounded-l-none"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              You'll earn 20 points for each friend who registers using your link!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-gray-600">Total Referrals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-gray-600">Successful Referrals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">0 D4L</div>
              <div className="text-gray-600">Referral Rewards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
