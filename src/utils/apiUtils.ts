import { NextResponse } from 'next/server';

// Standard response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: number;
  };
}

// Error codes
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
}

// HTTP status codes mapping
const statusCodes: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.CONTRACT_ERROR]: 500,
};

// Create a success response
export function createSuccessResponse<T>(
  data: T,
  meta?: Omit<ApiResponse<T>['meta'], 'timestamp'>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: Date.now(),
    },
  });
}

// Create an error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: Date.now(),
      },
    },
    { status: statusCodes[code] }
  );
}

// Validate request parameters
export function validateParams(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => !params[param]);
  return {
    isValid: missingParams.length === 0,
    missingParams,
  };
}

// Sanitize input to prevent injection attacks
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

// Validate Ethereum address
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Log API errors with proper sanitization
export function logApiError(
  endpoint: string,
  error: any,
  requestData?: any
): void {
  // Sanitize sensitive data before logging
  const sanitizedRequestData = requestData
    ? JSON.parse(
        JSON.stringify(requestData, (key, value) => {
          // Mask sensitive fields
          if (
            ['password', 'token', 'secret', 'key', 'signature'].includes(
              key.toLowerCase()
            )
          ) {
            return '[REDACTED]';
          }
          return value;
        })
      )
    : undefined;

  console.error(`API Error [${endpoint}]:`, {
    message: error.message,
    stack: error.stack,
    requestData: sanitizedRequestData,
    timestamp: new Date().toISOString(),
  });
}
