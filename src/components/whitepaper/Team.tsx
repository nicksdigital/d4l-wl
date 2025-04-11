import React from 'react';
import Image from 'next/image';

export const Team = () => {
  return (
    <section id="team" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Team
      </h2>
      
      {/* Team Introduction with enhanced glassmorphism effect */}
      <div className="relative mb-16 overflow-hidden rounded-xl">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl blur-sm"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-10"></div>
        
        {/* Content */}
        <div className="relative p-8 border border-white/10 backdrop-blur-sm rounded-xl">
          <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm">
            Leadership
          </div>
          <p className="text-xl leading-relaxed text-white/90 mt-6 mb-4">
            D4L is built by a focused team with deep expertise in blockchain technology, financial engineering, and business operations. Our leadership brings decades of combined experience to create a revolutionary DeFi platform that addresses real market needs.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Core Team with enhanced cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {[
          {
            name: "Raymond",
            role: "Founder & CEO",
            bio: "A battle-hardened business veteran with over 20 years of experience pioneering at the intersection of traditional finance and blockchain technology. Raymond built his first trading system during the dotcom era before mastering institutional finance, complex derivatives structuring, and shepherding multiple successful IPOs. He's architected DeFi tokenomics for several top-performing protocols and specializes in creating sustainable economic models that align incentives across diverse stakeholder groups. His visionary leadership and strategic foresight drive D4L's mission to bridge the gap between wild speculation and sustainable growth.",
            expertise: ["DeFi Tokenomics Expert", "Institutional Finance", "Regulatory Navigation", "Market Microstructure", "Strategic Partnerships"],
            color: "from-blue-500 to-cyan-500"
          },
          {
            name: "Nick",
            role: "Co-Founder & CTO",
            bio: "The creator of HydraCurve AMM and QZKP (Quantum Zero-Knowledge Proof) technology. With over 25 years of experience in blockchain innovation, cryptography, and quantum computing, Nick is a pioneering technologist who has founded multiple successful ventures including AxiomVerse and Genovatix. His groundbreaking work in quantum-resistant algorithms and zero-knowledge proofs revolutionized DeFi capital efficiency with the HydraCurve's dynamic bonding mechanism. Nick leads D4L's technical vision with an unwavering commitment to security, scalability, and user experience, bringing his expertise from leading large-scale projects for Fortune 500 companies to the cutting edge of decentralized finance.",
            expertise: ["HydraCurve Creator", "Quantum-ZKP Innovator", "Cryptographic Systems", "Decentralized Finance", "Blockchain Architecture"],
            color: "from-purple-500 to-indigo-500"
          }
        ].map((member, index) => (
          <div key={index} className="relative group">
            {/* Enhanced card with depth effects */}
            <div className="relative h-full bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 overflow-hidden transform transition-all duration-300 hover:bg-white/10 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              {/* Background accent elements */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl bg-gradient-to-br ${member.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-800/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              {/* Content with improved layout */}
              <div className="relative z-10">
                {/* Header with role */}
                <div className="flex items-start mb-6">
                  {/* Avatar with gradient ring */}
                  <div className={`relative w-20 h-20 rounded-full mr-6 p-1 bg-gradient-to-r ${member.color} shadow-lg`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center text-white/70 text-xl font-bold">
                      {member.name[0]}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-1 text-white">{member.name}</h3>
                    <p className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${member.color}`}>
                      {member.role}
                    </p>
                  </div>
                </div>
                
                {/* Bio with improved typography */}
                <p className="text-white/80 text-base leading-relaxed mb-6">
                  {member.bio}
                </p>
                
                {/* Expertise tags */}
                <div className="mb-6">
                  <h4 className="text-sm uppercase text-white/60 mb-3">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1 text-xs rounded-full bg-white/10 border border-white/10 text-white/70`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Social links with improved styling */}
                <div className="flex flex-wrap gap-3">
                  {['Twitter', 'LinkedIn', 'GitHub'].map((social, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className={`px-4 py-2 rounded-md bg-white/5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/10 flex items-center`}
                    >
                      <span className="mr-1.5">
                        {social === 'Twitter' ? '🐦' : social === 'LinkedIn' ? '💼' : '🔧'}
                      </span>
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Community-driven approach */}
      <div className="relative p-8 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full text-white font-semibold text-sm">
          Community-Driven Development
        </div>
        <p className="text-xl leading-relaxed text-white/90 mt-6 mb-4">
          Beyond our core team, D4L thrives on community contribution. We're building a platform where community members can participate in governance, contribute to development, and share in the ecosystem's success.
        </p>
        <div className="flex flex-wrap gap-6 mt-8">
          {[
            {
              title: "Open Development",
              description: "Community members can contribute code, suggest features, and help improve the platform.", 
              icon: "🧩"
            },
            {
              title: "Transparent Governance",
              description: "Token holders participate in key decisions through our on-chain governance system.",
              icon: "🏛️"
            },
            {
              title: "Community Rewards",
              description: "Contributors are rewarded through our innovative tokenomics system.",
              icon: "🏆"
            }
          ].map((item, idx) => (
            <div key={idx} className="flex-1 min-w-[280px] bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{item.icon}</span>
                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
              </div>
              <p className="text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
