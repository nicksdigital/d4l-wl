import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthToken } from '@/lib/auth/authToken';

type ResponseData = {
  authenticated: boolean;
  address?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the auth token
    const authToken = getAuthToken();

    if (!authToken) {
      return res.status(200).json({ authenticated: false });
    }

    // Here you could add additional verification if needed
    // For example, checking if the token has expired

    // Return authentication status
    return res.status(200).json({ 
      authenticated: true,
      address: authToken.address 
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
