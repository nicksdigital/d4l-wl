import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ContentTags } from './lib/cache';

// Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.walletconnect.com https://*.walletconnect.org https://cdn.jsdelivr.net https://unpkg.com https://*.infura.io https://api.web3modal.com https://api.web3modal.org https://pulse.walletconnect.org https://verify.walletconnect.org https://explorer-api.walletconnect.com https://registry.walletconnect.org https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://*.ipfs.io https://ipfs.io https://*.gateway.ipfs.io https://gateway.ipfs.io https://*.infura.io https://*.walletconnect.com https://*.walletconnect.org;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.infura.io wss://*.walletconnect.com wss://*.walletconnect.org wss://*.infura.io https://d4l.ai https://api.d4l.ai https://*.ipfs.io https://ipfs.io https://*.gateway.ipfs.io https://gateway.ipfs.io https://api.web3modal.com https://api.web3modal.org https://rpc.walletconnect.org https://pulse.walletconnect.org https://verify.walletconnect.org https://explorer-api.walletconnect.com https://registry.walletconnect.org https://api.blocknative.com https://api.coingecko.com https://ethereum-api.xyz https://eth-mainnet.g.alchemy.com https://base-sepolia.g.alchemy.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

export async function middleware(request: NextRequest) {
  // Clone the response so we can modify headers
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  
  // Check if the request is for an API route or admin route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname.startsWith('/api/admin');
  
  // Always invalidate cache for admin routes
  if (isAdminRoute) {
    // This is a server action that will be executed
    // We can't directly call revalidateTag here due to middleware limitations
    // Instead, we'll set a header that our admin API can check for
    response.headers.set('x-revalidate-admin-cache', 'true');
  }
  
  // For API routes, add additional checks
  if (isApiRoute) {
    // Skip auth check for the auth API route itself
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return response;
    }
    
    // Check for API key for public endpoints
    const apiKey = request.headers.get('x-api-key');
    const publicApiKey = process.env.PUBLIC_API_KEY;
    
    // If it's a public API with a valid key, allow access
    if (apiKey && publicApiKey && apiKey === publicApiKey) {
      return response;
    }
    
    // For authentication, we'll check for a session cookie
    // This is a simplified check - in a real app with NextAuth.js properly installed,
    // you would use getToken from next-auth/jwt
    const hasSession = request.cookies.has('next-auth.session-token') || 
                      request.cookies.has('__Secure-next-auth.session-token');
    
    // If no session and not a public API, deny access
    if (!hasSession) {
      // For now, we'll just let the request through and let the API routes handle auth
      // In a production app, you would deny access here
      console.log('No session detected, but allowing request to proceed to API route');
      
      // Uncomment below to enforce auth at the middleware level
      /*
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(securityHeaders.map(h => [h.key, h.value])),
          },
        }
      );
      */
    }
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Exclude Next.js static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
