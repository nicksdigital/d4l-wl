import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import WishlistRegistryABI from '@/abis/WishlistRegistry.json';
import { getProvider } from '@/utils/providers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: { message: 'Address parameter is required' } });
    }
    
    // Validate address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: { message: 'Invalid Ethereum address' } });
    }

    const provider = getProvider();
    const wishlistRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.WISHLIST_REGISTRY,
      WishlistRegistryABI.abi,
      provider
    );
    
    const isRegistered = await wishlistRegistry.isRegistered(address);
    
    return res.status(200).json({
      data: { isRegistered },
      error: null
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return res.status(500).json({ 
      error: { 
        message: error instanceof Error ? error.message : 'Failed to check registration status' 
      } 
    });
  }
}
