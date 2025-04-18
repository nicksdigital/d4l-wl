import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const AUTH_COOKIE = 'd4l-auth-token';
const API_RPC_ROUTE = '/api/rpc';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore requests for public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/auth') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if it's an API RPC request
  if (pathname === API_RPC_ROUTE) {
    // Check if the auth token exists in cookies or Authorization header
    const token = req.cookies.get(AUTH_COOKIE) || req.headers.get('Authorization');
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico, manifest.json (browsers files)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
