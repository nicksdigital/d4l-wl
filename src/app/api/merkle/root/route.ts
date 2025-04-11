import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  logApiError
} from "@/utils/apiUtils";

// Mock merkle root - in a real app, this would be stored in a database or fetched from IPFS
const MERKLE_ROOT = "0x8a29648bed032bf77f4ab0da8b6f9599f3c5b1726bb5169767ee9165f7cf7b50";

// GET endpoint to retrieve the current merkle root
export async function GET(request: NextRequest) {
  try {
    // Get session for authentication (optional)
    const session = await getServerSession(authOptions);
    
    // Return the merkle root
    return createSuccessResponse({
      merkleRoot: MERKLE_ROOT,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logApiError("Error getting merkle root", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to get merkle root"
    );
  }
}
