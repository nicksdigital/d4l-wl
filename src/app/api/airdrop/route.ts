import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getContractAddresses } from "@/utils/contractUtils";
import { ethers } from "ethers";
import { AirdropControllerABI } from "@/contracts/abis";

// Rate limiting setup
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
};

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
const applyRateLimit = (ip: string): { success: boolean; message?: string } => {
  const now = Date.now();
  const resetTime = now + rateLimit.windowMs;
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 1, resetTime });
    return { success: true };
  }
  
  const requestData = ipRequests.get(ip)!;
  
  // Reset count if the window has passed
  if (now > requestData.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime });
    return { success: true };
  }
  
  // Check if limit exceeded
  if (requestData.count >= rateLimit.max) {
    return { 
      success: false, 
      message: rateLimit.message
    };
  }
  
  // Increment count
  requestData.count += 1;
  ipRequests.set(ip, requestData);
  return { success: true };
};

// Helper function to get provider
const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("RPC URL not configured");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = applyRateLimit(ip);
    
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
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
    
    // Get contract data
    const provider = getProvider();
    const addresses = getContractAddresses(84532); // Base Sepolia chain ID
    
    const airdropContract = new ethers.Contract(
      addresses.airdropController,
      AirdropControllerABI,
      provider
    );
    
    // Get airdrop status
    const airdropStatus = await airdropContract.getAirdropStatus();
    
    // Check if user has claimed
    const hasClaimed = await airdropContract.hasClaimed(address);
    
    // Return the data
    return NextResponse.json({
      status: {
        isActive: airdropStatus.isActive,
        isPaused: airdropStatus.isPaused,
        startTime: Number(airdropStatus.startTime),
      },
      userInfo: {
        address,
        hasClaimed,
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint for claiming airdrops
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = applyRateLimit(ip);
    
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
    const { address, signature } = body;
    
    if (!address || !signature) {
      return NextResponse.json(
        { error: "Address and signature are required" },
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
    
    // In a real implementation, you would verify the signature and process the claim
    // This is a simplified example
    
    return NextResponse.json({
      success: true,
      message: "Airdrop claim processed",
      txHash: "0x" + Array(64).fill("0").join(""), // Placeholder transaction hash
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
