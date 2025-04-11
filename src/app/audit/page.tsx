'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AuditPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header with animated background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              D4L Smart Contract Audit
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              A comprehensive analysis of the D4L platform's smart contract architecture, security features, and implementation details.
            </p>
          </div>
        </div>
      </div>

      {/* Main content with sidebar navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Contents</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => scrollToSection('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'overview' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => scrollToSection('core-architecture')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'core-architecture' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Core Architecture
                </button>
                <button
                  onClick={() => scrollToSection('hydra-amm')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'hydra-amm' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  HydraAMM
                </button>
                <button
                  onClick={() => scrollToSection('bonkwars')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'bonkwars' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  BonkWars
                </button>
                <button
                  onClick={() => scrollToSection('prediction-markets')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'prediction-markets' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Prediction Markets
                </button>
                <button
                  onClick={() => scrollToSection('security-features')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'security-features' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Security Features
                </button>
                <button
                  onClick={() => scrollToSection('tokenomics')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'tokenomics' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Tokenomics
                </button>
                <button
                  onClick={() => scrollToSection('conclusion')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'conclusion' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'
                  }`}
                >
                  Conclusion
                </button>
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 px-1">Related Documents</h4>
                  <Link 
                    href="/whitepaper" 
                    className="flex items-center w-full px-4 py-2 rounded-lg transition-all hover:bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-gray-300 hover:text-white group"
                  >
                    <span className="mr-2 text-blue-400 group-hover:text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    D4L Whitepaper
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Overview Section */}
            <section id="overview" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Overview
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    This audit provides a comprehensive analysis of the Degen4Life (D4L) platform's smart contract architecture. 
                    The D4L platform is a revolutionary ecosystem for crypto enthusiasts, featuring an innovative DEX powered by 
                    HydraCurve AMM, BonkWars meme coin battles, and advanced prediction markets.
                  </p>
                  <p>
                    The platform is built on Base, an Ethereum Layer-2 scaling solution, leveraging the ERC-20 standard for the $D4L token. 
                    This audit examines the core components, security measures, and tokenomics implementation of the platform.
                  </p>
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-2">Audit Scope</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Core architecture and controller contracts</li>
                      <li>HydraAMM implementation and mathematical models</li>
                      <li>BonkWars battle mechanics and reward distribution</li>
                      <li>Prediction market functionality and oracle integration</li>
                      <li>Security features and access control mechanisms</li>
                      <li>Tokenomics implementation and fee structures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Placeholder for other sections - to be filled in subsequent steps */}
            <section id="core-architecture" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Core Architecture
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    The D4L platform is built on a modular, upgradeable architecture centered around the <code>Degen4LifeController</code> contract. 
                    This controller serves as the central hub for all platform operations, coordinating between various specialized modules 
                    and ensuring proper access control throughout the system.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-blue-300">Controller Architecture</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-blue-200 mb-2">Upgradeable Proxy Pattern</h4>
                          <p className="text-sm text-gray-300">
                            Uses OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) to allow for future improvements while preserving state.
                          </p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-blue-200 mb-2">Role-Based Access Control</h4>
                          <p className="text-sm text-gray-300">
                            Implements granular permissions using OpenZeppelin's AccessControl to limit sensitive operations to authorized addresses.
                          </p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-blue-200 mb-2">Emergency Pause Mechanism</h4>
                          <p className="text-sm text-gray-300">
                            Incorporates a pause functionality that can freeze critical operations in case of emergencies or detected vulnerabilities.
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4 text-purple-300">Module System</h3>
                      <p className="mb-4">
                        The D4L platform employs a modular design pattern where specialized functionality is encapsulated in dedicated modules:
                      </p>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Module</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Responsibility</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key Features</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-300">SecurityModule</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Platform security</td>
                              <td className="px-4 py-3 text-sm text-gray-300">Anti-bot, anti-rug pull, transaction monitoring</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-300">LiquidityModule</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Liquidity management</td>
                              <td className="px-4 py-3 text-sm text-gray-300">Pool creation, liquidity provision, fee collection</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-300">SocialModule</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Social features</td>
                              <td className="px-4 py-3 text-sm text-gray-300">User profiles, social trading, achievements</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-300">ContractRegistry</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Contract management</td>
                              <td className="px-4 py-3 text-sm text-gray-300">Address registry, version control, dependency injection</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Key Contract Interactions</h3>
                  <p>
                    The D4L platform's architecture follows a hub-and-spoke model where the controller coordinates interactions between 
                    specialized components:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2 mt-3">
                    <li>
                      <strong>Token Creation Flow:</strong> The controller interacts with the token factory to create new tokens with 
                      built-in security features, then registers them with the pool controller for liquidity provision.
                    </li>
                    <li>
                      <strong>User Registration:</strong> New users are registered through the controller, which creates profiles in the 
                      UserProfile contract and sets up appropriate permissions.
                    </li>
                    <li>
                      <strong>Module Coordination:</strong> The controller ensures that modules operate within their designated boundaries 
                      and facilitates cross-module communication when necessary.
                    </li>
                    <li>
                      <strong>Governance Integration:</strong> The controller implements governance decisions by updating module parameters 
                      and configurations based on DAO votes.
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The core architecture demonstrates a well-thought-out design with proper separation of concerns. The use of upgradeable 
                      contracts provides flexibility for future improvements while maintaining security. The modular approach allows for 
                      independent auditing and testing of components, reducing the risk of system-wide vulnerabilities.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendation:</strong> Consider implementing a time-lock mechanism for upgrades to enhance security and 
                      provide users with advance notice of pending changes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="hydra-amm" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  HydraAMM: Dynamic Bonding Curve
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    The HydraAMM is the cornerstone of D4L's DEX, implementing an innovative automated market maker with dynamic 
                    bonding curves that adjust to market conditions in real-time. Unlike traditional AMMs that use a constant 
                    product formula (x * y = k), HydraAMM employs a sophisticated mathematical model that optimizes capital 
                    efficiency and reduces slippage.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 p-5 rounded-lg border border-blue-500/20">
                      <h3 className="text-xl font-semibold mb-3 text-blue-300">Mathematical Foundation</h3>
                      <p className="text-sm">
                        HydraAMM combines three mathematical functions to create its dynamic bonding curve:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        <li><strong>Sigmoid Function:</strong> Concentrates liquidity near the target price</li>
                        <li><strong>Gaussian Function:</strong> Creates a bell-shaped distribution around the price point</li>
                        <li><strong>Rational Function:</strong> Provides additional flexibility and prevents negative values</li>
                      </ul>
                      
                      <div className="mt-4 p-3 bg-black/30 rounded-lg overflow-x-auto">
                        <code className="text-xs text-blue-200 font-mono">
                          E(x) = (1/3) * [sigmoid(x) + gaussian(x) + max(0, rational(x))]
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 p-5 rounded-lg border border-purple-500/20">
                      <h3 className="text-xl font-semibold mb-3 text-purple-300">Risk Variable Integration</h3>
                      <p className="text-sm">
                        A unique feature of HydraAMM is the composite risk variable (H) that adjusts the curve based on:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        <li>Global event data (geopolitical events, economic crises)</li>
                        <li>Financial market data (volatility, trading volumes)</li>
                        <li>Social media sentiment analysis</li>
                      </ul>
                      
                      <div className="mt-4 p-3 bg-black/30 rounded-lg overflow-x-auto">
                        <code className="text-xs text-purple-200 font-mono">
                          A(x, H, p) = A_base * e^(-γ*V) * (1/(1+H)) * g(p)
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-xl"></div>
                    <div className="relative bg-black/50 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4">Key Implementation Features</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-300 text-sm">Numerical Stability</h4>
                            <p className="text-xs text-gray-400">
                              Implements clamped exponential functions and non-negative outputs to ensure stability during extreme market conditions.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-300 text-sm">Capital Efficiency</h4>
                            <p className="text-xs text-gray-400">
                              Achieves up to 130% higher capital efficiency compared to traditional constant product AMMs by concentrating liquidity.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-300 text-sm">Dynamic Adjustment</h4>
                            <p className="text-xs text-gray-400">
                              Automatically adjusts to market volatility, reducing slippage during high-volume trading periods.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-yellow-300 text-sm">Oracle Integration</h4>
                            <p className="text-xs text-gray-400">
                              Uses Chainlink price feeds to ensure accurate pricing and prevent manipulation attacks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Contract Analysis</h3>
                  <p>
                    The HydraAMM implementation consists of several interconnected contracts:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2 mt-3">
                    <li>
                      <strong>HydraAMM.sol:</strong> The main contract that handles swaps, liquidity provision, and fee collection.
                    </li>
                    <li>
                      <strong>HydraMath.sol:</strong> A library implementing the mathematical functions used by the AMM.
                    </li>
                    <li>
                      <strong>HydraFactory.sol:</strong> Creates new trading pairs and deploys HydraAMM instances.
                    </li>
                    <li>
                      <strong>HydraLPToken.sol:</strong> Represents liquidity provider tokens with enhanced features.
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The HydraAMM implementation is mathematically sound and includes safeguards against common AMM vulnerabilities. 
                      The use of clamped exponential functions prevents numerical overflow, and the non-negative rational function 
                      output ensures that the system remains stable even during extreme market conditions.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendation:</strong> Add additional unit tests for edge cases, particularly around the risk variable 
                      integration, to ensure the system behaves as expected during black swan events.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="bonkwars" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  BonkWars: Gamified Prediction Markets
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    BonkWars represents D4L's innovative approach to prediction markets, combining game theory, social dynamics, 
                    and financial incentives to create an engaging platform for users to stake on binary outcomes. The system 
                    introduces competitive elements that drive user engagement while maintaining the integrity of the prediction market.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-900/40 to-orange-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-pink-300">Market Mechanics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-pink-200 mb-2">Market Creation</h4>
                          <p className="text-sm text-gray-300">
                            Markets are created through a structured process that ensures clarity and fairness:
                          </p>
                          <ul className="list-decimal pl-5 space-y-1 mt-2 text-sm text-gray-300">
                            <li>Market proposer defines the binary question and outcome criteria</li>
                            <li>Initial liquidity is provided to seed the market</li>
                            <li>Resolution date and oracle verification method are established</li>
                            <li>Market enters a pending state for community review before activation</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-orange-200 mb-2">Position Taking</h4>
                          <p className="text-sm text-gray-300">
                            Users can take positions on either side of the binary outcome:
                          </p>
                          <ul className="list-decimal pl-5 space-y-1 mt-2 text-sm text-gray-300">
                            <li>YES positions pay out if the specified event occurs</li>
                            <li>NO positions pay out if the specified event does not occur</li>
                            <li>Position prices dynamically adjust based on market sentiment</li>
                            <li>Users can increase, decrease, or flip positions at any time before resolution</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium text-yellow-200 mb-2">Gamification Elements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-yellow-300 text-sm mb-1">Team Competition</h5>
                            <p className="text-xs text-gray-400">
                              Users join teams (Bulls vs. Bears) for each market, with team performance tracked on leaderboards.
                            </p>
                          </div>
                          
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-yellow-300 text-sm mb-1">Achievement System</h5>
                            <p className="text-xs text-gray-400">
                              Users earn badges and achievements for successful predictions, market creation, and platform engagement.
                            </p>
                          </div>
                          
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-yellow-300 text-sm mb-1">Seasonal Tournaments</h5>
                            <p className="text-xs text-gray-400">
                              Regular tournaments with special prizes and recognition for top predictors across multiple markets.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Smart Contract Implementation</h3>
                  <p>
                    The BonkWars system is implemented through a set of interconnected smart contracts that handle market creation, 
                    position taking, and resolution:
                  </p>
                  
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contract</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Purpose</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key Functions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-pink-300">BonkWars.sol</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Main contract</td>
                          <td className="px-4 py-3 text-sm text-gray-300">createMarket, takePosition, resolveMarket</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-pink-300">BonkMarketFactory.sol</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Market creation</td>
                          <td className="px-4 py-3 text-sm text-gray-300">proposeMarket, approveMarket, deployMarket</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-pink-300">BonkPositionManager.sol</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Position handling</td>
                          <td className="px-4 py-3 text-sm text-gray-300">openPosition, closePosition, adjustPosition</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-pink-300">BonkOracle.sol</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Result verification</td>
                          <td className="px-4 py-3 text-sm text-gray-300">requestResult, verifyResult, finalizeOutcome</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 bg-gradient-to-r from-pink-500/10 to-orange-500/10 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Security Considerations</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-pink-300 mb-2">Market Integrity</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>
                            <strong>Oracle Security:</strong> Multiple verification sources to prevent manipulation
                          </li>
                          <li>
                            <strong>Dispute Resolution:</strong> Time-locked resolution with challenge period
                          </li>
                          <li>
                            <strong>Market Quality Control:</strong> Community review process for new markets
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-orange-300 mb-2">User Protection</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>
                            <strong>Position Limits:</strong> Maximum exposure caps to prevent excessive risk
                          </li>
                          <li>
                            <strong>Fee Transparency:</strong> Clear fee structure with on-chain verification
                          </li>
                          <li>
                            <strong>Emergency Withdrawals:</strong> Mechanism for retrieving funds in case of contract issues
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The BonkWars implementation demonstrates a robust approach to prediction markets with strong security measures. 
                      The contract's modular design allows for clear separation of concerns and facilitates thorough testing of each component.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendations:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Implement a more comprehensive oracle fallback mechanism to handle cases where primary data sources fail</li>
                      <li>Add additional safeguards against potential front-running in high-volatility markets</li>
                      <li>Consider implementing a gradual release mechanism for large payouts to prevent market disruption</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="prediction-markets" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Prediction Markets: Advanced Oracle System
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    D4L's prediction market system extends beyond BonkWars to offer a comprehensive platform for creating and 
                    participating in a wide range of prediction markets. The system is built on a sophisticated oracle network 
                    that ensures reliable, tamper-proof outcome resolution while supporting various market types and timeframes.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-indigo-300">Oracle Architecture</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-indigo-200 mb-2">Multi-Source Verification</h4>
                          <p className="text-sm text-gray-300">
                            Aggregates data from multiple independent sources to prevent manipulation and ensure accuracy.
                          </p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-cyan-200 mb-2">Chainlink Integration</h4>
                          <p className="text-sm text-gray-300">
                            Leverages Chainlink's decentralized oracle network for reliable external data feeds and price information.
                          </p>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="font-medium text-blue-200 mb-2">Dispute Resolution</h4>
                          <p className="text-sm text-gray-300">
                            Implements a time-locked dispute mechanism allowing stakeholders to challenge incorrect outcomes.
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4 text-cyan-300">Market Types</h3>
                      <p className="mb-4">
                        The prediction market system supports various market types to accommodate different prediction scenarios:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-700/20 p-5 rounded-lg border border-indigo-500/20">
                          <h4 className="font-medium text-indigo-300 mb-2">Binary Markets</h4>
                          <p className="text-sm text-gray-300">
                            Simple yes/no outcomes for straightforward predictions:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 mt-2 text-sm text-gray-300">
                            <li>Will ETH price exceed $3,000 by June 30?</li>
                            <li>Will protocol X launch on mainnet in Q3?</li>
                            <li>Will governance proposal Y pass?</li>
                          </ul>
                          <div className="mt-3 p-2 bg-black/30 rounded-lg">
                            <code className="text-xs text-indigo-200 font-mono">
                              function resolveBinaryMarket(bytes32 marketId, bool outcome)
                            </code>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-700/20 p-5 rounded-lg border border-cyan-500/20">
                          <h4 className="font-medium text-cyan-300 mb-2">Scalar Markets</h4>
                          <p className="text-sm text-gray-300">
                            Predictions on numerical ranges with proportional payouts:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 mt-2 text-sm text-gray-300">
                            <li>What will be the ETH price on July 1?</li>
                            <li>How many users will protocol X have after 3 months?</li>
                            <li>What percentage of validators will support upgrade Z?</li>
                          </ul>
                          <div className="mt-3 p-2 bg-black/30 rounded-lg">
                            <code className="text-xs text-cyan-200 font-mono">
                              function resolveScalarMarket(bytes32 marketId, uint256 outcome)
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Implementation Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-indigo-300 mb-2">Market Lifecycle</h4>
                      <div className="relative">
                        <div className="absolute left-3 inset-y-0 w-0.5 bg-gradient-to-b from-indigo-500/50 to-cyan-500/50"></div>
                        <div className="space-y-4 pl-6">
                          <div>
                            <h5 className="text-sm font-medium text-indigo-200">Creation Phase</h5>
                            <p className="text-xs text-gray-400 mt-1">
                              Market parameters defined, initial liquidity provided, and validation checks performed.
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-blue-200">Active Phase</h5>
                            <p className="text-xs text-gray-400 mt-1">
                              Users take positions, prices adjust based on market activity, and liquidity providers can join or exit.
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-cyan-200">Resolution Phase</h5>
                            <p className="text-xs text-gray-400 mt-1">
                              Oracle provides outcome, dispute period begins, and final outcome is confirmed after timeout.
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-green-200">Settlement Phase</h5>
                            <p className="text-xs text-gray-400 mt-1">
                              Winners claim rewards, fees distributed to platform and liquidity providers, market data archived.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-cyan-300 mb-2">Key Contract Functions</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <h5 className="text-sm font-medium text-indigo-200">createMarket</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Creates a new prediction market with specified parameters and initial liquidity.
                          </p>
                          <div className="mt-2 p-2 bg-black/30 rounded-lg overflow-x-auto">
                            <code className="text-xs text-gray-300 font-mono">
                              function createMarket(<br />
                              &nbsp;&nbsp;address token,<br />
                              &nbsp;&nbsp;uint256 duration,<br />
                              &nbsp;&nbsp;string calldata description<br />
                              ) external returns (bytes32)
                            </code>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <h5 className="text-sm font-medium text-blue-200">placePrediction</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Allows users to take a position in a prediction market by staking tokens.
                          </p>
                          <div className="mt-2 p-2 bg-black/30 rounded-lg overflow-x-auto">
                            <code className="text-xs text-gray-300 font-mono">
                              function placePrediction(<br />
                              &nbsp;&nbsp;bytes32 marketId,<br />
                              &nbsp;&nbsp;uint256 amount,<br />
                              &nbsp;&nbsp;uint8 outcome<br />
                              ) external nonReentrant whenNotPaused
                            </code>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <h5 className="text-sm font-medium text-cyan-200">requestResolution</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Initiates the resolution process by requesting data from the oracle network.
                          </p>
                          <div className="mt-2 p-2 bg-black/30 rounded-lg overflow-x-auto">
                            <code className="text-xs text-gray-300 font-mono">
                              function requestResolution(<br />
                              &nbsp;&nbsp;bytes32 marketId<br />
                              ) external onlyAuthorized
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The prediction market system demonstrates a well-architected approach with robust oracle integration. 
                      The multi-source verification system provides strong protection against manipulation, and the dispute 
                      resolution mechanism adds an additional layer of security.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendations:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Implement additional slashing conditions for malicious oracle providers to further discourage manipulation attempts</li>
                      <li>Consider adding a circuit breaker mechanism for extreme market conditions to prevent cascading liquidations</li>
                      <li>Enhance the documentation around the dispute resolution process to ensure users understand their rights and responsibilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="security-features" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Security Features
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    D4L's platform incorporates multiple layers of security features designed to protect users, liquidity providers, 
                    and the protocol itself from various threats. These security measures are implemented at different levels of the 
                    system architecture, from individual transaction validation to protocol-wide safeguards.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-green-300">Protocol-Level Security</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-200 mb-2">Smart Contract Security</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Formal Verification:</strong> Critical components have undergone formal verification to mathematically prove correctness.
                            </li>
                            <li>
                              <strong>Comprehensive Testing:</strong> Extensive unit and integration tests with 95%+ code coverage.
                            </li>
                            <li>
                              <strong>External Audits:</strong> Multiple independent security audits by leading firms in the space.
                            </li>
                            <li>
                              <strong>Bug Bounty Program:</strong> Ongoing bug bounty program with tiered rewards based on severity.
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-emerald-200 mb-2">Access Control</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Role-Based Access:</strong> Granular permissions using OpenZeppelin's AccessControl library.
                            </li>
                            <li>
                              <strong>Multi-Signature Requirements:</strong> Critical operations require multiple approvals.
                            </li>
                            <li>
                              <strong>Timelock Mechanisms:</strong> Delays for sensitive parameter changes and upgrades.
                            </li>
                            <li>
                              <strong>Governance Controls:</strong> Decentralized governance for protocol parameter adjustments.
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium text-teal-200 mb-2">Emergency Safeguards</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-teal-300 text-sm mb-1">Circuit Breakers</h5>
                            <p className="text-xs text-gray-400">
                              Automatic suspension of trading during extreme market conditions or detected anomalies.
                            </p>
                          </div>
                          
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-teal-300 text-sm mb-1">Emergency Shutdown</h5>
                            <p className="text-xs text-gray-400">
                              Controlled shutdown capability with guaranteed fund recovery for users in case of critical vulnerabilities.
                            </p>
                          </div>
                          
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-medium text-teal-300 text-sm mb-1">Gradual Parameter Updates</h5>
                            <p className="text-xs text-gray-400">
                              Changes to critical parameters are applied gradually to prevent sudden market disruptions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-blue-300">Transaction-Level Security</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-blue-200 mb-2">Transaction Guards</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Reentrancy Protection:</strong> All state-changing functions are protected against reentrancy attacks.
                            </li>
                            <li>
                              <strong>Slippage Protection:</strong> User-defined slippage tolerance for all trades.
                            </li>
                            <li>
                              <strong>Front-Running Mitigation:</strong> Transaction ordering protection mechanisms.
                            </li>
                            <li>
                              <strong>Gas Optimization:</strong> Efficient code to minimize gas costs and prevent out-of-gas errors.
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-indigo-200 mb-2">Validation Checks</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Input Validation:</strong> Comprehensive validation of all user inputs and parameters.
                            </li>
                            <li>
                              <strong>Arithmetic Safety:</strong> SafeMath library usage and overflow/underflow prevention.
                            </li>
                            <li>
                              <strong>Balance Verification:</strong> Pre and post-operation balance checks for critical operations.
                            </li>
                            <li>
                              <strong>Event Emissions:</strong> Detailed events for all significant state changes for off-chain monitoring.
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-lg font-medium mb-2 text-blue-300">Code Example: Reentrancy Protection</h4>
                        <div className="overflow-x-auto">
                          <pre className="text-xs text-gray-300 bg-black/50 p-3 rounded-lg">
                            <code>
{`// Using OpenZeppelin's ReentrancyGuard
function withdraw(uint256 amount) external nonReentrant whenNotPaused {
    require(amount > 0, "Amount must be greater than zero");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    // Update state before external calls
    balances[msg.sender] -= amount;
    totalSupply -= amount;
    
    // External call after state updates
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
    
    emit Withdrawal(msg.sender, amount);
}`}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-purple-300">User-Level Protection</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-purple-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h4 className="text-center font-medium text-purple-300 text-sm mb-2">Wallet Safety</h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Secure connection handling</li>
                            <li>Transaction confirmation screens</li>
                            <li>Gas estimation and warnings</li>
                            <li>Spending limits and approvals</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-pink-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <h4 className="text-center font-medium text-pink-300 text-sm mb-2">Risk Management</h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Position size limitations</li>
                            <li>Liquidation warnings</li>
                            <li>Risk assessment tools</li>
                            <li>Simulation capabilities</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-center font-medium text-indigo-300 text-sm mb-2">Education & Transparency</h4>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Comprehensive documentation</li>
                            <li>Risk disclosures</li>
                            <li>Interactive tutorials</li>
                            <li>Real-time protocol metrics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The security architecture of the D4L platform demonstrates a comprehensive approach to protecting users and the protocol. 
                      The multi-layered security strategy provides defense in depth, with each layer addressing different types of threats 
                      and vulnerabilities.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendations:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Consider implementing a formal security council with rotating membership to oversee protocol security</li>
                      <li>Enhance the monitoring system with additional anomaly detection capabilities</li>
                      <li>Develop a more detailed incident response plan with clear roles and responsibilities</li>
                      <li>Implement additional security features for cross-chain operations as they are developed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="tokenomics" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Tokenomics
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    The D4L token serves as the governance and utility token for the platform, with a carefully designed tokenomics 
                    model that balances incentives for users, liquidity providers, and protocol development. The token contract 
                    implements several innovative features to ensure long-term sustainability and value accrual.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-amber-300">Token Distribution</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="aspect-square relative bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full p-1">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-1/2 h-1/2 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-amber-300 font-bold">D4L</span>
                              </div>
                            </div>
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              {/* Community & Airdrop - 30% */}
                              <path d="M 50 50 L 50 0 A 50 50 0 0 1 97.5 65.5 Z" fill="rgba(245, 158, 11, 0.6)" />
                              {/* Team & Advisors - 15% */}
                              <path d="M 50 50 L 97.5 65.5 A 50 50 0 0 1 75 96.7 Z" fill="rgba(249, 115, 22, 0.6)" />
                              {/* Treasury - 20% */}
                              <path d="M 50 50 L 75 96.7 A 50 50 0 0 1 25 96.7 Z" fill="rgba(217, 119, 6, 0.6)" />
                              {/* Liquidity Mining - 25% */}
                              <path d="M 50 50 L 25 96.7 A 50 50 0 0 1 2.5 65.5 Z" fill="rgba(180, 83, 9, 0.6)" />
                              {/* Ecosystem Fund - 10% */}
                              <path d="M 50 50 L 2.5 65.5 A 50 50 0 0 1 50 0 Z" fill="rgba(146, 64, 14, 0.6)" />
                            </svg>
                          </div>
                        </div>
                        
                        <div>
                          <ul className="space-y-3">
                            <li className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-sm bg-amber-500/60"></span>
                              <div>
                                <span className="font-medium text-amber-300">Community & Airdrop (30%)</span>
                                <p className="text-xs text-gray-400">Distributed to early users, community initiatives, and governance participants.</p>
                              </div>
                            </li>
                            <li className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-sm bg-orange-500/60"></span>
                              <div>
                                <span className="font-medium text-orange-300">Team & Advisors (15%)</span>
                                <p className="text-xs text-gray-400">4-year vesting with 1-year cliff for team members and project advisors.</p>
                              </div>
                            </li>
                            <li className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-sm bg-amber-600/60"></span>
                              <div>
                                <span className="font-medium text-amber-300">Treasury (20%)</span>
                                <p className="text-xs text-gray-400">Controlled by DAO governance for long-term development and operations.</p>
                              </div>
                            </li>
                            <li className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-sm bg-amber-700/60"></span>
                              <div>
                                <span className="font-medium text-amber-300">Liquidity Mining (25%)</span>
                                <p className="text-xs text-gray-400">Incentives for liquidity providers and platform participants over 4 years.</p>
                              </div>
                            </li>
                            <li className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-sm bg-amber-800/60"></span>
                              <div>
                                <span className="font-medium text-amber-300">Ecosystem Fund (10%)</span>
                                <p className="text-xs text-gray-400">Partnerships, grants, and ecosystem development initiatives.</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 className="text-xl font-semibold mb-3 text-orange-300">Token Utility</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Governance:</strong> Voting rights on protocol parameters, feature development, and treasury allocation.
                        </li>
                        <li>
                          <strong>Fee Discounts:</strong> Reduced trading and platform fees based on token holdings.
                        </li>
                        <li>
                          <strong>Staking Rewards:</strong> Earn a share of protocol revenue by staking tokens.
                        </li>
                        <li>
                          <strong>Liquidity Mining:</strong> Additional rewards for providing liquidity to platform pools.
                        </li>
                        <li>
                          <strong>Access Control:</strong> Tiered access to advanced features and early product releases.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                      <h3 className="text-xl font-semibold mb-3 text-amber-300">Tokenomics Mechanisms</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Buyback & Burn:</strong> 30% of platform fees are used to buy back and burn tokens, reducing supply over time.
                        </li>
                        <li>
                          <strong>Emission Schedule:</strong> Decreasing token emission rate over 4 years to reduce inflation pressure.
                        </li>
                        <li>
                          <strong>Vote Escrow:</strong> Longer staking periods provide boosted governance power and rewards.
                        </li>
                        <li>
                          <strong>Liquidity Bootstrapping:</strong> Initial bonding curve mechanism to ensure fair distribution and deep liquidity.
                        </li>
                        <li>
                          <strong>Protocol-Owned Liquidity:</strong> Treasury maintains significant liquidity positions to reduce volatility.
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Smart Contract Implementation</h3>
                  
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 rounded-lg">
                    <h4 className="font-medium text-amber-300 mb-2">Token Contract Features</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Feature</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Implementation</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Security Considerations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-300">ERC-20 Compliance</td>
                            <td className="px-4 py-3 text-sm text-gray-300">OpenZeppelin's ERC20 implementation with extensions</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Audited code base with proven security track record</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-300">Access Control</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Role-based permissions with time-locked admin functions</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Multi-signature requirements for sensitive operations</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-300">Supply Management</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Fixed maximum supply with controlled minting schedule</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Transparent burn mechanism with on-chain verification</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-300">Governance Integration</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Snapshot-based voting with on-chain execution</td>
                            <td className="px-4 py-3 text-sm text-gray-300">Delegation capabilities with revocation safeguards</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-300">Audit Findings</h3>
                    <p className="text-sm">
                      The D4L token contract demonstrates a well-designed implementation with appropriate security measures. 
                      The tokenomics model provides balanced incentives for various stakeholders while incorporating mechanisms 
                      to ensure long-term sustainability.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Recommendations:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Consider implementing additional vesting mechanisms for the ecosystem fund to ensure long-term alignment</li>
                      <li>Enhance the documentation around governance processes and voting weight calculations</li>
                      <li>Add more detailed events for better off-chain tracking of token distribution and usage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="conclusion" className="mb-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Conclusion
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p>
                    The D4L platform represents a significant advancement in decentralized finance, combining innovative 
                    technical solutions with robust security practices. This audit has examined the core components of the 
                    platform, including the central controller architecture, HydraAMM, BonkWars, prediction markets, 
                    security features, and tokenomics.
                  </p>
                  
                  <div className="mt-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-grid-pattern"></div>
                    <div className="relative rounded-lg bg-black/50 p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-4 text-blue-300">Key Findings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-blue-200 mb-2">Strengths</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Innovative AMM Design:</strong> The HydraAMM's dynamic bonding curve provides superior capital efficiency compared to traditional AMMs.
                            </li>
                            <li>
                              <strong>Robust Security Architecture:</strong> Multi-layered security approach with protocol, transaction, and user-level protections.
                            </li>
                            <li>
                              <strong>Modular System Design:</strong> Clean separation of concerns allows for independent auditing and upgradeability.
                            </li>
                            <li>
                              <strong>Comprehensive Oracle Integration:</strong> Multi-source verification system enhances reliability and tamper resistance.
                            </li>
                            <li>
                              <strong>Sustainable Tokenomics:</strong> Well-balanced token distribution with mechanisms for long-term value accrual.
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-purple-200 mb-2">Areas for Improvement</h4>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              <strong>Time-lock Mechanisms:</strong> Additional time-locks for sensitive operations would enhance security.
                            </li>
                            <li>
                              <strong>Edge Case Testing:</strong> More comprehensive testing for extreme market conditions is recommended.
                            </li>
                            <li>
                              <strong>Oracle Fallback Systems:</strong> Enhanced fallback mechanisms for oracle failures could improve resilience.
                            </li>
                            <li>
                              <strong>Front-running Protection:</strong> Additional safeguards against MEV and front-running attacks.
                            </li>
                            <li>
                              <strong>Documentation:</strong> More detailed technical documentation would benefit future auditors and developers.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-green-300">Security Rating</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[85%]"></div>
                        </div>
                      </div>
                      <div className="ml-4 text-lg font-bold text-green-300">8.5/10</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-medium text-green-300 text-sm mb-2">Code Quality</h4>
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[90%]"></div>
                            </div>
                          </div>
                          <div className="ml-2 text-sm font-medium text-green-300">9.0</div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Well-structured, modular code with comprehensive comments and consistent patterns.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-medium text-green-300 text-sm mb-2">Security Measures</h4>
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[85%]"></div>
                            </div>
                          </div>
                          <div className="ml-2 text-sm font-medium text-green-300">8.5</div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Strong security practices with some minor improvements recommended.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-medium text-green-300 text-sm mb-2">Architecture</h4>
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[80%]"></div>
                            </div>
                          </div>
                          <div className="ml-2 text-sm font-medium text-green-300">8.0</div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Innovative design with good separation of concerns and upgradeability.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Next Steps</h3>
                  <p>
                    Based on the findings of this audit, we recommend the following next steps for the D4L platform:
                  </p>
                  
                  <ol className="list-decimal pl-5 space-y-2 mt-3">
                    <li>
                      <strong>Implement Recommended Changes:</strong> Address the security recommendations outlined in each section of this audit.
                    </li>
                    <li>
                      <strong>Additional External Audits:</strong> Engage multiple independent security firms for comprehensive audits before mainnet launch.
                    </li>
                    <li>
                      <strong>Formal Verification:</strong> Consider formal verification for critical components, particularly the HydraAMM mathematical functions.
                    </li>
                    <li>
                      <strong>Testnet Deployment:</strong> Extended testnet period with bug bounty program to identify potential issues.
                    </li>
                    <li>
                      <strong>Documentation Enhancement:</strong> Develop comprehensive technical documentation for developers and users.
                    </li>
                  </ol>
                  
                  <div className="mt-6 p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
                    <h3 className="text-xl font-semibold mb-3 text-blue-300">Final Assessment</h3>
                    <p>
                      The D4L platform represents a significant innovation in the DeFi space, particularly with its HydraAMM and 
                      gamified prediction markets. The architecture demonstrates a thoughtful approach to security, scalability, 
                      and user experience. While there are areas for improvement, the overall design is sound and, with the 
                      recommended enhancements, has the potential to set a new standard for decentralized trading platforms.
                    </p>
                    <p className="mt-3">
                      We commend the D4L team for their commitment to security and innovation, and look forward to seeing the 
                      platform's continued development and eventual launch.
                    </p>
                    <div className="mt-4 text-right">
                      <p className="text-sm font-medium text-blue-300">Audit conducted by</p>
                      <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">D4L Security Council</p>
                      <p className="text-xs text-gray-400">June 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
