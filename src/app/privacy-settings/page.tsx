"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import PrivacySettings from '@/components/gdpr/PrivacySettings';

export default function PrivacySettingsPage() {
  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Glassmorphism header with blur effect */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl -z-10"></div>
        <div className="absolute inset-0 bg-black/5 backdrop-blur-md rounded-xl -z-5"></div>
        <div className="relative p-8 border border-white/10 rounded-xl z-0">
          <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Privacy Settings
          </h1>
          <p className="text-center text-gray-300 max-w-3xl mx-auto">
            Manage your privacy preferences and cookie settings
          </p>
        </div>
        
        {/* Floating particles for visual appeal */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl -z-1 pointer-events-none">
          <div className="particle-1 absolute w-4 h-4 rounded-full bg-blue-400/30 blur-sm"></div>
          <div className="particle-2 absolute w-6 h-6 rounded-full bg-purple-400/20 blur-sm"></div>
          <div className="particle-3 absolute w-3 h-3 rounded-full bg-cyan-400/20 blur-sm"></div>
        </div>
      </div>

      {/* Privacy Settings Component */}
      <PrivacySettings />

      {/* Additional Information */}
      <div className="relative mt-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl blur-sm -z-10"></div>
        <div className="relative p-6 border border-white/10 rounded-xl backdrop-blur-sm bg-black/20">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            About Your Privacy
          </h2>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <p>
              At D4L, we take your privacy seriously. We believe in transparency and giving you control over your data.
            </p>
            
            <h3>Your Rights Under GDPR</h3>
            <p>
              Under the General Data Protection Regulation (GDPR), you have several rights regarding your personal data:
            </p>
            <ul>
              <li>The right to be informed about how your data is used</li>
              <li>The right to access your personal data</li>
              <li>The right to rectification if your data is inaccurate</li>
              <li>The right to erasure (the "right to be forgotten")</li>
              <li>The right to restrict processing of your data</li>
              <li>The right to data portability</li>
              <li>The right to object to data processing</li>
              <li>Rights related to automated decision making and profiling</li>
            </ul>
            
            <h3>Data Deletion Request</h3>
            <p>
              If you wish to delete all your data from our platform, please contact us at privacy@d4l.io with the subject line "Data Deletion Request". We will process your request within 30 days as required by law.
            </p>
            
            <h3>Additional Resources</h3>
            <p>
              For more detailed information about how we handle your data, please review our:
            </p>
            <ul>
              <li><Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-blue-400 hover:text-blue-300">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation buttons with glassmorphism effect */}
      <div className="flex justify-between mt-12">
        <Link href="/" className="px-6 py-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-black/40 transition duration-300 text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      {/* Add floating animation keyframes */}
      <style jsx>{`
        .particle-1 {
          top: 20%;
          left: 10%;
          animation: float 8s ease-in-out infinite;
        }
        .particle-2 {
          top: 60%;
          left: 80%;
          animation: float 12s ease-in-out infinite;
        }
        .particle-3 {
          top: 80%;
          left: 30%;
          animation: float 10s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(0px) translateX(0px); }
          75% { transform: translateY(10px) translateX(-10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </div>
  );
}
