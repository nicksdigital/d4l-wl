import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Add request headers for better error handling
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', crypto.randomUUID());

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Skip auth check for authentication endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Only apply to API routes that should be protected
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    try {
      const token = await getToken({ req: request });

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }
  }

  // Continue with modified request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    // Protected API routes that require authentication
    '/api/protected/:path*',
    // All API routes
    '/api/:path*',
    // Skip Next.js system routes and static assets
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
