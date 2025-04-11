import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TokenABI, WishlistRegistryABI, AirdropControllerABI, SoulboundProfileABI } from '@/utils/contractInteractions';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// Get environment variables
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://base-sepolia.g.alchemy.com/v2/demo';

// Error responses
const errorResponse = (message: string, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated via session or API key
    const session = await getServerSession(authOptions);
    const apiKey = req.headers.get('x-api-key');
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    // Allow authentication via session or API key
    const isAuthenticated = session || (apiKey && adminApiKey && apiKey === adminApiKey);
    
    // In production, authentication is required
    if (!isAuthenticated && process.env.NODE_ENV === 'production') {
      return errorResponse('Unauthorized: Valid session or API key required', 401);
    }

    // Parse request body
    const body = await req.json();
    const { action, params } = body;

    // Validate required parameters
    if (!action) {
      return errorResponse('Missing required parameter: action');
    }

    // Check if private key is configured
    if (!PRIVATE_KEY) {
      return errorResponse('Server configuration error: Missing private key', 500);
    }

    // Check if RPC URL is configured
    if (!RPC_URL) {
      return errorResponse('Server configuration error: Missing RPC URL', 500);
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Handle different actions
    switch (action) {
      case 'register': {
        const { userAddress, email, social } = params;
        
        if (!userAddress) {
          return errorResponse('Missing required parameter: userAddress');
        }

        // Validate Ethereum address
        if (!ethers.isAddress(userAddress)) {
          return errorResponse('Invalid Ethereum address');
        }
        
        // Use default values if email or social are not provided
        const userEmail = email || `${userAddress.substring(0, 6)}@example.com`;
        const userSocial = social || '';

        // Create contract instances
        const wishlistRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.WISHLIST_REGISTRY as string, 
          WishlistRegistryABI.abi, 
          wallet
        );
        
        const soulboundProfile = new ethers.Contract(
          CONTRACT_ADDRESSES.SOULBOUND_PROFILE as string,
          SoulboundProfileABI.abi,
          wallet
        );

        // Check if user is already registered
        const isRegistered = await wishlistRegistry.isRegistered(userAddress);
        if (isRegistered) {
          return NextResponse.json({ success: true, message: 'User already registered', isRegistered: true });
        }

        // Register user using batchRegister (allows admin to register on behalf of users)
        // Create arrays with single user for batch registration
        const usersArray = [userAddress];
        const emailsArray = [userEmail];
        const socialsArray = [userSocial];
        
        // Use batchRegister to register the user on their behalf
        const registerTx = await wishlistRegistry.batchRegister(usersArray, emailsArray, socialsArray);
        const registerReceipt = await registerTx.wait();
        
        // Check if user already has a profile
        const hasProfile = await soulboundProfile.hasProfile(userAddress);
        
        if (!hasProfile) {
          // Mint a soulbound profile for the user
          const mintTx = await soulboundProfile.mintProfile(userAddress);
          const mintReceipt = await mintTx.wait();
          
          console.log(`Minted profile for ${userAddress}, token ID: ${mintReceipt.logs[0].topics[3]}`);
        }

        return NextResponse.json({
          success: true,
          message: 'User registered successfully',
          transactionHash: registerReceipt.hash,
          blockNumber: registerReceipt.blockNumber,
          profileCreated: !hasProfile
        });
      }

      case 'transfer': {
        const { recipient, amount } = params;
        
        if (!recipient || !amount) {
          return errorResponse('Missing required parameters: recipient and/or amount');
        }

        // Validate Ethereum address
        if (!ethers.isAddress(recipient)) {
          return errorResponse('Invalid recipient address');
        }

        // Validate amount
        const amountBigInt = BigInt(amount);
        if (amountBigInt <= BigInt(0)) {
          return errorResponse('Amount must be greater than 0');
        }

        // Create contract instance
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.TOKEN as string, 
          TokenABI.abi, 
          wallet
        );

        // Execute transfer
        const tx = await tokenContract.transfer(recipient, amountBigInt);
        const receipt = await tx.wait();

        return NextResponse.json({
          success: true,
          message: 'Transfer completed successfully',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        });
      }

      case 'airdrop': {
        const { userAddress, amount } = params;
        
        if (!userAddress || !amount) {
          return errorResponse('Missing required parameters: userAddress and/or amount');
        }

        // Validate Ethereum address
        if (!ethers.isAddress(userAddress)) {
          return errorResponse('Invalid Ethereum address');
        }

        // Validate amount
        const amountBigInt = BigInt(amount);
        if (amountBigInt <= BigInt(0)) {
          return errorResponse('Amount must be greater than 0');
        }

        // Create contract instance
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.TOKEN as string, 
          TokenABI.abi, 
          wallet
        );

        // Execute airdrop
        const tx = await tokenContract.transfer(userAddress, amountBigInt);
        const receipt = await tx.wait();

        return NextResponse.json({
          success: true,
          message: 'Airdrop completed successfully',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        });
      }

      default:
        return errorResponse(`Unsupported action: ${action}`);
    }
  } catch (error: any) {
    console.error('Transaction API error:', error);
    return errorResponse(
      `Transaction failed: ${error.message || 'Unknown error'}`,
      500
    );
  }
}
