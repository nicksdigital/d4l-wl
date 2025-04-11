"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Import components
import Sidebar from '@/components/whitepaper/Sidebar';
import Introduction from '@/components/whitepaper/Introduction';
import Vision from '@/components/whitepaper/Vision';
import Technology from '@/components/whitepaper/Technology';
import Tokenomics from '@/components/whitepaper/Tokenomics';
import Roadmap from '@/components/whitepaper/Roadmap';
import Team from '@/components/whitepaper/Team';
import Conclusion from '@/components/whitepaper/Conclusion';

export default function WhitepaperPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  // Handle scrolling to sections
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero section with glassmorphism effects */}
      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-20"></div>
        
        {/* Animated light effects */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            D4L Whitepaper
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
            The future of decentralized finance, gaming, and prediction markets
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="#introduction" 
              onClick={(e) => { e.preventDefault(); scrollToSection('introduction'); }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              Start Reading
            </Link>
            <a 
              href="#" 
              className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar navigation */}
          <div className="lg:w-1/4">
            <Sidebar activeSection={activeSection} scrollToSection={scrollToSection} />
          </div>

          {/* Main content */}
          <div className="lg:w-3/4 pb-20 lg:pb-0"> {/* Added bottom padding for mobile */}
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
              {/* Background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              {/* Content Sections */}
              <div className="relative z-10 p-10">
                <Introduction />
                <Vision />
                <Technology />
                <Tokenomics />
                <Roadmap />
                <Team />
                <Conclusion />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
