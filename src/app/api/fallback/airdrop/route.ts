import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { db, AirdropClaim } from "@/utils/dbUtils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateParams,
  isValidEthereumAddress,
  logApiError
} from "@/utils/apiUtils";
import { AirdropControllerABI } from '../../../../contracts/abi/AirdropControllerABI';

// GET endpoint to retrieve airdrop claim status from database
export async function GET(request: NextRequest) {
  return handleGetStatus(request);
}

// Internal function to handle GET requests
async function handleGetStatus(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    
    // Validate address
    if (!address || !isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Valid address parameter is required"
      );
    }
    
    // Get claim from database
    const claim = await db.getAirdropClaim(address);
    
    if (!claim) {
      return createSuccessResponse({
        address,
        hasClaim: false,
        status: null,
        amount: "0",
        timestamp: null
      });
    }
    
    // Return the data
    return createSuccessResponse({
      address,
      hasClaim: true,
      status: claim.status,
      amount: claim.amount,
      timestamp: claim.timestamp,
      txHash: claim.txHash
    });
    
  } catch (error: unknown) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    );
  }
}

// Function to handle airdrop claims
async function handleClaimStorage(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate required parameters
    const validation = validateParams(body, ["address", "amount", "merkleProof", "merkleRoot"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { address, amount, merkleProof, merkleRoot } = body;
    
    // Validate address
    if (!isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Validate amount
    try {
      // Using BigInt for validation instead of BigNumber
      const parsedAmount = BigInt(amount); // Validate that amount is a valid number
      if (!parsedAmount) {
        throw new Error('Invalid amount format');
      }
    } catch (error) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid amount format'
      );
    }
    
    // Verify the proof is an array
    if (!Array.isArray(merkleProof)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Merkle proof must be an array"
      );
    }
    
    // Create claim object
    const claim: AirdropClaim = {
      address,
      amount,
      timestamp: Date.now(),
      status: 'pending',
      merkleProof,
      merkleRoot
    };
    
    // Store claim in database
    await db.storeAirdropClaim(claim);
    
    // Return success
    return createSuccessResponse({
      success: true,
      message: "Airdrop claim stored in database",
      address,
      status: 'pending'
    });
    
  } catch (error: unknown) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
    );
  }
}

// Function to handle airdrop status updates
async function handleStatusUpdate(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate required parameters
    const validation = validateParams(body, ["address", "status"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { address, status, txHash } = body;
    
    // Validate address
    if (!isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Validate status
    if (!['pending', 'confirmed', 'failed'].includes(status)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Status must be one of: pending, confirmed, failed"
      );
    }
    
    // Update claim status in database
    await db.updateAirdropClaimStatus(address, status as 'pending' | 'confirmed' | 'failed', txHash);
    
    // Return success
    return createSuccessResponse({
      success: true,
      message: "Airdrop claim status updated",
      address,
      status
    });
    
  } catch (error: unknown) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
    );
  }
}

// Fallback airdrop endpoint
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/utils/rateLimit';

interface ClaimEvent {
  event: string;
  args: [string, string, string];
}

// Export POST handler for Route API
export async function POST(request: NextRequest) {
  // Router to determine which handler to use based on request params or body
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  // If action is 'store', use handleClaimStorage, otherwise use the default handler
  if (action === 'store') {
    return handleClaimStorage(request);
  } else if (action === 'update') {
    return handleStatusUpdate(request);
  }
  
  // Default handler for claiming airdrops
  try {
    // Rate limit the endpoint
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimit('fallback-airdrop', ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }
    
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { address, amount, proof } = body;

    if (!address || !amount || !proof) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the address is valid
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    // Verify the address matches the authenticated user
    if (session.user?.address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Address does not match authenticated user" },
        { status: 403 }
      );
    }

    // Connect to the contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(
      process.env.AIRDROP_CONTRACT_ADDRESS!,
      AirdropControllerABI,
      provider
    );

    // Get the current block number
    const blockNumber = await provider.getBlockNumber();

    // Get the current timestamp
    const block = await provider.getBlock(blockNumber);
    if (!block) {
      throw new Error('Failed to get block information');
    }
    const timestamp = block.timestamp;

    // Get the current root
    const currentRoot = await contract.getRoot();

    // Verify the proof
    const isValid = await contract.verifyProof(proof, address, amount);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid proof' },
        { status: 400 }
      );
    }

    // Get the current batch
    const currentBatch = await contract.getCurrentBatch();

    // Get the batch start time
    const batchStartTime = await contract.getBatchStartTime(currentBatch);

    // Get the batch duration
    const batchDuration = await contract.getBatchDuration();

    // Check if the batch is still active
    const batchEndTime = batchStartTime + batchDuration;
    if (timestamp > batchEndTime) {
      return NextResponse.json(
        { error: 'Batch has ended' },
        { status: 400 }
      );
    }

    // Get the claim status
    const claimed = await contract.hasClaimed(address);
    if (claimed) {
      return NextResponse.json(
        { error: 'Address has already claimed' },
        { status: 400 }
      );
    }

    // Get the signer
    const signer = await provider.getSigner();

    // Get the contract with the signer
    const contractWithSigner = contract.connect(await signer);

    // Get the gas price with null check
    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) {
      throw new Error('Failed to get gas price');
    }
    const gasPrice = BigInt(feeData.gasPrice.toString());

    // Get gas limit and calculate cost
    const amountBN = BigInt(amount);
    
    // Use the correct syntax for ethers v6 to estimate gas
    const gasLimit = await contractWithSigner.claim.estimateGas(address, amountBN, proof);
    const gasCost = gasPrice * BigInt(gasLimit.toString());

    // Get signer address and balance
    const signerAddress = await (await signer).getAddress();
    const balance = await provider.getBalance(signerAddress);

    // Check if there is enough balance
    const balanceBigInt = BigInt(balance.toString());
    if (balanceBigInt < gasCost) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Execute the claim
    // Make sure to use the correct method call syntax for ethers v6
    const tx = await contractWithSigner.claim(address, amountBN, proof);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();  // This should work with ethers v6

    // Process events with proper typing
    const events = receipt.events?.filter(
      (event: ClaimEvent) => event.event === 'Claim'
    );
    const claimedAddresses = events?.map((event: ClaimEvent) => event.args[0]);

    return NextResponse.json({
      success: true,
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      gasCost: gasCost.toString(),
      timestamp: receipt.timestamp
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Airdrop claim failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
