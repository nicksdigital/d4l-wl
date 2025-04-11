'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';
import { useGaslessTransactions } from '@/hooks/useGaslessTransactions';
import { useD4LToken } from '@/hooks/useD4LToken';

export default function GaslessRegistration() {
  const { address, isConnected } = useAccount();
  const { status: authStatus } = useSession();
  const { registerUser, isLoading, error } = useGaslessTransactions();
  const { refreshBalance } = useD4LToken();
  
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);

  // Check if user is already registered
  useEffect(() => {
    if (isConnected && address) {
      checkRegistrationStatus();
    }
  }, [isConnected, address]);

  // Function to check if user is registered
  const checkRegistrationStatus = async () => {
    // This would typically call a contract method, but for demo purposes
    // we'll just set it to false initially
    setIsRegistered(false);
  };

  // Handle registration
  const handleRegister = async () => {
    if (!isConnected || !address) return;
    
    // Warn if not authenticated
    if (authStatus !== 'authenticated') {
      setRegistrationStatus('Note: You are not authenticated. This may affect the registration process.');
    }
    
    setRegistrationStatus('Registering...');
    
    try {
      const result = await registerUser();
      
      if (result.success) {
        setIsRegistered(true);
        setRegistrationStatus('Registration successful!');
        setTxHash(result.transactionHash || null);
        
        // Refresh token balance
        await refreshBalance();
      } else {
        setRegistrationStatus(`Registration failed: ${result.error}`);
      }
    } catch (err: any) {
      setRegistrationStatus(`Error: ${err.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-white">Gasless Registration</h2>
        <p className="text-gray-300">Please connect your wallet to register.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50 relative overflow-hidden">
      {/* Glassmorphism effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-4 text-white">Gasless Registration</h2>
        
        {error && (
          <div className="p-4 bg-red-900/30 rounded-lg mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {registrationStatus && (
          <div className={`p-4 ${isRegistered ? 'bg-green-900/30' : 'bg-blue-900/30'} rounded-lg mb-4`}>
            <p className={isRegistered ? 'text-green-400' : 'text-blue-400'}>{registrationStatus}</p>
            
            {txHash && (
              <a 
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 block mt-2"
              >
                View transaction on BaseScan
              </a>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-gray-300 mb-2">
            Register to receive D4L tokens without paying gas fees. Our backend will cover the gas costs for you.
          </p>
          
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-gray-300 mb-2">Your wallet address:</p>
            <p className="font-mono text-sm break-all text-white">{address}</p>
          </div>
        </div>
        
        <button
          onClick={handleRegister}
          disabled={isLoading || isRegistered}
          className={`w-full py-3 rounded-lg transition-colors ${
            isRegistered
              ? 'bg-green-600 cursor-not-allowed'
              : isLoading
              ? 'bg-blue-700 opacity-75'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRegistered
            ? 'Registration Complete'
            : isLoading
            ? 'Processing...'
            : 'Register (Gasless)'}
        </button>
        
        {isRegistered && (
          <p className="text-green-400 text-sm mt-2">
            You are now registered and eligible to receive D4L tokens!
          </p>
        )}
      </div>
    </div>
  );
}
