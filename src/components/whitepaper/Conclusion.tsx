import React from 'react';
import Link from 'next/link';

export const Conclusion = () => {
  return (
    <section id="conclusion" className="mb-24">
      <h2 className="text-3xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Conclusion
      </h2>
      
      {/* Vision-Forward Conclusion with enhanced design */}
      <div className="relative mb-16 overflow-hidden rounded-xl">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl blur-sm"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative p-10 border border-white/10 backdrop-blur-sm rounded-xl">
          <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm">
            The Future Starts Here
          </div>
          
          <p className="text-2xl font-bold leading-relaxed text-white/90 mt-6 mb-8 text-center">
            D4L isn't just another DeFi platform—it's the future of crypto culture.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transform transition hover:bg-white/10">
              <div className="text-center mb-4">
                <span className="text-3xl mb-2 block">🔥</span>
                <h3 className="text-lg font-bold text-white">Risk It</h3>
              </div>
              <p className="text-white/80 text-center">
                Embrace the thrill of calculated risk in a secure environment where your boldest plays have real strategic impact.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transform transition hover:bg-white/10">
              <div className="text-center mb-4">
                <span className="text-3xl mb-2 block">🏗️</span>
                <h3 className="text-lg font-bold text-white">Build It</h3>
              </div>
              <p className="text-white/80 text-center">
                Create the future with tools designed for innovation—from dynamic AMM curves to community-driven token launches.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transform transition hover:bg-white/10">
              <div className="text-center mb-4">
                <span className="text-3xl mb-2 block">💰</span>
                <h3 className="text-lg font-bold text-white">Bank It</h3>
              </div>
              <p className="text-white/80 text-center">
                Convert your crypto savvy into tangible rewards through superior capital efficiency and strategic ecosystem participation.
              </p>
            </div>
          </div>

          <p className="text-xl leading-relaxed text-white/90 mb-6">
            D4L represents the next evolution in decentralized finance, fusing the HydraCurve AMM's 130% capital efficiency with gamified token battles and anti-scam token launches into an integrated ecosystem that rewards both the risk-takers and the builders.
          </p>
          
          <p className="text-xl leading-relaxed text-white/90">
            We're not just launching a platform—we're igniting a movement where crypto's reckless spirit meets responsible innovation, creating a financial playground that's both secure and thrilling.
          </p>
        </div>
      </div>
      
      {/* Join the Community */}
      <div className="relative p-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="absolute -top-5 left-8 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-semibold text-sm">
          Join the Community
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between mt-6">
          <div className="mb-8 md:mb-0 md:mr-8 flex-1">
            <h3 className="text-2xl font-bold mb-4 text-white">Be Part of the Future</h3>
            <p className="text-white/80 mb-6">
              Join our growing community of traders, developers, and enthusiasts building the future of decentralized finance. Stay updated on the latest developments, participate in governance, and help shape the future of D4L.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {[
                { name: "Twitter", icon: "🐦", href: "#", color: "from-blue-500 to-blue-600" },
                { name: "Discord", icon: "💬", href: "#", color: "from-indigo-500 to-indigo-600" },
                { name: "Telegram", icon: "📱", href: "#", color: "from-blue-400 to-blue-500" },
                { name: "GitHub", icon: "📂", href: "#", color: "from-gray-700 to-gray-800" }
              ].map((social, index) => (
                <Link 
                  key={index} 
                  href={social.href}
                  className={`flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${social.color} text-white font-medium transition-transform hover:scale-105`}
                >
                  <span className="mr-2">{social.icon}</span>
                  {social.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-xl font-bold mb-4 text-white">Stay Updated</h4>
              <p className="text-white/80 mb-4">Subscribe to our newsletter for the latest updates, features, and community events.</p>
              
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-r-lg text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Conclusion;
