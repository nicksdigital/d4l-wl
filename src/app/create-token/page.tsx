"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useWeb3 from '@/hooks/useWeb3';
import Image from 'next/image';
import Link from 'next/link';

// Define interface for token form data
interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  initialSupply: string;
  decimals: string;
  image: File | null;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const { isConnected, address, contracts } = useWeb3();
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    initialSupply: '1000000',
    decimals: '18',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [rewardPoints, setRewardPoints] = useState<number>(0);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate random reward points between 50 and 500
  const generateRewardPoints = () => {
    return Math.floor(Math.random() * 451) + 50; // Random between 50 and 500
  };

  // Submit form to create token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    if (!isConnected || !address || !contracts.tokenFactory) {
      setError('Wallet not connected or contract not available.');
      setIsCreating(false);
      return;
    }

    try {
      // Validate form data
      if (!formData.name || !formData.symbol || !formData.description) {
        throw new Error('Please fill in all required fields.');
      }

      // Convert values
      const initialSupply = BigInt(parseFloat(formData.initialSupply) * Math.pow(10, parseInt(formData.decimals)));
      const decimals = parseInt(formData.decimals);

      // Create token on-chain
      const tx = await contracts.tokenFactory.write.createToken([
        formData.name,
        formData.symbol,
        decimals,
        initialSupply,
        address
      ]);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Parse events to get token address
      const events = receipt?.logs || [];
      let newTokenAddress = '';
      
      // Find token creation event
      for (const event of events) {
        // This is a simplification - in a real app, you'd decode the event properly
        if (event.topics && event.topics[0] === '0x...' /* The topic for token creation event */) {
          // Extract token address from event
          newTokenAddress = '0x' + event.topics[1].slice(26);
          break;
        }
      }

      if (!newTokenAddress) {
        newTokenAddress = "0x..."; // Placeholder for demo
      }

      setTokenAddress(newTokenAddress);
      
      // Upload image to backend (mock for now)
      if (formData.image) {
        // In a real app, you'd upload the image to IPFS or your backend
        console.log('Uploading image:', formData.image.name);
      }
      
      // Generate and set reward points
      const points = generateRewardPoints();
      setRewardPoints(points);
      
      // Mock API call to backend to store token metadata and reward user
      // In a real app, you'd send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Successfully created token ${formData.name} (${formData.symbol}). You earned ${points} reward points!`);
    } catch (err: any) {
      console.error('Error creating token:', err);
      setError(err.message || 'Failed to create token. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Create Your Token</h1>
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-8 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="flex flex-col items-center justify-center py-8 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="mb-6 text-lg text-center text-white">Please connect your wallet to create a token.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 font-medium">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Create Your Token</h1>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Token Creation Form */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
            <div className="relative z-10">
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{success}</p>
                  </div>
                  
                  {tokenAddress && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <p className="font-medium text-white mb-2">Token Address:</p>
                      <p className="font-mono text-sm break-all text-white">{tokenAddress}</p>
                      <div className="mt-4 flex space-x-4">
                        <Link 
                          href={`/token/${tokenAddress}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-block transition-colors"
                        >
                          View Token
                        </Link>
                        <button 
                          onClick={() => {
                            // Reset form
                            setFormData({
                              name: '',
                              symbol: '',
                              description: '',
                              initialSupply: '1000000',
                              decimals: '18',
                              image: null,
                            });
                            setImagePreview(null);
                            setSuccess(null);
                            setTokenAddress(null);
                            setRewardPoints(0);
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg inline-block transition-colors"
                        >
                          Create Another Token
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              {!success && (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                        Token Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. My Awesome Token"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="symbol" className="block text-sm font-medium text-white mb-1">
                        Token Symbol <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="symbol"
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        placeholder="e.g. MAT"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your token and its purpose"
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="initialSupply" className="block text-sm font-medium text-white mb-1">
                        Initial Supply
                      </label>
                      <input
                        type="text"
                        id="initialSupply"
                        name="initialSupply"
                        value={formData.initialSupply}
                        onChange={handleInputChange}
                        placeholder="e.g. 1000000"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="decimals" className="block text-sm font-medium text-white mb-1">
                        Decimals
                      </label>
                      <input
                        type="text"
                        id="decimals"
                        name="decimals"
                        value={formData.decimals}
                        onChange={handleInputChange}
                        placeholder="e.g. 18"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">Standard is 18 decimals (like ETH)</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="image" className="block text-sm font-medium text-white mb-1">
                      Token Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-700/50 border border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors">
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-400">
                            {formData.image ? 'Change Image' : 'Upload Image'}
                          </span>
                        </div>
                      </label>
                      {imagePreview && (
                        <div className="relative h-20 w-20 border border-gray-600 rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Token Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: null }));
                              setImagePreview(null);
                            }}
                            className="absolute top-0 right-0 h-6 w-6 bg-red-600 text-white rounded-bl-lg flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 font-medium flex items-center"
                    >
                      {isCreating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Token
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar with Information */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10 relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white mb-4">Token Creation Benefits</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Create your own ERC-20 token in seconds</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Earn reward points for the airdrop</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Full ownership and control of your tokens</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Customizable token parameters</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white mb-4">Reward Points</h2>
              <p className="text-gray-300 mb-4">
                Creating a token earns you between 50-500 reward points. These points increase your chances for the upcoming airdrop.
              </p>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Your Wallet:</p>
                <p className="font-mono text-sm mb-3 break-all text-white">{address}</p>
                <p className="text-sm text-gray-400 mb-1">Current Points:</p>
                <p className="text-2xl font-bold text-white">{rewardPoints}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
