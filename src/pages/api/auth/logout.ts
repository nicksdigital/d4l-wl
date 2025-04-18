import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthToken } from '@/lib/auth/authToken';

type ResponseData = {
  success: boolean;
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
    // Clear the auth token
    clearAuthToken();

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}
