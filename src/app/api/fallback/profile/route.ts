import { NextRequest } from "next/server";
import { db, ProfileData } from "@/utils/dbUtils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateParams,
  isValidEthereumAddress,
  logApiError
} from "@/utils/apiUtils";

// GET endpoint to retrieve profile data from database
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
    
    // Get profile from database
    const profile = await db.getProfileData(address);
    
    if (!profile) {
      return createSuccessResponse({
        address,
        hasProfile: false,
        tokenId: null,
        baseAmount: null,
        bonusAmount: null,
        claimed: false,
        claimTimestamp: null
      });
    }
    
    // Return the data
    return createSuccessResponse({
      address,
      hasProfile: true,
      tokenId: profile.tokenId,
      baseAmount: profile.baseAmount,
      bonusAmount: profile.bonusAmount,
      claimed: profile.claimed,
      claimTimestamp: profile.claimTimestamp,
      metadata: profile.metadata
    });
    
  } catch (error: any) {
    logApiError("/api/fallback/profile", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// POST endpoint to store profile data in database
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate required parameters
    const validation = validateParams(body, ["address"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { 
      address, 
      tokenId, 
      baseAmount, 
      bonusAmount, 
      claimed = false, 
      claimTimestamp, 
      metadata 
    } = body;
    
    // Validate address
    if (!isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Create profile object
    const profile: ProfileData = {
      address,
      tokenId,
      baseAmount,
      bonusAmount,
      claimed,
      claimTimestamp,
      metadata
    };
    
    // Store profile in database
    await db.storeProfileData(profile);
    
    // Return success
    return createSuccessResponse({
      success: true,
      message: "Profile data stored in database",
      address
    });
    
  } catch (error: any) {
    logApiError("/api/fallback/profile", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}

// PATCH endpoint to mark profile as claimed
export async function PATCH(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate required parameters
    const validation = validateParams(body, ["address"]);
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        `Missing required parameters: ${validation.missingParams.join(", ")}`
      );
    }
    
    const { address } = body;
    
    // Validate address
    if (!isValidEthereumAddress(address)) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid address format"
      );
    }
    
    // Get existing profile
    const existingProfile = await db.getProfileData(address);
    
    if (!existingProfile) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Profile not found"
      );
    }
    
    // Update profile
    const updatedProfile: ProfileData = {
      ...existingProfile,
      claimed: true,
      claimTimestamp: Date.now()
    };
    
    // Store updated profile
    await db.storeProfileData(updatedProfile);
    
    // Return success
    return createSuccessResponse({
      success: true,
      message: "Profile marked as claimed",
      address,
      claimTimestamp: updatedProfile.claimTimestamp
    });
    
  } catch (error: any) {
    logApiError("/api/fallback/profile", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Internal server error",
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}
