import { NextResponse } from 'next/server';
import { ProfileStatus } from '@/lib/blockchain-api';

// Fallback data for profile status when blockchain connection fails
const fallbackProfileData: ProfileStatus = {
  hasProfile: false,
};

// Sample profile data for demo purposes
const sampleProfiles: Record<string, ProfileStatus> = {
  '0xde43d4faac1e6f0d6484215dfeea1270a5a3a9be': {
    hasProfile: true,
    profileData: {
      name: 'D4L Demo User',
      bio: 'Blockchain enthusiast and early adopter of the D4L platform.',
      avatar: 'https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg',
    },
  },
};

/**
 * GET handler for profile status
 * Provides fallback data when direct blockchain connections fail
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }
    
    // In a production environment, you would connect to a database or another API
    // that stores blockchain data rather than returning hardcoded values
    
    // Check if we have profile data for this address
    const normalizedAddress = userAddress.toLowerCase();
    const profileData = sampleProfiles[normalizedAddress] || fallbackProfileData;
    
    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error in profile status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile status' },
      { status: 500 }
    );
  }
}
