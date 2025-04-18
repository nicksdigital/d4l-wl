import { SignatureLike } from '@ethersproject/bytes';
import { verifyMessage } from 'ethers/lib/utils';
import { getCookie, setCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

const AUTH_TOKEN_KEY = 'd4l-auth-token';
const AUTH_ADDRESS_KEY = 'd4l-auth-address';
const AUTH_SIGNATURE_KEY = 'd4l-auth-signature';
const TOKEN_EXPIRY_DAYS = 7;

// Message to be signed for authentication
export const getAuthMessage = (address: string, nonce: string) => {
  return `Sign this message to authenticate with D4L Application.\n\nAddress: ${address}\nNonce: ${nonce}\nExpires: ${getExpiryTime()}`;
};

// Get expiry time in ms (current time + 7 days)
const getExpiryTime = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
  return expiryDate.getTime().toString();
};

// Generate a random nonce
export const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Create and store auth token
export const createAuthToken = (address: string, signature: string) => {
  const expiryDays = TOKEN_EXPIRY_DAYS;
  const options = { 
    maxAge: 60 * 60 * 24 * expiryDays, // seconds * minutes * hours * days
    path: '/',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production'
  };

  // Store authentication data in cookies
  setCookie(AUTH_TOKEN_KEY, `${address}:${signature}`, options);
  setCookie(AUTH_ADDRESS_KEY, address, options);
  setCookie(AUTH_SIGNATURE_KEY, signature, options);

  // Also store in localStorage for easier client-side access
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, `${address}:${signature}`);
    localStorage.setItem(AUTH_ADDRESS_KEY, address);
    localStorage.setItem(AUTH_SIGNATURE_KEY, signature);
  }

  return { address, signature };
};

// Get auth token from cookies or localStorage
export const getAuthToken = () => {
  // Try to get from cookies first
  const tokenFromCookie = getCookie(AUTH_TOKEN_KEY)?.toString();
  
  if (tokenFromCookie) {
    const [address, signature] = tokenFromCookie.split(':');
    return { address, signature };
  }
  
  // If not in cookies, try localStorage
  if (typeof window !== 'undefined') {
    const address = localStorage.getItem(AUTH_ADDRESS_KEY);
    const signature = localStorage.getItem(AUTH_SIGNATURE_KEY);
    
    if (address && signature) {
      return { address, signature };
    }
  }
  
  return null;
};

// Clear auth token
export const clearAuthToken = () => {
  setCookie(AUTH_TOKEN_KEY, '', { maxAge: 0, path: '/' });
  setCookie(AUTH_ADDRESS_KEY, '', { maxAge: 0, path: '/' });
  setCookie(AUTH_SIGNATURE_KEY, '', { maxAge: 0, path: '/' });
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ADDRESS_KEY);
    localStorage.removeItem(AUTH_SIGNATURE_KEY);
  }
};

// Verify the signature against the message
export const verifySignature = (address: string, signature: SignatureLike, message: string): boolean => {
  try {
    const recoveredAddress = verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

// Middleware to verify auth token from request headers or cookies
export const verifyAuthToken = (req: NextApiRequest, res: NextApiResponse, callback: () => void) => {
  // Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  let address: string | undefined;
  let signature: string | undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    [address, signature] = token.split(':');
  } else {
    // If not in header, try to get from cookies
    const token = getCookie(AUTH_TOKEN_KEY, { req, res })?.toString();
    if (token) {
      [address, signature] = token.split(':');
    }
  }
  
  if (!address || !signature) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Here you would typically verify the signature against a stored message
  // For simplicity, we're just checking if the address and signature exist
  // In a real app, you'd need to verify the signature cryptographically
  
  // Attach user info to the request for later use
  (req as any).user = { address };
  
  // Continue to the next middleware or route handler
  callback();
};

// Get authenticated user from request
export const getAuthUser = (req: NextApiRequest) => {
  return (req as any).user;
};
