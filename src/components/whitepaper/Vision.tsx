import React from 'react';

export const Vision = () => {
  return (
    <section id="vision" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Vision & Mission
      </h2>
      
      {/* Vision Statement with enhanced styling */}
      <div className="relative mb-16 p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm">
          Our Vision
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-4">
          D4L is more than a platform—it's a <span className="font-bold text-blue-300">movement</span> designed to thrive in any market. We empower traders, token creators, liquidity providers, and governance participants with a secure, innovative, and engaging decentralized ecosystem.
        </p>
      </div>
      
      {/* Market Opportunity with enhanced styling */}
      <div className="relative mb-16 p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white font-semibold text-sm">
          Market Opportunity
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-4">
          The DeFi landscape is fragmented, with users juggling multiple platforms for different needs. D4L unifies trading, gaming, and prediction markets into a <span className="font-bold text-purple-300">single ecosystem</span>, creating network effects that benefit all participants.
        </p>
      </div>
      
      {/* Core Values with enhanced styling */}
      <div className="relative p-8 bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full text-white font-semibold text-sm">
          Core Values
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            {
              title: "Innovation",
              description: "Pushing boundaries with cutting-edge DeFi solutions that create genuine value for users.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )
            },
            {
              title: "Security",
              description: "Prioritizing robust security measures to protect user assets and ensure platform integrity.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              title: "Community",
              description: "Building a vibrant, engaged community that actively participates in governance and platform growth.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            }
          ].map((value, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 mb-4 text-white">
                {value.icon}
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">{value.title}</h4>
              <p className="text-white/80">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Vision;
