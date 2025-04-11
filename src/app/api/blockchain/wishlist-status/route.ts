import { NextResponse } from 'next/server';
import { WishlistStatus } from '@/lib/blockchain-api';

// Fallback data for wishlist status when blockchain connection fails
const fallbackWishlistData: WishlistStatus = {
  totalRegistered: 3750,
  registrationOpen: true,
  isUserRegistered: false,
};

/**
 * GET handler for wishlist status
 * Provides fallback data when direct blockchain connections fail
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    
    // In a production environment, you would connect to a database or another API
    // that stores blockchain data rather than returning hardcoded values
    
    // If a user address is provided, check if they're registered
    if (userAddress) {
      // This is where you would typically query a database to check registration
      // For demo purposes, we'll consider specific addresses as registered
      const knownAddresses = [
        '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be',
        '0x123456789abcdef123456789abcdef123456789a',
      ];
      
      const isRegistered = knownAddresses.includes(userAddress.toLowerCase());
      
      return NextResponse.json({
        ...fallbackWishlistData,
        isUserRegistered: isRegistered,
      });
    }
    
    return NextResponse.json(fallbackWishlistData);
  } catch (error) {
    console.error('Error in wishlist status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist status' },
      { status: 500 }
    );
  }
}
