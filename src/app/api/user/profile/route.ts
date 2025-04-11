import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ethers } from "ethers";
import { getContractAddresses } from "@/utils/contractUtils";
import { SoulboundProfileABI } from "@/contracts/abis";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateParams,
  logApiError
} from "@/utils/apiUtils";

// Helper function to get provider
const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("RPC URL not configured");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

// GET endpoint to retrieve user profile data
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user (middleware already checks this, but we do it again for type safety)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.address) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Authentication required"
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address") || session.user.address;
    
    // Validate address
    if (!ethers.isAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Get contract data
    const provider = getProvider();
    const addresses = getContractAddresses(84532); // Base Sepolia chain ID
    
    const profileContract = new ethers.Contract(
      addresses.soulboundProfile,
      SoulboundProfileABI,
      provider
    );
    
    // Check if user has a profile
    const hasProfile = await profileContract.hasProfile(address);
    
    if (!hasProfile) {
      return createSuccessResponse({
        address,
        hasProfile: false,
        profileId: null,
        tokenURI: null,
        airdropInfo: null
      });
    }
    
    // Get profile ID
    const profileId = await profileContract.getProfileId(address);
    
    // Get token URI
    const tokenURI = await profileContract.tokenURI(profileId);
    
    // Get airdrop info
    const airdropInfo = await profileContract.getAirdropInfo(profileId);
    
    // Return the data
    return createSuccessResponse({
      address,
      hasProfile: true,
      profileId: Number(profileId),
      tokenURI,
      airdropInfo: {
        baseAmount: Number(airdropInfo.baseAmount),
        bonusAmount: Number(airdropInfo.bonusAmount),
        claimed: airdropInfo.claimed,
        claimTimestamp: airdropInfo.claimTimestamp ? Number(airdropInfo.claimTimestamp) : null
      }
    });
    
  } catch (error: any) {
    logApiError("/api/user/profile", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// POST endpoint to update user profile data
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
    const validation = validateParams(body, ["tokenURI"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { tokenURI } = body;
    const address = session.user.address;
    
    // In a real implementation, you would update the profile on-chain
    // This is a simplified example that just returns success
    
    return createSuccessResponse({
      success: true,
      message: "Profile updated successfully",
      address,
      tokenURI
    });
    
  } catch (error: any) {
    logApiError("/api/user/profile", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}
