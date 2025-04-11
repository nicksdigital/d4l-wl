import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip auth check for authentication endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Only apply to API routes that should be protected
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    // Protected API routes that require authentication
    '/api/protected/:path*',
    // Skip Next.js system routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
