"use client";

import { useState, useEffect } from 'react';
import { pageCacheConfig, ContentTags, cacheDataWithRedis, getCachedDataFromRedis } from '@/lib/cache';
import { useCachedData } from '@/hooks/useCachedData';
import Link from 'next/link';
import Image from 'next/image';
import useWeb3 from '@/hooks/useWeb3';
import { ArrowRightIcon, CheckCircleIcon, GlobeAltIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Page-specific caching behavior is configured in config.ts

// ClientOnly wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on first render to avoid SSR hydration issues
  return mounted ? <>{children}</> : null;
}

// Main Home component
export default function Home() {
  // Use a placeholder for the initial server render that doesn't use any web3 data
  // This prevents any web3 calls during SSR, avoiding the hydration mismatch
  return (
    <ClientOnly>
      <HomeContent />
    </ClientOnly>
  );
}

// Separate component for content that requires web3 data
function HomeContent() {
  const { isConnected, contracts, chainId } = useWeb3();

  // Use the cached data hook with content tagging for airdrop status
  const { data: airdropData, isLoading } = useCachedData(
    async () => {
      if (!isConnected || !contracts.airdropController || !contracts.wishlistRegistry) {
        return {
          airdropStatus: {
            isActive: false,
            isPaused: true,
            startTime: 0,
          },
          registrationStats: {
            totalRegistered: 0,
            totalMinted: 0,
            registrationOpen: false,
          }
        };
      }

      try {
        // Fetch data with Promise.all for better performance
        const [status, totalMinted, totalRegistered, registrationOpen] = await Promise.all([
          contracts.airdropController.read('getAirdropStatus'),
          contracts.airdropController.read('getTotalMinted'),
          contracts.wishlistRegistry.read('totalRegistered'),
          contracts.wishlistRegistry.read('registrationOpen'),
        ]);

        return {
          airdropStatus: {
            isActive: status.isActive,
            isPaused: status.isPaused,
            startTime: Number(status.startTime),
          },
          registrationStats: {
            totalRegistered: Number(totalRegistered),
            totalMinted: Number(totalMinted),
            registrationOpen,
          }
        };
      } catch (error) {
        console.error('Error fetching airdrop data:', error);
        return {
          airdropStatus: {
            isActive: false,
            isPaused: true,
            startTime: 0,
          },
          registrationStats: {
            totalRegistered: 0,
            totalMinted: 0,
            registrationOpen: false,
          }
        };
      }
    },
    'home-data',
    { chainId: chainId || 0 },
    [isConnected, contracts.airdropController, contracts.wishlistRegistry, chainId],
    pageCacheConfig.home.tags,
    pageCacheConfig.home.redisExpiration,
    // Generate a version based on the current timestamp (minute precision for home page)
    () => `${Math.floor(Date.now() / (60 * 1000))}`
  ) || {
    airdropStatus: {
      isActive: false,
      isPaused: true,
      startTime: 0,
    },
    registrationStats: {
      totalRegistered: 0,
      totalMinted: 0,
      registrationOpen: false,
    }
  };

  // Extract the data for easier access in the component
  const airdropStatus = airdropData?.airdropStatus || {
    isActive: false,
    isPaused: true,
    startTime: 0,
  };

  const registrationStats = airdropData?.registrationStats || {
    totalRegistered: 0,
    totalMinted: 0,
    registrationOpen: false,
  };

  // Format timestamp to date
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Not set';
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status message
  const getStatusMessage = () => {
    if (airdropStatus.isPaused) return 'Paused';
    if (!airdropStatus.isActive) return 'Not Active';
    return 'Active';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-16 relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Enhanced hero image with better visibility */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpeg"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover brightness-110 contrast-110"
            priority
          />
        </div>

        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-purple-600/60 z-0"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-30 z-0 animate-pulse-slow"></div>

        {/* Glassmorphism light effects */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-white/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/20 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 px-8 py-20 md:py-28 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 p-6 md:p-8 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
              Ride the D4L Wave: <br />
              <span className="text-yellow-300 drop-shadow-glow">Risk It. Build It. Bank It.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-lg">
              Secure your slice of the D4L ecosystem in our Q2 2025 airdrop—get in early, stack hard, and dominate token madness before the crowd catches on. Don't just watch the revolution—fuel it with D4L!
            </p>
            <div className="flex flex-wrap gap-4">
              {isConnected ? (
                <Link href="/register" className="btn backdrop-blur-md bg-white/90 text-primary-600 hover:bg-white dark:bg-gray-800/80 dark:text-primary-400 dark:hover:bg-gray-700/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg px-8 py-3 rounded-lg font-semibold border border-white/50 dark:border-white/10">
                  Register Now
                </Link>
              ) : (
                <div className="text-lg text-white bg-white/20 dark:bg-gray-800/40 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20 shadow-lg">
                  Connect your wallet to participate
                </div>
              )}
              <Link href="/whitepaper" className="btn btn-outline backdrop-blur-md border-white/70 text-white hover:bg-white/10 dark:border-gray-400/70 dark:hover:bg-gray-800/30 text-lg px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                View Whitepaper
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Glassmorphism card effect */}
              <div className="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl transform rotate-6 scale-90 z-0"></div>
              <div className="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl transform -rotate-3 scale-95 z-0"></div>

              {/* Enhanced layered shadows for 3D effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full animate-pulse"></div>
              <div className="absolute -right-4 -bottom-4 w-full h-full rounded-full bg-indigo-800/30 blur-md"></div>
              <div className="absolute left-6 top-6 w-full h-full rounded-full bg-blue-600/30 blur-xl"></div>
              <div className="absolute left-3 top-3 w-full h-full rounded-full bg-purple-600/30 blur-lg"></div>
              <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-700/20 blur-xl"></div>

              {/* Glassmorphism ring */}
              <div className="absolute inset-2 rounded-full border-4 border-white/20 backdrop-blur-sm z-5"></div>

              {/* Main token with enhanced 3D effects */}
              <div className="relative z-10 w-full h-full rounded-full overflow-hidden transform token-3d transition-all duration-500 hover:rotate-0 hover:scale-105 backdrop-blur-sm bg-white/5 border border-white/20">
                {/* Inner glow and reflections */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent z-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-transparent to-indigo-500/30 z-5"></div>

                {/* Token image */}
                <Image
                  src="/logo.png"
                  alt="D4L Token"
                  width={500}
                  height={500}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/20 to-purple-500/20 mix-blend-overlay"></div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-1/4 right-1/4 w-6 h-6 rounded-full bg-blue-400/50 blur-sm animate-float-particle-1"></div>
              <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-purple-400/50 blur-sm animate-float-particle-2"></div>
              <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-yellow-400/50 blur-sm animate-float-particle-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 relative">
        {/* Background effects */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Airdrop Status */}
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-header bg-white/90 dark:bg-gray-800/90 border-b border-gray-100/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold">Airdrop Status</h2>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        airdropStatus.isActive && !airdropStatus.isPaused
                          ? 'bg-green-100 text-green-800'
                          : airdropStatus.isPaused
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getStatusMessage()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium">{formatDate(airdropStatus.startTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Registration:</span>
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        registrationStats.registrationOpen
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {registrationStats.registrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-header bg-white/90 dark:bg-gray-800/90 border-b border-gray-100/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold">Participants</h2>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-medium text-2xl">{registrationStats.totalRegistered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">NFTs Minted:</span>
                    <span className="font-medium text-2xl">{registrationStats.totalMinted}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Join our growing community of early adopters and secure your position in the D4L ecosystem.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-header bg-white/90 dark:bg-gray-800/90 border-b border-gray-100/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold">Quick Links</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="flex items-center justify-between text-primary-600 hover:text-primary-800 hover:bg-gray-50 p-3 rounded-lg group"
                >
                  <span className="font-medium">Register for Airdrop</span>
                  <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center justify-between text-primary-600 hover:text-primary-800 hover:bg-gray-50 p-3 rounded-lg group"
                >
                  <span className="font-medium">View Profile</span>
                  <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/claim"
                  className="flex items-center justify-between text-primary-600 hover:text-primary-800 hover:bg-gray-50 p-3 rounded-lg group"
                >
                  <span className="font-medium">Claim Tokens</span>
                  <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/rewards"
                  className="flex items-center justify-between text-primary-600 hover:text-primary-800 hover:bg-gray-50 p-3 rounded-lg group"
                >
                  <span className="font-medium">Earn Rewards</span>
                  <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/whitepaper"
                  className="flex items-center justify-between text-primary-600 hover:text-primary-800 hover:bg-gray-50 p-3 rounded-lg group"
                >
                  <span className="font-medium">Whitepaper</span>
                  <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mb-16 scroll-mt-20 relative">
        {/* Background effects */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-bold mb-10 text-center relative z-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 transform hover:-translate-y-2 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-body text-center p-8">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-2xl font-bold mb-6 mx-auto shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect & Register</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Link your wallet to the D4L ecosystem and set up your profile. Get ready to join a movement that's redefining meme coin culture with security and innovation.
              </p>
              <div className="mt-6">
                <Link href="/register" className="inline-flex items-center text-primary-600 font-medium hover:text-primary-800">
                  Start Registration <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 transform hover:-translate-y-2 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-body text-center p-8">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-2xl font-bold mb-6 mx-auto shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Engage & Earn</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Participate in community activities, follow our social channels, and refer friends to boost your allocation in the upcoming Dutch Auction presale in Q2 2025.
              </p>
              <div className="mt-6">
                <Link href="/rewards" className="inline-flex items-center text-primary-600 font-medium hover:text-primary-800">
                  View Rewards <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="card backdrop-blur-md bg-white/80 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-white/20 transform hover:-translate-y-2 hover:bg-white/90 dark:hover:bg-gray-800/80">
            <div className="card-body text-center p-8">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-2xl font-bold mb-6 mx-auto shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Claim & Thrive</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Secure your D4L tokens and unlock the full potential of our ecosystem: stake for rewards, vote on governance, and participate in BonkWars and prediction markets.
              </p>
              <div className="mt-6">
                <Link href="/claim" className="inline-flex items-center text-primary-600 font-medium hover:text-primary-800">
                  Claim Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Why Join D4L?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <GlobeAltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Token Creation Launchpad & Validation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Spin up your own token with D4L's creator tools—customize it, secure it, launch it. Our verification system sniffs out scams, anti-bot features, plus no rug pulls to ruin the party.
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">BonkWars Arena</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Participate in the ultimate meme coin battle arena where community strength, market moves, and engagement metrics crown champions.
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Prediction Markets</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Bet your D4L on BonkWars outcomes and other market events, combining high stakes with strategic thinking for maximum rewards.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16 relative">
        {/* Background effects */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-bold mb-10 text-center relative z-10">About D4L</h2>
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 dark:from-gray-800/70 dark:to-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative z-10">
          {/* Glassmorphism effects */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>

          <div className="p-8 md:p-12 relative z-10">
            <div className="max-w-3xl mx-auto">
              <p className="text-lg mb-6 text-white/90">
                D4L isn't just another platform—it's the beating heart of crypto, cultivating a lifestyle built for those who live for wild bets, the enthusiasts who dream in code, and the investors chasing fat stacks. We're combining advanced trading, gamified battles, meme coin madness, prediction markets, and robust risk management into a comprehensive DeFi ecosystem.
              </p>
              <p className="text-lg mb-6 text-white/90">
                The D4L token is your key to this ecosystem: stake it for rewards, vote on governance, and unlock exclusive benefits. With a Q2 2025 presale starting with an innovative Dutch Auction, early participants will gain access to bonuses and an equal chance to shape the platform's evolution.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  href="https://docs.d4l.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-white/10"
                >
                  Read Whitepaper
                </a>
                <a
                  href="https://discord.gg/uW8gUT5r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn backdrop-blur-md bg-[#5865F2]/90 border border-[#5865F2]/50 hover:bg-[#5865F2] text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Glassmorphism effects */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-white/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/20 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-30 animate-pulse-slow"></div>

          <div className="px-8 py-12 md:py-16 text-center relative z-10 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-glow">Join the D4L Movement</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Subscribe to get early access to our Dutch Auction presale, BonkWars events, and exclusive alpha on upcoming features in the D4L ecosystem.
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="bg-white/90 backdrop-blur-md text-primary-600 hover:bg-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Early Access
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Ecosystem Highlights */}
      <section className="mb-16 relative">
        {/* Background effects */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-bold mb-10 text-center relative z-10">Ecosystem Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-14 h-14 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">DEX</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">Token Creator & Launchpad</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Secure Token Creation</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "Forge your own coin with D4L's slick token creator—shape it, lock it, and launch it with swagger, or bring your existing token and validate it through our rock-solid system. Our battle-tested verification hunts down scams, shuts out bots, and buries rug pulls, keeping the vibe legit and the party electric for every trailblazer."
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full w-14 h-14 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">BW</span>
              </div>
              <div>
                <h3 className="font-bold text-xl">BonkWars Arena</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Meme Coin Battle Royale</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "The ultimate battleground where meme coins compete based on community strength, market performance, and engagement metrics. Stake D4L on your favorites, participate in weekly tournaments, and earn rewards from the prize pool."
            </p>
          </div>
        </div>
      </section>

      {/* Gasless Transactions CTA */}
      <section className="mb-16 relative">
        <div className="bg-gradient-to-r from-blue-900/70 to-purple-900/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
          {/* Glassmorphism effects */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/20 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>

          <div className="px-8 py-12 text-center relative z-10">
            <div className="inline-block mb-6 p-3 bg-blue-500/20 backdrop-blur-md rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Gasless Transactions</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Experience blockchain without the gas fees! Our new gasless transaction system covers all gas costs for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/token"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
              >
                View D4L Token
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Register Gasless
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
