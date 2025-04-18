import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useSoulStream } from '../contexts/SoulStreamContext';
import ReputationScoreCard from '../components/reputation/ReputationScoreCard';

export default function Reputation() {
  const { account, connectWallet } = useWeb3();
  const { soulId, reputationAsset } = useSoulStream();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reputation activities (mock data for demo)
  useEffect(() => {
    const fetchActivities = async () => {
      if (!soulId || !reputationAsset) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, you would fetch this from events or an API
        // This is mock data for demonstration
        const mockActivities = [
          {
            id: 1,
            type: 'mint',
            description: 'Community contribution',
            amount: 25,
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago
          },
          {
            id: 2,
            type: 'mint',
            description: 'Question answered',
            amount: 10,
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
          },
          {
            id: 3,
            type: 'mint',
            description: 'Bug report submitted',
            amount: 15,
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
          },
          {
            id: 4,
            type: 'decay',
            description: 'Weekly decay',
            amount: -5,
            timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
          }
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [soulId, reputationAsset]);

  // Activity icons
  const activityIcons = {
    'mint': '⬆️',
    'burn': '⬇️',
    'transfer_in': '⬅️',
    'transfer_out': '➡️',
    'decay': '📉',
  };

  if (!account) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Reputation</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to view your reputation.</p>
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
        <h1 className="text-3xl font-bold mb-6">Reputation</h1>
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
      <h1 className="text-3xl font-bold mb-8">Your Reputation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ReputationScoreCard />
          
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Reputation Tiers</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium mr-3">
                    1
                  </div>
                  <span>Novice</span>
                </div>
                <span className="text-gray-500">0+ points</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium mr-3">
                    2
                  </div>
                  <span>Apprentice</span>
                </div>
                <span className="text-gray-500">50+ points</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium mr-3">
                    3
                  </div>
                  <span>Expert</span>
                </div>
                <span className="text-gray-500">100+ points</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-medium mr-3">
                    4
                  </div>
                  <span>Master</span>
                </div>
                <span className="text-gray-500">200+ points</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium mr-3">
                    5
                  </div>
                  <span>Legend</span>
                </div>
                <span className="text-gray-500">500+ points</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Reputation Activity</h3>
            
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading activities...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                {error}
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No reputation activities found.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start p-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-4">
                      {activityIcons[activity.type] || '🔄'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {activity.description}
                        </div>
                        <div className={`font-semibold ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.amount >= 0 ? '+' : ''}{activity.amount}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Earn Reputation</h3>
            <p className="text-gray-600 mb-4">
              Here are some ways you can earn reputation points:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Community Contributions</div>
                <div className="text-sm text-gray-600">
                  Submit helpful content, answer questions, and participate in discussions.
                </div>
                <div className="text-xs text-primary-600 mt-2">
                  +10 to +50 points per contribution
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Bug Reports</div>
                <div className="text-sm text-gray-600">
                  Report bugs and issues in the platform.
                </div>
                <div className="text-xs text-primary-600 mt-2">
                  +15 points per verified bug
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium mb-1">Feature Suggestions</div>
                <div className="text-sm text-gray-600">
                  Suggest new features or improvements.
                </div>
                <div className="text-xs text-primary-600 mt-2">
                  +20 points per implemented suggestion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
