import React from 'react';

export const Technology = () => {
  return (
    <section id="technology" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Technology
      </h2>

      {/* Technology Overview */}
      <div className="relative mb-16 p-8 bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full text-white font-semibold text-sm">
          Overview
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-4">
          D4L leverages <span className="font-bold text-blue-300">cutting-edge blockchain technology</span> to create a comprehensive platform that combines secure token creation and validation, advanced trading, gamified battles, and prediction markets, ensuring a trusted and scam-free environment for creators and participants alike.
        </p>
      </div>

      {/* Core Components Header */}
      <div className="flex items-center mb-10">
        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <h3 className="text-2xl font-bold px-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Core Components</h3>
        <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      {/* AltCoin Launchpad */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-semibold text-sm">
          Token Validator
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg leading-relaxed text-white/90 mb-4">
              Fire up your own token with D4L's token creator tools—tweak it, lock it, launch it with swagger. Our verification system hunts down scams, packing anti-bot defenses and bulletproof checks to crush rug pulls, keeping the vibe legit for every creator. Got a token already? Run it through our validator, and if you've got the heat, you'll earn a shot to dominate in BonkWars.
            </p>
            <p className="text-lg leading-relaxed text-white/90">
              Hit market cap milestones, and your token's promoted to <span className="font-semibold text-yellow-300">BonkWars</span>—where the real pioneers shine. It's a proving ground for hype and hustle.
            </p>
          </div>
        </div>
      </div>

      {/* HydraCurve AMM */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold text-sm">
          QZKP Technology
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex-1 relative z-10">
            {/* Animated background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>

            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold px-2 py-1 rounded mr-2">130%</span>
              <span className="text-white/80 text-sm">Capital Efficiency</span>
            </div>

            <div className="mb-6">
              <p className="text-lg leading-relaxed text-white/90 mb-4">
                The revolutionary <span className="font-semibold text-blue-300">HydraCurve AMM</span>, created by Nick, is the beating heart of D4L. This groundbreaking technology features a dynamic bonding curve that automatically adjusts to market conditions and external risk factors in real-time.
              </p>
              <p className="text-lg leading-relaxed text-white/90 mb-4">
                Built on Nick's pioneering <span className="font-semibold text-cyan-300">Quantum Zero-Knowledge Proof (QZKP)</span> technology, the HydraCurve provides unparalleled security and privacy while delivering superior capital efficiency compared to traditional AMMs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
                <h4 className="text-blue-300 font-semibold mb-2">Dynamic Risk-Adjusted Amplification</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  Implements the formula <span className="font-mono">A(x, H, p_event) = A_base * exp(-γ·Volatility) * f(H) * g(p_event)</span> where H is a risk variable integrating external market conditions, and p_event represents forecasted event probability. This allows real-time liquidity optimization even during extreme market conditions.
                </p>
              </div>

              <div className="bg-cyan-900/30 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/20">
                <h4 className="text-cyan-300 font-semibold mb-2">Tri-Function Mathematical Framework</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  Combines sigmoid, Gaussian, and rational functions with mathematically clamped exponentials to create an optimal liquidity curve that maintains numerical stability even under extreme market conditions while maximizing capital efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <span className="px-3 text-white/70 text-sm font-medium">Key Benefits</span>
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>

            <ul className="list-none space-y-2 mb-4">
              <li className="flex items-start">
                <span className="mr-2 text-blue-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Achieves 135% capital efficiency using a proprietary combination of sigmoid, Gaussian, and rational power curves</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Optimized parameter tuning with adaptive <span className="font-mono">α</span>, <span className="font-mono">β</span>, and <span className="font-mono">γ</span> constants for precision-targeted liquidity distribution</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Mathematically optimized slippage control through exponential curve modulation and dynamic dampening factors</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Zero-knowledge transaction privacy that maintains full on-chain verifiability and auditability</span>
              </li>
            </ul>

            <div className="p-5 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg border-l-4 border-blue-500">
              <p className="text-white/90 text-sm italic mb-3">
                "The HydraCurve AMM represents a quantum leap in decentralized exchange technology. By leveraging QZKP (Quantum Zero-Knowledge Proof) principles, Nick has created a system that simultaneously maximizes capital efficiency while providing unmatched privacy and security. The dynamic risk-adjusted bonding curve mechanism adapts in real-time to market conditions, offering DeFi users a resilient infrastructure even in the face of extreme volatility."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white mr-3">RC</div>
                <div>
                  <p className="text-white text-xs font-semibold">Dr. Ryan Cooper</p>
                  <p className="text-white/60 text-xs">Quantum Computing Research Institute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QZKP Technology */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white font-semibold text-sm">
          QZKP Technology
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1 relative">
            {/* Animated background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>

            <p className="text-lg leading-relaxed text-white/90 mb-4">
              <span className="font-semibold text-purple-300">Quantum Zero-Knowledge Proof (QZKP)</span> is Nick's revolutionary technology that integrates quantum principles with zero-knowledge cryptography. Developed using Qiskit quantum computing framework, QZKP leverages quantum mechanical phenomena to create an unprecedented level of transaction privacy and security.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <h4 className="text-purple-300 font-semibold mb-2">Tri-Phase Quantum Mechanism</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  Implements a three-phase approach: (1) <span className="font-mono">Probabilistic Encoding</span> using quantum superposition, (2) <span className="font-mono">Logical Entanglement</span> creating state dependencies, and (3) <span className="font-mono">Probabilistic Verification</span> through quantum measurement.
                </p>
              </div>

              <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-500/20">
                <h4 className="text-indigo-300 font-semibold mb-2">Multi-Layered Vector Structure</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  Uses a sophisticated Layered Matrix and Vector System with transaction registration across multiple entangled quantum registers, supporting vector transformations while maintaining quantum coherence and zero-knowledge properties.
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-2 py-1 rounded mr-2">QUANTUM SECURE</span>
              <span className="text-white/80 text-sm">Protected against both classical and quantum attacks</span>
            </div>

            <ul className="list-none space-y-2 mb-4">
              <li className="flex items-start">
                <span className="mr-2 text-purple-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Utilizes reduced density matrices and partial traces to validate proof integrity without revealing the underlying transaction data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90 text-base">Achieves unparalleled transaction privacy while maintaining regulatory compliance through quantum-derived proofs</span>
              </li>
            </ul>

            <div className="p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg border-l-4 border-purple-500">
              <p className="text-white/90 text-sm italic">
                "Nick's QZKP technology represents a paradigm shift in cryptographic security. By harnessing quantum mechanical properties for zero-knowledge proofs, he has created a system that maintains perfect transaction privacy while being inherently resistant to attacks from quantum computers—a holy grail in cryptographic circles previously thought to be decades away from practical implementation."
              </p>
              <div className="flex items-center mt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white mr-3">KL</div>
                <div>
                  <p className="text-white text-xs font-semibold">Dr. Kenji Liu</p>
                  <p className="text-white/60 text-xs">Quantum Computing & Cryptography Institute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BonkWars */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-semibold text-sm">
          BonkWars
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-2 py-1 rounded mr-2">SEASONAL</span>
              <span className="text-white/80 text-sm">Tournaments</span>
            </div>
            <p className="text-lg leading-relaxed text-white/90 mb-4">
              <span className="font-semibold text-orange-300">BonkWars</span> is our gamified token battle arena where communities compete for dominance. Tokens that graduate from the launchpad enter seasonal tournaments where holders can stake their tokens to earn points, complete missions, and climb the leaderboard.
            </p>
            <p className="text-lg leading-relaxed text-white/90">
              The winning token each season receives massive liquidity injections, marketing campaigns, and integration with major platforms. It's not just about price—it's about building the most engaged community and strategic tokenomics.
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Markets */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white font-semibold text-sm">
          Prediction Markets
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-2 py-1 rounded mr-2">CHAINLINK</span>
              <span className="text-white/80 text-sm">Oracle Integration</span>
            </div>
            <p className="text-lg leading-relaxed text-white/90 mb-4">
              Our <span className="font-semibold text-purple-300">prediction markets</span> allow users to bet on real-world events, from crypto prices to sports outcomes and beyond. By leveraging Chainlink oracles for reliable data feeds, we ensure fair and accurate resolution of markets.
            </p>
            <p className="text-lg leading-relaxed text-white/90">
              The automated market maker model ensures liquidity for all positions, while the fee structure rewards early participants who take more risk. Advanced features like conditional markets and multi-outcome scenarios create endless possibilities for strategic betting.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture */}
      <div className="relative p-8 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-green-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-semibold text-sm">
          Security Architecture
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg leading-relaxed text-white/90 mb-6">
              <span className="font-semibold text-green-300">Security</span> is paramount at D4L. Our multi-layered approach includes:
            </p>
            <ul className="space-y-4">
              {[
                "Formal verification of all smart contracts",
                "Multi-sig wallets for administrative functions",
                "Time-locked upgrades with community review periods",
                "Comprehensive insurance fund to protect users",
                "Regular security audits by leading firms"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center bg-green-500/20 text-green-300 rounded-full w-6 h-6 mr-3 mt-0.5 flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
