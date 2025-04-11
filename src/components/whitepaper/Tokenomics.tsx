import React from 'react';

export const Tokenomics = () => {
  return (
    <section id="tokenomics" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Tokenomics
      </h2>
      
      <div className="relative mb-16 p-8 bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-semibold text-sm">
          Overview
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-4">
          The D4L token is your key to this ecosystem: stake it, vote with it, and unlock exclusive benefits. With a total supply of 1 billion tokens, D4L is designed to fuel the platform's growth while providing value to holders.
        </p>
      </div>
      
      {/* Token Distribution */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-white/10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white font-semibold text-sm">
          Token Distribution
        </div>
        <div className="flex items-start">
          <div className="mr-6 mt-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {[
                { name: "Community Rewards", percentage: "40%", color: "bg-purple-500" },
                { name: "Liquidity", percentage: "25%", color: "bg-indigo-500" },
                { name: "Team & Development", percentage: "15%", color: "bg-blue-500" },
                { name: "Marketing", percentage: "10%", color: "bg-cyan-500" },
                { name: "Partnerships", percentage: "5%", color: "bg-teal-500" },
                { name: "Reserve", percentage: "5%", color: "bg-green-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className={`w-3 h-10 ${item.color} rounded-full mr-3`}></div>
                  <div>
                    <div className="text-white font-semibold">{item.name}</div>
                    <div className="text-white/70 text-sm">{item.percentage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Utility & Benefits */}
      <div className="relative mb-10 p-8 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold text-sm">
          Utility & Benefits
        </div>
        <ul className="space-y-4 mt-6">
          {[
            "Governance voting rights for protocol decisions",
            "Fee discounts on all platform transactions",
            "Exclusive access to premium features and tools",
            "Staking rewards from protocol revenue",
            "Priority access to new token launches",
            "Entry tickets to BonkWars tournaments"
          ].map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500/20 text-blue-300 rounded-full w-6 h-6 mr-3 mt-0.5 flex-shrink-0">
                ✓
              </span>
              <span className="text-white/90 text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Vesting Schedule */}
      <div className="relative p-8 bg-gradient-to-br from-cyan-900/20 to-teal-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full text-white font-semibold text-sm">
          Vesting Schedule
        </div>
        <div className="mt-6">
          <div className="relative h-16 mb-8">
            <div className="absolute left-0 right-0 h-0.5 top-1/2 transform -translate-y-1/2 bg-white/20"></div>
            
            {/* Timeline points */}
            {[
              { position: "left-0", label: "TGE", sublabel: "15% unlock" },
              { position: "left-1/4", label: "3 months", sublabel: "Cliff ends" },
              { position: "left-1/2", label: "12 months", sublabel: "50% unlocked" },
              { position: "left-3/4", label: "24 months", sublabel: "75% unlocked" },
              { position: "right-0", label: "36 months", sublabel: "100% unlocked" }
            ].map((point, index) => (
              <div key={index} className={`absolute ${point.position} bottom-0 transform -translate-x-1/2`}>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-teal-500 rounded-full mb-2"></div>
                  <div className="text-white text-sm font-semibold">{point.label}</div>
                  <div className="text-white/70 text-xs">{point.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-lg leading-relaxed text-white/90">
            Team and advisor tokens are subject to a 3-month cliff followed by a 36-month linear vesting schedule to ensure long-term alignment with the project's success.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
