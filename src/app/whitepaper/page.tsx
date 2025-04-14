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
// Team section removed
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
      {/* Hero section with glassmorphism effects - optimized for mobile */}
      <div className="relative overflow-hidden mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-20"></div>

        {/* Animated light effects - adjusted for mobile */}
        <div className="absolute top-20 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 leading-tight">
            D4L Whitepaper
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
            The future of decentralized finance, gaming, and prediction markets
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="#introduction"
              onClick={(e) => { e.preventDefault(); scrollToSection('introduction'); }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Start Reading
            </Link>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.print(); }}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium hover:bg-white/20 transition-colors border border-white/20 shadow-md hover:shadow-lg text-sm sm:text-base"
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
          <div className="lg:w-3/4 pb-32 lg:pb-0"> {/* Increased bottom padding for mobile to account for navigation */}
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
              {/* Background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              {/* Content Sections */}
              <div className="relative z-10 p-6 sm:p-8 md:p-10 whitepaper-content"> {/* Responsive padding with whitepaper-specific styles */}
                <Introduction />
                <Vision />
                <Technology />
                <Tokenomics />
                <Roadmap />
                {/* Team section removed */}
                <Conclusion />

                {/* Mobile-friendly footer with additional whitespace */}
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                  <p className="text-white/60 text-sm">
                    © 2025 D4L. All rights reserved.
                  </p>
                  <div className="flex justify-center space-x-4 mt-4">
                    {['Twitter', 'Discord', 'Telegram', 'GitHub'].map((social, index) => (
                      <a key={index} href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
