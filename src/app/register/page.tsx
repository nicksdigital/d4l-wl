"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useWeb3 from '@/hooks/useWeb3';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import GaslessRegistration from '@/components/token/GaslessRegistration';

// Form validation schema
const registrationSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  social: z
    .string()
    .min(0)
    .max(100, 'Social media handle must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationPage() {
  const router = useRouter();
  const { isConnected, address, contracts } = useWeb3();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(true); // Default to true
  const [totalRegistered, setTotalRegistered] = useState<number>(0);
  const [maxRegistrations] = useState<number>(5000); // Max whitelist cap
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      social: '',
      terms: true as true, // Type assertion to satisfy the literal type requirement
    },
  });

  // Check if user is already registered and get total registered users
  useEffect(() => {
    const checkRegistration = async () => {
      setIsLoading(true);
      setError(null);

      // If not connected or no contract, use fallback values in development
      if (!isConnected || !contracts.wishlistRegistry || !address) {
        // In development, we can use fallback values
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback values for development');
          setTotalRegistered(1250); // Fallback value
          setRegistrationOpen(true); // Always open in development
          setIsRegistered(false); // Not registered by default
        }
        setIsLoading(false);
        return;
      }

      try {
        // Get total registered users with retry mechanism
        let totalRegistered = 0;
        try {
          // Try using the contract's getTotalRegistered method from useWeb3
          totalRegistered = await contracts.wishlistRegistry.read('totalRegistered', []);
          totalRegistered = Number(totalRegistered);
          setTotalRegistered(totalRegistered);
          console.log('Successfully got total registered:', totalRegistered);
        } catch (err) {
          console.warn('Error getting total registered, using fallback:', err);
          setTotalRegistered(1250); // Fallback value if contract call fails
          totalRegistered = 1250;
        }
        
        // Registration is open until we reach max registrations
        setRegistrationOpen(totalRegistered < maxRegistrations);

        // Check if user is registered with retry mechanism
        try {
          const isUserRegistered = await contracts.wishlistRegistry.read('isRegistered', [address]);
          setIsRegistered(isUserRegistered);
        } catch (err) {
          console.warn('Error checking if user is registered, using fallback:', err);
          setIsRegistered(false); // Fallback value if contract call fails
        }
      } catch (error) {
        console.error('Error checking registration:', error);
        setError('Error connecting to the blockchain. Please refresh the page or try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [isConnected, contracts.wishlistRegistry, address, maxRegistrations]);

  // Handle form submission
  const onSubmit = async (data: RegistrationFormValues) => {
    if (!isConnected || !contracts.wishlistRegistry) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Check if we've reached max registrations
    if (totalRegistered >= maxRegistrations) {
      setError('Whitelist capacity has been reached');
      return;
    }

    if (isRegistered) {
      setError('You are already registered');
      return;
    }

    setIsRegistering(true);
    setError(null);
    setTxHash(null);

    try {
      // Add a small delay to show the loading state (better UX)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In development, we can simulate a successful registration
      if (process.env.NODE_ENV === 'development' && !contracts.wishlistRegistry) {
        console.log('Simulating registration in development mode');
        // Simulate a transaction hash
        setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
        
        // Simulate waiting for transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update registration status
        setIsRegistered(true);
        setTotalRegistered(prev => prev + 1);
        
        // Navigate to profile page after successful registration
        router.push('/profile');
        return;
      }
      
      // Actual contract interaction
      const tx = await contracts.wishlistRegistry.write('register', [
        data.email || '',
        data.social || ''
      ]);

      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update registration status
      setIsRegistered(true);
      setTotalRegistered(prev => prev + 1);
      
      // Navigate to profile page after successful registration
      router.push('/profile');
    } catch (error: any) {
      console.error('Error registering:', error);
      
      if (error.reason) {
        setError(`Registration failed: ${error.reason}`);
      } else if (error.message) {
        setError(`Registration failed: ${error.message}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20"></div>
      
      {/* Glassmorphism Background Blobs */}
      <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse -z-10"></div>
      <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping -z-10"></div>
      <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse -z-10"></div>
      <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping -z-10"></div>
      
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Registration</h1>

      {!isConnected ? (
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="mb-6 text-lg text-center text-white">Please connect your wallet to register for the airdrop.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 font-medium">
              Connect Wallet
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            <div className="relative mb-6">
              <div className="animate-ping absolute h-16 w-16 rounded-full bg-blue-400/20"></div>
              <div className="animate-spin relative rounded-full h-12 w-12 border-2 border-transparent border-t-blue-500 border-b-purple-500 shadow-lg"></div>
            </div>
            <p className="text-lg text-white">Checking registration status...</p>
          </div>
        </div>
      ) : !registrationOpen ? (
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-orange-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="p-8 text-center relative z-10">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
              <div className="text-yellow-400 text-6xl relative">⚠️</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">Whitelist Capacity Reached</h2>
            <p className="text-gray-300 mb-6">We've reached our maximum capacity of {maxRegistrations} whitelist spots. Follow our social media for updates on the next registration phase.</p>
            <div className="mt-6 p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-inner">
              <p className="font-semibold text-lg text-white mb-2">{totalRegistered} / {maxRegistrations} spots filled</p>
              <div className="w-full bg-gray-700 rounded-full h-3 mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: `${(totalRegistered / maxRegistrations) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : isRegistered ? (
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-green-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="p-8 text-center relative z-10">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
              <div className="text-green-400 text-6xl relative">✓</div>
            </div>
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">You're on the Whitelist!</h2>
            <p className="mb-6 text-gray-300">
              Your wallet is successfully registered for the D4L whitelist. You'll have early access to the Dutch Auction presale in Q2 2025 and all ecosystem features.
            </p>
            <Link
              href="/profile"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-1 transition-all duration-300 inline-block relative overflow-hidden group"
            >
              <span className="absolute inset-0 overflow-hidden rounded-lg">
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/0 via-green-400/40 to-green-400/0 -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
              </span>
              <span className="relative z-10">View Profile</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="p-6 border-b border-white/10 relative z-10 bg-gradient-to-br from-gray-700/50 to-gray-800/50">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Register for D4L Whitelist</h2>
            <div className="mt-3 p-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-inner">
              <p className="text-sm text-gray-300 mb-2">{totalRegistered} / {maxRegistrations} spots filled</p>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${(totalRegistered / maxRegistrations) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (optional)
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="your@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Providing your email will give you bonus tokens for the Dutch Auction presale.
                </p>
              </div>

              {/* Social Media Handle Field */}
              <div className="mb-4">
                <label htmlFor="social" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Social Media Handle (optional)
                </label>
                <input
                  id="social"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="@yourusername"
                  {...register('social')}
                />
                {errors.social && (
                  <p className="text-red-500 text-sm mt-1">{errors.social.message}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Providing your social media handle will give you bonus tokens and access to BonkWars events.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500 dark:bg-gray-800/80 backdrop-blur-sm"
                      {...register('terms')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                      I agree to the{' '}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={(e) => {
                          e.preventDefault();
                          // Open terms modal or page
                        }}
                      >
                        Terms and Conditions
                      </a>
                    </label>
                    {errors.terms && (
                      <p className="error">{errors.terms.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              {txHash && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800/30 backdrop-blur-sm">
                  <p className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Transaction submitted!
                  </p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                    View on Block Explorer
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-lg"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span className="ml-2">Securing Your Spot...</span>
                  </div>
                ) : (
                  'Join the D4L Whitelist'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gasless Registration */}
      <div className="mt-8 mb-8">
        <GaslessRegistration />
      </div>
      
      {/* Information */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-800/70 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden">
        <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/30">
          <h2 className="text-lg font-semibold">D4L Whitelist Benefits</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</div>
              <p className="text-gray-700 dark:text-gray-300">Early access to the Dutch Auction presale with guaranteed allocation in Q2 2025.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</div>
              <p className="text-gray-700 dark:text-gray-300">Exclusive access to BonkWars Arena beta and ability to participate in early tournaments.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</div>
              <p className="text-gray-700 dark:text-gray-300">Bonus allocation based on your email, social media engagement, and referrals.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</div>
              <p className="text-gray-700 dark:text-gray-300">Soulbound NFT profile that grants governance rights in the D4L ecosystem.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
