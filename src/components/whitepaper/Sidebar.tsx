'use client';

import React, { useEffect, useState } from 'react';

interface SidebarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, scrollToSection }) => {
  const [currentSection, setCurrentSection] = useState(activeSection);

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'vision', label: 'Vision & Mission' },
    { id: 'technology', label: 'Technology' },
    { id: 'tokenomics', label: 'Tokenomics' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'conclusion', label: 'Conclusion' }
  ];

  // Scrollspy functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset to trigger slightly before reaching the section

      // Find the section that is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          if (currentSection !== sections[i].id) {
            setCurrentSection(sections[i].id);
          }
          break;
        }
      }
    };

    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check on mount
    handleScroll();

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection, sections]);

  // Update parent component's activeSection when currentSection changes
  useEffect(() => {
    if (currentSection !== activeSection) {
      // This will update the parent's state without triggering a scroll
      // We're using a custom prop to handle this update
      const event = new CustomEvent('sectionChanged', { detail: { section: currentSection } });
      document.dispatchEvent(event);
    }
  }, [currentSection, activeSection]);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-2 py-2 shadow-lg">
        <div className="flex items-center overflow-x-auto hide-scrollbar pb-1 snap-x snap-mandatory">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs rounded-lg transition-all duration-200 mx-1 snap-start ${
                currentSection === section.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white font-medium shadow-inner'
                  : 'text-white/70 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              {currentSection === section.id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
              )}
              {section.label}
              {currentSection === section.id && (
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full ml-1 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Quick actions for mobile */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
          <button
            onClick={() => scrollToSection('introduction')}
            className="text-white/70 hover:text-white text-xs flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Top
          </button>

          <a
            href="#"
            className="text-white/70 hover:text-white text-xs flex items-center"
            onClick={(e) => {
              e.preventDefault();
              window.print();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>

          <button
            onClick={() => scrollToSection('conclusion')}
            className="text-white/70 hover:text-white text-xs flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Bottom
          </button>
        </div>
      </div>

      {/* Desktop Sidebar - hidden on mobile, visible on lg screens and up */}
      <div className="hidden lg:block sticky top-24 w-64 pr-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
          <h3 className="text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Contents
          </h3>
          <nav>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentSection === section.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white font-medium shadow-inner'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      {/* Section indicator */}
                      <div className={`w-2 h-2 rounded-full mr-2 ${currentSection === section.id ? 'bg-blue-400' : 'bg-white/20'}`}></div>
                      <span>{section.label}</span>
                      {currentSection === section.id && (
                        <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full ml-2 animate-pulse"></span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Additional Resources */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2 px-4">Additional Resources</h4>
              <a
                href="/audit"
                className="flex items-center w-full text-left px-4 py-2 rounded-lg transition-all hover:bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-gray-300 hover:text-white group"
              >
                <span className="mr-2 text-green-400 group-hover:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                Smart Contract Audit
              </a>
            </div>
          </nav>

          {/* Progress indicator */}
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{
                width: `${(sections.findIndex(s => s.id === currentSection) + 1) / sections.length * 100}%`
              }}
            ></div>
          </div>

          {/* Download button */}
          <div className="mt-6">
            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center group shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
