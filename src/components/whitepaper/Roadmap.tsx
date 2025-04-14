import React from 'react';

export const Roadmap = () => {
  return (
    <section id="roadmap" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Roadmap
      </h2>

      <div className="relative mb-16 p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm">
          Development Timeline
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-4">
          Our roadmap outlines the strategic development and expansion of the D4L ecosystem, with a focus on building a robust platform that delivers value to all participants.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

        {/* Phase 1 */}
        <div className="relative mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 gap-12">
            <div className="md:text-right mb-8 md:mb-0 md:pr-10">
              <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Phase 1: Foundation
              </h3>
              <p className="text-white/70 mb-2">Q2 2025</p>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <ul className="space-y-3">
                  {[
                    "Launch D4L token and initial liquidity pools",
                    "Release Token Creator & Launchpad MVP",
                    "Establish security protocols and complete initial audits",
                    "Form strategic partnerships for ecosystem growth"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start justify-end">
                      <span className="text-white/80">{item}</span>
                      <span className="inline-flex items-center justify-center bg-blue-500/20 text-blue-300 rounded-full w-6 h-6 ml-3 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:pl-10">
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h4 className="text-xl font-bold mb-4 text-blue-300">Key Milestones</h4>
                <div className="space-y-4">
                  {[
                    { title: "Token Launch", description: "Successful TGE with 5,000+ initial holders" },
                    { title: "Exchange Listings", description: "Listing on 3+ major centralized exchanges" },
                    { title: "Community Growth", description: "10,000+ active community members across platforms" }
                  ].map((milestone, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-1">{milestone.title}</h5>
                      <p className="text-white/70 text-sm">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="relative mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 gap-12">
            <div className="md:text-right mb-8 md:mb-0 md:pr-10">
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h4 className="text-xl font-bold mb-4 text-purple-300">Key Milestones</h4>
                <div className="space-y-4">
                  {[
                    { title: "BonkWars Season 1", description: "First successful tournament with 50+ competing tokens" },
                    { title: "Liquidity Growth", description: "$100M+ TVL across all pools" },
                    { title: "Developer Adoption", description: "100+ projects building on the D4L ecosystem" }
                  ].map((milestone, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-1">{milestone.title}</h5>
                      <p className="text-white/70 text-sm">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:pl-10">
              <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Phase 2: Expansion
              </h3>
              <p className="text-white/70 mb-2">Q4 2025</p>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <ul className="space-y-3">
                  {[
                    "Launch BonkWars with first seasonal tournament",
                    "Release prediction markets with Chainlink integration",
                    "Expand to additional blockchain networks",
                    "Introduce governance framework for community proposals"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-purple-500/20 text-purple-300 rounded-full w-6 h-6 mr-3 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="relative">
          <div className="flex items-center justify-center mb-6">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">3</span>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 gap-12">
            <div className="md:text-right mb-8 md:mb-0 md:pr-10">
              <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-400">
                Phase 3: Innovation
              </h3>
              <p className="text-white/70 mb-2">Q2 2026</p>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <ul className="space-y-3">
                  {[
                    "Introduce on-chain derivatives and options trading",
                    "Launch cross-chain liquidity aggregation",
                    "Develop AI-powered trading strategies and analytics",
                    "Implement zero-knowledge proof privacy features",
                    "Establish DAO treasury for ecosystem investments"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start justify-end">
                      <span className="text-white/80">{item}</span>
                      <span className="inline-flex items-center justify-center bg-pink-500/20 text-pink-300 rounded-full w-6 h-6 ml-3 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:pl-10">
              <div className="bg-gradient-to-br from-pink-900/20 to-red-900/20 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h4 className="text-xl font-bold mb-4 text-pink-300">Key Milestones</h4>
                <div className="space-y-4">
                  {[
                    { title: "Ecosystem Integration", description: "Integration with 20+ major DeFi protocols" },
                    { title: "Mass Adoption", description: "1M+ active users across all platform features" },
                    { title: "Market Position", description: "Top 10 DeFi platform by TVL and user activity" }
                  ].map((milestone, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-1">{milestone.title}</h5>
                      <p className="text-white/70 text-sm">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
