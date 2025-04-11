'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSecureApi } from '@/hooks/useSecureApi';
import { ProfileResponse } from '@/types/api';

export default function UserProfile() {
  const { data: session } = useSession();
  const { get, data, error, loading } = useSecureApi<ProfileResponse>({ requireAuth: true });
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.address) {
        try {
          setIsLoading(true);
          const response = await get('/user/profile', { address: session.user.address });
          if (response.success && response.data) {
            setProfile(response.data);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [session, get]);

  if (!session) {
    return (
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p>Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="p-4 bg-red-500/20 rounded-lg">
          <p className="text-red-500">Error loading profile: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p>No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Address</h3>
          <p className="font-mono text-sm break-all">{profile.address}</p>
        </div>
        
        {profile.hasProfile ? (
          <>
            <div>
              <h3 className="text-lg font-semibold">Profile ID</h3>
              <p>{profile.profileId}</p>
            </div>
            
            {profile.tokenURI && (
              <div>
                <h3 className="text-lg font-semibold">Token URI</h3>
                <p className="font-mono text-sm break-all">{profile.tokenURI}</p>
              </div>
            )}
            
            {profile.airdropInfo && (
              <div>
                <h3 className="text-lg font-semibold">Airdrop Info</h3>
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-400">Base Amount</p>
                      <p>{profile.airdropInfo.baseAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Bonus Amount</p>
                      <p>{profile.airdropInfo.bonusAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Claimed</p>
                      <p>{profile.airdropInfo.claimed ? 'Yes' : 'No'}</p>
                    </div>
                    {profile.airdropInfo.claimTimestamp && (
                      <div>
                        <p className="text-sm text-gray-400">Claim Time</p>
                        <p>{new Date(profile.airdropInfo.claimTimestamp * 1000).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-500/20 p-4 rounded-lg">
            <p className="text-yellow-500">You don't have a profile yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
