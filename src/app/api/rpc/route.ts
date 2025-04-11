import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  logApiError
} from '@/utils/apiUtils';

// RPC proxy endpoint for secure blockchain interactions
export async function POST(request: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);
    
    // Only allow authenticated users
    if (!session || !session.user) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        'Authentication required'
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Validate the request
    if (!body.method || !body.params) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid request format. Method and params are required.'
      );
    }
    
    // Use the private RPC URL from environment variables
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    
    if (!rpcUrl) {
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'RPC URL not configured'
      );
    }
    
    // Create the JSON-RPC request
    const rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: body.method,
      params: body.params
    };
    
    // Forward the request to the RPC provider
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rpcRequest)
    });
    
    // Get the response
    const data = await response.json();
    
    // Return the response
    return createSuccessResponse(data);
  } catch (error) {
    logApiError('Error in RPC proxy', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to process RPC request'
    );
  }
}
