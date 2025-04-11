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
import { AirdropControllerABI } from '@/contracts/abi';

// GET endpoint to retrieve airdrop claim status from database
export async function GET(request: NextRequest) {
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
    
  } catch (error: any) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// POST endpoint to store airdrop claim in database
export async function POST(request: NextRequest) {
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
      ethers.parseUnits(amount, 18); // Validate that amount is a valid number
    } catch (error) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid amount format"
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
    
  } catch (error: any) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// PATCH endpoint to update airdrop claim status
export async function PATCH(request: NextRequest) {
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
    
  } catch (error: any) {
    logApiError("/api/fallback/airdrop", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// Fallback airdrop endpoint
export async function FALLBACK(request: NextRequest) {
  try {
    const { address, amount, proof } = await request.json();

    if (!address || !amount || !proof) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
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
    const signer = provider.getSigner();

    // Get the contract with the signer
    const contractWithSigner = contract.connect(signer);

    // Get the gas price
    const gasPrice = await provider.getGasPrice();

    // Get the gas limit
    const gasLimit = await contractWithSigner.estimateGas.claim(
      address,
      amount,
      proof
    );

    // Get the gas cost
    const gasCost = gasPrice.mul(gasLimit);

    // Get the balance
    const balance = await provider.getBalance(signer.getAddress());

    // Check if there is enough balance
    if (balance.lt(gasCost)) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Execute the claim
    const tx = await contractWithSigner.claim(
      address,
      amount,
      proof
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toNumber(),
      gasPrice: gasPrice.toNumber(),
      gasCost: gasCost.toNumber(),
      timestamp: receipt.timestamp
    });
  } catch (error: any) {
    console.error('Fallback airdrop error:', error);
    return NextResponse.json(
      { error: 'Fallback airdrop failed' },
      { status: 500 }
    );
  }
}
