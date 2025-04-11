"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20"></div>
      
      {/* Glassmorphism Background Blobs */}
      <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse -z-10"></div>
      <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping -z-10"></div>
      <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse -z-10"></div>
      <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-indigo-400 rounded-full animate-ping -z-10"></div>
      
      {/* Glassmorphism header with enhanced blur effect */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur-xl -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-xl -z-5"></div>
        <div className="relative p-8 border border-white/10 rounded-xl z-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Privacy Policy
            </h1>
            <p className="text-center text-gray-300 max-w-3xl mx-auto">
              Last Updated: April 2, 2025
            </p>
          </div>
        </div>
        
        {/* Enhanced Floating particles with animations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl -z-1 pointer-events-none">
          <div className="absolute w-4 h-4 rounded-full bg-purple-400/30 blur-sm top-1/4 left-1/4 animate-float-slow"></div>
          <div className="absolute w-6 h-6 rounded-full bg-blue-400/20 blur-sm bottom-1/4 right-1/4 animate-float-medium"></div>
          <div className="absolute w-3 h-3 rounded-full bg-pink-400/20 blur-sm top-3/4 left-3/4 animate-float-fast"></div>
          <div className="absolute w-5 h-5 rounded-full bg-cyan-400/20 blur-sm bottom-1/3 left-1/3 animate-float-medium"></div>
        </div>
      </div>

      {/* Main content with enhanced glassmorphism card */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl blur-sm -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30 rounded-xl"></div>
        <div className="relative p-8 border border-white/10 rounded-xl backdrop-blur-md bg-gradient-to-br from-gray-800/70 to-gray-900/70 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="prose prose-lg prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to D4L ("we," "our," or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
            <p>
              By accessing or using D4L, you consent to the practices described in this Privacy Policy. If you do not agree with the policies and practices described here, please do not use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul>
              <li>Create an account or profile</li>
              <li>Connect your wallet</li>
              <li>Participate in airdrops or token distributions</li>
              <li>Communicate with us</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p>
              This information may include:
            </p>
            <ul>
              <li>Email address</li>
              <li>Ethereum wallet address</li>
              <li>Username or display name</li>
              <li>Profile information</li>
            </ul>

            <h3>2.2 Blockchain Data</h3>
            <p>
              When you interact with our platform, we collect and process blockchain data, including:
            </p>
            <ul>
              <li>Transaction history</li>
              <li>Smart contract interactions</li>
              <li>Token balances and transfers</li>
              <li>On-chain activity related to our platform</li>
            </ul>
            <p>
              Please note that blockchain data is publicly available and transparent by design.
            </p>

            <h3>2.3 Automatically Collected Information</h3>
            <p>
              We automatically collect certain information when you visit, use, or navigate our platform. This information does not reveal your specific identity but may include:
            </p>
            <ul>
              <li>Device and usage information</li>
              <li>IP address</li>
              <li>Browser and device characteristics</li>
              <li>Operating system</li>
              <li>Language preferences</li>
              <li>Referring URLs</li>
              <li>Usage patterns and interactions</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul>
              <li>Providing, operating, and maintaining our platform</li>
              <li>Improving and personalizing your experience</li>
              <li>Processing transactions and distributing tokens</li>
              <li>Communicating with you about updates, security alerts, and support</li>
              <li>Preventing fraud and enforcing our terms of service</li>
              <li>Analyzing usage patterns and optimizing our services</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>4. How We Share Your Information</h2>
            <p>
              We may share your information in the following situations:
            </p>
            <ul>
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
            </ul>

            <h2>5. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul>
              <li><strong>Access:</strong> You have the right to request copies of your personal information.</li>
              <li><strong>Rectification:</strong> You have the right to request that we correct inaccurate information about you.</li>
              <li><strong>Erasure:</strong> You have the right to request that we delete your personal information in certain circumstances.</li>
              <li><strong>Restriction:</strong> You have the right to request that we restrict the processing of your information in certain circumstances.</li>
              <li><strong>Data Portability:</strong> You have the right to request that we transfer your information to another organization or directly to you.</li>
              <li><strong>Objection:</strong> You have the right to object to our processing of your personal information.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at privacy@d4l.io.
            </p>

            <h2>6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect and store information about your interactions with our platform. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2>7. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission or storage system is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@d4l.io<br />
              Address: 123 Blockchain Avenue, Suite 456, Crypto City, CC 12345
            </p>
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
        <Link href="/terms-conditions" className="px-6 py-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-black/40 transition duration-300 text-white flex items-center">
          Terms & Conditions
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
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
