/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getContractAddresses } from "@/utils/contractUtils";
import { ethers as ethersLib } from "ethers";
import { AirdropControllerABI } from "@/contracts/abis";
import { rateLimit } from '@/utils/rateLimit';

// Rate limiting setup
const rateLimitConfig = {
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
  const resetTime = now + rateLimitConfig.windowMs;
  
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
  if (requestData.count >= rateLimitConfig.max) {
    return { 
      success: false, 
      message: rateLimitConfig.message
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
  return new ethersLib.JsonRpcProvider(rpcUrl);
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
    if (!ethersLib.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }
    
    // Get contract data
    const provider = getProvider();
    const addresses = getContractAddresses(84532); // Base Sepolia chain ID
    
    const airdropContract = new ethersLib.Contract(
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
    // Rate limit the endpoint
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimit('airdrop', ip);
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
    // @ts-ignore
    const { address, proof } = body;
    const claimAmount = body.amount;

    if (!address || !claimAmount || !proof) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the address is valid
    if (!ethersLib.isAddress(address)) {
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
    const provider = new ethersLib.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethersLib.Contract(
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
    const isValid = await contract.verifyProof(proof, address, claimAmount);
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
    const contractWithSigner = contract.connect(await signer) as ethersLib.Contract & {
      estimateGas: {
        "claim(address,uint256,bytes32[])": (address: string, amount: ethersLib.BigNumberish, proof: string[]) => Promise<ethersLib.BigNumberish>
      },
      "claim(address,uint256,bytes32[])": (address: string, amount: ethersLib.BigNumberish, proof: string[]) => Promise<ethersLib.ContractTransactionResponse>
    };

    // Get fee data (replaces getGasPrice)
    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) {
      return NextResponse.json(
        { error: 'Failed to get gas price data' },
        { status: 500 }
      );
    }
    const gasPrice = feeData.gasPrice;

    // Get gas limit and calculate cost
    const tokenAmount = ethersLib.parseUnits('1', 'ether');
    const gasLimit = await contractWithSigner.estimateGas["claim(address,uint256,bytes32[])"](address, tokenAmount, proof);
    const gasCost = Number(gasPrice) * Number(gasLimit);

    // Get signer address and balance
    const signerAddress = (await signer).getAddress();
    const balance = await provider.getBalance(signerAddress);

    // Check balance
    if (Number(balance) < Number(gasCost)) {
      return NextResponse.json(
        { error: 'Insufficient balance for gas' },
        { status: 400 }
      );
    }

    // Execute claim
    const tx = await contractWithSigner["claim(address,uint256,bytes32[])"](address, tokenAmount, proof);
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      gasUsed: receipt?.gasUsed,
      gasPrice: gasPrice,
      gasCost: gasCost
    });
  } catch (error: any) {
    console.error('Airdrop error:', error);
    return NextResponse.json(
      { error: 'Airdrop failed' },
      { status: 500 }
    );
  }
}
