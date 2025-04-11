'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useD4LToken } from '@/hooks/useD4LToken';
import { useGaslessTransactions } from '@/hooks/useGaslessTransactions';
import WalletButton from '@/components/wallet/WalletButton';
import Link from 'next/link';

export default function TransferPage() {
  const { address, isConnected } = useAccount();
  const { balance, refreshBalance } = useD4LToken();
  const { transferTokens, isLoading } = useGaslessTransactions();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Format balance for display
  const formattedBalance = parseFloat(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Handle transfer
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Validate input
    if (!recipient || !amount) {
      setError('Please enter both recipient address and amount');
      return;
    }
    
    // Validate recipient address
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Invalid recipient address');
      return;
    }
    
    // Validate amount
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    // Check if user has enough balance
    if (amountFloat > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }
    
    try {
      // Execute gasless transfer
      const result = await transferTokens(recipient, amount);
      
      if (result.success) {
        // Show success message
        setSuccess(`Successfully transferred ${amount} D4L tokens to ${recipient.substring(0, 6)}...${recipient.substring(38)}`);
        
        // Reset form
        setRecipient('');
        setAmount('');
        
        // Refresh balance
        await refreshBalance();
      } else {
        setError(result.error || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfer D4L Tokens</h1>
          <p className="text-lg">
            Send D4L tokens to another address.
          </p>
        </div>

        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
          <div className="text-center py-8">
            <p className="mb-4 text-gray-300">Please connect your wallet to transfer tokens.</p>
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Transfer D4L Tokens</h1>
        <p className="text-lg text-gray-300">
          Send D4L tokens to another address.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50 relative overflow-hidden">
          {/* Glassmorphism effects */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-4 text-white">Transfer Form</h2>
            
            {error && (
              <div className="p-4 bg-red-900/30 rounded-lg mb-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-900/30 rounded-lg mb-4">
                <p className="text-green-400">{success}</p>
              </div>
            )}
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block mb-1 text-gray-300">Recipient Address</label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block mb-1 text-gray-300">Amount</label>
                <div className="relative">
                  <input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">D4L</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-400">
                  Available: {formattedBalance} D4L
                </p>
                <button
                  type="button"
                  onClick={() => setAmount(balance)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Transfer Tokens'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 text-white">Your Balance</h2>
          
          <div className="flex items-center justify-center my-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{formattedBalance}</p>
              <p className="text-sm text-gray-400 mt-1">D4L Tokens</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <Link 
              href="/token"
              className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-center transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
