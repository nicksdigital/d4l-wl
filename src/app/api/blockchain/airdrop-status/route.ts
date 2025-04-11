import { NextResponse } from 'next/server';
import { AirdropStatus } from '@/lib/blockchain-api';

// Fallback data for airdrop status when blockchain connection fails
const fallbackAirdropData: AirdropStatus = {
  isActive: true,
  totalMinted: 4250,
  maxSupply: 10000,
  startTime: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // 7 days ago
  endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
};

/**
 * GET handler for airdrop status
 * Provides fallback data when direct blockchain connections fail
 */
export async function GET() {
  try {
    // In a production environment, you would connect to a database or another API
    // that stores blockchain data rather than returning hardcoded values
    
    return NextResponse.json(fallbackAirdropData);
  } catch (error) {
    console.error('Error in airdrop status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airdrop status' },
      { status: 500 }
    );
  }
}
