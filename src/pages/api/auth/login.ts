import type { NextApiRequest, NextApiResponse } from 'next';
import { createAuthToken, getAuthMessage, verifySignature } from '@/lib/auth/authToken';
import { verifyMessage } from 'ethers/lib/utils';

type ResponseData = {
  success: boolean;
  address?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, signature, nonce } = req.body;

    if (!address || !signature || !nonce) {
      return res.status(400).json({ error: 'Address, signature, and nonce are required' });
    }

    // Recreate the message that was signed
    const message = getAuthMessage(address, nonce);

    // Verify the signature
    try {
      const recoveredAddress = verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid signature format' });
    }

    // Create and store the auth token
    createAuthToken(address, signature);

    // Return success response
    return res.status(200).json({ 
      success: true,
      address 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
