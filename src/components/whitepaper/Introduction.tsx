import React from 'react';

export const Introduction = () => {
  return (
    <section id="introduction" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Introduction
      </h2>

      {/* Welcome banner with enhanced styling - mobile optimized */}
      <div className="relative mb-12 sm:mb-16 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl blur-sm"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-20"></div>
        <div className="relative p-6 sm:p-10 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-glow leading-tight">
            Ride the D4L Wave: <br className="sm:hidden" /><span className="text-blue-300">Risk It</span>, <span className="text-purple-300">Build It</span>, <span className="text-green-300">Bank It</span>
          </h3>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto my-4 sm:my-6 rounded-full"></div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="relative mb-12 p-6 sm:p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm">
          Executive Summary
        </div>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90 mt-4 mb-6">
          D4L isn't some boring platform—it's the <span className="font-bold text-blue-300">beating heart of crypto</span>, cultivating a lifestyle built for those who live for wild bets, the enthusiasts who dream in code, and the investors chasing fat stacks. We're throwing advanced trading, gamified battles, token madness, prediction markets, social engagement and robust risk management into a comprehensive DeFi blender, creating an ecosystem that's equal parts adventurous and rock-solid.
        </p>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90">
          In a 2025 market where opportunities are ripening and clarity is emerging, D4L's the spark—delivering a secure DEX with the revolutionary <span className="font-semibold text-purple-300">HydraCurve</span> magic, a <span className="font-semibold text-yellow-300">BonkWars</span> arena for token community dominance, and prediction markets to flex your brain while you stack your bags.
        </p>
      </div>

      {/* Vision Section */}
      <div className="relative mb-12 p-6 sm:p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold text-sm">
          Our Vision
        </div>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90 mt-4 mb-6">
          D4L is more than a platform—it's a <span className="font-bold text-green-300">movement</span> designed to thrive in any market. We empower traders, token creators, liquidity providers, and governance participants with a secure, innovative, and engaging decentralized ecosystem.
        </p>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90">
          Whether you're chasing moonshots, building the next big meme coin, or seeking strategic opportunities, D4L is your gateway to the future of crypto. The "D4L token" is your key to this ecosystem: stake it, vote with it, and unlock exclusive benefits.
        </p>
      </div>

      {/* Market Opportunity */}
      <div className="relative mb-12 p-6 sm:p-8 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white font-semibold text-sm">
          The 2025 Scene
        </div>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90 mt-4 mb-6">
          Meme coins like DOGE, SHIB, and PEPE once ignited the crypto frontier, rallying the crew to chase moonshots with unstoppable energy. By March 2025, the landscape transformed—not slowed, but sharpened. The market's ripe with potential as savvy traders pivot from fleeting hype to golden opportunities.
        </p>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90 mb-6 sm:mb-8">
          Scams are fading into the rearview, replaced by a hunger for trust and value—wallets are guarded, yes, but ready to fuel what's real. DeFi's charging ahead, blazing trails with secure liquidity and vibrant communities that demand substance over noise.
        </p>

        <div className="flex items-center mb-4">
          <div className="h-px flex-grow bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <h3 className="text-xl font-semibold px-4 text-white">The Problem</h3>
          <div className="h-px flex-grow bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        </div>

        <p className="text-lg leading-relaxed text-white/90 mb-6">
          The current meme coin scene is a chaotic landscape riddled with pitfalls. Lack of security leaves investors vulnerable to rug pulls, while opaque token launches obscure critical details, leaving participants in the dark.
        </p>
        <p className="text-lg leading-relaxed text-white/90">
          Liquidity fragmentation across platforms creates inefficiencies and volatility, and high-risk trading often feels like a gamble with no real edge. It's a culture in desperate need of a reboot—one that preserves the reckless spirit of meme coins but adds the guardrails needed to thrive.
        </p>
      </div>

      {/* D4L's Approach with enhanced styling */}
      <div className="relative mb-12 p-6 sm:p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white font-semibold text-sm">
          D4L's Approach: Turning Chaos into Crypto Gold
        </div>
        <p className="text-lg sm:text-xl leading-relaxed text-white/90 mt-4 mb-6 sm:mb-8">
          Enter D4L—built by trailblazers, for trailblazers, with a twist that hooks everyone. Our meme coin launchpad's scam-proof, locking in trust for creators and players alike. Our DEX, powered by HydraCurve, keeps trades slick and steady—30% capital efficiency isn't just talk, it's more cash in your hand. BonkWars and prediction markets turn the chaos into a game you can win. We're not just another token—we're a lifestyle, a system, a crew, a culture. Risk it for the rush, build it for the future, bank it for the win—D4L's the spark crypto's been missing in 2025.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {[
            {
              title: "HydraCurve AMM",
              description: "Not just another DEX. A revolutionary AMM with 130% capital efficiency through dynamic bonding curves that respond to risk variables, market changes, and trading patterns in real-time.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "BonkWars",
              description: "Where meme coin communities clash for supremacy. Stake your favorite tokens, rally your community, and battle for ecosystem dominance while earning real rewards. The DeFi arena you've been waiting for.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              color: "from-orange-500 to-red-500"
            },
            {
              title: "AltCoin Launchpad",
              description: "Launch your token with anti-scam guardrails built in. Set lockup schedules, enforce liquidity requirements, and build community trust from day one with our comprehensive security toolkit.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: "from-yellow-500 to-amber-500"
            },
            {
              title: "Prediction Markets",
              description: "Put your crypto brain to work. Bet on BonkWars outcomes, market movements, and real-world events with our oracle-powered prediction marketplace. Knowledge is power—and profit.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              color: "from-purple-500 to-indigo-500"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 transform transition-all duration-300 hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-lg shadow-[0_4px_20px_rgb(0,0,0,0.12)]">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className={`inline-flex items-center justify-center p-2 sm:p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mr-3 sm:mr-4`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h4>
              </div>
              <p className="text-white/80 text-sm sm:text-base">
                {feature.description}
              </p>
              <div className={`h-1 w-12 sm:w-16 mt-3 sm:mt-4 rounded-full bg-gradient-to-r ${feature.color}`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Introduction;
