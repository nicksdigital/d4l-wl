import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce } from '@/lib/auth/authToken';

type ResponseData = {
  nonce: string;
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
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Generate a random nonce for this address
    const nonce = generateNonce();

    // In a real application, you might want to store this nonce in a database
    // with the address and an expiration time to prevent replay attacks
    
    return res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return res.status(500).json({ error: 'Failed to generate nonce' });
  }
}
