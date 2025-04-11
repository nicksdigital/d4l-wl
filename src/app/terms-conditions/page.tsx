"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function TermsConditionsPage() {
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-xl -z-5"></div>
        <div className="relative p-8 border border-white/10 rounded-xl z-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Terms & Conditions
            </h1>
            <p className="text-center text-gray-300 max-w-3xl mx-auto">
              Last Updated: April 2, 2025
            </p>
          </div>
        </div>
        
        {/* Enhanced Floating particles with animations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl -z-1 pointer-events-none">
          <div className="absolute w-4 h-4 rounded-full bg-blue-400/30 blur-sm top-1/4 left-1/4 animate-float-slow"></div>
          <div className="absolute w-6 h-6 rounded-full bg-purple-400/20 blur-sm bottom-1/4 right-1/4 animate-float-medium"></div>
          <div className="absolute w-3 h-3 rounded-full bg-cyan-400/20 blur-sm top-3/4 left-3/4 animate-float-fast"></div>
          <div className="absolute w-5 h-5 rounded-full bg-indigo-400/20 blur-sm bottom-1/3 left-1/3 animate-float-medium"></div>
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
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and D4L ("we," "us" or "our"), concerning your access to and use of the D4L platform and services.
            </p>
            <p>
              By accessing or using D4L, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access our platform.
            </p>

            <h2>2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the D4L platform and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the platform (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
            </p>
            <p>
              The Content and Marks are provided on the platform "AS IS" for your information and personal use only. Except as expressly provided in these Terms, no part of the platform and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>

            <h2>3. User Representations</h2>
            <p>
              By using D4L, you represent and warrant that:
            </p>
            <ol>
              <li>You have the legal capacity and agree to comply with these Terms;</li>
              <li>You are at least 18 years of age;</li>
              <li>You will not use the platform for any illegal or unauthorized purpose;</li>
              <li>Your use of the platform will not violate any applicable law or regulation;</li>
              <li>You have not been previously suspended or removed from using our services;</li>
              <li>You are solely responsible for all activity that occurs under your account;</li>
              <li>You understand the risks associated with blockchain technology and cryptocurrency transactions.</li>
            </ol>

            <h2>4. User Registration</h2>
            <p>
              You may be required to register with the platform to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>

            <h2>5. Blockchain and Cryptocurrency Risks</h2>
            <p>
              By using D4L, you acknowledge and agree that:
            </p>
            <ul>
              <li>Blockchain and cryptocurrency technologies are subject to many risks, including price volatility, transaction failures, delays, and security vulnerabilities;</li>
              <li>We do not guarantee the value of any tokens or digital assets on our platform;</li>
              <li>You are solely responsible for securing your private keys and wallet;</li>
              <li>Blockchain transactions are irreversible and we cannot recover lost funds or reverse transactions;</li>
              <li>Regulatory changes may adversely affect the platform or the value of digital assets;</li>
              <li>You are responsible for complying with all applicable tax laws in your jurisdiction.</li>
            </ul>

            <h2>6. Prohibited Activities</h2>
            <p>
              You may not access or use the platform for any purpose other than that for which we make it available. The platform may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
            <p>
              As a user of the platform, you agree not to:
            </p>
            <ul>
              <li>Systematically retrieve data or other content from the platform to create or compile, directly or indirectly, a collection, compilation, database, or directory;</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information;</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the platform;</li>
              <li>Use any information obtained from the platform to harass, abuse, or harm another person;</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct;</li>
              <li>Use the platform in a manner inconsistent with any applicable laws or regulations;</li>
              <li>Engage in unauthorized framing of or linking to the platform;</li>
              <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the platform;</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages;</li>
              <li>Attempt to impersonate another user or person or use the username of another user;</li>
              <li>Sell or otherwise transfer your profile;</li>
              <li>Interfere with, disrupt, or create an undue burden on the platform or the networks or services connected to the platform;</li>
              <li>Attempt to bypass any measures of the platform designed to prevent or restrict access to the platform, or any portion of the platform;</li>
              <li>Copy or adapt the platform's software, including but not limited to Flash, PHP, HTML, JavaScript, or other code;</li>
              <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the platform;</li>
              <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the platform to you.</li>
            </ul>

            <h2>7. Contributions</h2>
            <p>
              The platform may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the platform, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
            </p>
            <p>
              Any Contribution you transmit to the platform will be treated as non-confidential and non-proprietary. By creating a Contribution, you grant us a perpetual, non-exclusive, worldwide, royalty-free, irrevocable, transferable right to use, reproduce, distribute, modify, adapt, publish, translate, publicly perform and publicly display your Contribution in any media or format.
            </p>

            <h2>8. Submissions</h2>
            <p>
              You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information regarding the platform ("Submissions") provided by you to us are non-confidential and shall become our sole property. We shall own exclusive rights, including all intellectual property rights, and shall be entitled to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
            </p>

            <h2>9. Third-Party Websites and Content</h2>
            <p>
              The platform may contain links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). We are not responsible for any Third-Party Websites or Third-Party Content accessed through the platform.
            </p>

            <h2>10. Platform Management</h2>
            <p>
              We reserve the right, but not the obligation, to:
            </p>
            <ul>
              <li>Monitor the platform for violations of these Terms;</li>
              <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms;</li>
              <li>Refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;</li>
              <li>In our sole discretion and without limitation, notice, or liability, remove from the platform or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems;</li>
              <li>Otherwise manage the platform in a manner designed to protect our rights and property and to facilitate the proper functioning of the platform.</li>
            </ul>

            <h2>11. Privacy Policy</h2>
            <p>
              We care about data privacy and security. Please review our <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>. By using the platform, you agree to be bound by our Privacy Policy, which is incorporated into these Terms. Please be advised the platform is hosted in the United States. If you access the platform from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in the United States, then through your continued use of the platform, you are transferring your data to the United States, and you agree to have your data transferred to and processed in the United States.
            </p>

            <h2>12. Term and Termination</h2>
            <p>
              These Terms shall remain in full force and effect while you use the platform. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE PLATFORM (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE PLATFORM OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
            </p>

            <h2>13. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the platform at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the platform without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the platform.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of [Your Country/State]. D4L and yourself irrevocably consent that the courts of [Your Country/State] shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>

            <h2>15. Dispute Resolution</h2>
            <p>
              You agree to irrevocably submit all disputes related to Terms or the relationship established by this Agreement to the jurisdiction of the [Your Country/State] courts. D4L shall also maintain the right to bring proceedings as to the substance of the matter in the courts of the country where you reside or, if these Terms are entered into in the course of your trade or profession, the state of your principal place of business.
            </p>

            <h2>16. Corrections</h2>
            <p>
              There may be information on the platform that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the platform at any time, without prior notice.
            </p>

            <h2>17. Disclaimer</h2>
            <p>
              THE PLATFORM IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE PLATFORM AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE PLATFORM AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE PLATFORM'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE PLATFORM AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE PLATFORM, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN.
            </p>

            <h2>18. Limitations of Liability</h2>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <h2>19. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the platform; (3) breach of these Terms; (4) any breach of your representations and warranties set forth in these Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the platform with whom you connected via the platform.
            </p>

            <h2>20. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the platform or to receive further information regarding use of the platform, please contact us at:
            </p>
            <p>
              Email: legal@d4l.io<br />
              Address: 123 Blockchain Avenue, Suite 456, Crypto City, CC 12345
            </p>
          </div>
        </div>
      </div>

      {/* Navigation buttons with glassmorphism effect */}
      <div className="flex justify-between mt-12">
        <Link href="/privacy-policy" className="px-6 py-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-black/40 transition duration-300 text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Privacy Policy
        </Link>
        <Link href="/" className="px-6 py-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-black/40 transition duration-300 text-white flex items-center">
          Back to Home
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
