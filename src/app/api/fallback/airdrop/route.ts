import { NextRequest } from "next/server";
import { ethers } from "ethers";
import { db, AirdropClaim } from "@/utils/dbUtils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateParams,
  isValidEthereumAddress,
  logApiError
} from "@/utils/apiUtils";

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
