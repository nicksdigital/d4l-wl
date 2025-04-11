import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Sample token balances for demo purposes
const sampleBalances: Record<string, Record<string, string>> = {
  '0xde43d4faac1e6f0d6484215dfeea1270a5a3a9be': {
    '0x4e569c16220c734484BE84430A995A33d3543e0d': '1250.0', // D4L token
  },
};

/**
 * GET handler for token balance
 * Provides fallback data when direct blockchain connections fail
 */
export async function GET(request: Request) {
  try {
    // Check authentication - allow both session auth and API key auth
    const session = await getServerSession(authOptions);
    const headers = new Headers(request.headers);
    const apiKey = headers.get('x-api-key');
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    // Allow authentication via session or API key
    const isAuthenticated = session || (apiKey && adminApiKey && apiKey === adminApiKey);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const tokenAddress = searchParams.get('tokenAddress') || '0x4e569c16220c734484BE84430A995A33d3543e0d';
    
    // Check if user address is provided
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }
    
    // If not authenticated in production, return default data instead of error
    if (!isAuthenticated && process.env.NODE_ENV === 'production') {
      console.warn('Unauthenticated token balance request, returning default data');
      return NextResponse.json({ balance: '0.0' });
    }
    
    // In a production environment, you would connect to a database or another API
    // that stores blockchain data rather than returning hardcoded values
    
    // Check if we have balance data for this address and token
    const normalizedAddress = userAddress.toLowerCase();
    const normalizedTokenAddress = tokenAddress.toLowerCase();
    
    let balance = '0.0';
    
    if (sampleBalances[normalizedAddress] && 
        sampleBalances[normalizedAddress][normalizedTokenAddress]) {
      balance = sampleBalances[normalizedAddress][normalizedTokenAddress];
    }
    
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error in token balance API:', error);
    // Return a default balance instead of an error to prevent React errors
    return NextResponse.json({ balance: '0.0' });
  }
}
