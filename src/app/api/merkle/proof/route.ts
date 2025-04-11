import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ethers } from "ethers";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateParams,
  isValidEthereumAddress,
  logApiError
} from "@/utils/apiUtils";
import crypto from 'crypto';

// Mock merkle tree data - in a real app, this would be stored in a database or fetched from IPFS
const MOCK_MERKLE_ROOT = "0x8a29648bed032bf77f4ab0da8b6f9599f3c5b1726bb5169767ee9165f7cf7b50";

// Whitelist of addresses - in a real app, this would be stored in a database
const WHITELISTED_ADDRESSES = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  // Add more addresses as needed
];

// Mock function to generate a merkle proof
// In a real application, you would use a proper merkle tree library
const generateMockMerkleProof = (address: string): string[] => {
  // Create a deterministic but random-looking proof based on the address
  const hash = crypto.createHash('sha256').update(address).digest('hex');
  
  // Generate 3 proof elements
  return [
    '0x' + hash.substring(0, 64),
    '0x' + hash.substring(2, 66),
    '0x' + hash.substring(4, 68),
  ];
};

// GET endpoint to retrieve merkle proof for an address
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
    
    // Check if address is whitelisted
    const isWhitelisted = WHITELISTED_ADDRESSES.some(
      addr => addr.toLowerCase() === address.toLowerCase()
    );
    
    if (!isWhitelisted) {
      return createSuccessResponse({
        address,
        isWhitelisted: false,
        proof: null,
        amount: "0"
      });
    }
    
    // Generate mock proof
    const proof = generateMockMerkleProof(address);
    
    // Generate a deterministic but random-looking amount based on the address
    const hash = crypto.createHash('sha256').update(address).digest('hex');
    const amount = ethers.parseEther((parseInt(hash.substring(0, 4), 16) % 100 + 10).toString());
    
    // Return the data
    return createSuccessResponse({
      address,
      isWhitelisted: true,
      proof,
      amount: amount.toString(),
      merkleRoot: MOCK_MERKLE_ROOT
    });
    
  } catch (error: any) {
    logApiError("/api/merkle/proof", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// POST endpoint to verify a merkle proof
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.address) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required"
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required parameters
    const validation = validateParams(body, ["address", "proof"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { address, proof } = body;
    
    // Validate address
    if (!isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Verify the address matches the authenticated user
    if (session.user.address.toLowerCase() !== address.toLowerCase()) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "Address does not match authenticated user"
      );
    }
    
    // Verify the proof is an array
    if (!Array.isArray(proof)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Proof must be an array"
      );
    }
    
    // In a real implementation, you would verify the merkle proof
    // This is a simplified example that just checks if the address is whitelisted
    
    const isWhitelisted = WHITELISTED_ADDRESSES.some(
      addr => addr.toLowerCase() === address.toLowerCase()
    );
    
    if (!isWhitelisted) {
      return createErrorResponse(
        ErrorCode.FORBIDDEN,
        "Address is not whitelisted"
      );
    }
    
    // Return success
    return createSuccessResponse({
      verified: true,
      address,
      merkleRoot: MOCK_MERKLE_ROOT
    });
    
  } catch (error: any) {
    logApiError("/api/merkle/proof", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}
